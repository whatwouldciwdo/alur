import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import crypto from "crypto";

// --- Load .env ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const GMAIL_USER = env.GMAIL_USER;
const GMAIL_APP_PASSWORD = env.GMAIL_APP_PASSWORD;
const BASE_URL = env.NEXTAUTH_URL ?? "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

// --- DATA DUMMY LEMBUR ---
const DUMMY_LEMBUR = {
  id: "dummy-lembur-test-001",
  pegawai: "Muci Wadam",
  nip: "8803012345",
  subBidang: "MEKANIK",
  tanggalMulai: new Date("2026-05-27T08:00:00+07:00"),
  tanggalSelesai: new Date("2026-05-27T16:00:00+07:00"),
  deskripsi: "DASAR: Inspeksi rutin pompa feed water\n\nURAIAN: Melakukan pengecekan kondisi pompa feed water unit 1, pelumasan bearing, dan pengukuran vibrasi",
  penugas: "Assistant Manager",
};

// --- WORKFLOW STEPS (6 orang sesuai permintaan) ---
const APPROVERS = [
  {
    step: 1,
    roleName: "TL Mekanik",
    name: "Kratih",
    email: "kratih1103@gmail.com",
  },
  {
    step: 2,
    roleName: "Asman Mekanik",
    name: "Rifan",
    email: "rifan5708@gmail.com",
  },
  {
    step: 3,
    roleName: "Manager Pemeliharaan",
    name: "Regandi Masta",
    email: "regandimasta.rd@gmail.com",
  },
  {
    step: 4,
    roleName: "Branch Manager IPS",
    name: "Firmanulloh",
    email: "firmanulloh038@gmail.com",
  },
  {
    step: 5,
    roleName: "Admin",
    name: "Martinus Bayu",
    email: "martinusbayuchris@gmail.com",
  },
  // Step 6 = notifikasi final ke pegawai
  {
    step: 6,
    roleName: "Notifikasi Pegawai",
    name: "Ian Campoes",
    email: "ancampoes@gmail.com",
  },
];

// --- TEMPLATE: Email Approval Request ---
function buildApprovalEmail({ approver, lembur, token, isLast }) {
  const approveUrl = `${BASE_URL}/approve/${token}?action=APPROVED`;
  const revisiUrl  = `${BASE_URL}/approve/${token}?action=REVISED`;
  const tolakUrl   = `${BASE_URL}/approve/${token}?action=REJECTED`;
  const btnStyle   = "display:inline-block;padding:14px 28px;border-radius:100px;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:1.5px;border:2px solid #1b1c1c;margin:0 6px;box-shadow:3px 3px 0 #1b1c1c;";

  const totalSteps = APPROVERS.length - 1; // 5 approval steps
  const progressPct = Math.round(((approver.step - 1) / totalSteps) * 100);

  // Progress bar dots
  const dots = Array.from({ length: totalSteps }, (_, i) => {
    const stepNum = i + 1;
    const isDone = stepNum < approver.step;
    const isCurrent = stepNum === approver.step;
    const color = isDone ? "#006934" : isCurrent ? "#f59e0b" : "#ddd";
    const textColor = isDone || isCurrent ? "#fff" : "#999";
    return `<td align="center" style="padding:0 4px;">
      <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2px solid #1b1c1c;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:${textColor};line-height:32px;text-align:center;">${stepNum}</div>
      <div style="font-size:10px;color:#666;margin-top:4px;white-space:nowrap;">${APPROVERS[i].roleName.split(" ")[0]}</div>
    </td>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f0;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:2px solid #1b1c1c;border-radius:24px;overflow:hidden;box-shadow:6px 6px 0 #1b1c1c;">

      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,#006934 0%,#008a44 60%,#00a352 100%);padding:32px;text-align:center;">
          <div style="display:inline-block;background:#fff;border-radius:50%;width:64px;height:64px;font-size:32px;line-height:64px;text-align:center;border:3px solid rgba(255,255,255,0.4);box-shadow:0 4px 16px rgba(0,0,0,0.2);margin-bottom:12px;">⚡</div>
          <h1 style="color:#fff;font-size:28px;margin:0 0 4px;letter-spacing:4px;font-weight:900;">ALUR</h1>
          <p style="color:#c8f5d8;font-size:12px;margin:0 0 2px;letter-spacing:1px;">Absen Lembur Ranger</p>
          <p style="color:rgba(255,255,255,0.7);font-size:11px;margin:0;">PLN Indonesia Power Services — UBP Cilegon</p>
        </td>
      </tr>

      <!-- BADGE -->
      <tr><td style="padding:0 32px;background:#fff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:-16px;">
          <tr><td align="center">
            <span style="display:inline-block;background:#f59e0b;color:#fff;padding:8px 24px;border-radius:100px;font-size:12px;font-weight:800;letter-spacing:2px;border:2px solid #1b1c1c;box-shadow:3px 3px 0 #1b1c1c;">
              ⏳ PERSETUJUAN STEP ${approver.step} DARI ${totalSteps}
            </span>
          </td></tr>
        </table>
      </td></tr>

      <!-- BODY -->
      <tr><td style="padding:24px 32px 8px;">
        <h2 style="color:#1b1c1c;font-size:20px;margin:0 0 8px;font-weight:800;">Halo, ${approver.name}! 👋</h2>
        <p style="color:#555;line-height:1.7;margin:0 0 20px;font-size:14px;">
          Anda mendapatkan permintaan persetujuan lembur sebagai <strong style="color:#006934;">${approver.roleName}</strong>. 
          Mohon tinjau dan berikan keputusan Anda sebelum link ini kadaluarsa (7 hari).
        </p>

        <!-- Progress Steps -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9faf9;border:2px solid #e0e8e0;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 12px;font-weight:700;font-size:12px;color:#006934;letter-spacing:1px;">PROGRESS APPROVAL</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>${dots}</tr>
            </table>
            <!-- Progress bar -->
            <div style="background:#e0e8e0;border-radius:100px;height:6px;margin-top:12px;overflow:hidden;">
              <div style="background:linear-gradient(90deg,#006934,#00a352);height:100%;width:${progressPct}%;border-radius:100px;"></div>
            </div>
            <p style="margin:8px 0 0;font-size:11px;color:#888;text-align:center;">${progressPct}% proses approval selesai</p>
          </td></tr>
        </table>

        <!-- Info Lembur -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f9f5;border:2px solid #1b1c1c;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 12px;font-weight:700;font-size:12px;color:#006934;letter-spacing:1px;">DETAIL LEMBUR</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:5px 0;font-weight:700;color:#1b1c1c;font-size:13px;width:40%;">👤 Nama Pegawai</td>
                <td style="padding:5px 0;color:#444;font-size:13px;">: ${lembur.pegawai}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-weight:700;color:#1b1c1c;font-size:13px;">🪪 NIP</td>
                <td style="padding:5px 0;color:#444;font-size:13px;">: ${lembur.nip}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-weight:700;color:#1b1c1c;font-size:13px;">🏭 Sub-Bidang</td>
                <td style="padding:5px 0;color:#444;font-size:13px;">: ${lembur.subBidang.replace(/_/g, " ")}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-weight:700;color:#1b1c1c;font-size:13px;">📅 Tanggal Mulai</td>
                <td style="padding:5px 0;color:#444;font-size:13px;">: ${lembur.tanggalMulai.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-weight:700;color:#1b1c1c;font-size:13px;">📅 Tanggal Selesai</td>
                <td style="padding:5px 0;color:#444;font-size:13px;">: ${lembur.tanggalSelesai.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-weight:700;color:#1b1c1c;font-size:13px;vertical-align:top;">📝 Deskripsi</td>
                <td style="padding:5px 0;color:#444;font-size:13px;">: ${lembur.deskripsi.replace(/\n/g, "<br>")}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;font-weight:700;color:#1b1c1c;font-size:13px;">👨‍💼 Penugas</td>
                <td style="padding:5px 0;color:#444;font-size:13px;">: ${lembur.penugas}</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <!-- Action Buttons -->
        <p style="color:#1b1c1c;font-weight:700;font-size:14px;margin:0 0 16px;">Berikan keputusan Anda:</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding-bottom:20px;">
            <a href="${approveUrl}" style="${btnStyle}background:#006934;color:#ffffff;">✅ SETUJUI</a>
            <a href="${revisiUrl}"  style="${btnStyle}background:#f59e0b;color:#ffffff;">⚠ REVISI</a>
            <a href="${tolakUrl}"   style="${btnStyle}background:#9d3649;color:#ffffff;">❌ TOLAK</a>
          </td></tr>
        </table>

        <p style="font-size:11px;color:#aaa;text-align:center;margin:0 0 8px;">
          ⏰ Link ini berlaku <strong>7 hari</strong> dan hanya bisa digunakan <strong>sekali</strong>.<br>
          Jika Anda bukan penerima yang dituju, abaikan email ini.
        </p>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#f5f9f5;border-top:2px solid #e0e8e0;padding:16px 32px;text-align:center;">
        <p style="color:#006934;font-weight:800;font-size:12px;margin:0 0 2px;letter-spacing:1px;">⚡ PLN INDONESIA POWER SERVICES</p>
        <p style="color:#888;font-size:11px;margin:0 0 2px;">Unit Bisnis Pembangkitan Cilegon</p>
        <p style="color:#aaa;font-size:10px;margin:0;">© 2026 ALUR PIPS — Email otomatis, mohon tidak dibalas.</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// --- TEMPLATE: Notifikasi Final ke Pegawai ---
function buildFinalNotifEmail({ recipientName, recipientEmail, lembur }) {
  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f0;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:2px solid #1b1c1c;border-radius:24px;overflow:hidden;box-shadow:6px 6px 0 #1b1c1c;">
      <tr>
        <td style="background:linear-gradient(135deg,#006934 0%,#008a44 60%,#00a352 100%);padding:32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🎉</div>
          <h1 style="color:#fff;font-size:26px;margin:0 0 4px;letter-spacing:3px;font-weight:900;">ALUR PIPS</h1>
          <p style="color:#c8f5d8;font-size:12px;margin:0;">PLN Indonesia Power Services — UBP Cilegon</p>
        </td>
      </tr>
      <tr><td style="padding:0 32px;background:#fff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:-16px;">
          <tr><td align="center">
            <span style="display:inline-block;background:#006934;color:#fff;padding:8px 24px;border-radius:100px;font-size:12px;font-weight:800;letter-spacing:2px;border:2px solid #1b1c1c;box-shadow:3px 3px 0 #1b1c1c;">
              ✅ LEMBUR DISETUJUI PENUH
            </span>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 32px;">
        <h2 style="color:#1b1c1c;font-size:20px;margin:0 0 12px;font-weight:800;">Selamat, ${recipientName}! 🎊</h2>
        <p style="color:#555;line-height:1.7;font-size:14px;margin:0 0 20px;">
          Pengajuan lembur Anda telah <strong style="color:#006934;">disetujui oleh semua pihak</strong> — 
          TL, Asman, Manager, Branch Manager, hingga Admin. Lembur Anda kini resmi tercatat dalam sistem ALUR.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f9f5;border:2px solid #1b1c1c;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 8px;font-weight:700;font-size:12px;color:#006934;letter-spacing:1px;">RINGKASAN LEMBUR DISETUJUI</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-weight:700;color:#1b1c1c;font-size:13px;width:40%;">📅 Tanggal Mulai</td><td style="padding:4px 0;color:#444;font-size:13px;">: ${lembur.tanggalMulai.toLocaleDateString("id-ID", { weekday:"long",day:"numeric",month:"long",year:"numeric" })}</td></tr>
              <tr><td style="padding:4px 0;font-weight:700;color:#1b1c1c;font-size:13px;">📅 Tanggal Selesai</td><td style="padding:4px 0;color:#444;font-size:13px;">: ${lembur.tanggalSelesai.toLocaleDateString("id-ID", { weekday:"long",day:"numeric",month:"long",year:"numeric" })}</td></tr>
              <tr><td style="padding:4px 0;font-weight:700;color:#1b1c1c;font-size:13px;">🏭 Sub-Bidang</td><td style="padding:4px 0;color:#444;font-size:13px;">: ${lembur.subBidang.replace(/_/g, " ")}</td></tr>
              <tr><td style="padding:4px 0;font-weight:700;color:#1b1c1c;font-size:13px;">✅ Status</td><td style="padding:4px 0;font-weight:800;color:#006934;font-size:13px;">: DISETUJUI PENUH</td></tr>
            </table>
          </td></tr>
        </table>
        <!-- All approvers signed -->
        <p style="color:#1b1c1c;font-weight:700;font-size:13px;margin:0 0 10px;">Disetujui oleh:</p>
        ${["TL Mekanik — Kratih ✅","Asman Mekanik — Rifan ✅","Manager Pemeliharaan — Regandi Masta ✅","Branch Manager IPS — Firmanulloh ✅","Admin — Martinus Bayu ✅"].map(s => `<p style="margin:4px 0;font-size:13px;color:#444;padding-left:12px;border-left:3px solid #006934;">• ${s}</p>`).join("")}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr><td align="center">
            <a href="${BASE_URL}/lembur/${lembur.id}" style="display:inline-block;background:#006934;color:#fff;padding:14px 40px;border-radius:100px;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:2px;border:2px solid #1b1c1c;box-shadow:4px 4px 0 #1b1c1c;">
              📄 LIHAT DETAIL LEMBUR
            </a>
          </td></tr>
        </table>
        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:16px;">Terima kasih atas dedikasi Anda untuk PLN Indonesia Power Services!</p>
      </td></tr>
      <tr><td style="background:#f5f9f5;border-top:2px solid #e0e8e0;padding:16px 32px;text-align:center;">
        <p style="color:#006934;font-weight:800;font-size:12px;margin:0 0 2px;letter-spacing:1px;">⚡ PLN INDONESIA POWER SERVICES</p>
        <p style="color:#aaa;font-size:10px;margin:0;">© 2026 ALUR PIPS — Email otomatis, mohon tidak dibalas.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// --- MAIN ---
async function main() {
  console.log("🔌 Verifikasi koneksi SMTP...");
  try {
    await transporter.verify();
    console.log("✅ SMTP terhubung!\n");
  } catch (err) {
    console.error("❌ SMTP gagal:", err.message);
    process.exit(1);
  }

  console.log("📋 DATA DUMMY LEMBUR:");
  console.log(`   Pegawai   : ${DUMMY_LEMBUR.pegawai} (${DUMMY_LEMBUR.nip})`);
  console.log(`   Sub-Bidang: ${DUMMY_LEMBUR.subBidang}`);
  console.log(`   Tanggal   : ${DUMMY_LEMBUR.tanggalMulai.toLocaleDateString("id-ID")} – ${DUMMY_LEMBUR.tanggalSelesai.toLocaleDateString("id-ID")}`);
  console.log("\n📨 Mengirim email approval step-by-step...\n");

  // Kirim ke 5 approvers (step 1-5)
  for (let i = 0; i < APPROVERS.length - 1; i++) {
    const approver = APPROVERS[i];
    const token = crypto.randomBytes(32).toString("hex");
    const html = buildApprovalEmail({ approver, lembur: DUMMY_LEMBUR, token, isLast: i === APPROVERS.length - 2 });

    try {
      await transporter.sendMail({
        from: `"ALUR PIPS - PLN IPS UBP Cilegon" <${GMAIL_USER}>`,
        to: approver.email,
        subject: `[ALUR] ⏳ Step ${approver.step}/${APPROVERS.length - 1} — Persetujuan Lembur ${DUMMY_LEMBUR.pegawai} (${approver.roleName})`,
        html,
      });
      console.log(`✅ Step ${approver.step} terkirim → ${approver.name} <${approver.email}> (${approver.roleName})`);
      await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
      console.error(`❌ Step ${approver.step} gagal → ${approver.email}: ${err.message}`);
    }
  }

  // Kirim notifikasi final ke pegawai (representasi = Ian Campoes)
  const finalRecipient = APPROVERS[APPROVERS.length - 1];
  const finalHtml = buildFinalNotifEmail({
    recipientName: finalRecipient.name,
    recipientEmail: finalRecipient.email,
    lembur: DUMMY_LEMBUR,
  });

  try {
    await transporter.sendMail({
      from: `"ALUR PIPS - PLN IPS UBP Cilegon" <${GMAIL_USER}>`,
      to: finalRecipient.email,
      subject: `[ALUR] 🎉 Lembur Anda Telah Disetujui Penuh — ${DUMMY_LEMBUR.pegawai}`,
      html: finalHtml,
    });
    console.log(`🎉 Notifikasi final terkirim → ${finalRecipient.name} <${finalRecipient.email}>`);
  } catch (err) {
    console.error(`❌ Notifikasi final gagal: ${err.message}`);
  }

  console.log("\n📊 SELESAI! Total 6 email terkirim:");
  console.log("   Step 1 → kratih1103@gmail.com (TL Mekanik)");
  console.log("   Step 2 → rifan5708@gmail.com (Asman Mekanik)");
  console.log("   Step 3 → regandimasta.rd@gmail.com (Manager Pemeliharaan)");
  console.log("   Step 4 → firmanulloh038@gmail.com (Branch Manager IPS)");
  console.log("   Step 5 → martinusbayuchris@gmail.com (Admin)");
  console.log("   Final  → ancampoes@gmail.com (Notifikasi Disetujui)");
  console.log("\n🚀 Workflow test selesai! Silakan cek inbox masing-masing.");
}

main();
