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

  const W = 210;
  const mL = 25; // Margin kiri lebih lebar untuk dokumen resmi
  const mR = 25;
  const cW = W - mL - mR;
  let y = 15;

  // ── KOP SURAT ─────────────────────────────────────────────────────────────
  try {
    const logoRes = await fetch("/image/Logo-PLN-Indonesiapower-Services.png");
    const logoBlob = await logoRes.blob();
    const logoB64 = await blobToBase64(logoBlob);
    doc.addImage(logoB64, "PNG", mL, y, 42, 14, undefined, "FAST");
  } catch (e) {
    console.error("Logo error", e);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PLN IP SERVICES", mL, y + 10);
  }

  // Teks Kop Surat di tengah atau kanan (mengikuti standar biasa)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0); // Black for formal docs
  doc.text("PT PLN INDONESIA POWER SERVICES", W / 2 + 10, y + 5, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Unit Bisnis Pembangkitan (UBP) Cilegon", W / 2 + 10, y + 10, { align: "center" });
  doc.setFontSize(9);
  doc.text("Jl. Indag Raya No.1, Cilegon, Banten 42445", W / 2 + 10, y + 14.5, { align: "center" });

  y += 20;

  // Garis Kop Surat (Ganda)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.0);
  doc.line(mL, y, W - mR, y);
  doc.setLineWidth(0.3);
  doc.line(mL, y + 1.5, W - mR, y + 1.5);
  y += 12;

  // ── JUDUL SURAT ───────────────────────────────────────────────────────────
  const isLembur = data.kategori === "LEMBUR";
  const titleTxt = isLembur ? "SURAT PERINTAH KERJA LEMBUR" : "SURAT PERINTAH PIKET";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(titleTxt, W / 2, y, { align: "center" });
  
  // Garis bawah untuk judul
  const titleWidth = doc.getTextWidth(titleTxt);
  doc.setLineWidth(0.3);
  doc.line((W - titleWidth) / 2, y + 1, (W + titleWidth) / 2, y + 1);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (data.nomorSpkl) {
    doc.text(`Nomor: ${data.nomorSpkl}`, W / 2, y, { align: "center" });
  }
  y += 12;

  // ── ISI SURAT ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Yang bertanda tangan di bawah ini, memberikan perintah ${isLembur ? "lembur" : "piket"} kepada:`, mL, y);
  y += 8;

  // Fungsi pembantu untuk membuat baris dengan titik dua yang rapi
  const drawRow = (label: string, value: string, currentY: number) => {
    doc.text(label, mL + 5, currentY);
    doc.text(":", mL + 45, currentY);
    doc.text(value, mL + 48, currentY);
  };

  doc.setFont("helvetica", "bold");
  drawRow("Nama", data.user.nama, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  drawRow("NIP", data.user.nip, y);
  y += 6;
  drawRow("Jabatan", data.user.jenjangJabatan, y);
  y += 6;
  const bidangStr = `${BIDANG_LABEL[data.user.bidang] ?? data.user.bidang} / ${SUB_LABEL[data.user.subBidang] ?? data.user.subBidang}`;
  drawRow("Bidang / Bagian", bidangStr, y);
  y += 6;
  
  const isShift = data.user.subBidang === "OPERATOR_SHIFT";
  const jenisKerja = isShift
    ? `SHIFT${data.user.tlGroup ? ` — Grup ${data.user.tlGroup}` : ""}`
    : "NON-SHIFT";
  drawRow("Jenis Kerja", jenisKerja, y);
  y += 10;

  doc.text(`Untuk melaksanakan pekerjaan di luar jam kerja normal (${isLembur ? "lembur" : "piket"}), dengan rincian sebagai berikut:`, mL, y);
  y += 8;

  drawRow("Kategori Pekerjaan", isLembur ? "KERJA LEMBUR" : "PIKET", y);
  y += 6;
  drawRow("Waktu Mulai", fmtDate(data.tanggalMulai), y);
  y += 6;
  drawRow("Waktu Selesai", fmtDate(data.tanggalSelesai), y);
  y += 6;
  
  // Penanganan deskripsi multiline
  doc.text("Uraian Pekerjaan", mL + 5, y);
  doc.text(":", mL + 45, y);
  const descLines = doc.splitTextToSize(data.deskripsi || "-", cW - 48);
  doc.text(descLines, mL + 48, y);
  y += Math.max(descLines.length * 5, 5) + 4;

  if (data.penugas) {
    drawRow("Diberikan Oleh", data.penugas, y);
    y += 10;
  } else {
    y += 4;
  }

  doc.text(`Demikian surat perintah kerja ${isLembur ? "lembur" : "piket"} ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.`, mL, y, { maxWidth: cW, align: "justify" });
  y += 20;

  // ── BAGIAN TANDA TANGAN ───────────────────────────────────────────────────
  // Bagian kanan untuk kota dan tanggal
  const dateStr = `Cilegon, ${new Date(data.submittedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(dateStr, W - mR - 10, y, { align: "right" });
  y += 12;

  // QR Code global untuk dimasukkan ke setiap blok TTE (Tanda Tangan Elektronik)
  const validateUrl = `${baseUrl}/validate/${data.id}`;
  const qrDataUrl = await QRCode.toDataURL(validateUrl, {
    width: 60, margin: 0, errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  // Tabel Tanda Tangan (Grid Layout)
  // Menampilkan maksimal 3 approver terakhir di bawah
  const approvers = data.approvals.filter(a => a.status === "APPROVED");
  // Jika lebih dari 3, ambil 3 terakhir
  const sigApprovers = approvers.length > 3 ? approvers.slice(-3) : approvers;
  
  if (sigApprovers.length > 0) {
    const sigWidth = cW / sigApprovers.length;
    const startX = mL;
    
    // Role names
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    sigApprovers.forEach((app, idx) => {
      const xCenter = startX + (sigWidth * idx) + (sigWidth / 2);
      // Print role/title
      const roleLines = doc.splitTextToSize(app.roleName, sigWidth - 4);
      doc.text(roleLines, xCenter, y, { align: "center" });
    });
    
    const signatureY = y + 5;
    y += 28; // Space for signature / QR
    
    // Names & Signatures
    sigApprovers.forEach((app, idx) => {
      const xCenter = startX + (sigWidth * idx) + (sigWidth / 2);
      
      // -- Digital Signature dgn QR Code --
      const qrSize = 12;
      const qrX = xCenter - (qrSize / 2);
      doc.addImage(qrDataUrl, "PNG", qrX, signatureY + 2, qrSize, qrSize);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text("Ditandatangani secara elektronik", xCenter, signatureY + qrSize + 4, { align: "center" });
      // -----------------------------
      
      // Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(app.approver.nama, xCenter, y, { align: "center" });
      
      // NIP placeholder or line
      doc.setLineWidth(0.2);
      doc.setDrawColor(0, 0, 0);
      const nameWidth = doc.getTextWidth(app.approver.nama);
      doc.line(xCenter - (nameWidth/2) - 5, y + 1, xCenter + (nameWidth/2) + 5, y + 1);
    });
    y += 18;
  } else {
    y += 40;
  }

  // Jika halaman hampir habis sebelum QR, tambahkan halaman baru
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // ── QR CODE & LOG LOGIC ───────────────────────────────────────────────────
  // Kita buat garis pemisah tipis
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(mL, y, W - mR, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Log Persetujuan Digital:", mL, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  // Log all approvals
  data.approvals.forEach((app, idx) => {
    let statTxt = "Menunggu";
    if (app.status === "APPROVED") statTxt = `Disetujui pada ${fmtDateShort(app.respondedAt || "")}`;
    else if (app.status === "REJECTED") statTxt = `Ditolak pada ${fmtDateShort(app.respondedAt || "")}`;

    const logText = `${idx + 1}. [${statTxt}] oleh: ${app.approver?.nama || "-"} (${app.roleName})`;
    doc.text(logText, mL, y);
    y += 5;
  });

  // QR Code global untuk log
  const qrSize = 25;
  const qrY = y - (data.approvals.length * 5) - 5; // Align with log title
  const qrX = W - mR - qrSize;
  
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("Scan QR untuk validasi", qrX + (qrSize/2), qrY + qrSize + 3, { align: "center" });
  doc.text("dokumen elektronik", qrX + (qrSize/2), qrY + qrSize + 6, { align: "center" });

  // ── FOOTER HALAMAN 1 ──────────────────────────────────────────────────────
  const pageH = 297;
  const printFooter = () => {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Dicetak dari Sistem ALUR pada ${new Date().toLocaleString("id-ID")} | PT PLN Indonesia Power Services`,
      W / 2, pageH - 15,
      { align: "center" }
    );
  };
  printFooter();

  // ── HALAMAN 2: LAMPIRAN ───────────────────────────────────────────────────
  if (data.evidentUrl) {
    doc.addPage();
    y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("LAMPIRAN", W / 2, y, { align: "center" });
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (data.nomorSpkl) {
      doc.text(`Lampiran untuk SPKL Nomor: ${data.nomorSpkl}`, W / 2, y, { align: "center" });
      y += 10;
    }

    // Load evident image
    try {
      const imgRes = await fetch(data.evidentUrl);
      const imgBlob = await imgRes.blob();
      const imgB64 = await blobToBase64(imgBlob);
      const imgType = imgBlob.type.includes("png") ? "PNG" : "JPEG";
      
      // Karena kita mendownload dari cloud (Supabase), 
      // ukuran aslinya tidak diketahui langsung dari base64 secara sinkron di jsPDF tanpa memuat Image object,
      // kita set ke lebar maksimal, lalu jsPDF akan menyesuaikan proporsi (atau kita bisa ambil info image, tapi untuk simplify kita pakai fixed max width dan set alias supaya proporsional).
      // Untuk amannya, kita beri space besar di bawah.
      
      // Calculate max width/height to fit page
      const maxImgW = W - (mL * 2);
      const maxImgH = pageH - y - 30; // Leave space for footer
      
      // doc.addImage takes (base64, format, x, y, width, height)
      // If we only provide width and height as undefined or skip them, it prints native resolution,
      // which might be huge. We can use a trick: create an Image element to get dimensions if in browser.
      
      const imgProps = doc.getImageProperties(imgB64);
      const imgRatio = imgProps.height / imgProps.width;
      
      let finalW = maxImgW;
      let finalH = finalW * imgRatio;
      
      if (finalH > maxImgH) {
        finalH = maxImgH;
        finalW = finalH / imgRatio;
      }
      
      // Center the image horizontally
      const imgX = (W - finalW) / 2;

      doc.addImage(imgB64, imgType, imgX, y, finalW, finalH, undefined, "FAST");
    } catch (e) {
      console.error("Evident image error", e);
      doc.setFont("helvetica", "italic");
      doc.text("[ Gagal memuat foto lampiran ]", W / 2, y + 20, { align: "center" });
    }

    printFooter();
  }

  // ── SAVE ──────────────────────────────────────────────────────────────────────
  const safeName = data.user.nama.replace(/[^a-zA-Z0-9]/g, "_");
  const fileDateStr  = fmtDateFile(data.tanggalMulai);
  const isLemburName = isLembur ? "SPKL" : "SPP";
  const filename = `${isLemburName}_${safeName}_${fileDateStr}.pdf`;
  doc.save(filename);
}
