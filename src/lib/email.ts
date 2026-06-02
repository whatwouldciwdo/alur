import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function getBaseUrl(): string {
  let base = process.env.NEXTAUTH_URL || "https://alur-pips.netlify.app";
  if (process.env.NODE_ENV === "production" && base.includes("localhost")) {
    base = "https://alur-pips.netlify.app";
  }
  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  return base;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `"ALUR - Absen Lembur Ranger" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

function baseTemplate(content: string): string {
  return `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #1b1c1c; border-radius: 24px; overflow: hidden; box-shadow: 6px 6px 0px #1b1c1c; }
      .header { background: #006934; padding: 32px; text-align: center; }
      .header h1 { color: #ffffff; font-size: 28px; margin: 0; letter-spacing: 2px; }
      .header p { color: #c8f5d8; font-size: 13px; margin: 8px 0 0; }
      .body { padding: 32px; }
      .body h2 { color: #1b1c1c; font-size: 20px; margin-top: 0; }
      .body p { color: #444; line-height: 1.7; }
      .info-box { background: #f5f5f0; border: 2px solid #1b1c1c; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
      .info-row { display: flex; margin-bottom: 8px; }
      .info-label { font-weight: bold; min-width: 160px; color: #1b1c1c; }
      .info-value { color: #444; }
      .badge { display: inline-block; background: #006934; color: white; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 16px; }
      .badge-rejected { background: #9d3649; }
      .badge-revised { background: #e67e22; }
      .footer { background: #f5f5f0; border-top: 2px solid #1b1c1c; padding: 20px 32px; text-align: center; color: #888; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>ALUR</h1>
        <p>Absen Lembur Ranger — PLN Indonesia Power Services UBP Cilegon</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>© 2026 PLN Indonesia Power Services - UBP Cilegon</p>
        <p>Email ini dikirim otomatis, mohon tidak membalas.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export async function sendApprovalRequestEmail({
  to,
  approverName,
  pegawaiName,
  subBidang,
  tanggalMulai,
  tanggalSelesai,
  deskripsi,
  lemburId,
  roleName,
  token,
}: {
  to: string;
  approverName: string;
  pegawaiName: string;
  subBidang: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  deskripsi: string;
  lemburId: string;
  roleName: string;
  token: string;
}) {
  const base = getBaseUrl();
  const approveUrl = `${base}/approve/${token}?action=APPROVED`;
  const revisiUrl  = `${base}/approve/${token}?action=REVISED`;
  const tolakUrl   = `${base}/approve/${token}?action=REJECTED`;
  const btnStyle = "display:inline-block;padding:12px 24px;border-radius:100px;text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:1px;border:2px solid #1b1c1c;margin:0 4px;";

  const html = baseTemplate(`
    <span class="badge">PERSETUJUAN DIPERLUKAN</span>
    <h2>Halo, ${approverName}!</h2>
    <p>Anda mendapatkan permintaan persetujuan lembur sebagai <strong>${roleName}</strong>.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Nama Pegawai</span><span class="info-value">: ${pegawaiName}</span></div>
      <div class="info-row"><span class="info-label">Sub-Bidang</span><span class="info-value">: ${subBidang.replace(/_/g, " ")}</span></div>
      <div class="info-row"><span class="info-label">Jam Mulai</span><span class="info-value">: ${new Date(tanggalMulai).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</span></div>
      <div class="info-row"><span class="info-label">Jam Selesai</span><span class="info-value">: ${new Date(tanggalSelesai).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</span></div>
      <div class="info-row"><span class="info-label">Deskripsi</span><span class="info-value">: ${deskripsi}</span></div>
    </div>
    <p style="margin-bottom:8px;">Klik salah satu tombol di bawah untuk memberikan keputusan Anda:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${approveUrl}" style="${btnStyle}background:#006934;color:#ffffff;">✅ SETUJUI</a>
      <a href="${revisiUrl}"  style="${btnStyle}background:#e67e22;color:#ffffff;">⚠ REVISI</a>
      <a href="${tolakUrl}"   style="${btnStyle}background:#9d3649;color:#ffffff;">❌ TOLAK</a>
    </div>
    <p style="font-size:12px;color:#888;text-align:center;">
      Link ini hanya berlaku 7 hari dan hanya bisa digunakan sekali.<br>
      Jika Anda bukan penerima yang dituju, abaikan email ini.
    </p>
  `);

  await sendEmail({
    to,
    subject: `[ALUR] Persetujuan Lembur — ${pegawaiName} (${roleName})`,
    html,
  });
}

export async function sendApprovedEmail({
  to,
  pegawaiName,
  tanggalMulai,
  tanggalSelesai,
}: {
  to: string;
  pegawaiName: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}) {
  const html = baseTemplate(`
    <span class="badge">✓ LEMBUR DISETUJUI</span>
    <h2>Selamat, ${pegawaiName}!</h2>
    <p>Pengajuan lembur Anda telah <strong>disetujui oleh semua pihak</strong> dan telah direkap oleh Admin.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Tanggal Mulai</span><span class="info-value">: ${new Date(tanggalMulai).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div>
      <div class="info-row"><span class="info-label">Tanggal Selesai</span><span class="info-value">: ${new Date(tanggalSelesai).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div>
    </div>
    <p>Lembur Anda telah tercatat dalam sistem. Terima kasih atas dedikasi Anda!</p>
  `);

  await sendEmail({
    to,
    subject: `[ALUR] ✓ Lembur Anda Telah Disetujui`,
    html,
  });
}

export async function sendRejectedEmail({
  to,
  pegawaiName,
  rejectorName,
  roleName,
  catatan,
  tanggalMulai,
}: {
  to: string;
  pegawaiName: string;
  rejectorName: string;
  roleName: string;
  catatan?: string;
  tanggalMulai: Date;
}) {
  const html = baseTemplate(`
    <span class="badge badge-rejected">✗ LEMBUR DITOLAK</span>
    <h2>Halo, ${pegawaiName}</h2>
    <p>Pengajuan lembur Anda pada tanggal <strong>${new Date(tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong> telah <strong>ditolak</strong>.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Ditolak oleh</span><span class="info-value">: ${rejectorName} (${roleName})</span></div>
      <div class="info-row"><span class="info-label">Alasan</span><span class="info-value">: ${catatan || "Tidak ada keterangan."}</span></div>
    </div>
    <p>Jika ada pertanyaan, silakan hubungi atasan Anda secara langsung.</p>
  `);

  await sendEmail({
    to,
    subject: `[ALUR] ✗ Pengajuan Lembur Ditolak`,
    html,
  });
}

export async function sendRevisionEmail({
  to,
  pegawaiName,
  revisorName,
  roleName,
  catatan,
  tanggalMulai,
}: {
  to: string;
  pegawaiName: string;
  revisorName: string;
  roleName: string;
  catatan?: string;
  tanggalMulai: Date;
}) {
  const html = baseTemplate(`
    <span class="badge badge-revised">⚠ REVISI DIPERLUKAN</span>
    <h2>Halo, ${pegawaiName}</h2>
    <p>Pengajuan lembur Anda pada tanggal <strong>${new Date(tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong> memerlukan <strong>revisi</strong>.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Diminta revisi oleh</span><span class="info-value">: ${revisorName} (${roleName})</span></div>
      <div class="info-row"><span class="info-label">Catatan</span><span class="info-value">: ${catatan || "Tidak ada keterangan."}</span></div>
    </div>
    <p>Silakan login ke aplikasi ALUR untuk memperbaiki pengajuan Anda.</p>
    <p style="text-align:center; margin-top:24px;">
      <a href="${getBaseUrl()}/history"
         style="background:#006934;color:#fff;padding:12px 32px;border-radius:100px;text-decoration:none;font-weight:bold;letter-spacing:1px;border:2px solid #1b1c1c;display:inline-block;">
        BUKA HISTORY LEMBUR
      </a>
    </p>
  `);

  await sendEmail({
    to,
    subject: `[ALUR] ⚠ Pengajuan Lembur Memerlukan Revisi`,
    html,
  });
}

export async function sendPasswordResetEmail({
  to,
  pegawaiName,
  resetUrl,
}: {
  to: string;
  pegawaiName: string;
  resetUrl: string;
}) {
  const html = baseTemplate(`
    <span class="badge">🔐 RESET PASSWORD</span>
    <h2>Halo, ${pegawaiName}!</h2>
    <p>Super Admin telah mengirimkan permintaan reset password untuk akun ALUR Anda.</p>
    <p>Klik tombol di bawah untuk membuat password baru. Link ini <strong>berlaku selama 15 menit</strong> dan hanya bisa digunakan sekali.</p>
    <p style="text-align:center; margin-top:28px; margin-bottom:28px;">
      <a href="${resetUrl}"
         style="background:#006934;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:bold;letter-spacing:1px;border:2px solid #1b1c1c;display:inline-block;font-size:15px;">
        🔐 BUAT PASSWORD BARU
      </a>
    </p>
    <p style="font-size:12px;color:#888;text-align:center;">
      Jika Anda tidak meminta reset password, abaikan email ini.<br>
      Link akan kadaluarsa dalam 15 menit.
    </p>
  `);

  await sendEmail({
    to,
    subject: `[ALUR] 🔐 Reset Password Akun Anda`,
    html,
  });
}
