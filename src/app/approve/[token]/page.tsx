"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Clock, User, FileText, ChevronRight } from "lucide-react";

interface ApprovalInfo {
  id: string;
  step: number;
  roleName: string;
  approverName: string;
}

interface LemburDetail {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  evidentUrl?: string;
  penugas?: string;
  submittedAt: string;
  user: {
    nama: string;
    nip: string;
    jenjangJabatan: string;
    bidang: string;
    subBidang: string;
  };
  approvals: {
    step: number;
    roleName: string;
    status: string;
    approver: { nama: string; role: string; jenjangJabatan: string };
  }[];
}

type ActionType = "APPROVED" | "REJECTED" | "REVISED";

const actionConfig: Record<ActionType, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  catatanRequired: boolean;
  catatanLabel: string;
  confirmLabel: string;
}> = {
  APPROVED: {
    label: "Menyetujui",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    icon: <CheckCircle size={20} className="text-emerald-600" />,
    catatanRequired: false,
    catatanLabel: "Catatan (opsional)",
    confirmLabel: "✅ KONFIRMASI SETUJUI",
  },
  REVISED: {
    label: "Meminta Revisi",
    color: "text-orange-800",
    bg: "bg-orange-50",
    border: "border-orange-300",
    icon: <AlertCircle size={20} className="text-orange-600" />,
    catatanRequired: true,
    catatanLabel: "Catatan Revisi (wajib diisi)",
    confirmLabel: "⚠ KONFIRMASI MINTA REVISI",
  },
  REJECTED: {
    label: "Menolak",
    color: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-300",
    icon: <XCircle size={20} className="text-red-600" />,
    catatanRequired: true,
    catatanLabel: "Alasan Penolakan (wajib diisi)",
    confirmLabel: "❌ KONFIRMASI TOLAK",
  },
};

export default function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const actionFromUrl = searchParams.get("action") as ActionType | null;

  const [data, setData] = useState<{ approval: ApprovalInfo; lembur: LemburDetail } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [action, setAction] = useState<ActionType>(actionFromUrl ?? "APPROVED");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ status: string } | null>(null);

  useEffect(() => {
    fetch(`/api/approve/${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) setError(d.error ?? "Terjadi kesalahan.");
        else setData(d);
      })
      .catch(() => setError("Gagal menghubungi server."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (actionFromUrl) setAction(actionFromUrl);
  }, [actionFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cfg = actionConfig[action];
    if (cfg.catatanRequired && !catatan.trim()) {
      alert(`${cfg.catatanLabel} harus diisi.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/approve/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, catatan: catatan.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error ?? "Gagal memproses.");
      else setDone({ status: d.status });
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
        <p className="font-bold uppercase animate-pulse text-[#006934]">Memuat...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-[#1b1c1c] rounded-2xl p-8 text-center" style={{ boxShadow: "6px 6px 0 #1b1c1c" }}>
          <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-[#1b1c1c] flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-xl font-bold mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600 text-sm">{error ?? "Link approval ini tidak dapat digunakan."}</p>
          <p className="text-xs text-gray-400 mt-4">Silakan hubungi pengaju lembur jika terjadi kesalahan.</p>
        </div>
      </main>
    );
  }

  if (done) {
    const doneMap: Record<string, { icon: React.ReactNode; title: string; msg: string; color: string }> = {
      APPROVED: {
        icon: <CheckCircle size={40} className="text-emerald-600" />,
        title: "Lembur Disetujui!",
        msg: "Keputusan Anda telah tercatat. Email notifikasi telah dikirim ke pegawai.",
        color: "bg-emerald-50 border-emerald-300",
      },
      REVISED: {
        icon: <AlertCircle size={40} className="text-orange-500" />,
        title: "Revisi Diminta",
        msg: "Catatan revisi telah dikirimkan ke pegawai melalui email.",
        color: "bg-orange-50 border-orange-300",
      },
      REJECTED: {
        icon: <XCircle size={40} className="text-red-600" />,
        title: "Lembur Ditolak",
        msg: "Keputusan penolakan telah tercatat. Pegawai akan diberitahu melalui email.",
        color: "bg-red-50 border-red-300",
      },
    };
    const d = doneMap[done.status] ?? doneMap.APPROVED;
    return (
      <main className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-[#1b1c1c] rounded-2xl p-8 text-center" style={{ boxShadow: "6px 6px 0 #1b1c1c" }}>
          <div className={`w-20 h-20 rounded-full ${d.color} border-2 flex items-center justify-center mx-auto mb-4`}>
            {d.icon}
          </div>
          <h1 className="text-2xl font-bold mb-2">{d.title}</h1>
          <p className="text-gray-600 text-sm">{d.msg}</p>
          <p className="text-xs text-gray-400 mt-6">Halaman ini bisa ditutup.</p>
        </div>
      </main>
    );
  }

  const { approval, lembur } = data;
  const cfg = actionConfig[action];

  const formatDt = (s: string) =>
    new Date(s).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" });

  const durMenit = Math.round(
    (new Date(lembur.tanggalSelesai).getTime() - new Date(lembur.tanggalMulai).getTime()) / 60000
  );

  return (
    <main className="min-h-screen bg-[#f5f5f0] py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-[#006934] border-2 border-[#1b1c1c] rounded-2xl p-6 mb-4 text-white" style={{ boxShadow: "6px 6px 0 #1b1c1c" }}>
          <p className="text-[#c8f5d8] text-xs uppercase font-bold tracking-widest mb-1">ALUR — PLN Indonesia Power UBP Cilegon</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Persetujuan Lembur</h1>
          <p className="text-[#c8f5d8] text-sm mt-1">Anda diminta sebagai <strong className="text-white">{approval.roleName}</strong></p>
        </div>

        {/* Info Pegawai */}
        <div className="bg-white border-2 border-[#1b1c1c] rounded-2xl p-5 mb-4" style={{ boxShadow: "4px 4px 0 #1b1c1c" }}>
          <p className="text-sm font-medium text-gray-700 mb-5">
            Assistant Manager/Manager(*) <span className="font-bold underline px-1">{lembur.penugas || "................................"}</span> menugaskan kerja lembur kepada:
          </p>

          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-[#006934]" />
            <span className="text-xs font-bold uppercase text-gray-500">Info Pengaju</span>
          </div>
          <p className="text-xl font-extrabold uppercase">{lembur.user.nama}</p>
          <p className="text-sm text-gray-500">{lembur.user.jenjangJabatan} — {lembur.user.subBidang.replace(/_/g, " ")}</p>
          <p className="text-sm text-gray-500">NIP: {lembur.user.nip}</p>

          <hr className="border-[#1b1c1c]/20 my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Jam Mulai</p>
              <p className="font-semibold">{formatDt(lembur.tanggalMulai)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Jam Selesai</p>
              <p className="font-semibold">{formatDt(lembur.tanggalSelesai)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Durasi</p>
              <p className="font-semibold">{durMenit} menit ({Math.floor(durMenit / 60)} jam {durMenit % 60} menit)</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Deskripsi Pekerjaan</p>
              <p className="whitespace-pre-wrap">{lembur.deskripsi}</p>
            </div>
            
            {lembur.evidentUrl && (
              <div className="sm:col-span-2 mt-2">
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Evident / Foto Pekerjaan</p>
                <div className="border-2 border-[#1b1c1c] rounded-xl overflow-hidden hard-shadow w-fit">
                  <img src={lembur.evidentUrl} alt="Bukti Pekerjaan" className="max-h-64 object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border-2 border-[#1b1c1c] rounded-2xl p-5 mb-4" style={{ boxShadow: "4px 4px 0 #1b1c1c" }}>
          <p className="text-xs font-bold uppercase text-gray-500 mb-3">Alur Persetujuan</p>
          <div className="flex flex-col gap-2">
            {lembur.approvals.map((a) => {
              const isCurrent = a.step === lembur.currentStep;
              const isDone = a.status === "APPROVED";
              return (
                <div key={a.step} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isCurrent ? "border-amber-400 bg-amber-50" : isDone ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50"
                }`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone ? "bg-[#006934] border-[#006934] text-white"
                    : isCurrent ? "bg-amber-400 border-amber-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                  }`}>
                    {isDone ? "✓" : a.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{a.roleName}</p>
                    <p className="text-xs text-gray-500">{a.approver?.nama}</p>
                  </div>
                  {isCurrent && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Giliran Anda</span>}
                  {isDone && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Selesai</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="bg-white border-2 border-[#1b1c1c] rounded-2xl p-5" style={{ boxShadow: "4px 4px 0 #1b1c1c" }}>
          <p className="text-xs font-bold uppercase text-gray-500 mb-3">Keputusan Anda</p>

          {/* Action selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(["APPROVED", "REVISED", "REJECTED"] as ActionType[]).map((a) => {
              const c = actionConfig[a];
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={`py-3 px-2 rounded-xl border-2 font-bold text-xs transition-all ${
                    action === a
                      ? `${c.bg} ${c.border} ${c.color} border-2`
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {c.icon}
                  <span className="block mt-1">{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected action info */}
          <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 mb-4 flex items-center gap-2`}>
            {cfg.icon}
            <p className={`text-sm font-semibold ${cfg.color}`}>
              Anda akan <strong>{cfg.label}</strong> pengajuan lembur ini.
            </p>
          </div>

          {/* Catatan */}
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">
              {cfg.catatanLabel}
              {cfg.catatanRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              required={cfg.catatanRequired}
              placeholder={cfg.catatanRequired ? "Wajib diisi..." : "Tambahkan catatan jika perlu..."}
              className="w-full border-2 border-[#1b1c1c] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006934] transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#006934] text-white font-bold rounded-full py-4 border-2 border-[#1b1c1c] transition-all disabled:opacity-50 text-sm tracking-wide"
            style={{ boxShadow: submitting ? "none" : "4px 4px 0 #1b1c1c" }}
          >
            {submitting ? "MEMPROSES..." : cfg.confirmLabel}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Tindakan ini bersifat final dan tidak dapat dibatalkan.
          </p>
        </form>
      </div>
    </main>
  );
}
