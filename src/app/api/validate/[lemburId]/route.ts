import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lemburId: string }> }
) {
  const { lemburId } = await params;

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
