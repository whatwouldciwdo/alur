import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextStep } from "@/lib/workflow";
import {
  sendApprovalRequestEmail,
  sendApprovedEmail,
  sendRejectedEmail,
  sendRevisionEmail,
} from "@/lib/email";
import { SubBidang } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const approval = await prisma.approval.findUnique({
    where: { token },
    include: {
      lembur: {
        include: {
          user: {
            select: {
              nama: true,
              nip: true,
              jenjangJabatan: true,
              bidang: true,
              subBidang: true,
              emailPerusahaan: true,
              emailPersonal: true,
              tlGroup: true,
            },
          },
          approvals: {
            include: { approver: { select: { nama: true, role: true, jenjangJabatan: true } } },
            orderBy: { step: "asc" },
          },
        },
      },
      approver: { select: { nama: true, role: true, jenjangJabatan: true } },
    },
  });

  if (!approval) return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
  return NextResponse.json(approval);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json();
  const { action, catatan } = body;

  if (!["APPROVED", "REJECTED", "REVISED"].includes(action)) {
    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  }

  const approval = await prisma.approval.findUnique({
    where: { token },
    include: {
      approver: { select: { nama: true } },
      lembur: {
        include: {
          user: true,
          approvals: { orderBy: { step: "asc" } },
        },
      },
    },
  });

  if (!approval) return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });

  const lembur = approval.lembur;

  if (lembur.status !== "PENDING") {
    return NextResponse.json({ error: "Lembur tidak dalam status pending" }, { status: 400 });
  }

  if (approval.status !== "PENDING") {
    return NextResponse.json({ error: "Approval ini sudah diproses" }, { status: 400 });
  }

  await prisma.approval.update({
    where: { id: approval.id },
    data: { status: action, catatan, respondedAt: new Date() },
  });

  if (action === "REJECTED") {
    await prisma.lembur.update({ where: { id: lembur.id }, data: { status: "REJECTED" } });
    await sendRejectedEmail({
      to:           lembur.user.emailPersonal ?? lembur.user.emailPerusahaan ?? "",
      pegawaiName:  lembur.user.nama,
      rejectorName: approval.approver?.nama ?? "Atasan",
      roleName:     approval.roleName,
      catatan,
      tanggalMulai: lembur.tanggalMulai,
    });
    return NextResponse.json({ success: true, status: "REJECTED" });
  }

  if (action === "REVISED") {
    await prisma.lembur.update({ where: { id: lembur.id }, data: { status: "REVISED", currentStep: 0 } });
    await sendRevisionEmail({
      to:          lembur.user.emailPersonal ?? lembur.user.emailPerusahaan ?? "",
      pegawaiName: lembur.user.nama,
      revisorName: approval.approver?.nama ?? "Atasan",
      roleName:    approval.roleName,
      catatan,
      tanggalMulai: lembur.tanggalMulai,
    });
    return NextResponse.json({ success: true, status: "REVISED" });
  }

  // APPROVED — advance to next step
  const subBidang = lembur.user.subBidang as SubBidang;
  const nextStep  = getNextStep(subBidang, lembur.currentStep);

  if (!nextStep) {
    await prisma.lembur.update({ where: { id: lembur.id }, data: { status: "APPROVED" } });
    await sendApprovedEmail({
      to:             lembur.user.emailPersonal ?? lembur.user.emailPerusahaan ?? "",
      pegawaiName:    lembur.user.nama,
      tanggalMulai:   lembur.tanggalMulai,
      tanggalSelesai: lembur.tanggalSelesai,
    });
    return NextResponse.json({ success: true, status: "APPROVED" });
  }

  await prisma.lembur.update({ where: { id: lembur.id }, data: { currentStep: nextStep.step } });

  const nextApprover = await findApprover(nextStep, lembur.user.tlGroup ?? undefined);
  if (nextApprover) {
    await prisma.approval.updateMany({
      where: { lemburId: lembur.id, step: nextStep.step },
      data:  { approverId: nextApprover.id },
    });

    const nextApproval = await prisma.approval.findFirst({
      where: { lemburId: lembur.id, step: nextStep.step },
    });

    if (nextApproval?.token) {
      await sendApprovalRequestEmail({
        to:             nextApprover.emailPerusahaan ?? nextApprover.emailPersonal ?? "",
        approverName:   nextApprover.nama,
        pegawaiName:    lembur.user.nama,
        subBidang:      lembur.user.subBidang,
        tanggalMulai:   lembur.tanggalMulai,
        tanggalSelesai: lembur.tanggalSelesai,
        deskripsi:      lembur.deskripsi,
        lemburId:       lembur.id,
        roleName:       nextStep.roleName,
        token:          nextApproval.token,
      });
    }
  }

  return NextResponse.json({ success: true, status: "PENDING", nextStep: nextStep.step });
}

async function findApprover(
  step: { requiredRole: string; bidang?: string; subBidang?: string },
  tlGroup?: string
) {
  const where: Record<string, string> = { role: step.requiredRole };
  if (step.subBidang) where.subBidang = step.subBidang;
  else if (step.bidang) where.bidang = step.bidang;
  if (step.requiredRole === "TL" && step.subBidang === "OPERATOR_SHIFT" && tlGroup) {
    where.tlGroup = tlGroup;
  }
  return await prisma.user.findFirst({ where });
}
