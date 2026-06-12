/**
 * seed.generated.ts
 * AUTO-GENERATED dari database Supabase pada 2026-06-12T05:57:50.482Z
 * Generate ulang dengan: npx ts-node scripts/dump-to-seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter } as any);

// ── DATA USER (diambil dari database pada 2026-06-12T05:57:50.484Z) ─────────────────
const USERS = [
  {"nip":"2401618308K","nama":"Aan Suhelan","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"aan.suhelan@plnipservices.co.id","emailPersonal":"elan190319@gmail.com","phone":"087847429861","tlGroup":"D"},
  {"nip":"229443800K","nama":"Afrian Aeji","jenjangJabatan":"Pelaksana K3","bidang":"OPERASI","subBidang":"K3","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"afrian.aeji@plnipservices.co.id","emailPersonal":"afrianaeji9@gmail.com","phone":"085930044699","tlGroup":"A"},
  {"nip":"177825830B","nama":"Ahmad Yani","jenjangJabatan":"Pelaksana K3","bidang":"OPERASI","subBidang":"K3","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"ahmad.yani@plnipservices.co.id","emailPersonal":"iancampoes@gmail.com","phone":"081932167177"},
  {"nip":"149218620B","nama":"Amiq Syihabuddin","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"amigsyihabuddin@plnipservices.co.id","emailPersonal":"amiqsyihab92@gmail.com","phone":"085711344988","tlGroup":"D"},
  {"nip":"149412290B","nama":"Ardiansyah Apprillah","jenjangJabatan":"Pelaksana K3","bidang":"OPERASI","subBidang":"K3","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"ardiansyah.apprillah@plnipservices.co.id","emailPersonal":"ardhydeavinci@ymail.com","phone":"089646744778","tlGroup":"D"},
  {"nip":"149518660B","nama":"Aris Sofian","jenjangJabatan":"Pelaksana Niaga","bidang":"OPERASI","subBidang":"OPERATOR_NIAGA","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"aris.sofian@plnipservices.co.id","emailPersonal":"arissofian48@yahoo.co.id","phone":"08976746575","tlGroup":"A"},
  {"nip":"149318690B","nama":"Dodo Prasetyo","jenjangJabatan":"Pelaksana Niaga","bidang":"OPERASI","subBidang":"OPERATOR_NIAGA","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"dodopraseyo@plnipservices.co.id","emailPersonal":"dodoq67@gmail.com","phone":"087889891129","tlGroup":"C"},
  {"nip":"179325970B","nama":"Firmanulloh","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"firmanulloh@plnipservices.co.id","emailPersonal":"firmanulloh038@gmail.com","phone":"087774141411","tlGroup":"A"},
  {"nip":"1494187608","nama":"M. Chasani","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"Muhammad.chasani@plnipservices.co.id","emailPersonal":"sanixperia3@gmail.com","phone":"082340038377","tlGroup":"B"},
  {"nip":"178725842B","nama":"Mansur","jenjangJabatan":"Pelaksana K3","bidang":"OPERASI","subBidang":"K3","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"mansur2584@plnipservices.co.id","emailPersonal":"manli.mansur@gmail.com","phone":"081911125425","tlGroup":"B"},
  {"nip":"149118800B","nama":"Muhammad Muhklis","jenjangJabatan":"Pelaksana Niaga","bidang":"OPERASI","subBidang":"OPERATOR_NIAGA","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"muhammad.muhklis@plnipservices.co.id","emailPersonal":"muhklism3@gmail.com","phone":"081353330765","tlGroup":"D"},
  {"nip":"149518810B","nama":"Muhammad Refai","jenjangJabatan":"Pelaksana K3","bidang":"OPERASI","subBidang":"K3","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"Muhammad.refai@plnipservices.co.id","emailPersonal":"muhammadrefai93@gmail.com","phone":"085866444460","tlGroup":"C"},
  {"nip":"149218820B","nama":"Muhammad Suhanda","jenjangJabatan":"Pelaksana Niaga","bidang":"OPERASI","subBidang":"OPERATOR_NIAGA","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"muhammad.suhanda@plnipservices.co.id","emailPersonal":"suhanda.cogindo@gmail.com","phone":"087865684926","tlGroup":"B"},
  {"nip":"1792259908","nama":"Muji Edhi Purwanto","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"muji.purwanto@plnipservices.co.id","emailPersonal":"edhi.elbarcelona92@gmail.com","phone":"081293968852","tlGroup":"C"},
  {"nip":"178326080B","nama":"Oping Mardani","jenjangJabatan":"Pelaksana Kimia","bidang":"OPERASI","subBidang":"KEPMO","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"oping.mardani@plnipservices.co.id","emailPersonal":"omkakaom558@gmail.com","phone":"085215297525"},
  {"nip":"8912345Z","nama":"Ranger Andalan","jenjangJabatan":"Officer K3","bidang":"OPERASI","subBidang":"K3","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"ranger.andalan@plnindonesiapower.co.id"},
  {"nip":"149718560B","nama":"Regan Dimasta","jenjangJabatan":"Pelaksana Kimia","bidang":"OPERASI","subBidang":"KEPMO","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"regan.dimasta@plnipservices.co.id","emailPersonal":"regandimasta.rd@gmail.com","phone":"087865684926"},
  {"nip":"179528170B","nama":"Rifan Arizki","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"rifan.arizki@plnipservices.co.id","emailPersonal":"arizkiifan@yahoo.com","phone":"081906327065","tlGroup":"A"},
  {"nip":"179226020B","nama":"Sahari","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"sahari@plnipservices.co.id","emailPersonal":"sahariarie2@gmail.com","phone":"08978068207","tlGroup":"D"},
  {"nip":"178026030B","nama":"Sainan","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"sainan@plnipservices.co.id","emailPersonal":"saynand.nehwal@gmail.com","phone":"081380346301","tlGroup":"C"},
  {"nip":"178826040B","nama":"Sapto Joko Saputro","jenjangJabatan":"Operator BOP","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"sapto.saputro@plnipservices.co.id","emailPersonal":"saptojokosaputro4@gmail.com","phone":"085966777312","tlGroup":"B"},
  {"nip":"229742672K","nama":"Shylviana Denauli","jenjangJabatan":"Pelaksana Lingkungan","bidang":"OPERASI","subBidang":"LINGKUNGAN","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"shylviadenauli@plnipservices.co.id","emailPersonal":"shylvidenauli@gmail.com","phone":"089679029059"},
  {"nip":"1791260708","nama":"Wisnu Marwanto","jenjangJabatan":"Pelaksana Lingkungan","bidang":"OPERASI","subBidang":"LINGKUNGAN","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"wisnu.marwanto@plnipservices.co.id","emailPersonal":"wisnu_marwanto@yahoo.com","phone":"087871153115"},
  {"nip":"OFF_K3","nama":"Bimaji Catur W.","jenjangJabatan":"Officer K3","bidang":"OPERASI","subBidang":"K3","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"bimaji.catur@plnindonesiapower.co.id"},
  {"nip":"9900000004","nama":"Dian Pratama","jenjangJabatan":"Officer Kepmo","bidang":"OPERASI","subBidang":"KEPMO","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"dian.pratama@plnindonesiapower.co.id"},
  {"nip":"9900000007","nama":"Fajar Officer K3","jenjangJabatan":"Officer K3","bidang":"OPERASI","subBidang":"K3","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"fajar.k3@plnindonesiapower.co.id"},
  {"nip":"OFF_LINGKUNGAN","nama":"Masenda","jenjangJabatan":"Officer Lingkungan","bidang":"OPERASI","subBidang":"LINGKUNGAN","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"masenda.clg@plnindonesiapower.co.id"},
  {"nip":"OFF_KEPMO","nama":"Rudy Bambang","jenjangJabatan":"Officer Kepmo","bidang":"OPERASI","subBidang":"KEPMO","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"rudi.bambang@plnindonesiapower.co.id"},
  {"nip":"TL_SHIFT_A","nama":"Ihwansyah WS.","jenjangJabatan":"Officer/TL Shift A","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"SHIFT","emailPerusahaan":"ihwansyah.wibowo@plnindonesiapower.co.id","tlGroup":"A"},
  {"nip":"TL_SHIFT_C","nama":"Sulistiyono","jenjangJabatan":"Officer/TL Shift C","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"SHIFT","emailPerusahaan":"sulistiyono@plnindonesiapower.co.id","tlGroup":"C"},
  {"nip":"9900000009","nama":"TL Shift A","jenjangJabatan":"TL Shift A","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"tl.shifta@plnindonesiapower.co.id","tlGroup":"A"},
  {"nip":"9900000010","nama":"TL Shift B","jenjangJabatan":"TL Shift B","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"tl.shiftb@plnindonesiapower.co.id","tlGroup":"B"},
  {"nip":"9900000011","nama":"TL Shift C","jenjangJabatan":"TL Shift C","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"tl.shiftc@plnindonesiapower.co.id","tlGroup":"C"},
  {"nip":"9900000012","nama":"TL Shift D","jenjangJabatan":"TL Shift D","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"tl.shiftd@plnindonesiapower.co.id","tlGroup":"D"},
  {"nip":"TL_SHIFT_B","nama":"Untung Riyadi","jenjangJabatan":"Officer/TL Shift B","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"SHIFT","emailPerusahaan":"untung.riyadi@plnindonesiapower.co.id","tlGroup":"B"},
  {"nip":"TL_SHIFT_D","nama":"Yayan Suryana","jenjangJabatan":"Officer/TL Shift D","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"TL","tipeKerja":"SHIFT","emailPerusahaan":"yayan.suryana@plnindonesiapower.co.id","tlGroup":"D"},
  {"nip":"9900000013","nama":"Asman Operasi Shift","jenjangJabatan":"Asman Operasi","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"asman.operasi@plnindonesiapower.co.id"},
  {"nip":"ASM_K3","nama":"Fuji Juhairil H.","jenjangJabatan":"Asman K3L","bidang":"OPERASI","subBidang":"K3","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"fuji.juhairil@plnindonesiapower.co.id"},
  {"nip":"ASM_KEPMO","nama":"Gaguk S.","jenjangJabatan":"Asman Kepmo","bidang":"OPERASI","subBidang":"KEPMO","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"gaguk.s@plnindonesiapower.co.id"},
  {"nip":"ASM_NIAGA","nama":"Jontohom","jenjangJabatan":"Asman Niaga","bidang":"OPERASI","subBidang":"OPERATOR_NIAGA","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"jon.tohom@plnindonesiapower.co.id"},
  {"nip":"ASM_SHIFT","nama":"M. Ulil Amri","jenjangJabatan":"Asman Operasi","bidang":"OPERASI","subBidang":"OPERATOR_SHIFT","role":"ASMAN","tipeKerja":"SHIFT","emailPerusahaan":"m.amri@plnindonesiapower.co.id"},
  {"nip":"9900000005","nama":"Rizky Asman Kepmo","jenjangJabatan":"Asman Kepmo","bidang":"OPERASI","subBidang":"KEPMO","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"rizky.asman@plnindonesiapower.co.id"},
  {"nip":"9900000008","nama":"Wahyu Asman K3L","jenjangJabatan":"Asman K3L","bidang":"OPERASI","subBidang":"K3","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"wahyu.k3l@plnindonesiapower.co.id"},
  {"nip":"MGR_OPR","nama":"Hendra Surya Kusumah","jenjangJabatan":"Manager Operasi","bidang":"OPERASI","subBidang":"KEPMO","role":"MANAGER","tipeKerja":"NON_SHIFT","emailPerusahaan":"hendra.surya@plnindonesiapower.co.id"},
  {"nip":"9900000003","nama":"Hendra Wijaya","jenjangJabatan":"Manager Operasi","bidang":"OPERASI","subBidang":"KEPMO","role":"MANAGER","tipeKerja":"NON_SHIFT","emailPerusahaan":"hendra.wijaya@plnindonesiapower.co.id"},
  {"nip":"BM001","nama":"Ade Majid","jenjangJabatan":"Branch Manager","bidang":"OPERASI","subBidang":"KEPMO","role":"BRANCH_MANAGER","tipeKerja":"NON_SHIFT","emailPerusahaan":"ade.majid83@gmail.com"},
  {"nip":"SUPERADMIN001","nama":"Super Admin UBP Cilegon","jenjangJabatan":"Super Administrator","bidang":"OPERASI","subBidang":"ADMIN_SEKRETARIS","role":"SUPER_ADMIN","tipeKerja":"NON_SHIFT","emailPerusahaan":"superadmin@ubpcilegon.local"},
  {"nip":"129308920B","nama":"Alip Novi Hayati N","jenjangJabatan":"Pelaksana Pengadaan Barang dan Jasa","bidang":"SDM_KEU","subBidang":"PBJ","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"alip.hayatinnofus@plnipservices.co.id","emailPersonal":"novalip33@gmail.com","phone":"085694916896"},
  {"nip":"249257102K","nama":"Bimo Septo Armando","jenjangJabatan":"Pelaksana Administrasi Gudang","bidang":"SDM_KEU","subBidang":"UMUM","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"bimo.septo42182@plnipservices.co.id","phone":"081386977189"},
  {"nip":"179025960B","nama":"Dinar Furi Handayani","jenjangJabatan":"Pelaksana Pengadaan Barang dan Jasa","bidang":"SDM_KEU","subBidang":"PBJ","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"dinar.handayani@plnipservices.co.id","emailPersonal":"dinarfuri21@gmail.com","phone":"081285523948"},
  {"nip":"199136592B","nama":"Gega Wira Patria","jenjangJabatan":"Pelaksana Administrasi Gudang","bidang":"SDM_KEU","subBidang":"UMUM","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"gega.patria@plnipservices.co.id","emailPersonal":"wiragega@gmail.com","phone":"085319599184"},
  {"nip":"229844762K","nama":"Linda Indriyani","jenjangJabatan":"Pelaksana Keuangan dan Pajak","bidang":"SDM_KEU","subBidang":"KEUANGAN","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"linda.indriyani44762@plnipservice.co.id","phone":"082112029299"},
  {"nip":"199636562B","nama":"M. Rivanur Todo Faruq","jenjangJabatan":"Pelaksana Senior Akutansi","bidang":"SDM_KEU","subBidang":"KEUANGAN","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"rivanur.faruq@plnipservices.co.id","emailPersonal":"Rivanur.t.f@gmail.com","phone":"085774412492"},
  {"nip":"178726002B","nama":"Nurlaelah","jenjangJabatan":"Pelaksana Kesekretariatan","bidang":"SDM_KEU","subBidang":"UMUM","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"nurlaelah@plnipservices.co.id","emailPersonal":"lela@indonesiapower.co.id","phone":"081911144382"},
  {"nip":"178526011B","nama":"Ratih Kartika","jenjangJabatan":"Pelaksana Umum","bidang":"SDM_KEU","subBidang":"UMUM","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"ratih.kartika@plnipservices.co.id","emailPersonal":"ratihkartika@yahoo.com","phone":"081932111600"},
  {"nip":"178126050B","nama":"Tini Ruliani Y.","jenjangJabatan":"Pelaksana Pengadaan Barang dan Jasa","bidang":"SDM_KEU","subBidang":"PBJ","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"Tini.yatmikasari@plnipservices.co.id","emailPersonal":"rulitini@gmail.com","phone":"087771690771"},
  {"nip":"178126061B","nama":"Wati Rahmawati","jenjangJabatan":"Pelaksana Senior Anggaran","bidang":"SDM_KEU","subBidang":"KEUANGAN","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"wati.rahmawati@plnipservices.co.id","emailPersonal":"wati@indonesiapower.co.id","phone":"081380278481"},
  {"nip":"198333672B","nama":"Yulfitri Ardiana","jenjangJabatan":"Pelaksana Pengadaan Barang dan Jasa","bidang":"SDM_KEU","subBidang":"PBJ","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"yulfitri.ardiana@plnipservices.co.id","emailPersonal":"yulfitriardiana@gmail.com","phone":"08567512621"},
  {"nip":"OFF_SDM","nama":"Anisa Mutiari","jenjangJabatan":"Officer SDM","bidang":"SDM_KEU","subBidang":"SDM","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"anisa.mutiari@plnindonesiapower.co.id"},
  {"nip":"OFF_UMUM","nama":"Irvan Sandi","jenjangJabatan":"Officer Umum","bidang":"SDM_KEU","subBidang":"UMUM","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"irvan.sandi@plnindonesiapower.co.id"},
  {"nip":"ASM_PBJ","nama":"Ahmad Fatullah","jenjangJabatan":"Asman PBJ","bidang":"SDM_KEU","subBidang":"PBJ","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"ahmad.fatullah@plnindonesiapower.co.id"},
  {"nip":"ASM_UMUM","nama":"Arif Sarifudin","jenjangJabatan":"Asman Umum","bidang":"SDM_KEU","subBidang":"UMUM","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"arif.sarifudin@plnindonesiapower.co.id"},
  {"nip":"ASM_KEU","nama":"Hecal Ahmad","jenjangJabatan":"Asman Keuangan & Akuntansi","bidang":"SDM_KEU","subBidang":"KEUANGAN","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"hecal.achmad@plnindonesiapower.co.id"},
  {"nip":"ASM_SDM","nama":"Wildani Pratiwi","jenjangJabatan":"Asman SDM","bidang":"SDM_KEU","subBidang":"SDM","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"wildani.pratiwi@plnindonesiapower.co.id"},
  {"nip":"MGR_SDM","nama":"Riyadi","jenjangJabatan":"Manager SDM & Keu","bidang":"SDM_KEU","subBidang":"SDM","role":"MANAGER","tipeKerja":"NON_SHIFT","emailPerusahaan":"riyadi@plnindonesiapower.co.id"},
  {"nip":"159321810B","nama":"Annisa Frezty","jenjangJabatan":"Pelaksana Administrasi (Non Formasi)","bidang":"SDM_KEU","subBidang":"SDM","role":"ADMIN","tipeKerja":"NON_SHIFT","emailPerusahaan":"annisa.fadilla@plnipservices.co.id","emailPersonal":"frezyannisa@gmail.com","phone":"081808340629"},
  {"nip":"149417951B","nama":"R.A Suci Arbianty","jenjangJabatan":"Pelaksana Senior Adminitrasi (Non Formasi)","bidang":"SDM_KEU","subBidang":"SDM","role":"ADMIN","tipeKerja":"NON_SHIFT","emailPerusahaan":"suciarbianty@plnipservices.co.id","emailPersonal":"suciarbianty@ymail.com","phone":"08557628632"},
  {"nip":"ADM001","nama":"Siti Rahayu","jenjangJabatan":"Staff Admin","bidang":"SDM_KEU","subBidang":"SDM","role":"ADMIN","tipeKerja":"NON_SHIFT","emailPerusahaan":"siti.rahayu@plnindonesiapower.co.id"},
  {"nip":"177025860B","nama":"Arifudin","jenjangJabatan":"Teknisi Mesin BOP, Bengkel dan Tools","bidang":"PEMELIHARAAN","subBidang":"BOP","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"arifudin@plnipservices.co.id","emailPersonal":"arifudin3517@gmail.com","phone":"08809193332"},
  {"nip":"177525871B","nama":"Aris Budi Ariyanto","jenjangJabatan":"Teknisi Mesin BOP, Bengkel dan Tools","bidang":"PEMELIHARAAN","subBidang":"BOP","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"aris.ariyanto@plnipservices.co.id","emailPersonal":"aris_budi30@yahoo.com","phone":"08176843906"},
  {"nip":"178025890B","nama":"Asep Wawan Setiawan","jenjangJabatan":"Teknisi Kontrol dan Instrumen Unit dan BOP","bidang":"PEMELIHARAAN","subBidang":"IC","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"asep.setiawan@plnipservices.co.id","emailPersonal":"asepwawan.0108@gmail.com","phone":"081807238191"},
  {"nip":"249660900K","nama":"Dedi Jamaludin","jenjangJabatan":"Teknisi Mesin","bidang":"PEMELIHARAAN","subBidang":"MEKANIK","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"dedi.jamaludin@plnipservices.co.id","emailPersonal":"dedijamaludin96@gmail.com","phone":"085862491664"},
  {"nip":"178225950B","nama":"Deni Harliman","jenjangJabatan":"Teknisi Mesin","bidang":"PEMELIHARAAN","subBidang":"MEKANIK","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"deni.harliman@plnipservices.co.id","emailPersonal":"deniharliman@gmail.com","phone":"081999432543"},
  {"nip":"229543790K","nama":"Deni Junaidi","jenjangJabatan":"Teknisi Mesin","bidang":"PEMELIHARAAN","subBidang":"MEKANIK","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"deni.junaidi43790@plnipservices.co.id","emailPersonal":"denijunaidi00@gmail.com","phone":"089619911856"},
  {"nip":"2395504008K","nama":"Martinus Bayu C","jenjangJabatan":"Teknisi Kontrol dan Instrumen Unit dan BOP","bidang":"PEMELIHARAAN","subBidang":"IC","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"martinus.bayu50400@plnipservices.co.id","emailPersonal":"martinusbaychris@gmail.com","phone":"087788642691"},
  {"nip":"178425900B","nama":"Nanang Suendi","jenjangJabatan":"Teknisi Listrik Unit dan BOP","bidang":"PEMELIHARAAN","subBidang":"LISTRIK","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"nanang.suendi@plnipservices.co.id","emailPersonal":"nanang.suendi@gmail.com","phone":"081906470112"},
  {"nip":"2490660910K","nama":"Pambudi","jenjangJabatan":"Teknisi Mesin","bidang":"PEMELIHARAAN","subBidang":"MEKANIK","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"pambudi@plnipservices.co.id","emailPersonal":"pambudibudenx@gmail.com","phone":"085730675081"},
  {"nip":"2400618208","nama":"Rio Setiawan","jenjangJabatan":"Teknisi Mesin BOP, Bengkel dan Tools","bidang":"PEMELIHARAAN","subBidang":"BOP","role":"PEGAWAI","tipeKerja":"SHIFT","emailPerusahaan":"rio.setiawan@plnipservices.co.id","emailPersonal":"riosetiawan2108@gmail.com","phone":"087783281372"},
  {"nip":"177525910B","nama":"Saniman","jenjangJabatan":"Teknisi Listrik Unit dan BOP","bidang":"PEMELIHARAAN","subBidang":"LISTRIK","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"saniman@plnipservices.co.id","emailPersonal":"mansaniman9@gmail.com","phone":"085219511908"},
  {"nip":"177625920B","nama":"Slamet Sugianto","jenjangJabatan":"Teknisi Mesin BOP, Bengkel dan Tools","bidang":"PEMELIHARAAN","subBidang":"BOP","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"slamet.sugianto@plnipservices.co.id","emailPersonal":"slametmbahislam@gmail.com","phone":"087871189461"},
  {"nip":"177125930B","nama":"Supiin","jenjangJabatan":"Teknisi Mesin","bidang":"PEMELIHARAAN","subBidang":"MEKANIK","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"supiin@plnipservices.co.id","emailPersonal":"supiin76271@gmail.com","phone":"08787836625"},
  {"nip":"TL_LISTRIK","nama":"Gunawan","jenjangJabatan":"TL Listrik","bidang":"PEMELIHARAAN","subBidang":"LISTRIK","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"gunawan.li@plnindonesiapower.co.id"},
  {"nip":"TL_MEKANIK","nama":"Juan Oktapiansa","jenjangJabatan":"TL Mekanik","bidang":"PEMELIHARAAN","subBidang":"MEKANIK","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"oktaviansa@plnindonesiapower.co.id"},
  {"nip":"TL_BOP","nama":"Rizki Alif","jenjangJabatan":"TL BOP","bidang":"PEMELIHARAAN","subBidang":"BOP","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"rizky.alifutama@plnindonesiapower.co.id"},
  {"nip":"TL_IC","nama":"Yudi Nugraha","jenjangJabatan":"TL I&C","bidang":"PEMELIHARAAN","subBidang":"IC","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"yudi.nugraha@plnindonesiapower.co.id"},
  {"nip":"ASM_BOP","nama":"Asman BOP","jenjangJabatan":"Asman BOP","bidang":"PEMELIHARAAN","subBidang":"BOP","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"asman.bop@plnindonesiapower.co.id"},
  {"nip":"ASM_LISTRIK","nama":"Syahrial","jenjangJabatan":"Asman Listrik","bidang":"PEMELIHARAAN","subBidang":"LISTRIK","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"syahrial.huda@plnindonesiapower.co.id"},
  {"nip":"ASM_MEKANIK","nama":"Yunarko","jenjangJabatan":"Asman Mekanik","bidang":"PEMELIHARAAN","subBidang":"MEKANIK","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"yunarko@plnindonesiapower.co.id"},
  {"nip":"MGR_PML","nama":"Edward Meidriansyah","jenjangJabatan":"Manager Pemeliharaan","bidang":"PEMELIHARAAN","subBidang":"LISTRIK","role":"MANAGER","tipeKerja":"NON_SHIFT","emailPerusahaan":"edward.m@plnindonesiapower.co.id"},
  {"nip":"199236582B","nama":"Chilvia Jenita","jenjangJabatan":"Pelaksana KM, SMT dan Inovasi","bidang":"ENGINEERING","subBidang":"ADMIN_SEKRETARIS","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"chilvia.jenita@plnipservices.co.id","emailPersonal":"chilviajeniita1427@gmail.com","phone":"082300057676"},
  {"nip":"178625850B","nama":"Rahmat Hidayat","jenjangJabatan":"Predictive Maintenance","bidang":"ENGINEERING","subBidang":"PDM","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"rahmat.hidayat@plnipservices.co.id","emailPersonal":"rahmat.tegalwangi@gmail.com","phone":"08771297106"},
  {"nip":"PEG_ADMSEK","nama":"Sekretaris Engineering","jenjangJabatan":"Staf Admin/Sekretaris","bidang":"ENGINEERING","subBidang":"ADMIN_SEKRETARIS","role":"PEGAWAI","tipeKerja":"NON_SHIFT","emailPerusahaan":"sekretaris.engineering@plnindonesiapower.co.id"},
  {"nip":"OFF_KINERJA","nama":"Eulis Rosmayanti","jenjangJabatan":"Officer Kinerja","bidang":"ENGINEERING","subBidang":"ADMIN_SEKRETARIS","role":"OFFICER","tipeKerja":"NON_SHIFT","emailPerusahaan":"eulis.rosmayanti@plnindonesiapower.co.id"},
  {"nip":"TL_PDM","nama":"Insan Taufik","jenjangJabatan":"TL PDM","bidang":"ENGINEERING","subBidang":"PDM","role":"TL","tipeKerja":"NON_SHIFT","emailPerusahaan":"insan.taufik@plnindonesiapower.co.id"},
  {"nip":"ASM_PDM","nama":"Sayuti","jenjangJabatan":"Asman PDM","bidang":"ENGINEERING","subBidang":"PDM","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"sayutiwn@plnindonesiapower.co.id"},
  {"nip":"ASM_EKSIS","nama":"Yondha Dwika Aferiandi","jenjangJabatan":"Asman EKSIS","bidang":"ENGINEERING","subBidang":"ADMIN_SEKRETARIS","role":"ASMAN","tipeKerja":"NON_SHIFT","emailPerusahaan":"yondha.dwika@plnindonesiapower.co.id"},
  {"nip":"MGR_ENG","nama":"Ana Mustakim","jenjangJabatan":"Manager Engineering","bidang":"ENGINEERING","subBidang":"PDM","role":"MANAGER","tipeKerja":"NON_SHIFT","emailPerusahaan":"ana.mustakim@plnindonesiapower.co.id"},
];

async function main() {
  console.log("🌱 Seeding database dari data yang di-dump...");
  const SALT_ROUNDS = 10;

  for (const u of USERS) {
    const hashedPassword = await bcrypt.hash(u.nip, SALT_ROUNDS);
    await prisma.user.upsert({
      where: { nip: u.nip },
      update: {
        nama:            u.nama,
        jenjangJabatan:  u.jenjangJabatan,
        bidang:          u.bidang as any,
        subBidang:       u.subBidang as any,
        role:            u.role as any,
        tipeKerja:       u.tipeKerja as any,
        emailPerusahaan: u.emailPerusahaan,
        emailPersonal:   (u as any).emailPersonal ?? null,
        phone:           (u as any).phone ?? null,
        tlGroup:         (u as any).tlGroup ?? null,
      },
      create: {
        nip:             u.nip,
        nama:            u.nama,
        jenjangJabatan:  u.jenjangJabatan,
        bidang:          u.bidang as any,
        subBidang:       u.subBidang as any,
        role:            u.role as any,
        tipeKerja:       u.tipeKerja as any,
        emailPerusahaan: u.emailPerusahaan,
        emailPersonal:   (u as any).emailPersonal ?? null,
        phone:           (u as any).phone ?? null,
        tlGroup:         (u as any).tlGroup ?? null,
        password:        hashedPassword,
      },
    });
    console.log(`  ✓ ${u.nama} [${u.role}] [${u.bidang}]`);
  }

  console.log(`\n✅ Selesai: ${USERS.length} user di-upsert.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
