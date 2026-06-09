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

  /** Upsert system user (approver/manager).
   *  Looks up by NIP first — jika ada, update by ID (aman walau email berubah).
   *  Jika tidak ada, coba upsert by emailPerusahaan (buat baru jika perlu). */
  const upsertSys = async (data: {
    nip: string; nama: string; jenjangJabatan: string;
    bidang: string; subBidang: string; role: string;
    emailPerusahaan: string; tlGroup?: string; tipeKerja?: string;
  }) => {
    const existing = await prisma.user.findFirst({ where: { nip: data.nip } });
    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          nama: data.nama,
          jenjangJabatan: data.jenjangJabatan,
          bidang: data.bidang as any,
          subBidang: data.subBidang as any,
          role: data.role as any,
          emailPerusahaan: data.emailPerusahaan,
          tlGroup: data.tlGroup ?? null,
          tipeKerja: (data.tipeKerja ?? "NON_SHIFT") as any,
        },
      });
    }
    return prisma.user.upsert({
      where: { emailPerusahaan: data.emailPerusahaan },
      update: {
        nip: data.nip, nama: data.nama, jenjangJabatan: data.jenjangJabatan,
        bidang: data.bidang as any, subBidang: data.subBidang as any,
        role: data.role as any, tlGroup: data.tlGroup ?? null,
        tipeKerja: (data.tipeKerja ?? "NON_SHIFT") as any,
      },
      create: {
        nip: data.nip, nama: data.nama, jenjangJabatan: data.jenjangJabatan,
        bidang: data.bidang as any, subBidang: data.subBidang as any,
        role: data.role as any,
        emailPerusahaan: data.emailPerusahaan,
        tlGroup: data.tlGroup,
        tipeKerja: (data.tipeKerja ?? "NON_SHIFT") as any,
        password: await hash("password123"),
      },
    });
  };


  // ── BRANCH MANAGER (1 orang, lintas bidang) ──────────────────────
  // ── BRANCH MANAGER ───────────────────────────────────────────────
  await upsertSys({ nip: "BM001", nama: "Ade Majid", jenjangJabatan: "Branch Manager",
    bidang: "OPERASI", subBidang: "KEPMO", role: "BRANCH_MANAGER",
    emailPerusahaan: "ade.majid83@gmail.com" });


  // ── ADMIN ─────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { emailPerusahaan: "siti.rahayu@plnindonesiapower.co.id" },
    update: { nip: "ADM001", nama: "Siti Rahayu", jenjangJabatan: "Staff Admin", role: "ADMIN" },
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
  // Manager Operasi (shared — semua sub-bidang OPERASI)
  await prisma.user.upsert({
    where: { emailPerusahaan: "hendra.surya@plnindonesiapower.co.id" },
    update: { nip: "MGR_OPR", nama: "Hendra Surya Kusumah", jenjangJabatan: "Manager Operasi", role: "MANAGER" },
    create: {
      nip: "MGR_OPR",
      nama: "Hendra Surya Kusumah",
      jenjangJabatan: "Manager Operasi",
      bidang: "OPERASI",
      subBidang: "KEPMO",
      role: "MANAGER",
      emailPerusahaan: "hendra.surya@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Kepmo: Officer — Rudy Bambang
  await prisma.user.upsert({
    where: { emailPerusahaan: "rudi.bambang@plnindonesiapower.co.id" },
    update: { nip: "OFF_KEPMO", nama: "Rudy Bambang", jenjangJabatan: "Officer Kepmo", role: "OFFICER" },
    create: {
      nip: "OFF_KEPMO",
      nama: "Rudy Bambang",
      jenjangJabatan: "Officer Kepmo",
      bidang: "OPERASI",
      subBidang: "KEPMO",
      role: "OFFICER",
      emailPerusahaan: "rudi.bambang@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Kepmo: Asman — Gaguk S.
  await prisma.user.upsert({
    where: { emailPerusahaan: "gaguk.s@plnindonesiapower.co.id" },
    update: { nip: "ASM_KEPMO", nama: "Gaguk S.", jenjangJabatan: "Asman Kepmo", role: "ASMAN" },
    create: {
      nip: "ASM_KEPMO",
      nama: "Gaguk S.",
      jenjangJabatan: "Asman Kepmo",
      bidang: "OPERASI",
      subBidang: "KEPMO",
      role: "ASMAN",
      emailPerusahaan: "gaguk.s@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Lingkungan: Officer — Masenda
  await prisma.user.upsert({
    where: { emailPerusahaan: "masenda.clg@plnindonesiapower.co.id" },
    update: { nip: "OFF_LINGKUNGAN", nama: "Masenda", jenjangJabatan: "Officer Lingkungan", role: "OFFICER" },
    create: {
      nip: "OFF_LINGKUNGAN",
      nama: "Masenda",
      jenjangJabatan: "Officer Lingkungan",
      bidang: "OPERASI",
      subBidang: "LINGKUNGAN",
      role: "OFFICER",
      emailPerusahaan: "masenda.clg@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });
  // Catatan: Asman K3L (Fuji Juhairil H.) serve Lingkungan & K3.
  // Disimpan di subBidang K3, workflow LINGKUNGAN step 2 sudah di-fix ke subBidang K3.


  // Kepmo: Pegawai (dummy user utama)
  await prisma.user.upsert({
    where: { emailPerusahaan: "ranger.andalan@plnindonesiapower.co.id" },
    update: { nip: "8912345Z", nama: "Ranger Andalan", jenjangJabatan: "Officer K3", role: "PEGAWAI" },
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

  // K3: Officer — Bimaji Catur W.
  await prisma.user.upsert({
    where: { emailPerusahaan: "bimaji.catur@plnindonesiapower.co.id" },
    update: { nip: "OFF_K3", nama: "Bimaji Catur W.", jenjangJabatan: "Officer K3", role: "OFFICER" },
    create: {
      nip: "OFF_K3",
      nama: "Bimaji Catur W.",
      jenjangJabatan: "Officer K3",
      bidang: "OPERASI",
      subBidang: "K3",
      role: "OFFICER",
      emailPerusahaan: "bimaji.catur@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // K3 & Lingkungan: Asman K3L — Fuji Juhairil H.
  // (disimpan di subBidang K3 agar bisa serve K3 + Lingkungan via satu user)
  await prisma.user.upsert({
    where: { emailPerusahaan: "fuji.juhairil@plnindonesiapower.co.id" },
    update: { nip: "ASM_K3", nama: "Fuji Juhairil H.", jenjangJabatan: "Asman K3L", role: "ASMAN" },
    create: {
      nip: "ASM_K3",
      nama: "Fuji Juhairil H.",
      jenjangJabatan: "Asman K3L",
      bidang: "OPERASI",
      subBidang: "K3",
      role: "ASMAN",
      emailPerusahaan: "fuji.juhairil@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Operator Niaga: Asman Niaga — Jontohom
  await prisma.user.upsert({
    where: { emailPerusahaan: "jon.tohom@plnindonesiapower.co.id" },
    update: { nip: "ASM_NIAGA", nama: "Jontohom", jenjangJabatan: "Asman Niaga", role: "ASMAN" },
    create: {
      nip: "ASM_NIAGA",
      nama: "Jontohom",
      jenjangJabatan: "Asman Niaga",
      bidang: "OPERASI",
      subBidang: "OPERATOR_NIAGA",
      role: "ASMAN",
      emailPerusahaan: "jon.tohom@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Operator Shift: 4 TL dengan data nyata
  await prisma.user.upsert({
    where: { emailPerusahaan: "ihwansyah.wibowo@plnindonesiapower.co.id" },
    update: { nip: "TL_SHIFT_A", nama: "Ihwansyah WS.", jenjangJabatan: "Officer/TL Shift A", role: "TL", tlGroup: "A", tipeKerja: "SHIFT" },
    create: {
      nip: "TL_SHIFT_A",
      nama: "Ihwansyah WS.",
      jenjangJabatan: "Officer/TL Shift A",
      bidang: "OPERASI",
      subBidang: "OPERATOR_SHIFT",
      role: "TL",
      tlGroup: "A",
      tipeKerja: "SHIFT",
      emailPerusahaan: "ihwansyah.wibowo@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });
  await prisma.user.upsert({
    where: { emailPerusahaan: "untung.riyadi@plnindonesiapower.co.id" },
    update: { nip: "TL_SHIFT_B", nama: "Untung Riyadi", jenjangJabatan: "Officer/TL Shift B", role: "TL", tlGroup: "B", tipeKerja: "SHIFT" },
    create: {
      nip: "TL_SHIFT_B",
      nama: "Untung Riyadi",
      jenjangJabatan: "Officer/TL Shift B",
      bidang: "OPERASI",
      subBidang: "OPERATOR_SHIFT",
      role: "TL",
      tlGroup: "B",
      tipeKerja: "SHIFT",
      emailPerusahaan: "untung.riyadi@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });
  await prisma.user.upsert({
    where: { emailPerusahaan: "sulistiyono@plnindonesiapower.co.id" },
    update: { nip: "TL_SHIFT_C", nama: "Sulistiyono", jenjangJabatan: "Officer/TL Shift C", role: "TL", tlGroup: "C", tipeKerja: "SHIFT" },
    create: {
      nip: "TL_SHIFT_C",
      nama: "Sulistiyono",
      jenjangJabatan: "Officer/TL Shift C",
      bidang: "OPERASI",
      subBidang: "OPERATOR_SHIFT",
      role: "TL",
      tlGroup: "C",
      tipeKerja: "SHIFT",
      emailPerusahaan: "sulistiyono@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });
  await prisma.user.upsert({
    where: { emailPerusahaan: "yayan.suryana@plnindonesiapower.co.id" },
    update: { nip: "TL_SHIFT_D", nama: "Yayan Suryana", jenjangJabatan: "Officer/TL Shift D", role: "TL", tlGroup: "D", tipeKerja: "SHIFT" },
    create: {
      nip: "TL_SHIFT_D",
      nama: "Yayan Suryana",
      jenjangJabatan: "Officer/TL Shift D",
      bidang: "OPERASI",
      subBidang: "OPERATOR_SHIFT",
      role: "TL",
      tlGroup: "D",
      tipeKerja: "SHIFT",
      emailPerusahaan: "yayan.suryana@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // Operator Shift: Asman Operasi — M. Ulil Amri
  await prisma.user.upsert({
    where: { emailPerusahaan: "m.amri@plnindonesiapower.co.id" },
    update: { nip: "ASM_SHIFT", nama: "M. Ulil Amri", jenjangJabatan: "Asman Operasi", role: "ASMAN", tipeKerja: "SHIFT" },
    create: {
      nip: "ASM_SHIFT",
      nama: "M. Ulil Amri",
      jenjangJabatan: "Asman Operasi",
      bidang: "OPERASI",
      subBidang: "OPERATOR_SHIFT",
      role: "ASMAN",
      tipeKerja: "SHIFT",
      emailPerusahaan: "m.amri@plnindonesiapower.co.id",
      password: await hash("password123"),
    },
  });

  // ── BIDANG PEMELIHARAAN ───────────────────────────────────────────
  // Manager Pemeliharaan (shared semua sub-bidang) — Edward Meidriansyah
  await upsertSys({ nip: "MGR_PML", nama: "Edward Meidriansyah", jenjangJabatan: "Manager Pemeliharaan",
    bidang: "PEMELIHARAAN", subBidang: "LISTRIK", role: "MANAGER",
    emailPerusahaan: "edward.m@plnindonesiapower.co.id" });

  // Listrik: TL — Gunawan
  await upsertSys({ nip: "TL_LISTRIK", nama: "Gunawan", jenjangJabatan: "TL Listrik",
    bidang: "PEMELIHARAAN", subBidang: "LISTRIK", role: "TL",
    emailPerusahaan: "gunawan.li@plnindonesiapower.co.id" });

  // Listrik & I&C: Asman — Syahrial (serve kedua subBidang, disimpan di LISTRIK)
  await upsertSys({ nip: "ASM_LISTRIK", nama: "Syahrial", jenjangJabatan: "Asman Listrik",
    bidang: "PEMELIHARAAN", subBidang: "LISTRIK", role: "ASMAN",
    emailPerusahaan: "syahrial.huda@plnindonesiapower.co.id" });

  // I&C: TL — Yudi Nugraha
  await upsertSys({ nip: "TL_IC", nama: "Yudi Nugraha", jenjangJabatan: "TL I&C",
    bidang: "PEMELIHARAAN", subBidang: "IC", role: "TL",
    emailPerusahaan: "yudi.nugraha@plnindonesiapower.co.id" });
  // Asman I&C = Syahrial (ASM_LISTRIK) — workflow IC step 2 sudah di-fix ke subBidang LISTRIK

  // Mekanik: TL — Juan Oktapiansa
  await upsertSys({ nip: "TL_MEKANIK", nama: "Juan Oktapiansa", jenjangJabatan: "TL Mekanik",
    bidang: "PEMELIHARAAN", subBidang: "MEKANIK", role: "TL",
    emailPerusahaan: "oktaviansa@plnindonesiapower.co.id" });

  // Mekanik: Asman — Yunarko
  await upsertSys({ nip: "ASM_MEKANIK", nama: "Yunarko", jenjangJabatan: "Asman Mekanik",
    bidang: "PEMELIHARAAN", subBidang: "MEKANIK", role: "ASMAN",
    emailPerusahaan: "yunarko@plnindonesiapower.co.id" });

  // BOP: TL — Rizki Alif
  await upsertSys({ nip: "TL_BOP", nama: "Rizki Alif", jenjangJabatan: "TL BOP",
    bidang: "PEMELIHARAAN", subBidang: "BOP", role: "TL",
    emailPerusahaan: "rizky.alifutama@plnindonesiapower.co.id" });
  // Asman BOP = Yunarko (ASM_MEKANIK) — workflow BOP step 2 sudah di-fix ke subBidang MEKANIK

  // ── BIDANG SDM & KEU ──────────────────────────────────────────────
  // Manager SDM & Keu (shared semua sub-bidang SDM_KEU) — Riyadi
  await upsertSys({ nip: "MGR_SDM", nama: "Riyadi", jenjangJabatan: "Manager SDM & Keu",
    bidang: "SDM_KEU", subBidang: "SDM", role: "MANAGER",
    emailPerusahaan: "riyadi@plnindonesiapower.co.id" });

  // SDM: Officer — Anisa Mutiari
  await upsertSys({ nip: "OFF_SDM", nama: "Anisa Mutiari", jenjangJabatan: "Officer SDM",
    bidang: "SDM_KEU", subBidang: "SDM", role: "OFFICER",
    emailPerusahaan: "anisa.mutiari@plnindonesiapower.co.id" });

  // SDM: Asman — Wildani Pratiwi
  await upsertSys({ nip: "ASM_SDM", nama: "Wildani Pratiwi", jenjangJabatan: "Asman SDM",
    bidang: "SDM_KEU", subBidang: "SDM", role: "ASMAN",
    emailPerusahaan: "wildani.pratiwi@plnindonesiapower.co.id" });

  // Umum: Officer — Irvan Sandi
  await upsertSys({ nip: "OFF_UMUM", nama: "Irvan Sandi", jenjangJabatan: "Officer Umum",
    bidang: "SDM_KEU", subBidang: "UMUM", role: "OFFICER",
    emailPerusahaan: "irvan.sandi@plnindonesiapower.co.id" });

  // Umum: Asman — Arif Sarifudin
  await upsertSys({ nip: "ASM_UMUM", nama: "Arif Sarifudin", jenjangJabatan: "Asman Umum",
    bidang: "SDM_KEU", subBidang: "UMUM", role: "ASMAN",
    emailPerusahaan: "arif.sarifudin@plnindonesiapower.co.id" });

  // Keuangan: Asman (tidak ada Officer step) — Hecal Ahmad
  await upsertSys({ nip: "ASM_KEU", nama: "Hecal Ahmad", jenjangJabatan: "Asman Keuangan & Akuntansi",
    bidang: "SDM_KEU", subBidang: "KEUANGAN", role: "ASMAN",
    emailPerusahaan: "hecal.achmad@plnindonesiapower.co.id" });

  // PBJ: Asman (tidak ada Officer step) — Ahmad Fatullah
  await upsertSys({ nip: "ASM_PBJ", nama: "Ahmad Fatullah", jenjangJabatan: "Asman PBJ",
    bidang: "SDM_KEU", subBidang: "PBJ", role: "ASMAN",
    emailPerusahaan: "ahmad.fatullah@plnindonesiapower.co.id" });

  // ── BIDANG ENGINEERING ────────────────────────────────────────────
  // Manager Engineering (shared PDM & Admin/Sekretaris) — Ana Mustakim
  await upsertSys({ nip: "MGR_ENG", nama: "Ana Mustakim", jenjangJabatan: "Manager Engineering",
    bidang: "ENGINEERING", subBidang: "PDM", role: "MANAGER",
    emailPerusahaan: "ana.mustakim@plnindonesiapower.co.id" });

  // PDM: TL — Insan Taufik
  await upsertSys({ nip: "TL_PDM", nama: "Insan Taufik", jenjangJabatan: "TL PDM",
    bidang: "ENGINEERING", subBidang: "PDM", role: "TL",
    emailPerusahaan: "insan.taufik@plnindonesiapower.co.id" });

  // PDM: Asman — Sayuti
  await upsertSys({ nip: "ASM_PDM", nama: "Sayuti", jenjangJabatan: "Asman PDM",
    bidang: "ENGINEERING", subBidang: "PDM", role: "ASMAN",
    emailPerusahaan: "sayutiwn@plnindonesiapower.co.id" });

  // Admin/Sekretaris: Officer Kinerja — Eulis Rosmayanti
  await upsertSys({ nip: "OFF_KINERJA", nama: "Eulis Rosmayanti", jenjangJabatan: "Officer Kinerja",
    bidang: "ENGINEERING", subBidang: "ADMIN_SEKRETARIS", role: "OFFICER",
    emailPerusahaan: "eulis.rosmayanti@plnindonesiapower.co.id" });

  // Admin/Sekretaris: Asman EKSIS — Yondha Dwika Aferiandi
  await upsertSys({ nip: "ASM_EKSIS", nama: "Yondha Dwika Aferiandi", jenjangJabatan: "Asman EKSIS",
    bidang: "ENGINEERING", subBidang: "ADMIN_SEKRETARIS", role: "ASMAN",
    emailPerusahaan: "yondha.dwika@plnindonesiapower.co.id" });

  // Pegawai dummy untuk Admin/Sekretaris Engineering
  await upsertSys({ nip: "PEG_ADMSEK", nama: "Sekretaris Engineering", jenjangJabatan: "Staf Admin/Sekretaris",
    bidang: "ENGINEERING", subBidang: "ADMIN_SEKRETARIS", role: "PEGAWAI",
    emailPerusahaan: "sekretaris.engineering@plnindonesiapower.co.id" });


  // ── 50 PEGAWAI ASLI ─────────────────────────────────────────────────────────
  console.log("🌱 Inserting 50 pegawai...");

  type PegawaiInput = {
    nip: string; nama: string; jenjangJabatan: string;
    bidang: string; subBidang: string; tlGroup?: string;
    tipeKerja: string;
    role?: string; // opsional — default PEGAWAI, kecuali ADMIN perekap
    emailPerusahaan: string; emailPersonal?: string; phone?: string;
  };

  const pegawaiList: PegawaiInput[] = [
    // ── OPERASI: Operator BOP (OPERATOR_SHIFT) — SEMUA SHIFT ───────
    { nip: "1793259708", nama: "Firmanulloh", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "A", tipeKerja: "SHIFT", emailPerusahaan: "firmanulloh@plnipservices.co.id", emailPersonal: "firmanulloh038@gmail.com", phone: "087774141411" },
    { nip: "1795281708", nama: "Rifan Arizki", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "A", tipeKerja: "SHIFT", emailPerusahaan: "rifan.arizki@plnipservices.co.id", emailPersonal: "arizkiifan@yahoo.com", phone: "081906327065" },
    { nip: "1788260408", nama: "Sapto Joko Saputro", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "B", tipeKerja: "SHIFT", emailPerusahaan: "sapto.saputro@plnipservices.co.id", emailPersonal: "saptojokosaputro4@gmail.com", phone: "085966777312" },
    { nip: "1494187608", nama: "M. Chasani", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "B", tipeKerja: "SHIFT", emailPerusahaan: "Muhammad.chasani@plnipservices.co.id", emailPersonal: "sanixperia3@gmail.com", phone: "082340038377" },
    { nip: "1780260308", nama: "Sainan", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "C", tipeKerja: "SHIFT", emailPerusahaan: "sainan@plnipservices.co.id", emailPersonal: "saynand.nehwal@gmail.com", phone: "081380346301" },
    { nip: "1792259908", nama: "Muji Edhi Purwanto", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "C", tipeKerja: "SHIFT", emailPerusahaan: "muji.purwanto@plnipservices.co.id", emailPersonal: "edhi.elbarcelona92@gmail.com", phone: "081293968852" },
    { nip: "1792260208", nama: "Sahari", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "D", tipeKerja: "SHIFT", emailPerusahaan: "sahari@plnipservices.co.id", emailPersonal: "sahariarie2@gmail.com", phone: "08978068207" },
    { nip: "1492186208", nama: "Amiq Syihabuddin", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "D", tipeKerja: "SHIFT", emailPerusahaan: "amigsyihabuddin@plnipservices.co.id", emailPersonal: "amiqsyihab92@gmail.com", phone: "085711344988" },
    { nip: "2401618308", nama: "Aan Suhelan", jenjangJabatan: "Operator BOP", bidang: "OPERASI", subBidang: "OPERATOR_SHIFT", tlGroup: "D", tipeKerja: "SHIFT", emailPerusahaan: "aan.suhelan@plnipservices.co.id", emailPersonal: "elan190319@gmail.com", phone: "087847429861" },

    // ── OPERASI: Pelaksana K3 — SHIFT (A-D) + NON_SHIFT (Ahmad Yani)
    { nip: "229443800K", nama: "Afrian Aeji", jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "A", tipeKerja: "SHIFT", emailPerusahaan: "afrian.aeji@plnipservices.co.id", emailPersonal: "afrianaeji9@gmail.com", phone: "085930044699" },
    { nip: "1787258428", nama: "Mansur", jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "B", tipeKerja: "SHIFT", emailPerusahaan: "mansur2584@plnipservices.co.id", emailPersonal: "manli.mansur@gmail.com", phone: "081911125425" },
    { nip: "1495188108", nama: "Muhammad Refai", jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "C", tipeKerja: "SHIFT", emailPerusahaan: "Muhammad.refai@plnipservices.co.id", emailPersonal: "muhammadrefai93@gmail.com", phone: "085866444460" },
    { nip: "1494122908", nama: "Ardiansyah Apprillah", jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tlGroup: "D", tipeKerja: "SHIFT", emailPerusahaan: "ardiansyah.apprillah@plnipservices.co.id", emailPersonal: "ardhydeavinci@ymail.com", phone: "089646744778" },
    { nip: "1778258308", nama: "Ahmad Yani", jenjangJabatan: "Pelaksana K3", bidang: "OPERASI", subBidang: "K3", tipeKerja: "SHIFT", emailPerusahaan: "ahmad.yani@plnipservices.co.id", emailPersonal: "iancampoes@gmail.com", phone: "081932167177" },

    // ── OPERASI: Pelaksana Niaga (OPERATOR_NIAGA) — SEMUA SHIFT ────
    { nip: "1495186608", nama: "Aris Sofian", jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "A", tipeKerja: "SHIFT", emailPerusahaan: "aris.sofian@plnipservices.co.id", emailPersonal: "arissofian48@yahoo.co.id", phone: "08976746575" },
    { nip: "1492188208", nama: "Muhammad Suhanda", jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "B", tipeKerja: "SHIFT", emailPerusahaan: "muhammad.suhanda@plnipservices.co.id", emailPersonal: "suhanda.cogindo@gmail.com", phone: "087865684926" },
    { nip: "1493186908", nama: "Dodo Prasetyo", jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "C", tipeKerja: "SHIFT", emailPerusahaan: "dodopraseyo@plnipservices.co.id", emailPersonal: "dodoq67@gmail.com", phone: "087889891129" },
    { nip: "1491188008", nama: "Muhammad Muhklis", jenjangJabatan: "Pelaksana Niaga", bidang: "OPERASI", subBidang: "OPERATOR_NIAGA", tlGroup: "D", tipeKerja: "SHIFT", emailPerusahaan: "muhammad.muhklis@plnipservices.co.id", emailPersonal: "muhklism3@gmail.com", phone: "081353330765" },

    // ── OPERASI: Pelaksana Lingkungan — NON SHIFT ──────────────────
    { nip: "1791260708", nama: "Wisnu Marwanto", jenjangJabatan: "Pelaksana Lingkungan", bidang: "OPERASI", subBidang: "LINGKUNGAN", tipeKerja: "NON_SHIFT", emailPerusahaan: "wisnu.marwanto@plnipservices.co.id", emailPersonal: "wisnu_marwanto@yahoo.com", phone: "087871153115" },
    { nip: "229742672K", nama: "Shylviana Denauli", jenjangJabatan: "Pelaksana Lingkungan", bidang: "OPERASI", subBidang: "LINGKUNGAN", tipeKerja: "NON_SHIFT", emailPerusahaan: "shylviadenauli@plnipservices.co.id", emailPersonal: "shylvidenauli@gmail.com", phone: "089679029059" },

    // ── OPERASI: Pelaksana Kimia (Kepmo) — NON SHIFT ───────────────
    { nip: "1497185608", nama: "Regan Dimasta", jenjangJabatan: "Pelaksana Kimia", bidang: "OPERASI", subBidang: "KEPMO", tipeKerja: "NON_SHIFT", emailPerusahaan: "regan.dimasta@plnipservices.co.id", emailPersonal: "regandimasta.rd@gmail.com", phone: "087865684926" },
    { nip: "1783260808", nama: "Oping Mardani", jenjangJabatan: "Pelaksana Kimia", bidang: "OPERASI", subBidang: "KEPMO", tipeKerja: "NON_SHIFT", emailPerusahaan: "oping.mardani@plnipservices.co.id", emailPersonal: "omkakaom558@gmail.com", phone: "085215297525" },

    // ── PEMELIHARAAN: Teknisi Mesin (MEKANIK) — NON SHIFT ─────────
    { nip: "1771259308", nama: "Supiin", jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", tipeKerja: "NON_SHIFT", emailPerusahaan: "supiin@plnipservices.co.id", emailPersonal: "supiin76271@gmail.com", phone: "08787836625" },
    { nip: "1782259508", nama: "Deni Harliman", jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", tipeKerja: "NON_SHIFT", emailPerusahaan: "deni.harliman@plnipservices.co.id", emailPersonal: "deniharliman@gmail.com", phone: "081999432543" },
    { nip: "229543790K", nama: "Deni Junaidi", jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", tipeKerja: "NON_SHIFT", emailPerusahaan: "deni.junaidi43790@plnipservices.co.id", emailPersonal: "denijunaidi00@gmail.com", phone: "089619911856" },
    { nip: "2490660910K", nama: "Pambudi", jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", tipeKerja: "NON_SHIFT", emailPerusahaan: "pambudi@plnipservices.co.id", emailPersonal: "pambudibudenx@gmail.com", phone: "085730675081" },
    { nip: "249660900K", nama: "Dedi Jamaludin", jenjangJabatan: "Teknisi Mesin", bidang: "PEMELIHARAAN", subBidang: "MEKANIK", tipeKerja: "NON_SHIFT", emailPerusahaan: "dedi.jamaludin@plnipservices.co.id", emailPersonal: "dedijamaludin96@gmail.com", phone: "085862491664" },

    // ── PEMELIHARAAN: Teknisi Mesin BOP (BOP) — Arifudin/Slamet/Aris NON SHIFT, Rio SHIFT
    { nip: "1770258608", nama: "Arifudin", jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", tipeKerja: "NON_SHIFT", emailPerusahaan: "arifudin@plnipservices.co.id", emailPersonal: "arifudin3517@gmail.com", phone: "08809193332" },
    { nip: "1776259208", nama: "Slamet Sugianto", jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", tipeKerja: "NON_SHIFT", emailPerusahaan: "slamet.sugianto@plnipservices.co.id", emailPersonal: "slametmbahislam@gmail.com", phone: "087871189461" },
    { nip: "1775258718", nama: "Aris Budi Ariyanto", jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", tipeKerja: "NON_SHIFT", emailPerusahaan: "aris.ariyanto@plnipservices.co.id", emailPersonal: "aris_budi30@yahoo.com", phone: "08176843906" },
    { nip: "2400618208", nama: "Rio Setiawan", jenjangJabatan: "Teknisi Mesin BOP, Bengkel dan Tools", bidang: "PEMELIHARAAN", subBidang: "BOP", tipeKerja: "SHIFT", emailPerusahaan: "rio.setiawan@plnipservices.co.id", emailPersonal: "riosetiawan2108@gmail.com", phone: "087783281372" },

    // ── PEMELIHARAAN: Teknisi Listrik (LISTRIK) — NON SHIFT ───────
    { nip: "1784259008", nama: "Nanang Suendi", jenjangJabatan: "Teknisi Listrik Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "LISTRIK", tipeKerja: "NON_SHIFT", emailPerusahaan: "nanang.suendi@plnipservices.co.id", emailPersonal: "nanang.suendi@gmail.com", phone: "081906470112" },
    { nip: "1775259108", nama: "Saniman", jenjangJabatan: "Teknisi Listrik Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "LISTRIK", tipeKerja: "NON_SHIFT", emailPerusahaan: "saniman@plnipservices.co.id", emailPersonal: "mansaniman9@gmail.com", phone: "085219511908" },

    // ── PEMELIHARAAN: Teknisi I&C (IC) — NON SHIFT ────────────────
    { nip: "1780258908", nama: "Asep Wawan Setiawan", jenjangJabatan: "Teknisi Kontrol dan Instrumen Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "IC", tipeKerja: "NON_SHIFT", emailPerusahaan: "asep.setiawan@plnipservices.co.id", emailPersonal: "asepwawan.0108@gmail.com", phone: "081807238191" },
    { nip: "2395504008K", nama: "Martinus Bayu C", jenjangJabatan: "Teknisi Kontrol dan Instrumen Unit dan BOP", bidang: "PEMELIHARAAN", subBidang: "IC", tipeKerja: "NON_SHIFT", emailPerusahaan: "martinus.bayu50400@plnipservices.co.id", emailPersonal: "martinusbaychris@gmail.com", phone: "087788642691" },

    // ── ENGINEERING: PDM — NON SHIFT ──────────────────────────────
    { nip: "1786258508", nama: "Rahmat Hidayat", jenjangJabatan: "Predictive Maintenance", bidang: "ENGINEERING", subBidang: "PDM", tipeKerja: "NON_SHIFT", emailPerusahaan: "rahmat.hidayat@plnipservices.co.id", emailPersonal: "rahmat.tegalwangi@gmail.com", phone: "08771297106" },

    // ── ENGINEERING: Admin/Sekretaris — NON SHIFT ─────────────────
    { nip: "1992365828", nama: "Chilvia Jenita", jenjangJabatan: "Pelaksana KM, SMT dan Inovasi", bidang: "ENGINEERING", subBidang: "ADMIN_SEKRETARIS", tipeKerja: "NON_SHIFT", emailPerusahaan: "chilvia.jenita@plnipservices.co.id", emailPersonal: "chilviajeniita1427@gmail.com", phone: "082300057676" },

    // ── SDM & KEU: UMUM — NON SHIFT ───────────────────────────────
    { nip: "1785260118", nama: "Ratih Kartika", jenjangJabatan: "Pelaksana Umum", bidang: "SDM_KEU", subBidang: "UMUM", tipeKerja: "NON_SHIFT", emailPerusahaan: "ratih.kartika@plnipservices.co.id", emailPersonal: "ratihkartika@yahoo.com", phone: "081932111600" },
    { nip: "1787260028", nama: "Nurlaelah", jenjangJabatan: "Pelaksana Kesekretariatan", bidang: "SDM_KEU", subBidang: "UMUM", tipeKerja: "NON_SHIFT", emailPerusahaan: "nurlaelah@plnipservices.co.id", emailPersonal: "lela@indonesiapower.co.id", phone: "081911144382" },
    { nip: "2492571028K", nama: "Bimo Septo Armando", jenjangJabatan: "Pelaksana Administrasi Gudang", bidang: "SDM_KEU", subBidang: "UMUM", tipeKerja: "NON_SHIFT", emailPerusahaan: "bimo.septo42182@plnipservices.co.id", phone: "081386977189" },
    { nip: "1991365928", nama: "Gega Wira Patria", jenjangJabatan: "Pelaksana Administrasi Gudang", bidang: "SDM_KEU", subBidang: "UMUM", tipeKerja: "NON_SHIFT", emailPerusahaan: "gega.patria@plnipservices.co.id", emailPersonal: "wiragega@gmail.com", phone: "085319599184" },

    // ── SDM & KEU: PBJ — NON SHIFT ────────────────────────────────
    { nip: "1781260508", nama: "Tini Ruliani Y.", jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", tipeKerja: "NON_SHIFT", emailPerusahaan: "Tini.yatmikasari@plnipservices.co.id", emailPersonal: "rulitini@gmail.com", phone: "087771690771" },
    { nip: "1790259608", nama: "Dinar Furi Handayani", jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", tipeKerja: "NON_SHIFT", emailPerusahaan: "dinar.handayani@plnipservices.co.id", emailPersonal: "dinarfuri21@gmail.com", phone: "081285523948" },
    { nip: "1293089208", nama: "Alip Novi Hayati N", jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", tipeKerja: "NON_SHIFT", emailPerusahaan: "alip.hayatinnofus@plnipservices.co.id", emailPersonal: "novalip33@gmail.com", phone: "085694916896" },
    { nip: "1983336728", nama: "Yulfitri Ardiana", jenjangJabatan: "Pelaksana Pengadaan Barang dan Jasa", bidang: "SDM_KEU", subBidang: "PBJ", tipeKerja: "NON_SHIFT", emailPerusahaan: "yulfitri.ardiana@plnipservices.co.id", emailPersonal: "yulfitriardiana@gmail.com", phone: "08567512621" },

    // ── SDM & KEU: KEUANGAN — NON SHIFT ───────────────────────────
    { nip: "229844762K", nama: "Linda Indriyani", jenjangJabatan: "Pelaksana Keuangan dan Pajak", bidang: "SDM_KEU", subBidang: "KEUANGAN", tipeKerja: "NON_SHIFT", emailPerusahaan: "linda.indriyani44762@plnipservice.co.id", phone: "082112029299" },
    { nip: "1781260618", nama: "Wati Rahmawati", jenjangJabatan: "Pelaksana Senior Anggaran", bidang: "SDM_KEU", subBidang: "KEUANGAN", tipeKerja: "NON_SHIFT", emailPerusahaan: "wati.rahmawati@plnipservices.co.id", emailPersonal: "wati@indonesiapower.co.id", phone: "081380278481" },
    { nip: "1996365628", nama: "M. Rivanur Todo Faruq", jenjangJabatan: "Pelaksana Senior Akutansi", bidang: "SDM_KEU", subBidang: "KEUANGAN", tipeKerja: "NON_SHIFT", emailPerusahaan: "rivanur.faruq@plnipservices.co.id", emailPersonal: "Rivanur.t.f@gmail.com", phone: "085774412492" },

    // ── SDM & KEU: SDM — NON SHIFT ────────────────────────────────
    // Role ADMIN agar saat mengajukan lembur alur langsung ke Branch Manager (ADMIN_WORKFLOW)
    { nip: "1494179518", nama: "R.A Suci Arbianty", role: "ADMIN", jenjangJabatan: "Pelaksana Senior Adminitrasi (Non Formasi)", bidang: "SDM_KEU", subBidang: "SDM", tipeKerja: "NON_SHIFT", emailPerusahaan: "suciarbianty@plnipservices.co.id", emailPersonal: "suciarbianty@ymail.com", phone: "08557628632" },
    { nip: "1593218108", nama: "Annisa Frezty", role: "ADMIN", jenjangJabatan: "Pelaksana Administrasi (Non Formasi)", bidang: "SDM_KEU", subBidang: "SDM", tipeKerja: "NON_SHIFT", emailPerusahaan: "annisa.fadilla@plnipservices.co.id", emailPersonal: "frezyannisa@gmail.com", phone: "081808340629" },
  ];

  for (const p of pegawaiList) {
    await prisma.user.upsert({
      where: { emailPerusahaan: p.emailPerusahaan },
      update: {
        nip: p.nip,
        nama: p.nama,
        jenjangJabatan: p.jenjangJabatan,
        bidang: p.bidang as any,
        subBidang: p.subBidang as any,
        role: (p.role ?? "PEGAWAI") as any,
        tlGroup: p.tlGroup ?? null,
        tipeKerja: p.tipeKerja as any,
        phone: p.phone,
        emailPersonal: p.emailPersonal,
      },
      create: {
        nip: p.nip,
        nama: p.nama,
        jenjangJabatan: p.jenjangJabatan,
        bidang: p.bidang as any,
        subBidang: p.subBidang as any,
        role: (p.role ?? "PEGAWAI") as any,
        tlGroup: p.tlGroup,
        tipeKerja: p.tipeKerja as any,
        emailPerusahaan: p.emailPerusahaan,
        emailPersonal: p.emailPersonal,
        phone: p.phone,
        password: await hash("password123"),
      },
    });
    console.log(`  ✓ ${p.nama} [${p.tipeKerja}] [${p.role ?? "PEGAWAI"}]`);
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
