"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, Shield, ShieldCheck, FileText, Stamp } from "lucide-react";

interface ApprovalStep {
  step: number;
  roleName: string;
  status: string;
  respondedAt: string | null;
  approver: { nama: string; jenjangJabatan: string; role: string };
}

interface LemburData {
  id: string;
  nomorSpkl: string | null;
  status: string;
  kategori: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  penugas: string | null;
  submittedAt: string;
  user: {
    nama: string; nip: string; jenjangJabatan: string;
    bidang: string; subBidang: string; tlGroup: string | null;
  };
  approvals: ApprovalStep[];
}

const BIDANG_LABEL: Record<string, string> = {
  OPERASI: "Operasi", PEMELIHARAAN: "Pemeliharaan",
  SDM_KEU: "SDM & Keuangan", ENGINEERING: "Engineering",
};
const SUB_LABEL: Record<string, string> = {
  OPERATOR_SHIFT: "Operator BOP (Shift)", OPERATOR_NIAGA: "Niaga",
  K3: "K3", LINGKUNGAN: "Lingkungan", KEPMO: "Kepmo",
  SDM: "SDM", UMUM: "Umum", KEUANGAN: "Keuangan", PBJ: "PBJ",
  LISTRIK: "Listrik", IC: "I&C", MEKANIK: "Mekanik", BOP: "BOP",
  PDM: "PDM", ADMIN_SEKRETARIS: "Admin/Sekretaris",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ValidatePage() {
  const { lemburId } = useParams<{ lemburId: string }>();
  const [data, setData] = useState<LemburData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/validate/${lemburId}`)
      .then(r => r.ok ? r.json() : r.json().then((e: { error: string }) => Promise.reject(e.error)))
      .then(setData)
      .catch(e => setError(typeof e === "string" ? e : "Dokumen tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [lemburId]);

  if (loading) return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-gray-500">
        <div className="w-8 h-8 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm uppercase tracking-widest font-semibold">Memverifikasi Dokumen...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border-t-4 border-red-600 shadow-xl p-8 text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2 uppercase tracking-wide">Dokumen Tidak Valid</h1>
        <p className="text-gray-600 mb-6">{error || "Dokumen tidak ditemukan di dalam sistem ALUR PLN IP Services."}</p>
        <p className="text-xs text-gray-400">Harap pastikan kode QR yang Anda pindai berasal dari dokumen resmi.</p>
      </div>
    </div>
  );

  const isApproved = data.status === "APPROVED";
  const isRejected = data.status === "REJECTED";
  const isPending = data.status === "PENDING" || data.status === "REVISED";
  const isShift = data.user.subBidang === "OPERATOR_SHIFT";

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-8 px-4 flex justify-center font-sans">
      <div className="bg-white max-w-2xl w-full shadow-2xl relative overflow-hidden">
        {/* Top Header / Kop Resmi */}
        <div className="border-b-4 border-double border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
          <Image src="/image/Logo-PLN-Indonesiapower-Services.png" alt="PLN IP" width={160} height={45} className="object-contain w-auto h-auto" />
          <div className="text-center md:text-right">
            <h1 className="text-lg font-bold text-gray-900 uppercase tracking-widest">PT PLN Indonesia Power Services</h1>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">Head Office — Jl. Raya Pasar Minggu No.190, Jakarta Selatan</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Telp: (6221) 2178 9990 | info@plnipservices.co.id</p>
          </div>
        </div>

        {/* Status Section */}
        <div className="px-6 py-8 flex flex-col items-center text-center border-b border-gray-200 bg-gray-50/50">
          {isApproved && <ShieldCheck className="w-16 h-16 text-emerald-600 mb-3" />}
          {isRejected && <XCircle className="w-16 h-16 text-red-600 mb-3" />}
          {isPending && <Clock className="w-16 h-16 text-amber-600 mb-3" />}

          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Status Validasi Dokumen</h2>
          <h3 className={`text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wide ${isApproved ? 'text-emerald-700' : isRejected ? 'text-red-700' : 'text-amber-700'}`}>
            {isApproved ? "TERVALIDASI & SAH" : isRejected ? "DITOLAK" : "DALAM PROSES"}
          </h3>
          
          {data.nomorSpkl && (
            <div className="mt-5 bg-white px-5 py-2 border border-gray-300 shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Nomor Referensi</p>
              <p className="text-sm font-mono font-bold text-gray-900">{data.nomorSpkl}</p>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-8 bg-white">
          {/* Data Pegawai & Pekerjaan */}
          <div>
            <div className="flex items-center gap-2 border-b-2 border-gray-800 pb-2 mb-4">
              <FileText className="w-4 h-4 text-gray-800" />
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Informasi Dokumen</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="space-y-2">
                <DataRow label="Nama" value={data.user.nama} />
                <DataRow label="NIP" value={data.user.nip} font="font-mono" />
                <DataRow label="Jabatan" value={data.user.jenjangJabatan} />
                <DataRow label="Bidang" value={`${BIDANG_LABEL[data.user.bidang] ?? data.user.bidang} / ${SUB_LABEL[data.user.subBidang] ?? data.user.subBidang}`} />
              </div>
              <div className="space-y-2">
                <DataRow label="Kategori" value={data.kategori === "LEMBUR" ? "Kerja Lembur" : "Piket"} />
                <DataRow label="Jenis Kerja" value={isShift ? `SHIFT${data.user.tlGroup ? ` — Grup ${data.user.tlGroup}` : ""}` : "NON-SHIFT"} />
                <DataRow label="Waktu Mulai" value={fmtDate(data.tanggalMulai)} />
                <DataRow label="Waktu Selesai" value={fmtDate(data.tanggalSelesai)} />
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deskripsi Pekerjaan:</p>
              <p className="text-sm text-gray-800 leading-relaxed text-justify">{data.deskripsi}</p>
            </div>
          </div>

          {/* Rantai Persetujuan */}
          <div>
            <div className="flex items-center gap-2 border-b-2 border-gray-800 pb-2 mb-4">
              <Stamp className="w-4 h-4 text-gray-800" />
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Log Persetujuan Digital</h4>
            </div>
            
            <div className="overflow-x-auto w-full border border-gray-300">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-2 font-bold text-gray-700 text-xs uppercase tracking-wider w-1/3">Pejabat Pengesah</th>
                    <th className="px-4 py-2 font-bold text-gray-700 text-xs uppercase tracking-wider">Status Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.approvals.map((a, i) => {
                    const isAppr = a.status === "APPROVED";
                    const isRej = a.status === "REJECTED";
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-gray-900">{a.approver?.nama ?? "—"}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{a.roleName}</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border ${
                              isAppr ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              isRej ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {isAppr ? 'Disetujui' : isRej ? 'Ditolak' : 'Menunggu'}
                            </span>
                          </div>
                          {a.respondedAt && (
                            <div className="text-xs text-gray-500 mt-1">Pada: {fmtDate(a.respondedAt)}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-gray-900 text-gray-400 p-6 sm:p-8 text-center text-xs leading-relaxed">
          <p className="mb-2 uppercase tracking-widest text-gray-300 font-bold">Dokumen Elektronik Sah</p>
          <p className="max-w-md mx-auto">
            Halaman ini adalah bukti validasi resmi dari Sistem ALUR PT PLN Indonesia Power Services. Pemalsuan dokumen elektronik dapat dikenakan sanksi sesuai dengan peraturan yang berlaku.
          </p>
          <p className="mt-4 font-mono text-[10px] text-gray-500">ID: {data.id}</p>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value, font = "font-sans" }: { label: string; value: string; font?: string }) {
  return (
    <div className="flex items-start">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-28 shrink-0 mt-0.5">{label}</span>
      <span className="text-xs font-bold text-gray-500 w-4 shrink-0 mt-0.5">:</span>
      <span className={`text-sm text-gray-900 font-medium ${font} flex-1`}>{value}</span>
    </div>
  );
}
