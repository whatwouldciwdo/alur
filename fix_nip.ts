import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

// NIP yang benar berdasarkan HTML dari user
const correctNips: { nama: string; nip: string }[] = [
  { nama: "Firmanulloh",           nip: "179325970B" },
  { nama: "Rifan Arizki",          nip: "179528170B" },
  { nama: "Sapto Joko Saputro",    nip: "178826040B" },
  { nama: "M. Chasani",            nip: "149418760B" },
  { nama: "Sainan",                nip: "178026030B" },
  { nama: "Muji Edhi Purwanto",    nip: "179225990B" },
  { nama: "Sahari",                nip: "179226020B" },
  { nama: "Amiq Syihabuddin",      nip: "149218620B" },
  { nama: "Aan Suhelan",           nip: "240161830K" },
  { nama: "Afrian Aeji",           nip: "229443800K" },
  { nama: "Mansur",                nip: "178725842B" },
  { nama: "Muhammad Refai",        nip: "149518810B" },
  { nama: "Ardiansyah Apprillah",  nip: "149412290B" },
  { nama: "Ahmad Yani",            nip: "177825830B" },
  { nama: "Aris Sofian",           nip: "149518660B" },
  { nama: "Muhammad Suhanda",      nip: "149218820B" },
  { nama: "Dodo Prasetyo",         nip: "149318690B" },
  { nama: "Muhammad Muhklis",      nip: "149118800B" },
  { nama: "Wisnu Marwanto",        nip: "179126070B" },
  { nama: "Shylviana Denauli",     nip: "229742672K" },
  { nama: "Supiin",                nip: "177125930B" },
  { nama: "Deni Harliman",         nip: "178225950B" },
  { nama: "Deni Junaidi",          nip: "229543790K" },
  { nama: "Pambudi",               nip: "249660910K" },
  { nama: "Dedi Jamaludin",        nip: "249660900K" },
  { nama: "Arifudin",              nip: "177025860B" },
  { nama: "Slamet Sugianto",       nip: "177625920B" },
  { nama: "Aris Budi Ariyanto",    nip: "177525871B" },
  { nama: "Rio Setiawan",          nip: "240061820K" },
  { nama: "Nanang Suendi",         nip: "178425900B" },
  { nama: "Saniman",               nip: "177525910B" },
  { nama: "Asep Wawan Setiawan",   nip: "178025890B" },
  { nama: "Martinus Bayu C",       nip: "239550400K" },
  { nama: "Regan Dimasta",         nip: "149718560B" },
  { nama: "Oping Mardani",         nip: "178326080B" },
  { nama: "Rahmat Hidayat",        nip: "178625850B" },
  { nama: "Chilvia Jenita",        nip: "199236582B" },
  { nama: "Ratih Kartika",         nip: "178526011B" },
  { nama: "Nurlaelah",             nip: "178726002B" },
  { nama: "Tini Ruliani Y.",       nip: "178126050B" },
  { nama: "Dinar Furi Handayani",  nip: "179025960B" },
  { nama: "Alip Novi Hayati N",    nip: "129308920B" },
  { nama: "Yulfitri Ardiana",      nip: "198336572B" },
  { nama: "Bimo Septo Armando",    nip: "249257102K" },
  { nama: "Gega Wira Patria",      nip: "199136592B" },
  { nama: "Linda Indriyani",       nip: "229844762K" },
  { nama: "Wati Rahmawati",        nip: "178126061B" },
  { nama: "M. Rivanur Todo Faruq", nip: "199636562B" },
  { nama: "R.A Suci Arbianty",     nip: "149417951B" },
  { nama: "Annisa Frezty",         nip: "159321810B" },
];

async function main() {
  console.log("🔧 Mengkoreksi 50 NIP pegawai berdasarkan data HTML...\n");

  let fixed = 0;
  let notFound = 0;

  for (const item of correctNips) {
    // Cari user berdasarkan nama
    const user = await (prisma as any).user.findFirst({
      where: { nama: item.nama, role: "PEGAWAI" },
    });

    if (!user) {
      console.log(`  ⚠ Tidak ditemukan: ${item.nama}`);
      notFound++;
      continue;
    }

    if (user.nip === item.nip) {
      console.log(`  ✓ ${item.nama} — sudah benar (${item.nip})`);
      fixed++;
      continue;
    }

    // Cek apakah NIP baru sudah dipakai user lain
    const conflict = await (prisma as any).user.findUnique({ where: { nip: item.nip } });
    if (conflict && conflict.id !== user.id) {
      // Hapus conflict dan update
      await (prisma as any).user.delete({ where: { nip: item.nip } });
    }

    await (prisma as any).user.update({
      where: { id: user.id },
      data: { nip: item.nip },
    });
    console.log(`  ✓ ${item.nama}: ${user.nip} → ${item.nip}`);
    fixed++;
  }

  console.log(`\n✅ Selesai! ${fixed} NIP diperbaiki, ${notFound} tidak ditemukan.`);
  await (prisma as any).$disconnect();
}

main().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
