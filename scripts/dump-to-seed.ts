/**
 * dump-to-seed.ts
 * Tarik semua data User dari database Supabase (live),
 * lalu generate file prisma/seed.generated.ts sebagai backup & seed baru.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter } as any);

async function main() {
  console.log("📥 Menarik data dari database Supabase...\n");

  // ── 1. Ambil semua User ──────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    orderBy: [{ bidang: "asc" }, { role: "asc" }, { nama: "asc" }],
  });

  console.log(`✅ Ditemukan ${users.length} user`);

  // ── 2. Generate seed file ────────────────────────────────────────────────
  const lines: string[] = [];

  lines.push(`/**`);
  lines.push(` * seed.generated.ts`);
  lines.push(` * AUTO-GENERATED dari database Supabase pada ${new Date().toISOString()}`);
  lines.push(` * Generate ulang dengan: npx ts-node scripts/dump-to-seed.ts`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`import { PrismaClient } from "@prisma/client";`);
  lines.push(`import { PrismaPg } from "@prisma/adapter-pg";`);
  lines.push(`import bcrypt from "bcryptjs";`);
  lines.push(`import * as dotenv from "dotenv";`);
  lines.push(``);
  lines.push(`dotenv.config();`);
  lines.push(``);
  lines.push(`const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });`);
  lines.push(`const prisma  = new PrismaClient({ adapter } as any);`);
  lines.push(``);
  lines.push(`// ── DATA USER (diambil dari database pada ${new Date().toISOString()}) ─────────────────`);
  lines.push(`const USERS = [`);

  for (const u of users) {
    const entry: Record<string, unknown> = {
      nip:            u.nip,
      nama:           u.nama,
      jenjangJabatan: u.jenjangJabatan,
      bidang:         u.bidang,
      subBidang:      u.subBidang,
      role:           u.role,
      tipeKerja:      u.tipeKerja,
      emailPerusahaan: u.emailPerusahaan,
    };
    if (u.emailPersonal) entry.emailPersonal = u.emailPersonal;
    if (u.phone)         entry.phone         = u.phone;
    if (u.tlGroup)       entry.tlGroup       = u.tlGroup;

    lines.push(`  ${JSON.stringify(entry)},`);
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`async function main() {`);
  lines.push(`  console.log("🌱 Seeding database dari data yang di-dump...");`);
  lines.push(`  const SALT_ROUNDS = 10;`);
  lines.push(``);
  lines.push(`  for (const u of USERS) {`);
  lines.push(`    const hashedPassword = await bcrypt.hash(u.nip, SALT_ROUNDS);`);
  lines.push(`    await prisma.user.upsert({`);
  lines.push(`      where: { nip: u.nip },`);
  lines.push(`      update: {`);
  lines.push(`        nama:            u.nama,`);
  lines.push(`        jenjangJabatan:  u.jenjangJabatan,`);
  lines.push(`        bidang:          u.bidang as any,`);
  lines.push(`        subBidang:       u.subBidang as any,`);
  lines.push(`        role:            u.role as any,`);
  lines.push(`        tipeKerja:       u.tipeKerja as any,`);
  lines.push(`        emailPerusahaan: u.emailPerusahaan,`);
  lines.push(`        emailPersonal:   (u as any).emailPersonal ?? null,`);
  lines.push(`        phone:           (u as any).phone ?? null,`);
  lines.push(`        tlGroup:         (u as any).tlGroup ?? null,`);
  lines.push(`      },`);
  lines.push(`      create: {`);
  lines.push(`        nip:             u.nip,`);
  lines.push(`        nama:            u.nama,`);
  lines.push(`        jenjangJabatan:  u.jenjangJabatan,`);
  lines.push(`        bidang:          u.bidang as any,`);
  lines.push(`        subBidang:       u.subBidang as any,`);
  lines.push(`        role:            u.role as any,`);
  lines.push(`        tipeKerja:       u.tipeKerja as any,`);
  lines.push(`        emailPerusahaan: u.emailPerusahaan,`);
  lines.push(`        emailPersonal:   (u as any).emailPersonal ?? null,`);
  lines.push(`        phone:           (u as any).phone ?? null,`);
  lines.push(`        tlGroup:         (u as any).tlGroup ?? null,`);
  lines.push(`        password:        hashedPassword,`);
  lines.push(`      },`);
  lines.push(`    });`);
  lines.push(`    console.log(\`  ✓ \${u.nama} [\${u.role}] [\${u.bidang}]\`);`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  console.log(\`\\n✅ Selesai: \${USERS.length} user di-upsert.\`);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`main()`);
  lines.push(`  .catch(console.error)`);
  lines.push(`  .finally(() => prisma.$disconnect());`);
  lines.push(``);

  const seedPath = path.resolve(__dirname, "../prisma/seed.generated.ts");
  fs.writeFileSync(seedPath, lines.join("\n"), "utf-8");
  console.log(`\n📄 Seed file ditulis ke: ${seedPath}`);

  // ── 3. Ringkasan ─────────────────────────────────────────────────────────
  const byRole:   Record<string, number> = {};
  const byBidang: Record<string, number> = {};
  const byTipe:   Record<string, number> = {};
  for (const u of users) {
    byRole[u.role]      = (byRole[u.role]      || 0) + 1;
    byBidang[u.bidang]  = (byBidang[u.bidang]  || 0) + 1;
    byTipe[u.tipeKerja] = (byTipe[u.tipeKerja] || 0) + 1;
  }

  console.log("\n── RINGKASAN ─────────────────────────────────────────");
  console.log("Per Role:");
  for (const [k, v] of Object.entries(byRole).sort())
    console.log(`  ${k.padEnd(16)}: ${v}`);
  console.log("\nPer Bidang:");
  for (const [k, v] of Object.entries(byBidang).sort())
    console.log(`  ${k.padEnd(16)}: ${v}`);
  console.log("\nPer Tipe Kerja:");
  for (const [k, v] of Object.entries(byTipe).sort())
    console.log(`  ${k.padEnd(16)}: ${v}`);
  console.log("──────────────────────────────────────────────────────");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
