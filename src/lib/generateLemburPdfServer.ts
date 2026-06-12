/**
 * generateLemburPdfServer.ts
 * Server-side SPKL PDF generator (Node.js compatible).
 * Returns a Buffer — use as email attachment.
 * Does NOT use browser APIs (FileReader, window, document).
 */
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { getBaseUrl } from "./email";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LemburPdfServerData {
  id: string;
  nomorSpkl: string | null;
  status: string;
  kategori: string;
  tanggalMulai: Date | string;
  tanggalSelesai: Date | string;
  deskripsi: string;
  penugas: string | null;
  evidentUrl: string | null;
  submittedAt: Date | string;
  user: {
    nama: string;
    nip: string;
    jenjangJabatan: string;
    bidang: string;
    subBidang: string;
    tlGroup: string | null;
  };
  approvals: {
    step: number;
    roleName: string;
    status: string;
    respondedAt: Date | string | null;
    approver: { nama: string; role: string; jenjangJabatan: string } | null;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchAsBase64(url: string): Promise<string> {
  const fullUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Failed to fetch: ${fullUrl}`);
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString("base64");
  const mime = res.headers.get("content-type") ?? "image/png";
  return `data:${mime};base64,${b64}`;
}

function fmtDate(iso: Date | string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtDateShort(iso: Date | string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtDateFile(iso: Date | string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

const BIDANG_LABEL: Record<string, string> = {
  OPERASI: "Operasi", PEMELIHARAAN: "Pemeliharaan",
  SDM_KEU: "SDM & Keuangan", ENGINEERING: "Engineering",
};
const SUB_LABEL: Record<string, string> = {
  OPERATOR_SHIFT: "Operator BOP (Shift)", OPERATOR_NIAGA: "Niaga",
  K3: "K3", LINGKUNGAN: "Lingkungan", KEPMO: "Kepmo", SDM: "SDM",
  UMUM: "Umum", KEUANGAN: "Keuangan", PBJ: "PBJ", LISTRIK: "Listrik",
  IC: "I&C", MEKANIK: "Mekanik", BOP: "BOP", PDM: "PDM",
  ADMIN_SEKRETARIS: "Admin/Sekretaris",
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function generateLemburPdfServer(
  data: LemburPdfServerData
): Promise<{ buffer: Buffer; filename: string }> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W  = 210;
  const mL = 18;
  const mR = 18;
  const cW = W - mL - mR;
  let y    = 12;

  const DARK_BLUE  = [30,  58,  138] as const;
  const MID_BLUE   = [59,  130, 246] as const;
  const LIGHT_BLUE = [239, 246, 255] as const;
  const GRAY       = [100, 116, 139] as const;
  const GREEN      = [22,  163, 74 ] as const;
  const RED        = [220, 38,  38 ] as const;
  const AMBER      = [217, 119, 6  ] as const;

  // ── Blue top bar ─────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, 0, W, 8, "F");

  y = 12;

  // ── Logo ─────────────────────────────────────────────────────────────────────
  try {
    const logoB64 = await fetchAsBase64("/image/Logo-PLN-Indonesiapower-Services.png");
    doc.addImage(logoB64, "PNG", mL, y, 42, 14, undefined, "FAST");
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK_BLUE);
    doc.text("PLN IP SERVICES", mL, y + 8);
  }

  // ── Company info ─────────────────────────────────────────────────────────────
  const cxStart = mL + 47;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK_BLUE);
  doc.text("PT PLN INDONESIA POWER SERVICES", cxStart, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("Head Office — Jl. Raya Pasar Minggu No.190, Pejaten Bar., Ps. Minggu, Jakarta Selatan 12510", cxStart, y + 10.5);
  doc.setFontSize(7.5);
  doc.text("Telp: (6221) 2178 9990   |   info@plnipservices.co.id", cxStart, y + 15.5);
  y += 22;

  // ── Double divider ────────────────────────────────────────────────────────────
  doc.setDrawColor(...DARK_BLUE);
  doc.setLineWidth(0.8);
  doc.line(mL, y, W - mR, y);
  doc.setLineWidth(0.2);
  doc.line(mL, y + 1.5, W - mR, y + 1.5);
  y += 6;

  // ── Title ─────────────────────────────────────────────────────────────────────
  const isLembur = data.kategori === "LEMBUR";
  const titleTxt = isLembur
    ? "SURAT PERINTAH KERJA LEMBUR (SPKL)"
    : "SURAT PERINTAH PIKET";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK_BLUE);
  doc.text(titleTxt, W / 2, y, { align: "center" });
  y += 6;
  if (data.nomorSpkl) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(`Nomor: ${data.nomorSpkl}`, W / 2, y, { align: "center" });
    y += 4.5;
  }
  y += 4;

  // Helper — section header
  const sectionHeader = (label: string) => {
    doc.setFillColor(...LIGHT_BLUE);
    doc.setDrawColor(...MID_BLUE);
    doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, cW, 7, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK_BLUE);
    doc.text(label, mL + 3, y + 4.8);
    y += 10;
  };

  // Helper — 2-column info row
  const col1W = 26;
  const col2W = 56;
  const col3W = 26;
  const infoRow = (l1: string, v1: string, l2: string, v2: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(l1, mL, y);
    if (l2) doc.text(l2, mL + col1W + col2W, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(": " + v1, mL + col1W, y, { maxWidth: col2W - 2 });
    if (v2) doc.text(": " + v2, mL + col1W + col2W + col3W, y, { maxWidth: cW - col1W - col2W - col3W });
    y += 5.5;
  };

  // ── Data Pegawai ──────────────────────────────────────────────────────────────
  sectionHeader("DATA PEGAWAI");
  const isShift    = data.user.subBidang === "OPERATOR_SHIFT";
  const jenisKerja = isShift
    ? `SHIFT${data.user.tlGroup ? ` — Grup ${data.user.tlGroup}` : ""}`
    : "NON-SHIFT";
  infoRow("Nama",      data.user.nama,                                          "NIP",         data.user.nip);
  infoRow("Jabatan",   data.user.jenjangJabatan,                                "Bidang",      BIDANG_LABEL[data.user.bidang] ?? data.user.bidang);
  infoRow("Sub-Bidang",SUB_LABEL[data.user.subBidang] ?? data.user.subBidang,   "Jenis Kerja", jenisKerja);
  y += 2;

  // ── Detail Pekerjaan ─────────────────────────────────────────────────────────
  sectionHeader("DETAIL PEKERJAAN");
  infoRow("Tgl Mulai",   fmtDate(data.tanggalMulai),              "Tgl Selesai", fmtDate(data.tanggalSelesai));
  infoRow("Kategori",    isLembur ? "KERJA LEMBUR" : "PIKET",    "Penugas",     data.penugas || "-");
  infoRow("Diajukan",    fmtDate(data.submittedAt),               "",            "");

  // Deskripsi
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Deskripsi", mL, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const descLines = doc.splitTextToSize(": " + (data.deskripsi || "-"), cW - col1W + 2);
  doc.text(descLines, mL + col1W, y, { maxWidth: cW - col1W + 2 });
  y += Math.max(descLines.length * 4.8, 5.5) + 2;

  // ── Bukti / Lampiran ─────────────────────────────────────────────────────────
  if (data.evidentUrl) {
    if (y > 200) { doc.addPage(); y = 15; }
    sectionHeader("BUKTI / LAMPIRAN");
    try {
      const imgB64  = await fetchAsBase64(data.evidentUrl);
      const imgType = data.evidentUrl.endsWith(".png") ? "PNG" : "JPEG";
      doc.addImage(imgB64, imgType, mL, y, cW, 60, undefined, "FAST");
      y += 64;
    } catch {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text("[ Bukti tidak dapat dimuat ]", mL, y + 4);
      y += 10;
    }
    y += 2;
  }

  // ── Persetujuan ───────────────────────────────────────────────────────────────
  if (y + 55 > 275) { doc.addPage(); y = 15; }
  sectionHeader("RANTAI PERSETUJUAN");

  const approvals = data.approvals;
  const cols      = Math.min(approvals.length, 5);
  const colW      = cW / cols;
  const rowH      = 32;

  // Header row
  doc.setFillColor(...DARK_BLUE);
  doc.rect(mL, y, cW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  for (let i = 0; i < cols; i++) {
    doc.text(approvals[i].roleName, mL + colW * i + colW / 2, y + 4.5, { align: "center", maxWidth: colW - 2 });
  }
  y += 7;

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);

  for (let i = 0; i < cols; i++) {
    const a   = approvals[i];
    const x   = mL + colW * i;
    const isA = a.status === "APPROVED";
    const isR = a.status === "REJECTED";
    doc.setFillColor(isA ? 240 : isR ? 255 : 250, isA ? 253 : isR ? 240 : 250, isA ? 244 : isR ? 240 : 250);
    doc.rect(x, y, colW, rowH, "F");
    doc.line(x, y, x, y + rowH);
    doc.line(x, y + rowH, x + colW, y + rowH);
    let cy = y + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    const nameL = doc.splitTextToSize(a.approver?.nama || "-", colW - 4);
    doc.text(nameL, x + colW / 2, cy, { align: "center" });
    cy += nameL.length * 4;
    if (isA) {
      doc.setTextColor(...GREEN);
      doc.setFontSize(7.5);
      doc.text("✓ DISETUJUI", x + colW / 2, cy + 2, { align: "center" });
      cy += 6;
      if (a.respondedAt) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...GRAY);
        doc.text(fmtDateShort(a.respondedAt), x + colW / 2, cy, { align: "center" });
      }
    } else if (isR) {
      doc.setTextColor(...RED);
      doc.text("✗ DITOLAK", x + colW / 2, cy + 2, { align: "center" });
    } else {
      doc.setTextColor(...AMBER);
      doc.setFont("helvetica", "italic");
      doc.text("Menunggu...", x + colW / 2, cy + 2, { align: "center" });
    }
    doc.setTextColor(0, 0, 0);
  }
  doc.line(mL + cW, y, mL + cW, y + rowH);
  doc.line(mL, y, mL + cW, y);
  y += rowH + 8;

  // ── QR Code + Tanda Tangan Digital ───────────────────────────────────────────
  const validateUrl = `${getBaseUrl()}/validate/${data.id}`;
  const qrDataUrl   = await QRCode.toDataURL(validateUrl, {
    width: 160, margin: 1, errorCorrectionLevel: "M",
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });

  const qrSize = 38;
  const qrX    = W - mR - qrSize;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...MID_BLUE);
  doc.setLineWidth(0.5);
  doc.roundedRect(qrX - 2, y - 2, qrSize + 4, qrSize + 12, 3, 3, "FD");
  doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...MID_BLUE);
  doc.text("Scan untuk verifikasi", qrX + qrSize / 2, y + qrSize + 4, { align: "center" });
  doc.text("keaslian dokumen", qrX + qrSize / 2, y + qrSize + 8, { align: "center" });

  // Digital signatures (left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK_BLUE);
  doc.text("TANDA TANGAN DIGITAL", mL, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  let sigY = y + 10;
  for (const a of approvals.filter(a => a.status === "APPROVED")) {
    doc.setTextColor(...GRAY);
    doc.text(`${a.roleName}:`, mL, sigY);
    doc.setTextColor(0, 0, 0);
    doc.text(a.approver?.nama || "-", mL + 48, sigY);
    sigY += 5;
  }
  y = Math.max(sigY + 4, y + qrSize + 15);

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footerY = Math.max(y + 4, 283);
  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, footerY, W, 8, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(200, 220, 255);
  doc.text(
    `Dicetak: ${new Date().toLocaleString("id-ID")}  ·  Sistem ALUR — PT PLN Indonesia Power Services — Head Office Jakarta`,
    W / 2, footerY + 5, { align: "center" }
  );

  // ── Return Buffer ─────────────────────────────────────────────────────────────
  const safeName = data.user.nama.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStr  = fmtDateFile(data.tanggalMulai);
  const filename = `SPKL_${safeName}_${dateStr}.pdf`;

  const arrayBuffer = doc.output("arraybuffer");
  return { buffer: Buffer.from(arrayBuffer), filename };
}
