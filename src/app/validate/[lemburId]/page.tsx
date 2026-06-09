"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle, XCircle, Clock, Shield, QrCode,
  User, Calendar, FileText, Building2, AlertCircle
} from "lucide-react";

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

const STATUS_CONFIG = {
  APPROVED: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle, label: "DISETUJUI" },
  REJECTED: { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle, label: "DITOLAK" },
  PENDING:  { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock, label: "MENUNGGU" },
  REVISED:  { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: AlertCircle, label: "REVISI" },
} as const;

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Memverifikasi dokumen...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-800 mb-2">Dokumen Tidak Valid</h1>
        <p className="text-slate-500 text-sm">{error || "Dokumen tidak ditemukan atau link tidak valid."}</p>
      </div>
    </div>
  );

  const statusCfg = STATUS_CONFIG[data.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;
  const isShift = data.user.subBidang === "OPERATOR_SHIFT";
  const approvedApprovals = data.approvals.filter(a => a.status === "APPROVED");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Image src="/image/Logo-PLN-Indonesiapower-Services.png" alt="PLN IP" width={120} height={32} className="object-contain h-8 w-auto" />
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <p className="text-xs text-slate-500 leading-none">Sistem ALUR</p>
            <p className="text-sm font-semibold text-slate-800 leading-tight">Verifikasi Dokumen</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <QrCode className="w-4 h-4" />
            <span>Hasil Scan QR</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Status Banner */}
        <div className={`rounded-2xl border-2 p-5 flex items-center gap-4 ${statusCfg.bg}`}>
          <div className={`p-3 rounded-full bg-white shadow-sm ${statusCfg.color}`}>
            <StatusIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Status Dokumen</p>
            <p className={`text-2xl font-black ${statusCfg.color}`}>{statusCfg.label}</p>
            {data.status === "APPROVED" && (
              <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Dokumen ini telah diverifikasi dan disetujui secara digital
              </p>
            )}
          </div>
          {data.nomorSpkl && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Nomor SPKL</p>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5 max-w-40 text-right">{data.nomorSpkl}</p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Data Pegawai */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-lg"><User className="w-4 h-4 text-blue-600" /></div>
              <h2 className="text-sm font-bold text-slate-800">Data Pegawai</h2>
            </div>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Nama" value={data.user.nama} />
              <InfoRow label="NIP" value={data.user.nip} mono />
              <InfoRow label="Jabatan" value={data.user.jenjangJabatan} />
              <InfoRow label="Bidang" value={BIDANG_LABEL[data.user.bidang] ?? data.user.bidang} />
              <InfoRow label="Sub-Bidang" value={SUB_LABEL[data.user.subBidang] ?? data.user.subBidang} />
              <InfoRow label="Jenis Kerja"
                value={isShift ? `SHIFT${data.user.tlGroup ? ` — Grup ${data.user.tlGroup}` : ""}` : "NON-SHIFT"} />
            </div>
          </div>

          {/* Detail Lembur */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-50 rounded-lg"><Calendar className="w-4 h-4 text-amber-600" /></div>
              <h2 className="text-sm font-bold text-slate-800">Detail Pekerjaan</h2>
            </div>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Jenis"
                value={data.kategori === "LEMBUR" ? "Kerja Lembur" : "Piket"}
                badge={data.kategori === "LEMBUR" ? "amber" : "blue"} />
              <InfoRow label="Mulai" value={fmtDate(data.tanggalMulai)} />
              <InfoRow label="Selesai" value={fmtDate(data.tanggalSelesai)} />
              {data.penugas && <InfoRow label="Penugas" value={data.penugas} />}
              <InfoRow label="Diajukan" value={fmtDate(data.submittedAt)} />
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-slate-50 rounded-lg"><FileText className="w-4 h-4 text-slate-600" /></div>
            <h2 className="text-sm font-bold text-slate-800">Deskripsi Pekerjaan</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{data.deskripsi}</p>
        </div>

        {/* Approval Chain */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-50 rounded-lg"><Building2 className="w-4 h-4 text-emerald-600" /></div>
            <h2 className="text-sm font-bold text-slate-800">Rantai Persetujuan</h2>
            <span className="ml-auto text-xs text-slate-400">
              {approvedApprovals.length}/{data.approvals.length} disetujui
            </span>
          </div>

          <div className="space-y-2">
            {data.approvals.map((a, idx) => {
              const cfg = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
              const Icon = cfg.icon;
              return (
                <div key={idx} className={`flex items-start gap-3 rounded-xl p-3.5 border ${cfg.bg}`}>
                  <div className={`mt-0.5 shrink-0 ${cfg.color}`}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Step {a.step}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        a.status === "APPROVED" ? "bg-emerald-100 text-emerald-700"
                        : a.status === "REJECTED" ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{a.roleName}</p>
                    <p className="text-xs text-slate-500">{a.approver?.nama ?? "—"}</p>
                    {a.respondedAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        {a.status === "APPROVED" ? "✓ Disetujui" : "✗ Diproses"} pada {fmtDate(a.respondedAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-6 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Dokumen ini diverifikasi melalui Sistem ALUR — PT PLN Indonesia Power Services UBP Cilegon
          </p>
          <p>ID Dokumen: <span className="font-mono">{data.id}</span></p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, badge }: {
  label: string; value: string; mono?: boolean; badge?: "amber" | "blue";
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 text-xs w-20 shrink-0 pt-0.5">{label}</span>
      {badge ? (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          badge === "amber" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
          {value}
        </span>
      ) : (
        <span className={`text-slate-800 font-medium break-words ${mono ? "font-mono text-xs" : "text-sm"}`}>
          {value}
        </span>
      )}
    </div>
  );
}
