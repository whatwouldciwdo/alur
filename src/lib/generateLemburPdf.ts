/**
 * generateLemburPdf.ts
 * Client-side SPKL PDF generator using jsPDF + QRCode.
 * Call from a "use client" component only.
 */
import jsPDF from "jspdf";
import QRCode from "qrcode";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LemburPdfData {
  id: string;
  nomorSpkl: string | null;
  status: string;
  kategori: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  penugas: string | null;
  evidentUrl: string | null;
  submittedAt: string;
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
    respondedAt: string | null;
    approver: { nama: string; role: string; jenjangJabatan: string };
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fmtDate(iso: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtDateShort(iso: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtDateFile(iso: string): string {
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

// ─── Main Generator ───────────────────────────────────────────────────────────

export async function generateLemburPdf(
  data: LemburPdfData,
  baseUrl: string
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;      // page width
  const mL = 18;      // left margin
  const mR = 18;      // right margin
  const cW = W - mL - mR; // content width ≈ 174mm
  let y = 12;

  const DARK_BLUE  = [30,  58,  138] as const;
  const MID_BLUE   = [59,  130, 246] as const;
  const LIGHT_BLUE = [239, 246, 255] as const;
  const GRAY       = [100, 116, 139] as const;
  const GREEN      = [22,  163, 74 ] as const;
  const RED        = [220, 38,  38 ] as const;
  const AMBER      = [217, 119, 6  ] as const;

  // ── KOP / HEADER ─────────────────────────────────────────────────────────────
  // Blue top bar
  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, 0, W, 8, "F");

  y = 12;

  // Logo (fetch from public folder)
  try {
    const logoRes  = await fetch("/image/Logo-PLN-Indonesiapower-Services.png");
    const logoBlob = await logoRes.blob();
    const logoB64  = await blobToBase64(logoBlob);
    doc.addImage(logoB64, "PNG", mL, y, 42, 14, undefined, "FAST");
  } catch {
    // Fallback text if logo fails
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK_BLUE);
    doc.text("PLN IP SERVICES", mL, y + 9);
  }

  // Company block (right of logo)
  const cxStart = mL + 47;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK_BLUE);
  doc.text("PT PLN INDONESIA POWER SERVICES", cxStart, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Unit Bisnis Pembangkitan (UBP) Cilegon", cxStart, y + 10);
  doc.text("Jl. Indag Raya No.1, Cilegon, Banten 42445", cxStart, y + 14.5);

  y += 20;

  // Divider — double line
  doc.setDrawColor(...DARK_BLUE);
  doc.setLineWidth(0.8);
  doc.line(mL, y, W - mR, y);
  doc.setLineWidth(0.2);
  doc.line(mL, y + 1.5, W - mR, y + 1.5);
  y += 6;

  // ── TITLE ─────────────────────────────────────────────────────────────────────
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

  // ── DATA PEGAWAI ──────────────────────────────────────────────────────────────
  // Section header
  doc.setFillColor(...LIGHT_BLUE);
  doc.setDrawColor(...MID_BLUE);
  doc.setLineWidth(0.3);
  doc.roundedRect(mL, y, cW, 7, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK_BLUE);
  doc.text("DATA PEGAWAI", mL + 3, y + 4.8);
  y += 10;

  const isShift  = data.user.subBidang === "OPERATOR_SHIFT";
  const jenisKerja = isShift
    ? `SHIFT${data.user.tlGroup ? ` — Grup ${data.user.tlGroup}` : ""}`
    : "NON-SHIFT";

  const rows1 = [
    ["Nama",        data.user.nama,                          "NIP",         data.user.nip],
    ["Jabatan",     data.user.jenjangJabatan,                "Bidang",      BIDANG_LABEL[data.user.bidang] ?? data.user.bidang],
    ["Sub-Bidang",  SUB_LABEL[data.user.subBidang] ?? data.user.subBidang, "Jenis Kerja", jenisKerja],
  ];

  const col1W = 26;
  const col2W = 56;
  const col3W = 26;

  for (const [l1, v1, l2, v2] of rows1) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(l1,       mL,                y);
    doc.text(l2,       mL + col1W + col2W, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(": " + v1, mL + col1W,       y, { maxWidth: col2W - 2 });
    doc.text(": " + v2, mL + col1W + col2W + col3W, y, { maxWidth: cW - col1W - col2W - col3W });
    y += 5.5;
  }
  y += 2;

  // ── DETAIL PEKERJAAN ─────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_BLUE);
  doc.setDrawColor(...MID_BLUE);
  doc.roundedRect(mL, y, cW, 7, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK_BLUE);
  doc.text("DETAIL PEKERJAAN", mL + 3, y + 4.8);
  y += 10;

  const rows2 = [
    ["Tanggal Mulai",   fmtDate(data.tanggalMulai),   "Tanggal Selesai", fmtDate(data.tanggalSelesai)],
    ["Kategori",        isLembur ? "KERJA LEMBUR" : "PIKET", "Penugas", data.penugas || "-"],
    ["Tanggal Diajukan",fmtDate(data.submittedAt),    "",                ""],
  ];

  for (const [l1, v1, l2, v2] of rows2) {
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
  }

  // Deskripsi (multi-line)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Deskripsi", mL, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const descLines = doc.splitTextToSize(": " + (data.deskripsi || "-"), cW - col1W + 2);
  doc.text(descLines, mL + col1W, y, { maxWidth: cW - col1W + 2 });
  y += Math.max(descLines.length * 4.8, 5.5) + 2;

  // ── BUKTI / LAMPIRAN ─────────────────────────────────────────────────────────
  if (data.evidentUrl) {
    if (y > 200) { doc.addPage(); y = 15; }

    doc.setFillColor(...LIGHT_BLUE);
    doc.setDrawColor(...MID_BLUE);
    doc.roundedRect(mL, y, cW, 7, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK_BLUE);
    doc.text("BUKTI / LAMPIRAN", mL + 3, y + 4.8);
    y += 10;

    try {
      const imgRes  = await fetch(data.evidentUrl);
      const imgBlob = await imgRes.blob();
      const imgB64  = await blobToBase64(imgBlob);
      const imgType = imgBlob.type.includes("png") ? "PNG" : "JPEG";
      const maxH    = 60;
      doc.addImage(imgB64, imgType, mL, y, cW, maxH, undefined, "FAST");
      y += maxH + 4;
    } catch {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text("[ Bukti tidak dapat dimuat ]", mL, y + 4);
      y += 10;
    }
    y += 2;
  }

  // ── PERSETUJUAN ───────────────────────────────────────────────────────────────
  const blockNeeded = 55;
  if (y + blockNeeded > 275) { doc.addPage(); y = 15; }

  doc.setFillColor(...LIGHT_BLUE);
  doc.setDrawColor(...MID_BLUE);
  doc.roundedRect(mL, y, cW, 7, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK_BLUE);
  doc.text("RANTAI PERSETUJUAN", mL + 3, y + 4.8);
  y += 10;

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
    const a = approvals[i];
    doc.text(a.roleName, mL + colW * i + colW / 2, y + 4.5, {
      align: "center", maxWidth: colW - 2,
    });
  }
  y += 7;

  // Body rows
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);

  for (let i = 0; i < cols; i++) {
    const a   = approvals[i];
    const x   = mL + colW * i;
    const isA = a.status === "APPROVED";
    const isR = a.status === "REJECTED";

    // Cell bg
    doc.setFillColor(isA ? 240 : isR ? 255 : 250, isA ? 253 : isR ? 240 : 250, isA ? 244 : isR ? 240 : 250);
    doc.rect(x, y, colW, rowH, "F");

    // Borders
    doc.line(x, y, x, y + rowH);
    doc.line(x, y + rowH, x + colW, y + rowH);

    let cy = y + 5;

    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    const nameL = doc.splitTextToSize(a.approver?.nama || "-", colW - 4);
    doc.text(nameL, x + colW / 2, cy, { align: "center" });
    cy += nameL.length * 4;

    // Status
    if (isA) {
      doc.setTextColor(...GREEN);
      doc.setFont("helvetica", "bold");
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
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("✗ DITOLAK", x + colW / 2, cy + 2, { align: "center" });
    } else {
      doc.setTextColor(...AMBER);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.text("Menunggu...", x + colW / 2, cy + 2, { align: "center" });
    }
    doc.setTextColor(0, 0, 0);
  }
  // Right border
  doc.line(mL + cW, y, mL + cW, y + rowH);
  doc.line(mL, y, mL + cW, y);
  y += rowH + 8;

  // ── QR CODE + TANDA TANGAN DIGITAL ───────────────────────────────────────────
  const validateUrl = `${baseUrl}/validate/${data.id}`;
  const qrDataUrl   = await QRCode.toDataURL(validateUrl, {
    width: 160, margin: 1, errorCorrectionLevel: "M",
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });

  const qrSize = 38;
  const qrX    = W - mR - qrSize;

  // QR box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...MID_BLUE);
  doc.setLineWidth(0.5);
  doc.roundedRect(qrX - 2, y - 2, qrSize + 4, qrSize + 12, 3, 3, "FD");
  doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

  // Scan note under QR
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...MID_BLUE);
  doc.text("Scan untuk verifikasi", qrX + qrSize / 2, y + qrSize + 4, { align: "center" });
  doc.text("keaslian dokumen", qrX + qrSize / 2, y + qrSize + 8, { align: "center" });

  // Digital signatures block (left side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK_BLUE);
  doc.text("TANDA TANGAN DIGITAL", mL, y + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  let sigY = y + 10;
  const approvedOnes = data.approvals.filter(a => a.status === "APPROVED");
  for (const a of approvedOnes) {
    doc.setTextColor(...GRAY);
    doc.text(`${a.roleName}:`, mL, sigY);
    doc.setTextColor(0, 0, 0);
    doc.text(a.approver?.nama || "-", mL + 48, sigY);
    sigY += 5;
  }

  y = Math.max(sigY + 4, y + qrSize + 15);

  // ── FOOTER ────────────────────────────────────────────────────────────────────
  const pageH = 297;
  const footerY = Math.max(y + 4, pageH - 14);

  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, footerY, W, 8, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(200, 220, 255);
  doc.text(
    `Dicetak: ${new Date().toLocaleString("id-ID")}  ·  Sistem ALUR — PT PLN Indonesia Power Services UBP Cilegon`,
    W / 2, footerY + 5,
    { align: "center" }
  );

  // ── SAVE ──────────────────────────────────────────────────────────────────────
  const safeName = data.user.nama.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStr  = fmtDateFile(data.tanggalMulai);
  const filename = `SPKL_${safeName}_${dateStr}.pdf`;
  doc.save(filename);
}
