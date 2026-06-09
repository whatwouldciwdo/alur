import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

// Helpers
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

async function run() {
  const data = {
    id: "dummy-lembur-123456",
    nomorSpkl: "SPKL/OPR/2026/06/001",
    status: "APPROVED",
    kategori: "LEMBUR",
    tanggalMulai: "2026-06-10T08:00:00Z",
    tanggalSelesai: "2026-06-10T17:00:00Z",
    deskripsi: "Penyelesaian laporan bulanan operasi dan rekapitulasi data energi.",
    penugas: "Ade Majid",
    evidentUrl: "dummy", // we will intercept this
    submittedAt: "2026-06-09T08:00:00Z",
    user: {
      nama: "Ahmad Yani",
      nip: "1778258308",
      jenjangJabatan: "Pelaksana K3",
      bidang: "OPERASI",
      subBidang: "K3",
      tlGroup: null,
    },
    approvals: [
      {
        step: 1,
        roleName: "Officer K3 & Lingkungan",
        status: "APPROVED",
        respondedAt: "2026-06-09T09:00:00Z",
        approver: { nama: "Supiin", role: "OFFICER", jenjangJabatan: "Officer K3 & Lingkungan" }
      },
      {
        step: 2,
        roleName: "Asman Operasi",
        status: "APPROVED",
        respondedAt: "2026-06-09T10:30:00Z",
        approver: { nama: "Pambudi", role: "ASMAN", jenjangJabatan: "Asisten Manager Operasi" }
      },
      {
        step: 3,
        roleName: "Manager Operasi",
        status: "APPROVED",
        respondedAt: "2026-06-09T13:00:00Z",
        approver: { nama: "Deni Junaidi", role: "MANAGER", jenjangJabatan: "Manager Operasi" }
      },
      {
        step: 4,
        roleName: "Branch Manager",
        status: "APPROVED",
        respondedAt: "2026-06-09T15:00:00Z",
        approver: { nama: "Ade Majid", role: "BRANCH_MANAGER", jenjangJabatan: "Branch Manager" }
      }
    ]
  };

  const baseUrl = "http://localhost:3000";

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const mL = 25; // Margin kiri lebih lebar untuk dokumen resmi
  const mR = 25;
  const cW = W - mL - mR;
  let y = 15;

  // ── KOP SURAT ─────────────────────────────────────────────────────────────
  try {
    const logoPath = path.join(process.cwd(), "public/image/Logo-PLN-Indonesiapower-Services.png");
    const logoBuf = fs.readFileSync(logoPath);
    const logoB64 = "data:image/png;base64," + logoBuf.toString("base64");
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
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SURAT PERINTAH KERJA LEMBUR", W / 2, y, { align: "center" });
  
  // Garis bawah untuk judul
  const titleWidth = doc.getTextWidth("SURAT PERINTAH KERJA LEMBUR");
  doc.setLineWidth(0.3);
  doc.line((W - titleWidth) / 2, y + 1, (W + titleWidth) / 2, y + 1);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nomor: ${data.nomorSpkl}`, W / 2, y, { align: "center" });
  y += 12;

  // ── ISI SURAT ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Yang bertanda tangan di bawah ini, memberikan perintah lembur kepada:", mL, y);
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
  drawRow("Jenis Kerja", "SHIFT", y);
  y += 10;

  doc.text("Untuk melaksanakan pekerjaan di luar jam kerja normal (lembur), dengan rincian sebagai berikut:", mL, y);
  y += 8;

  drawRow("Kategori Pekerjaan", "KERJA LEMBUR", y);
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

  doc.text("Demikian surat perintah kerja lembur ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.", mL, y, { maxWidth: cW, align: "justify" });
  y += 20;

  // ── BAGIAN TANDA TANGAN ───────────────────────────────────────────────────
  // Bagian kanan untuk kota dan tanggal
  const dateStr = `Cilegon, ${new Date(data.submittedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(dateStr, W - mR - 10, y, { align: "right" });
  y += 12; // Jarak antara tanggal dan tabel tanda tangan

  // Generate QR Code untuk ditaruh di masing-masing TTE
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
    const logText = `${idx + 1}. Disetujui oleh: ${app.approver.nama} (${app.roleName}) pada ${fmtDateShort(app.respondedAt || "")}`;
    doc.text(logText, mL, y);
    y += 5;
  });

  // QR Code
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
    doc.text(`Lampiran untuk SPKL Nomor: ${data.nomorSpkl}`, W / 2, y, { align: "center" });
    y += 10;

    // Load evident image (dummy uses logo)
    try {
      const evidentPath = path.join(process.cwd(), "public/image/Logo-PLN-Indonesiapower-Services.png");
      const evidentBuf = fs.readFileSync(evidentPath);
      const evidentB64 = "data:image/png;base64," + evidentBuf.toString("base64");
      
      // Calculate max width/height to fit page
      const maxImgW = W - (mL * 2);
      const maxImgH = pageH - y - 30; // Leave space for footer
      
      // Assuming logo ratio 3:1 for dummy, adjust in real app based on actual ratio
      const imgW = maxImgW;
      const imgH = maxImgW / 3; 

      doc.addImage(evidentB64, "PNG", mL, y, imgW, imgH, undefined, "FAST");
    } catch (e) {
      console.error("Evident image error", e);
      doc.setFont("helvetica", "italic");
      doc.text("[ Gagal memuat foto lampiran ]", W / 2, y + 20, { align: "center" });
    }

    printFooter();
  }

  const outPath = path.join(process.cwd(), "dummy_spkl_v5.pdf");
  fs.writeFileSync(outPath, Buffer.from(doc.output("arraybuffer")));
  console.log("PDF saved to", outPath);
}

run().catch(console.error);
