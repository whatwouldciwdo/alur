import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkflowSteps, getNextStep } from "@/lib/workflow";
import {
  sendApprovalRequestEmail,
  sendApprovedEmail,
  sendRejectedEmail,
  sendRevisionEmail,
} from "@/lib/email";
import { SubBidang } from "@prisma/client";
import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function tokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

export async function GET(
  req: NextRequest,
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
            },
          },
          approvals: {
            include: {
              approver: { select: { nama: true, role: true, jenjangJabatan: true } },
            },
            orderBy: { step: "asc" },
          },
        },
      },
      approver: { select: { nama: true, role: true } },
    },
  });

  if (!approval) {
    return NextResponse.json({ error: "Link tidak valid atau sudah kedaluwarsa." }, { status: 404 });
  }
  if (approval.expiresAt && approval.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link sudah kedaluwarsa (lebih dari 7 hari)." }, { status: 410 });
  }
  if (approval.tokenUsedAt) {
    return NextResponse.json({ error: "Link ini sudah digunakan sebelumnya." }, { status: 410 });
  }
  if (approval.step !== approval.lembur.currentStep) {
    return NextResponse.json({
      error: approval.step < approval.lembur.currentStep
        ? "Step ini sudah selesai diproses."
        : "Belum giliran step ini untuk diproses.",
    }, { status: 400 });
  }

  return NextResponse.json({
    approval: {
      id:           approval.id,
      step:         approval.step,
      roleName:     approval.roleName,
      approverName: approval.approver.nama,
    },
    lembur: approval.lembur,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json();
  const { action, catatan } = body as { action: "APPROVED" | "REJECTED" | "REVISED"; catatan?: string };

  if (!["APPROVED", "REJECTED", "REVISED"].includes(action)) {
    return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
  }

  const approval = await prisma.approval.findUnique({
    where: { token },
    include: {
      lembur: {
        include: { user: true, approvals: { orderBy: { step: "asc" } } },
      },
      approver: { select: { nama: true } },
    },
  });

  if (!approval) return NextResponse.json({ error: "Link tidak valid." }, { status: 404 });
  if (approval.expiresAt && approval.expiresAt < new Date())
    return NextResponse.json({ error: "Link sudah kedaluwarsa." }, { status: 410 });
  if (approval.tokenUsedAt)
    return NextResponse.json({ error: "Link ini sudah digunakan." }, { status: 410 });
  if (approval.lembur.status !== "PENDING")
    return NextResponse.json({ error: "Lembur ini tidak dalam status menunggu." }, { status: 400 });
  if (approval.step !== approval.lembur.currentStep)
    return NextResponse.json({ error: "Bukan giliran step ini." }, { status: 400 });

  const lembur       = approval.lembur;
  const approverName = approval.approver.nama;

  await prisma.approval.update({
    where: { id: approval.id },
    data: {
      status:      action,
      catatan:     catatan || null,
      respondedAt: new Date(),
      tokenUsedAt: new Date(),
    },
  });

  if (action === "REJECTED") {
    await prisma.lembur.update({ where: { id: lembur.id }, data: { status: "REJECTED" } });
    await sendRejectedEmail({
      to:           lembur.user.emailPerusahaan,
      pegawaiName:  lembur.user.nama,
      rejectorName: approverName,
      roleName:     approval.roleName,
      catatan:      catatan || undefined,
      tanggalMulai: lembur.tanggalMulai,
    });
    return NextResponse.json({ success: true, status: "REJECTED" });
  }

  if (action === "REVISED") {
    await prisma.lembur.update({ where: { id: lembur.id }, data: { status: "REVISED", currentStep: 0 } });
    await sendRevisionEmail({
      to:          lembur.user.emailPerusahaan,
      pegawaiName: lembur.user.nama,
      revisorName: approverName,
      roleName:    approval.roleName,
      catatan:     catatan || undefined,
      tanggalMulai: lembur.tanggalMulai,
    });
    return NextResponse.json({ success: true, status: "REVISED" });
  }

  const subBidang = lembur.user.subBidang as SubBidang;
  const nextStep  = getNextStep(subBidang, lembur.currentStep);

  if (!nextStep) {
    await prisma.lembur.update({ where: { id: lembur.id }, data: { status: "APPROVED" } });
    await sendApprovedEmail({
      to:            lembur.user.emailPerusahaan,
      pegawaiName:   lembur.user.nama,
      tanggalMulai:  lembur.tanggalMulai,
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
        to:            nextApprover.emailPerusahaan,
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
  const where: Record<string, string> = { role: step.requiredRole };
  if (step.subBidang) where.subBidang = step.subBidang;
  else if (step.bidang) where.bidang = step.bidang;
  if (step.requiredRole === "TL" && step.subBidang === "OPERATOR_SHIFT" && tlGroup) {
    where.tlGroup = tlGroup;
  }
  return await prisma.user.findFirst({ where });
}
