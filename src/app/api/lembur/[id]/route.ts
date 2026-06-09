import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkflowSteps, getNextStep } from "@/lib/workflow";
import {
  sendApprovalRequestEmail,
  sendApprovedEmail,
  sendRejectedEmail,
  sendRevisionEmail,
} from "@/lib/email";
import { SubBidang } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lembur = await prisma.lembur.findUnique({
    where: { id },
    include: {
      user: { select: { nama: true, nip: true, jenjangJabatan: true, bidang: true, subBidang: true } },
      approvals: {
        include: { approver: { select: { nama: true, role: true, jenjangJabatan: true } } },
        orderBy: { step: "asc" },
      },
    },
  });

  if (!lembur) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(lembur);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, catatan } = body;

  if (!["APPROVED", "REJECTED", "REVISED"].includes(action)) {
    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  }

  const lembur = await prisma.lembur.findUnique({
    where: { id },
    include: {
      user: true,
      approvals: { orderBy: { step: "asc" } },
    },
  });

  if (!lembur) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  if (lembur.status !== "PENDING") {
    return NextResponse.json({ error: "Lembur tidak dalam status pending" }, { status: 400 });
  }

  const currentApproval = lembur.approvals.find(
    (a) => a.step === lembur.currentStep && a.approverId === session.user.id && a.status === "PENDING"
  );

  if (!currentApproval) {
    return NextResponse.json({ error: "Anda tidak berhak melakukan approval ini" }, { status: 403 });
  }

  await prisma.approval.update({
    where: { id: currentApproval.id },
    data: { status: action, catatan, respondedAt: new Date() },
  });

  if (action === "REJECTED") {
    await prisma.lembur.update({ where: { id }, data: { status: "REJECTED" } });
    await sendRejectedEmail({
      to:           lembur.user.emailPersonal || lembur.user.emailPerusahaan,
      pegawaiName:  lembur.user.nama,
      rejectorName: session.user.name ?? "Atasan",
      roleName:     currentApproval.roleName,
      catatan,
      tanggalMulai: lembur.tanggalMulai,
    });
    return NextResponse.json({ success: true, status: "REJECTED" });
  }

  if (action === "REVISED") {
    await prisma.lembur.update({ where: { id }, data: { status: "REVISED", currentStep: 0 } });
    await sendRevisionEmail({
      to:          lembur.user.emailPersonal || lembur.user.emailPerusahaan,
      pegawaiName: lembur.user.nama,
      revisorName: session.user.name ?? "Atasan",
      roleName:    currentApproval.roleName,
      catatan,
      tanggalMulai: lembur.tanggalMulai,
    });
    return NextResponse.json({ success: true, status: "REVISED" });
  }

  const subBidang = lembur.user.subBidang as SubBidang;
  const nextStep  = getNextStep(subBidang, lembur.currentStep);

  if (!nextStep) {
    await prisma.lembur.update({ where: { id }, data: { status: "APPROVED" } });
    await sendApprovedEmail({
      to:            lembur.user.emailPersonal || lembur.user.emailPerusahaan,
      pegawaiName:   lembur.user.nama,
      tanggalMulai:  lembur.tanggalMulai,
      tanggalSelesai: lembur.tanggalSelesai,
    });
    return NextResponse.json({ success: true, status: "APPROVED" });
  }

  await prisma.lembur.update({ where: { id }, data: { currentStep: nextStep.step } });

  const nextApprover = await findApprover(nextStep, lembur.user.tlGroup ?? undefined);
  if (nextApprover) {
    await prisma.approval.updateMany({
      where: { lemburId: id, step: nextStep.step },
      data:  { approverId: nextApprover.id },
    });

    const nextApproval = await prisma.approval.findFirst({
      where: { lemburId: id, step: nextStep.step },
    });

    if (nextApproval?.token) {
      await sendApprovalRequestEmail({
        to:            nextApprover.emailPerusahaan ?? nextApprover.emailPersonal ?? "",
        approverName:  nextApprover.nama,
        pegawaiName:   lembur.user.nama,
        subBidang:     lembur.user.subBidang,
        tanggalMulai:  lembur.tanggalMulai,
        tanggalSelesai: lembur.tanggalSelesai,
        deskripsi:     lembur.deskripsi,
        lemburId:      lembur.id,
        roleName:      nextStep.roleName,
        token:         nextApproval.token,
      });
    }
  }

  return NextResponse.json({ success: true, status: "PENDING", nextStep: nextStep.step });
}

async function findApprover(
  step: { requiredRole: string; bidang?: string; subBidang?: string },
  tlGroup?: string
) {
  const where: any = { role: step.requiredRole };
  if (step.subBidang) where.subBidang = step.subBidang;
  else if (step.bidang) where.bidang = step.bidang;
  if (step.requiredRole === "TL" && step.subBidang === "OPERATOR_SHIFT" && tlGroup) {
    where.tlGroup = tlGroup;
  }
  return await prisma.user.findFirst({ where });
}
