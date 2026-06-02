import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("=== 1. REVERT emailPerusahaan ke semula ===\n");

  const reverts = [
    { nip: "9900000007", emailPerusahaan: "fajar.k3@plnindonesiapower.co.id", label: "Officer K3" },
    { nip: "9900000008", emailPerusahaan: "wahyu.k3l@plnindonesiapower.co.id", label: "Asman K3L" },
    { nip: "9900000003", emailPerusahaan: "hendra.wijaya@plnindonesiapower.co.id", label: "Manager Operasi" },
    { nip: "9900000001", emailPerusahaan: "budi.santoso@plnindonesiapower.co.id", label: "Branch Manager" },
    { nip: "9900000002", emailPerusahaan: "siti.rahayu@plnindonesiapower.co.id", label: "Admin" },
  ];

  for (const r of reverts) {
    await prisma.user.update({
      where: { nip: r.nip },
      data: { emailPerusahaan: r.emailPerusahaan },
    });
    console.log(`✅ ${r.label}: emailPerusahaan → ${r.emailPerusahaan}`);
  }

  console.log("\n=== 2. SET emailPersonal pada approver K3 (sesuai gambar) ===\n");

  const updates = [
    { nip: "9900000007", emailPersonal: "rifan5708@gmail.com",        label: "Step 2 - Officer K3" },
    { nip: "9900000008", emailPersonal: "firmanulloh038@gmail.com",   label: "Step 3 - Asman K3L" },
    { nip: "9900000003", emailPersonal: "regandimasta.rd@gmail.com",  label: "Step 4 - Manager Operasi" },
    { nip: "9900000001", emailPersonal: "rifan5708@gmail.com",        label: "Step 5 - Branch Manager IPS" },
    { nip: "9900000002", emailPersonal: "firmanulloh038@gmail.com",   label: "Step 6 - Admin" },
  ];

  for (const u of updates) {
    const result = await prisma.user.update({
      where: { nip: u.nip },
      data: { emailPersonal: u.emailPersonal },
    });
    console.log(`✅ ${u.label}: ${result.nama} → emailPersonal = ${result.emailPersonal}`);
  }

  // Verifikasi
  console.log("\n══════════════════════════════════════════════════════════════════════════════════════════");
  console.log("  CHAIN APPROVAL K3 - TESTING (atas nama Ahmad Yani)");
  console.log("  Email sekarang dikirim ke emailPersonal");
  console.log("══════════════════════════════════════════════════════════════════════════════════════════");
  console.log("Step | Role                 | Nama                       | emailPersonal (tujuan email)");
  console.log("─────┼──────────────────────┼────────────────────────────┼────────────────────────────────");

  const p = await prisma.user.findFirst({ where: { nip: "177825830B" } });
  console.log(`  1  | Pegawai (Submit)     | ${(p?.nama ?? "").padEnd(26)} | ${p?.emailPersonal ?? "(tidak ada)"}`);

  const o = await prisma.user.findFirst({ where: { nip: "9900000007" } });
  console.log(`  2  | Officer K3           | ${(o?.nama ?? "").padEnd(26)} | ${o?.emailPersonal}`);

  const a = await prisma.user.findFirst({ where: { nip: "9900000008" } });
  console.log(`  3  | Asman K3L            | ${(a?.nama ?? "").padEnd(26)} | ${a?.emailPersonal}`);

  const m = await prisma.user.findFirst({ where: { nip: "9900000003" } });
  console.log(`  4  | Manager Operasi      | ${(m?.nama ?? "").padEnd(26)} | ${m?.emailPersonal}`);

  const b = await prisma.user.findFirst({ where: { nip: "9900000001" } });
  console.log(`  5  | Branch Manager IPS   | ${(b?.nama ?? "").padEnd(26)} | ${b?.emailPersonal}`);

  const ad = await prisma.user.findFirst({ where: { nip: "9900000002" } });
  console.log(`  6  | Admin (Rekap)        | ${(ad?.nama ?? "").padEnd(26)} | ${ad?.emailPersonal}`);

  console.log("══════════════════════════════════════════════════════════════════════════════════════════");
  console.log("\n✅ Selesai! Email approval sekarang dikirim ke emailPersonal.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
