import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// --- Load .env manual ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
}

const GMAIL_USER = env.GMAIL_USER;
const GMAIL_APP_PASSWORD = env.GMAIL_APP_PASSWORD;

// --- Daftar penerima ---
const recipients = [
  "kratih1103@gmail.com",
  "rifan5708@gmail.com",
  "regandimasta.rd@gmail.com",
  "firmanulloh038@gmail.com",
  "martinusbayuchris@gmail.com",
  "iancampoes@gmail.com",
  "muciwadam77@gmail.com",
];

// --- Template email premium ---
function buildEmailHtml() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALUR PIPS — SMTP Berhasil</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #1b1c1c;border-radius:24px;overflow:hidden;box-shadow:6px 6px 0 #1b1c1c;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#006934 0%,#008a44 60%,#00a352 100%);padding:36px 32px;text-align:center;">
              <!-- Logo PLN IPS -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td align="center">
                    <!-- PLN Lightning bolt SVG icon inline -->
                    <div style="display:inline-block;background:#fff;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:38px;text-align:center;border:3px solid rgba(255,255,255,0.4);box-shadow:0 4px 16px rgba(0,0,0,0.2);">
                      ⚡
                    </div>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:32px;margin:0 0 4px;letter-spacing:4px;font-weight:900;text-shadow:0 2px 8px rgba(0,0,0,0.2);">ALUR</h1>
              <p style="color:#c8f5d8;font-size:13px;margin:0 0 4px;letter-spacing:1px;">Absen Lembur Ranger</p>
              <p style="color:rgba(255,255,255,0.75);font-size:11px;margin:0;letter-spacing:0.5px;">PLN Indonesia Power Services — UBP Cilegon</p>
            </td>
          </tr>

          <!-- STATUS BADGE -->
          <tr>
            <td style="padding:0 32px;background:#fff;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:-16px;">
                <tr>
                  <td align="center">
                    <span style="display:inline-block;background:#006934;color:#fff;padding:8px 24px;border-radius:100px;font-size:13px;font-weight:700;letter-spacing:2px;border:2px solid #1b1c1c;box-shadow:3px 3px 0 #1b1c1c;">
                      ✅ SMTP BERHASIL TERHUBUNG
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px 32px 8px;">
              <h2 style="color:#1b1c1c;font-size:22px;margin:0 0 12px;font-weight:800;">Halo, Ranger! 👋</h2>
              <p style="color:#444;line-height:1.8;margin:0 0 20px;font-size:15px;">
                Email ini merupakan konfirmasi bahwa sistem pengiriman email pada aplikasi 
                <strong style="color:#006934;">ALUR PIPS</strong> 
                (Absen Lembur Ranger — PLN Indonesia Power Services) 
                telah <strong>berhasil dikonfigurasi</strong> dan siap digunakan.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f9f5;border:2px solid #1b1c1c;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-weight:700;color:#006934;font-size:14px;width:50%;">📡 Status SMTP</td>
                        <td style="padding:6px 0;color:#1b1c1c;font-size:14px;"><strong>Aktif & Terhubung</strong></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-weight:700;color:#006934;font-size:14px;">🔧 Server</td>
                        <td style="padding:6px 0;color:#444;font-size:14px;">Gmail SMTP</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-weight:700;color:#006934;font-size:14px;">🏢 Organisasi</td>
                        <td style="padding:6px 0;color:#444;font-size:14px;">PLN IPS UBP Cilegon</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-weight:700;color:#006934;font-size:14px;">📅 Waktu Uji</td>
                        <td style="padding:6px 0;color:#444;font-size:14px;">${new Date().toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Features Section -->
              <p style="color:#1b1c1c;font-weight:700;font-size:15px;margin:0 0 12px;">Fitur yang sudah siap digunakan:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 12px;background:#f0f9f0;border-left:4px solid #006934;border-radius:0 8px 8px 0;margin-bottom:8px;display:block;color:#333;font-size:14px;margin-bottom:8px;">
                    ✅ &nbsp;Pengajuan form lembur dengan Clock-In &amp; Clock-Out
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:8px 12px;background:#f0f9f0;border-left:4px solid #006934;border-radius:0 8px 8px 0;color:#333;font-size:14px;margin-bottom:8px;">
                    ✅ &nbsp;Notifikasi email ke Asisten Manager &amp; Manager
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:8px 12px;background:#f0f9f0;border-left:4px solid #006934;border-radius:0 8px 8px 0;color:#333;font-size:14px;margin-bottom:8px;">
                    ✅ &nbsp;Approval / Revisi / Tolak via link di email (tanpa login)
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:8px 12px;background:#f0f9f0;border-left:4px solid #006934;border-radius:0 8px 8px 0;color:#333;font-size:14px;">
                    ✅ &nbsp;Multi-step workflow approval dengan token 7 hari
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:3000"
                       style="display:inline-block;background:#006934;color:#ffffff;padding:14px 40px;border-radius:100px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:2px;border:2px solid #1b1c1c;box-shadow:4px 4px 0 #1b1c1c;transition:all .2s;">
                      🚀 BUKA APLIKASI ALUR
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:24px 32px 0;">
              <hr style="border:none;border-top:2px solid #e8ede8;margin:0;">
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f5f9f5;padding:20px 32px;text-align:center;border-top:2px solid #e8ede8;">
              <p style="color:#006934;font-weight:700;font-size:13px;margin:0 0 4px;letter-spacing:1px;">⚡ PLN INDONESIA POWER SERVICES</p>
              <p style="color:#888;font-size:11px;margin:0 0 4px;">Unit Bisnis Pembangkitan Cilegon</p>
              <p style="color:#aaa;font-size:10px;margin:0;">Email ini dikirim otomatis oleh sistem ALUR PIPS. Mohon tidak membalas.</p>
              <p style="color:#aaa;font-size:10px;margin:6px 0 0;">© 2026 PLN Indonesia Power Services. Hak cipta dilindungi.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- Send ---
async function main() {
  console.log("🔌 Menghubungkan ke Gmail SMTP...");
  console.log(`📧 Akun pengirim: ${GMAIL_USER}\n`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  // Verifikasi koneksi
  try {
    await transporter.verify();
    console.log("✅ Koneksi SMTP berhasil!\n");
  } catch (err) {
    console.error("❌ Gagal terhubung ke SMTP:", err.message);
    process.exit(1);
  }

  const html = buildEmailHtml();
  let success = 0;
  let failed = 0;

  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: `"ALUR PIPS - PLN IPS UBP Cilegon" <${GMAIL_USER}>`,
        to: email,
        subject: `[ALUR PIPS] ✅ Sistem Email Berhasil — Aplikasi Siap Digunakan`,
        html,
      });
      console.log(`✅ Terkirim → ${email}`);
      success++;
      // Delay 1s antar email agar tidak kena rate limit
      await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
      console.error(`❌ Gagal → ${email}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Hasil: ${success} berhasil, ${failed} gagal dari ${recipients.length} penerima.`);
  if (success === recipients.length) {
    console.log("🎉 Semua email berhasil dikirim! SMTP sudah siap untuk production.");
  }
}

main();
