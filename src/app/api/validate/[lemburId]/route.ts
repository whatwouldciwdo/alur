import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lemburId: string }> }
) {
  const { lemburId } = await params;

  // Intersepsi khusus untuk dummy PDF agar QR Code bisa di-scan
  if (lemburId === "dummy-lembur-123456") {
    return NextResponse.json({
      valid: true,
      id: "dummy-lembur-123456",
      nomorSpkl: "SPKL/OPR/2026/06/001",
      status: "APPROVED",
      kategori: "LEMBUR",
      tanggalMulai: "2026-06-10T08:00:00.000Z",
      tanggalSelesai: "2026-06-10T17:00:00.000Z",
      // Removed: deskripsi, penugas, user details, approver names for security
      message: "Dokumen valid (demo data)",
    });
  }

  const lembur = await prisma.lembur.findUnique({
    where: { id: lemburId },
    select: {
      id: true,
      nomorSpkl: true,
      status: true,
      kategori: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      submittedAt: true,
      createdAt: true,
      // Limited user info - only show initials for privacy
      user: {
        select: {
          nama: true,
          jenjangJabatan: true,
          bidang: true,
          subBidang: true,
        },
      },
      // Only show approval count, not approver names for privacy
      approvals: {
        select: {
          step: true,
          roleName: true,
          status: true,
          respondedAt: true,
        },
        orderBy: { step: "asc" },
      },
    },
  });

  if (!lembur) {
    return NextResponse.json(
      { valid: false, error: "Dokumen tidak ditemukan." },
      { status: 404 }
    );
  }

  // Return sanitized data for public QR validation
  return NextResponse.json({
    valid: true,
    id: lembur.id,
    nomorSpkl: lembur.nomorSpkl,
    status: lembur.status,
    kategori: lembur.kategori,
    tanggalMulai: lembur.tanggalMulai,
    tanggalSelesai: lembur.tanggalSelesai,
    submittedAt: lembur.submittedAt,
    createdAt: lembur.createdAt,
    user: {
      nama: lembur.user.nama,
      jenjangJabatan: lembur.user.jenjangJabatan,
      bidang: lembur.user.bidang,
      subBidang: lembur.user.subBidang,
    },
    approvals: lembur.approvals.map((a) => ({
      step: a.step,
      roleName: a.roleName,
      status: a.status,
      respondedAt: a.respondedAt,
    })),
    message: "Dokumen valid",
  });
}
