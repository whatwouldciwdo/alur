import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const bulan    = searchParams.get("bulan");
  const bidang   = searchParams.get("bidang");
  const status   = searchParams.get("status");
  const kategori = searchParams.get("kategori");

  let tanggalFilter = {};
  if (bulan) {
    const [year, month] = bulan.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59, 999);
    tanggalFilter = { tanggalMulai: { gte: startDate, lte: endDate } };
  }

  const where: Record<string, unknown> = { ...tanggalFilter };
  if (bidang)   where.user    = { bidang };
  if (status)   where.status  = status;
  if (kategori) where.kategori = kategori;

  const lemburs = await prisma.lembur.findMany({
    where,
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
        include: { approver: { select: { nama: true, role: true } } },
        orderBy: { step: "asc" },
      },
    },
    orderBy: { tanggalMulai: "desc" },
  });

  return NextResponse.json(lemburs);
}
