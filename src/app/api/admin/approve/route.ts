import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextStep } from "@/lib/workflow";
import { sendApprovedEmail } from "@/lib/email";
import { SubBidang } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { lemburId } = await req.json();
  if (!lemburId) return NextResponse.json({ error: "lemburId required" }, { status: 400 });

  const lembur = await prisma.lembur.findUnique({
    where: { id: lemburId },
    include: {
      user: true,
      approvals: { orderBy: { step: "asc" } },
    },
  });

  if (!lembur) return NextResponse.json({ error: "Lembur tidak ditemukan" }, { status: 404 });
  if (lembur.status !== "PENDING")
    return NextResponse.json({ error: "Lembur tidak dalam status PENDING" }, { status: 400 });

  // Find the current approval step that is for Admin
  const currentApproval = lembur.approvals.find(
    (a) => a.step === lembur.currentStep && a.status === "PENDING"
  );

  if (!currentApproval)
    return NextResponse.json({ error: "Tidak ada step pending untuk disetujui" }, { status: 400 });

  // Update the current approval step to APPROVED
  await prisma.approval.update({
    where: { id: currentApproval.id },
    data: {
      status: "APPROVED",
      approverId: session.user.id,
      respondedAt: new Date(),
      tokenUsedAt: new Date(),
    },
  });

  // Check if there's a next step
  const subBidang = lembur.user.subBidang as SubBidang;
  const nextStep = getNextStep(subBidang, lembur.currentStep);

  if (!nextStep) {
    // All steps done — mark lembur as APPROVED
    await prisma.lembur.update({
      where: { id: lembur.id },
      data: { status: "APPROVED" },
    });
    await sendApprovedEmail({
      to: lembur.user.emailPersonal || lembur.user.emailPerusahaan,
      pegawaiName: lembur.user.nama,
      tanggalMulai: lembur.tanggalMulai,
      tanggalSelesai: lembur.tanggalSelesai,
    });
    return NextResponse.json({ success: true, status: "APPROVED" });
  }

  // Advance to next step
  await prisma.lembur.update({
    where: { id: lembur.id },
    data: { currentStep: nextStep.step },
  });

  return NextResponse.json({ success: true, status: "PENDING", nextStep: nextStep.step });
}
