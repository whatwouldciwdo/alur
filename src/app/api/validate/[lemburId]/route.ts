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
      id: "dummy-lembur-123456",
      nomorSpkl: "SPKL/OPR/2026/06/001",
      status: "APPROVED",
      kategori: "LEMBUR",
      tanggalMulai: "2026-06-10T08:00:00.000Z",
      tanggalSelesai: "2026-06-10T17:00:00.000Z",
      deskripsi: "Penyelesaian laporan bulanan operasi dan rekapitulasi data energi.",
      penugas: "Ade Majid",
      submittedAt: "2026-06-09T08:00:00.000Z",
      createdAt: "2026-06-09T08:00:00.000Z",
      user: {
        nama: "Ahmad Yani",
        nip: "1778258308",
        jenjangJabatan: "Pelaksana K3",
        bidang: "OPERASI",
        subBidang: "K3",
        tlGroup: null,
      },
      approvals: [
        { step: 1, roleName: "Officer K3 & Lingkungan", status: "APPROVED", respondedAt: "2026-06-09T09:00:00.000Z", approver: { nama: "Supiin", jenjangJabatan: "Officer K3 & Lingkungan", role: "OFFICER" } },
        { step: 2, roleName: "Asman Operasi", status: "APPROVED", respondedAt: "2026-06-09T10:30:00.000Z", approver: { nama: "Pambudi", jenjangJabatan: "Asisten Manager Operasi", role: "ASMAN" } },
        { step: 3, roleName: "Manager Operasi", status: "APPROVED", respondedAt: "2026-06-09T13:00:00.000Z", approver: { nama: "Deni Junaidi", jenjangJabatan: "Manager Operasi", role: "MANAGER" } },
        { step: 4, roleName: "Branch Manager", status: "APPROVED", respondedAt: "2026-06-09T15:00:00.000Z", approver: { nama: "Ade Majid", jenjangJabatan: "Branch Manager", role: "BRANCH_MANAGER" } }
      ]
    });
  }

  const lembur = await prisma.lembur.findUnique({
    where: { id: lemburId },
    include: {
      user: {
        select: {
          nama: true,
          nip: true,
          jenjangJabatan: true,
          bidang: true,
          subBidang: true,
          tlGroup: true,
        },
      },
      approvals: {
        include: {
          approver: {
            select: { nama: true, jenjangJabatan: true, role: true },
          },
        },
        orderBy: { step: "asc" },
      },
    },
  });

  if (!lembur) {
    return NextResponse.json(
      { error: "Dokumen tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id:             lembur.id,
    nomorSpkl:      lembur.nomorSpkl,
    status:         lembur.status,
    kategori:       lembur.kategori,
    tanggalMulai:   lembur.tanggalMulai,
    tanggalSelesai: lembur.tanggalSelesai,
    deskripsi:      lembur.deskripsi,
    penugas:        lembur.penugas,
    submittedAt:    lembur.submittedAt,
    createdAt:      lembur.createdAt,
    user:           lembur.user,
    approvals: lembur.approvals.map((a) => ({
      step:        a.step,
      roleName:    a.roleName,
      status:      a.status,
      respondedAt: a.respondedAt,
      approver:    a.approver,
    })),
  });
}
