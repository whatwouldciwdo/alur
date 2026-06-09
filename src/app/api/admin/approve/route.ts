import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextStep } from "@/lib/workflow";
import { sendApprovedEmail } from "@/lib/email";
import { generateLemburPdfServer } from "@/lib/generateLemburPdfServer";
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

  const currentApproval = lembur.approvals.find(
    (a) => a.step === lembur.currentStep && a.status === "PENDING"
  );

  if (!currentApproval)
    return NextResponse.json({ error: "Tidak ada step pending untuk disetujui" }, { status: 400 });

  
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
  // Admin (perekap) lembur hanya punya 1 step — tidak ada next step
  const subBidang = lembur.user.subBidang as SubBidang;
  const nextStep = lembur.user.role === "ADMIN" ? null : getNextStep(subBidang, lembur.currentStep);

  if (!nextStep) {
    // All steps done — mark lembur as APPROVED
    await prisma.lembur.update({
      where: { id: lembur.id },
      data: { status: "APPROVED" },
    });

    // Generate PDF attachment
    let pdfAttachment: { buffer: Buffer; filename: string } | undefined;
    try {
      const fullLembur = await prisma.lembur.findUnique({
        where: { id: lembur.id },
        include: {
          user: { select: { nama: true, nip: true, jenjangJabatan: true, bidang: true, subBidang: true, tlGroup: true } },
          approvals: {
            include: { approver: { select: { nama: true, role: true, jenjangJabatan: true } } },
            orderBy: { step: "asc" },
          },
        },
      });
      if (fullLembur) {
        pdfAttachment = await generateLemburPdfServer({
          id:             fullLembur.id,
          nomorSpkl:      fullLembur.nomorSpkl,
          status:         fullLembur.status,
          kategori:       fullLembur.kategori ?? "LEMBUR",
          tanggalMulai:   fullLembur.tanggalMulai,
          tanggalSelesai: fullLembur.tanggalSelesai,
          deskripsi:      fullLembur.deskripsi,
          penugas:        fullLembur.penugas,
          evidentUrl:     fullLembur.evidentUrl,
          submittedAt:    fullLembur.submittedAt ?? new Date(),
          user:           fullLembur.user as any,
          approvals:      fullLembur.approvals.map(a => ({
            step:        a.step,
            roleName:    a.roleName,
            status:      a.status,
            respondedAt: a.respondedAt as Date | string | null,
            approver:    a.approver as any,
          })),
        });
      }
    } catch (pdfErr) {
      console.error("[admin/approve] PDF generation failed:", pdfErr);
    }

    await sendApprovedEmail({
      to:            lembur.user.emailPersonal || lembur.user.emailPerusahaan,
      pegawaiName:   lembur.user.nama,
      tanggalMulai:  lembur.tanggalMulai,
      tanggalSelesai: lembur.tanggalSelesai,
      pdfAttachment,
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
