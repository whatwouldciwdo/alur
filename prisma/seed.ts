import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);


async function main() {
  console.log("🌱 Seeding database ALUR...");

  const hash = async (pw: string) => bcrypt.hash(pw, 10);

  // ── BRANCH MANAGER (1 orang, lintas bidang) ──────────────────────
  await prisma.user.upsert({
    where: { nip: "BM001" },
    update: {},
    create: {
      nip: "BM001",
      nama: "Budi Santoso",
      jenjangJabatan: "Branch Manager",
      bidang: "OPERASI",
      subBidang: "KEPMO",
      role: "BRANCH_MANAGER",
      emailPerusahaan: "budi.santoso@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // ── ADMIN ─────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { nip: "ADM001" },
    update: {},
    create: {
      nip: "ADM001",
      nama: "Siti Rahayu",
      jenjangJabatan: "Staff Admin",
      bidang: "SDM_KEU",
      subBidang: "SDM",
      role: "ADMIN",
      emailPerusahaan: "siti.rahayu@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // ── BIDANG OPERASI ────────────────────────────────────────────────
  // Manager Operasi
  await prisma.user.upsert({
    where: { nip: "MGR_OPR" },
    update: {},
    create: {
      nip: "MGR_OPR",
      nama: "Hendra Wijaya",
      jenjangJabatan: "Manager Operasi",
      bidang: "OPERASI",
      subBidang: "KEPMO",
      role: "MANAGER",
      emailPerusahaan: "hendra.wijaya@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Kepmo: Officer
  await prisma.user.upsert({
    where: { nip: "OFF_KEPMO" },
    update: {},
    create: {
      nip: "OFF_KEPMO",
      nama: "Dian Pratama",
      jenjangJabatan: "Officer Kepmo",
      bidang: "OPERASI",
      subBidang: "KEPMO",
      role: "OFFICER",
      emailPerusahaan: "dian.pratama@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Kepmo: Asman
  await prisma.user.upsert({
    where: { nip: "ASM_KEPMO" },
    update: {},
    create: {
      nip: "ASM_KEPMO",
      nama: "Rizky Asman Kepmo",
      jenjangJabatan: "Asman Kepmo",
      bidang: "OPERASI",
      subBidang: "KEPMO",
      role: "ASMAN",
      emailPerusahaan: "rizky.asman@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Kepmo: Pegawai (dummy user utama)
  await prisma.user.upsert({
    where: { nip: "8912345Z" },
    update: {},
    create: {
      nip: "8912345Z",
      nama: "Ranger Andalan",
      jenjangJabatan: "Officer K3",
      bidang: "OPERASI",
      subBidang: "K3",
      role: "PEGAWAI",
      emailPerusahaan: "ranger.andalan@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // K3: Officer
  await prisma.user.upsert({
    where: { nip: "OFF_K3" },
    update: {},
    create: {
      nip: "OFF_K3",
      nama: "Fajar Officer K3",
      jenjangJabatan: "Officer K3",
      bidang: "OPERASI",
      subBidang: "K3",
      role: "OFFICER",
      emailPerusahaan: "fajar.k3@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // K3: Asman
  await prisma.user.upsert({
    where: { nip: "ASM_K3" },
    update: {},
    create: {
      nip: "ASM_K3",
      nama: "Wahyu Asman K3L",
      jenjangJabatan: "Asman K3L",
      bidang: "OPERASI",
      subBidang: "K3",
      role: "ASMAN",
      emailPerusahaan: "wahyu.k3l@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Operator Shift: 4 TL (A,B,C,D)
  for (const grup of ["A", "B", "C", "D"]) {
    await prisma.user.upsert({
      where: { nip: `TL_SHIFT_${grup}` },
      update: {},
      create: {
        nip: `TL_SHIFT_${grup}`,
        nama: `TL Shift ${grup}`,
        jenjangJabatan: `TL Shift ${grup}`,
        bidang: "OPERASI",
        subBidang: "OPERATOR_SHIFT",
        role: "TL",
        tlGroup: grup,
        emailPerusahaan: `tl.shift${grup.toLowerCase()}@plnindonesiapower.co.id`,
        password: await hash("password123"),
      },
    });
  }

  // Operator Shift: Asman
  await prisma.user.upsert({
    where: { nip: "ASM_SHIFT" },
    update: {},
    create: {
      nip: "ASM_SHIFT",
      nama: "Asman Operasi Shift",
      jenjangJabatan: "Asman Operasi",
      bidang: "OPERASI",
      subBidang: "OPERATOR_SHIFT",
      role: "ASMAN",
      emailPerusahaan: "asman.operasi@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // ── BIDANG PEMELIHARAAN ───────────────────────────────────────────
  // Manager Pemeliharaan
  await prisma.user.upsert({
    where: { nip: "MGR_PML" },
    update: {},
    create: {
      nip: "MGR_PML",
      nama: "Anton Manager Pemeliharaan",
      jenjangJabatan: "Manager Pemeliharaan",
      bidang: "PEMELIHARAAN",
      subBidang: "LISTRIK",
      role: "MANAGER",
      emailPerusahaan: "anton.pemeliharaan@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Listrik: TL & Asman
  await prisma.user.upsert({
    where: { nip: "TL_LISTRIK" },
    update: {},
    create: {
      nip: "TL_LISTRIK",
      nama: "TL Listrik",
      jenjangJabatan: "TL Listrik",
      bidang: "PEMELIHARAAN",
      subBidang: "LISTRIK",
      role: "TL",
      emailPerusahaan: "tl.listrik@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  await prisma.user.upsert({
    where: { nip: "ASM_LISTRIK" },
    update: {},
    create: {
      nip: "ASM_LISTRIK",
      nama: "Asman Listrik",
      jenjangJabatan: "Asman Listrik",
      bidang: "PEMELIHARAAN",
      subBidang: "LISTRIK",
      role: "ASMAN",
      emailPerusahaan: "asman.listrik@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // ── BIDANG SDM & KEU ──────────────────────────────────────────────
  // Manager SDM & Keu
  await prisma.user.upsert({
    where: { nip: "MGR_SDM" },
    update: {},
    create: {
      nip: "MGR_SDM",
      nama: "Dewi Manager SDM Keu",
      jenjangJabatan: "Manager SDM & Keu",
      bidang: "SDM_KEU",
      subBidang: "SDM",
      role: "MANAGER",
      emailPerusahaan: "dewi.sdm@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // SDM: Officer & Asman
  await prisma.user.upsert({
    where: { nip: "OFF_SDM" },
    update: {},
    create: {
      nip: "OFF_SDM",
      nama: "Officer SDM",
      jenjangJabatan: "Officer SDM",
      bidang: "SDM_KEU",
      subBidang: "SDM",
      role: "OFFICER",
      emailPerusahaan: "officer.sdm@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  await prisma.user.upsert({
    where: { nip: "ASM_SDM" },
    update: {},
    create: {
      nip: "ASM_SDM",
      nama: "Asman SDM",
      jenjangJabatan: "Asman SDM",
      bidang: "SDM_KEU",
      subBidang: "SDM",
      role: "ASMAN",
      emailPerusahaan: "asman.sdm@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // ── BIDANG ENGINEERING ────────────────────────────────────────────
  // Manager Engineering
  await prisma.user.upsert({
    where: { nip: "MGR_ENG" },
    update: {},
    create: {
      nip: "MGR_ENG",
      nama: "Reza Manager Engineering",
      jenjangJabatan: "Manager Engineering",
      bidang: "ENGINEERING",
      subBidang: "PDM",
      role: "MANAGER",
      emailPerusahaan: "reza.engineering@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // PDM: TL & Asman
  await prisma.user.upsert({
    where: { nip: "TL_PDM" },
    update: {},
    create: {
      nip: "TL_PDM",
      nama: "TL PDM",
      jenjangJabatan: "TL PDM",
      bidang: "ENGINEERING",
      subBidang: "PDM",
      role: "TL",
      emailPerusahaan: "tl.pdm@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  await prisma.user.upsert({
    where: { nip: "ASM_PDM" },
    update: {},
    create: {
      nip: "ASM_PDM",
      nama: "Asman PDM",
      jenjangJabatan: "Asman PDM",
      bidang: "ENGINEERING",
      subBidang: "PDM",
      role: "ASMAN",
      emailPerusahaan: "asman.pdm@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Admin/Sekretaris Engineering: Officer Kinerja & Asman EKSIS
  await prisma.user.upsert({
    where: { nip: "OFF_KINERJA" },
    update: {},
    create: {
      nip: "OFF_KINERJA",
      nama: "Officer Kinerja Engineering",
      jenjangJabatan: "Officer Kinerja",
      bidang: "ENGINEERING",
      subBidang: "ADMIN_SEKRETARIS",
      role: "OFFICER",
      emailPerusahaan: "officer.kinerja@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  await prisma.user.upsert({
    where: { nip: "ASM_EKSIS" },
    update: {},
    create: {
      nip: "ASM_EKSIS",
      nama: "Asman EKSIS Engineering",
      jenjangJabatan: "Asman EKSIS",
      bidang: "ENGINEERING",
      subBidang: "ADMIN_SEKRETARIS",
      role: "ASMAN",
      emailPerusahaan: "asman.eksis@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Pegawai dummy untuk Admin/Sekretaris Engineering
  await prisma.user.upsert({
    where: { nip: "PEG_ADMSEK" },
    update: {},
    create: {
      nip: "PEG_ADMSEK",
      nama: "Sekretaris Engineering",
      jenjangJabatan: "Staf Admin/Sekretaris",
      bidang: "ENGINEERING",
      subBidang: "ADMIN_SEKRETARIS",
      role: "PEGAWAI",
      emailPerusahaan: "sekretaris.engineering@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });


  // ── 50 PEGAWAI ASLI ─────────────────────────────────────────────────────────
  console.log("🌱 Inserting 50 pegawai...");

  type PegawaiInput = {
    nip: string; nama: string; jenjangJabatan: string;
    bidang: string; subBidang: string; tlGroup?: string;
    emailPerusahaan: string; emailPersonal?: string; phone?: string;
  };

  const pegawaiList: PegawaiInput[] = [
    // ── OPERASI: Operator BOP (OPERATOR_SHIFT) ─────────────────────
    { nip: "1793259708", nama: "Firmanulloh",        jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "A", emailPerusahaan: "firmanulloh@plnipservices.co.id",       emailPersonal: "firmanulloh038@gmail.com",       phone: "087774141411" },
    { nip: "1795281708", nama: "Rifan Arizki",        jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "A", emailPerusahaan: "rifan.arizki@plnipservices.co.id",        emailPersonal: "arizkiifan@yahoo.com",           phone: "081906327065" },
    { nip: "1788260408", nama: "Sapto Joko Saputro",  jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "B", emailPerusahaan: "sapto.saputro@plnipservices.co.id",       emailPersonal: "saptojokosaputro4@gmail.com",    phone: "085966777312" },
    { nip: "1494187608", nama: "M. Chasani",          jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "B", emailPerusahaan: "Muhammad.chasani@plnipservices.co.id",    emailPersonal: "sanixperia3@gmail.com",          phone: "082340038377" },
    { nip: "1780260308", nama: "Sainan",               jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "C", emailPerusahaan: "sainan@plnipservices.co.id",              emailPersonal: "saynand.nehwal@gmail.com",       phone: "081380346301" },
    { nip: "1792259908", nama: "Muji Edhi Purwanto",  jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "C", emailPerusahaan: "muji.purwanto@plnipservices.co.id",       emailPersonal: "edhi.elbarcelona92@gmail.com",   phone: "081293968852" },
    { nip: "1792260208", nama: "Sahari",               jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "D", emailPerusahaan: "sahari@plnipservices.co.id",              emailPersonal: "sahariarie2@gmail.com",          phone: "08978068207"  },
    { nip: "1492186208", nama: "Amiq Syihabuddin",    jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "D", emailPerusahaan: "amigsyihabuddin@plnipservices.co.id",     emailPersonal: "amiqsyihab92@gmail.com",         phone: "085711344988" },
    { nip: "2401618308", nama: "Aan Suhelan",          jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "D", emailPerusahaan: "aan.suhelan@plnipservices.co.id",         emailPersonal: "elan190319@gmail.com",           phone: "087847429861" },

    // ── OPERASI: Pelaksana K3 ──────────────────────────────────────
    { nip: "229443800K", nama: "Afrian Aeji",          jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "A", emailPerusahaan: "afrian.aeji@plnipservices.co.id",        emailPersonal: "afrianaeji9@gmail.com",          phone: "085930044699" },
    { nip: "1787258428", nama: "Mansur",                jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "B", emailPerusahaan: "mansur2584@plnipservices.co.id",           emailPersonal: "manli.mansur@gmail.com",         phone: "081911125425" },
    { nip: "1495188108", nama: "Muhammad Refai",        jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "C", emailPerusahaan: "Muhammad.refai@plnipservices.co.id",       emailPersonal: "muhammadrefai93@gmail.com",      phone: "085866444460" },
    { nip: "1494122908", nama: "Ardiansyah Apprillah", jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "D", emailPerusahaan: "ardiansyah.apprillah@plnipservices.co.id", emailPersonal: "ardhydeavinci@ymail.com",        phone: "089646744778" },
    { nip: "1778258308", nama: "Ahmad Yani",            jenjangJabatan: "Pelaksana K3 (Non Shift)", bidang: "OPERASI", subBidang: "K3", emailPerusahaan: "ahmad.yani@plnipservices.co.id",          emailPersonal: "iancamgoes@gmail.com",           phone: "081932167177" },

    // ── OPERASI: Pelaksana Niaga (OPERATOR_NIAGA) ─────────────────
    { nip: "1495186608", nama: "Aris Sofian",          jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "A", emailPerusahaan: "aris.sofian@plnipservices.co.id",        emailPersonal: "arissofian48@yahoo.co.id",       phone: "08976746575"  },
    { nip: "1492188208", nama: "Muhammad Suhanda",     jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "B", emailPerusahaan: "muhammad.suhanda@plnipservices.co.id",   emailPersonal: "suhanda.cogindo@gmail.com",      phone: "087865684926" },
    { nip: "1493186908", nama: "Dodo Prasetyo",        jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "C", emailPerusahaan: "dodopraseyo@plnipservices.co.id",         emailPersonal: "dodoq67@gmail.com",              phone: "087889891129" },
    { nip: "1491188008", nama: "Muhammad Muhklis",     jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "D", emailPerusahaan: "muhammad.muhklis@plnipservices.co.id",    emailPersonal: "muhklism3@gmail.com",            phone: "081353330765" },

    // ── OPERASI: Pelaksana Lingkungan ─────────────────────────────
    { nip: "1791260708", nama: "Wisnu Marwanto",       jenjangJabatan: "Pelaksana Lingkungan", bidang: "OPERASI", subBidang: "LINGKUNGAN", emailPerusahaan: "wisnu.marwanto@plnipservices.co.id",  emailPersonal: "wisnu_marwanto@yahoo.com",       phone: "087871153115" },
    { nip: "229742672K", nama: "Shylviana Denauli",    jenjangJabatan: "Pelaksana Lingkungan", bidang: "OPERASI", subBidang: "LINGKUNGAN", emailPerusahaan: "shylviadenauli@plnipservices.co.id",  emailPersonal: "shylvidenauli@gmail.com",        phone: "089679029059" },

    // ── OPERASI: Pelaksana Kimia (Kepmo) ──────────────────────────
    { nip: "1497185608", nama: "Regan Dimasta",        jenjangJabatan: "Pelaksana Kimia", bidang: "OPERASI", subBidang: "KEPMO", emailPerusahaan: "regan.dimasta@plnipservices.co.id",   emailPersonal: "regandimasta.rd@gmail.com",      phone: "087865684926" },
    { nip: "1783260808", nama: "Oping Mardani",        jenjangJabatan: "Pelaksana Kimia", bidang: "OPERASI", subBidang: "KEPMO", emailPerusahaan: "oping.mardani@plnipservices.co.id",   emailPersonal: "omkakaom558@gmail.com",          phone: "085215297525" },

    // ── PEMELIHARAAN: Teknisi Mesin (MEKANIK) ─────────────────────
    { nip: "1771259308", nama: "Supiin",               jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", emailPerusahaan: "supiin@plnipservices.co.id",           emailPersonal: "supiin76271@gmail.com",          phone: "08787836625"  },
    { nip: "1782259508", nama: "Deni Harliman",        jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", emailPerusahaan: "deni.harliman@plnipservices.co.id",    emailPersonal: "deniharliman@gmail.com",         phone: "081999432543" },
    { nip: "229543790K", nama: "Deni Junaidi",         jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", emailPerusahaan: "deni.junaidi43790@plnipservices.co.id",emailPersonal: "denijunaidi00@gmail.com",        phone: "089619911856" },
    { nip: "2490660910K",nama: "Pambudi",              jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", emailPerusahaan: "pambudi@plnipservices.co.id",          emailPersonal: "pambudibudenx@gmail.com",        phone: "085730675081" },
    { nip: "249660900K", nama: "Dedi Jamaludin",       jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", emailPerusahaan: "dedi.jamaludin@plnipservices.co.id",   emailPersonal: "dedijamaludin96@gmail.com",      phone: "085862491664" },

    // ── PEMELIHARAAN: Teknisi Mesin BOP (BOP) ─────────────────────
    { nip: "1770258608", nama: "Arifudin",             jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", emailPerusahaan: "arifudin@plnipservices.co.id",     emailPersonal: "arifudin3517@gmail.com",         phone: "08809193332"  },
    { nip: "1776259208", nama: "Slamet Sugianto",      jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", emailPerusahaan: "slamet.sugianto@plnipservices.co.id", emailPersonal: "slametmbahislam@gmail.com",     phone: "087871189461" },
    { nip: "1775258718", nama: "Aris Budi Ariyanto",   jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", emailPerusahaan: "aris.ariyanto@plnipservices.co.id",  emailPersonal: "aris_budi30@yahoo.com",         phone: "08176843906"  },
    { nip: "2400618208", nama: "Rio Setiawan",         jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", emailPerusahaan: "rio.setiawan@plnipservices.co.id",   emailPersonal: "riosetiawan2108@gmail.com",     phone: "087783281372" },

    // ── PEMELIHARAAN: Teknisi Listrik (LISTRIK) ───────────────────
    { nip: "1784259008", nama: "Nanang Suendi",        jenjangJabatan: "Teknisi Listrik Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "LISTRIK", emailPerusahaan: "nanang.suendi@plnipservices.co.id",  emailPersonal: "nanang.suendi@gmail.com",        phone: "081906470112" },
    { nip: "1775259108", nama: "Saniman",               jenjangJabatan: "Teknisi Listrik Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "LISTRIK", emailPerusahaan: "saniman@plnipservices.co.id",         emailPersonal: "mansaniman9@gmail.com",          phone: "085219511908" },

    // ── PEMELIHARAAN: Teknisi I&C (IC) ────────────────────────────
    { nip: "1780258908", nama: "Asep Wawan Setiawan",  jenjangJabatan: "Teknisi Kontrol dan Instrumen Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "IC", emailPerusahaan: "asep.setiawan@plnipservices.co.id",    emailPersonal: "asepwawan.0108@gmail.com",       phone: "081807238191" },
    { nip: "2395504008K",nama: "Martinus Bayu C",      jenjangJabatan: "Teknisi Kontrol dan Instrumen Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "IC", emailPerusahaan: "martinus.bayu50400@plnipservices.co.id", emailPersonal: "martinusbaychris@gmail.com",     phone: "087788642691" },

    // ── ENGINEERING: PDM ──────────────────────────────────────────
    { nip: "1786258508", nama: "Rahmat Hidayat",       jenjangJabatan: "Predictive Maintenance",    bidang: "ENGINEERING", subBidang: "PDM", emailPerusahaan: "rahmat.hidayat@plnipservices.co.id",  emailPersonal: "rahmat.tegalwangi@gmail.com",    phone: "08771297106"  },

    // ── ENGINEERING: Admin/Sekretaris ─────────────────────────────
    { nip: "1992365828", nama: "Chilvia Jenita",       jenjangJabatan: "Pelaksana KM, SMT dan Inovasi", bidang: "ENGINEERING", subBidang: "ADMIN_SEKRETARIS", emailPerusahaan: "chilvia.jenita@plnipservices.co.id", emailPersonal: "chilviajeniita1427@gmail.com",  phone: "082300057676" },

    // ── SDM & KEU: UMUM ───────────────────────────────────────────
    { nip: "1785260118", nama: "Ratih Kartika",        jenjangJabatan: "Pelaksana Umum",               bidang: "SDM_KEU", subBidang: "UMUM", emailPerusahaan: "ratih.kartika@plnipservices.co.id",    emailPersonal: "ratihkartika@yahoo.com",         phone: "081932111600" },
    { nip: "1787260028", nama: "Nurlaelah",             jenjangJabatan: "Pelaksana Kesekretariatan",    bidang: "SDM_KEU", subBidang: "UMUM", emailPerusahaan: "nurlaelah@plnipservices.co.id",        emailPersonal: "lela@indonesiapower.co.id",      phone: "081911144382" },
    { nip: "2492571028K",nama: "Bimo Septo Armando",   jenjangJabatan: "Pelaksana Administrasi Gudang",bidang: "SDM_KEU", subBidang: "UMUM", emailPerusahaan: "bimo.septo42182@plnipservices.co.id",                                                   phone: "081386977189" },
    { nip: "1991365928", nama: "Gega Wira Patria",     jenjangJabatan: "Pelaksana Administrasi Gudang",bidang: "SDM_KEU", subBidang: "UMUM", emailPerusahaan: "gega.patria@plnipservices.co.id",       emailPersonal: "wiragega@gmail.com",             phone: "085319599184" },

    // ── SDM & KEU: PBJ ────────────────────────────────────────────
    { nip: "1781260508", nama: "Tini Ruliani Y.",       jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", emailPerusahaan: "Tini.yatmikasari@plnipservices.co.id",  emailPersonal: "rulitini@gmail.com",             phone: "087771690771" },
    { nip: "1790259608", nama: "Dinar Furi Handayani", jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", emailPerusahaan: "dinar.handayani@plnipservices.co.id",    emailPersonal: "dinarfuri21@gmail.com",          phone: "081285523948" },
    { nip: "1293089208", nama: "Alip Novi Hayati N",   jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", emailPerusahaan: "alip.hayatinnofus@plnipservices.co.id",  emailPersonal: "novalip33@gmail.com",            phone: "085694916896" },
    { nip: "1983336728", nama: "Yulfitri Ardiana",     jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", emailPerusahaan: "yulfitri.ardiana@plnipservices.co.id",   emailPersonal: "yulfitriardiana@gmail.com",      phone: "08567512621"  },

    // ── SDM & KEU: KEUANGAN ───────────────────────────────────────
    { nip: "229844762K", nama: "Linda Indriyani",      jenjangJabatan: "Pelaksana Keuangan dan Pajak",  bidang: "SDM_KEU", subBidang: "KEUANGAN", emailPerusahaan: "linda.indriyani44762@plnipservice.co.id",                                           phone: "082112029299" },
    { nip: "1781260618", nama: "Wati Rahmawati",       jenjangJabatan: "Pelaksana Senior Anggaran",     bidang: "SDM_KEU", subBidang: "KEUANGAN", emailPerusahaan: "wati.rahmawati@plnipservices.co.id",    emailPersonal: "wati@indonesiapower.co.id",      phone: "081380278481" },
    { nip: "1996365628", nama: "M. Rivanur Todo Faruq",jenjangJabatan: "Pelaksana Senior Akutansi",     bidang: "SDM_KEU", subBidang: "KEUANGAN", emailPerusahaan: "rivanur.faruq@plnipservices.co.id",     emailPersonal: "Rivanur.t.f@gmail.com",          phone: "085774412492" },

    // ── SDM & KEU: SDM ────────────────────────────────────────────
    { nip: "1494179518", nama: "R.A Suci Arbianty",    jenjangJabatan: "Pelaksana Senior Adminitrasi", bidang: "SDM_KEU", subBidang: "SDM", emailPerusahaan: "suciarbianty@plnipservices.co.id",      emailPersonal: "suciarbianty@ymail.com",         phone: "08557628632"  },
    { nip: "1593218108", nama: "Annisa Frezty",        jenjangJabatan: "Pelaksana Administrasi",        bidang: "SDM_KEU", subBidang: "SDM", emailPerusahaan: "annisa.fadilla@plnipservices.co.id",    emailPersonal: "frezyannisa@gmail.com",          phone: "081808340629" },
  ];

  for (const p of pegawaiList) {
    await prisma.user.upsert({
      where: { nip: p.nip },
      update: {
        phone: p.phone,
        emailPersonal: p.emailPersonal,
      },
      create: {
        nip: p.nip,
        nama: p.nama,
        jenjangJabatan: p.jenjangJabatan,
        bidang: p.bidang as any,
        subBidang: p.subBidang as any,
        role: "PEGAWAI",
        tlGroup: p.tlGroup,
        emailPerusahaan: p.emailPerusahaan,
        emailPersonal: p.emailPersonal,
        phone: p.phone,
        password: await hash("password123"),
      },
    });
    console.log(`  ✓ ${p.nama}`);
  }

  console.log("✅ Seeding selesai!");

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
