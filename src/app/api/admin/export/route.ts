import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function formatDurasi(mulai: Date, selesai: Date): string {
  const diff = selesai.getTime() - mulai.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}j ${minutes}m`;
}

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
  const format   = searchParams.get("format") ?? "xlsx";

  let tanggalFilter = {};
  if (bulan) {
    const [year, month] = bulan.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
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
        },
      },
      approvals: {
        include: { approver: { select: { nama: true, role: true } } },
        orderBy: { step: "asc" },
      },
    },
    orderBy: [{ user: { bidang: "asc" } }, { tanggalMulai: "asc" }],
  });

  if (format === "json") {
    return NextResponse.json(lemburs);
  }

  const rows = lemburs.map((l, idx) => {
    const approvedApprovals = l.approvals.filter((a) => a.status === "APPROVED");
    const lastApprover = approvedApprovals[approvedApprovals.length - 1];

    return {
      No: idx + 1,
      Kategori: l.kategori ?? "LEMBUR",
      "Nomor SPKL": l.nomorSpkl ?? "-",
      Nama: l.user.nama,
      NIP: l.user.nip,
      Jabatan: l.user.jenjangJabatan,
      Bidang: l.user.bidang.replace("_", " & "),
      "Sub Bidang": l.user.subBidang.replace(/_/g, " "),
      "Tanggal Mulai": new Date(l.tanggalMulai).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      "Tanggal Selesai": new Date(l.tanggalSelesai).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      Durasi: formatDurasi(new Date(l.tanggalMulai), new Date(l.tanggalSelesai)),
      Deskripsi: l.deskripsi,
      Penugas: l.penugas ?? "-",
      Status: l.status,
      "Disetujui Oleh": lastApprover?.approver?.nama ?? "-",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const colWidths = [
    { wch: 5 }, { wch: 10 }, { wch: 35 },
    { wch: 30 }, { wch: 15 }, { wch: 25 },
    { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 22 },
    { wch: 12 }, { wch: 50 }, { wch: 25 }, { wch: 15 }, { wch: 30 },
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  const sheetName = bulan
    ? `Lembur ${bulan}`
    : "Rekap Lembur";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = `rekap-lembur${bulan ? "-" + bulan : ""}${bidang ? "-" + bidang.toLowerCase() : ""}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
