"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertCircle, Plus, ChevronRight, Timer, Building2 } from "lucide-react";

const LS_LEMBUR_KEY = "alur_lembur_draft";

interface Approval {
  step: number;
  roleName: string;
  status: string;
}

interface Lembur {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  nomorSpkl?: string;
  kategori?: string;
  submittedAt: string;
  approvals: Approval[];
}

const statusConfig: Record<string, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Menunggu Approval",  color: "bg-secondary-container text-on-secondary-container", dot: "bg-amber-500",  icon: <Clock size={13} /> },
  APPROVED: { label: "Disetujui",          color: "bg-primary-container text-on-primary",               dot: "bg-emerald-500", icon: <CheckCircle size={13} /> },
  REJECTED: { label: "Ditolak",            color: "bg-error-container text-on-error-container",         dot: "bg-red-500",     icon: <XCircle size={13} /> },
  REVISED:  { label: "Perlu Revisi",       color: "bg-tertiary-container text-on-tertiary",             dot: "bg-orange-400",  icon: <AlertCircle size={13} /> },
  DRAFT:    { label: "Draft",              color: "bg-surface-variant text-on-surface",                 dot: "bg-slate-400",   icon: <Clock size={13} /> },
};

function ApprovalProgressCard({ lembur }: { lembur: Lembur }) {
  const cfg = statusConfig[lembur.status] ?? statusConfig.DRAFT;
  const progressPct = lembur.totalSteps > 0
    ? Math.round((lembur.currentStep - 1) / lembur.totalSteps * 100)
    : 0;

  const currentApproval = lembur.approvals.find(a => a.step === lembur.currentStep);
  const lastApproved = [...lembur.approvals]
    .filter(a => a.status === "APPROVED")
    .sort((a, b) => b.step - a.step)[0];

  const tanggal = new Date(lembur.tanggalMulai).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Link href={`/lembur/${lembur.id}`} className="group block">
      <div className="bg-surface-container-lowest border-2 border-on-background rounded-2xl p-4 hard-shadow group-hover:translate-y-[-2px] transition-transform duration-200">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              {lembur.kategori && (
                <span className={`font-label-bold text-xs px-2 py-0.5 rounded-full border border-on-background/30 ${
                  lembur.kategori === "PIKET"
                    ? "bg-secondary/20 text-on-secondary"
                    : "bg-primary-container/60 text-on-primary"
                }`}>
                  {lembur.kategori === "PIKET" ? <><Building2 size={11} /> Piket</> : <><Timer size={11} /> Lembur</>}
                </span>
              )}
              <p className="font-body-md text-sm text-on-surface-variant">{tanggal}</p>
            </div>
            <p className="font-bold text-base text-on-background">
              {lembur.deskripsi.replace(/^DASAR:\s*/i, "").split("\n")[0]}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`flex items-center gap-1 font-label-bold text-xs px-3 py-1 rounded-full border border-on-background/30 ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            <ChevronRight size={16} className="text-on-surface-variant" />
          </div>
        </div>

        {/* Progress bar */}
        {lembur.status === "PENDING" && (
          <>
            <div className="flex justify-between items-center mb-1">
              <p className="font-label-bold text-sm text-on-surface-variant uppercase">Progress Approval</p>
              <p className="font-label-bold text-sm text-on-surface-variant">
                {lembur.currentStep - 1} / {lembur.totalSteps} step selesai
              </p>
            </div>

            {/* Bar */}
            <div className="w-full h-3 bg-surface-variant rounded-full border border-on-background/20 overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Step list — circles always centered, lines absolute */}
            <div className="flex items-start w-full mb-3">
              {lembur.approvals.map((a, idx) => {
                const isCurrent = a.step === lembur.currentStep;
                const isDone = a.status === "APPROVED";
                const isRejected = a.status === "REJECTED";
                const isFirst = idx === 0;
                const isLast = idx === lembur.approvals.length - 1;
                const prevDone = idx > 0 && lembur.approvals[idx - 1].status === "APPROVED";
                return (
                  <div key={a.step} className="flex flex-col items-center flex-1 relative">
                    {/* Left connector (except first) — dari center kiri ke center step ini */}
                    {!isFirst && (
                      <div className={`absolute top-4 right-1/2 left-0 h-0.5 -translate-y-1/2 ${prevDone ? "bg-primary" : "bg-on-background/20"}`} />
                    )}
                    {/* Right connector (except last) — dari center step ini ke center kanan */}
                    {!isLast && (
                      <div className={`absolute top-4 left-1/2 right-0 h-0.5 -translate-y-1/2 ${isDone ? "bg-primary" : "bg-on-background/20"}`} />
                    )}
                    {/* Circle — selalu di tengah flex-1 */}
                    <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all
                      ${isDone
                        ? "bg-primary border-primary text-on-primary"
                        : isRejected
                        ? "bg-error border-error text-white"
                        : isCurrent
                        ? "bg-amber-400 border-amber-500 text-white animate-pulse"
                        : "bg-surface-variant border-on-background/30 text-on-surface-variant"}`}
                    >
                      {isDone ? "✓" : isRejected ? "✗" : a.step}
                    </div>
                    {/* Label — full text, wrap */}
                    <p className={`text-xs mt-1.5 text-center leading-tight px-1 font-medium
                      ${isCurrent ? "text-amber-700 font-bold" : isDone ? "text-primary font-semibold" : "text-on-surface-variant"}`}
                    >
                      {a.roleName}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Keterangan step saat ini */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                Menunggu persetujuan{" "}
                <span className="font-bold">{currentApproval?.roleName ?? "—"}</span>
              </p>
            </div>
          </>
        )}

        {lembur.status === "APPROVED" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">Semua tahap approval telah selesai</p>
          </div>
        )}

        {lembur.status === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <XCircle size={14} className="text-red-600 shrink-0" />
            <p className="text-xs text-red-800 font-medium">
              Ditolak pada step{" "}
              <span className="font-bold">{currentApproval?.roleName ?? lastApproved?.roleName ?? "—"}</span>
            </p>
          </div>
        )}

        {lembur.status === "REVISED" && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertCircle size={14} className="text-orange-600 shrink-0" />
            <p className="text-xs text-orange-800 font-medium">Perlu revisi dari <span className="font-bold">{currentApproval?.roleName ?? "—"}</span></p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lemburs, setLemburs] = useState<Lembur[]>([]);
  const [loadingLembur, setLoadingLembur] = useState(true);
  const [activeClock, setActiveClock] = useState<{ clockIn: string; clockOut?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LEMBUR_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.clockIn) {
          setActiveClock({ clockIn: saved.clockIn, clockOut: saved.clockOut ?? undefined });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/lembur")
        .then(r => r.json())
        .then(data => {
          const sorted = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
            const priority = (s: string) => (s === "PENDING" || s === "REVISED") ? 0 : 1;
            return priority(a.status) - priority(b.status) || new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
          });
          setLemburs(sorted.slice(0, 5));
        })
        .catch(() => {})
        .finally(() => setLoadingLembur(false));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <main className="w-full flex items-center justify-center min-h-screen">
        <div className="font-label-bold text-label-bold uppercase animate-pulse">Memuat...</div>
      </main>
    );
  }

  if (!session) { router.push("/"); return null; }

  const user = session.user;
  const isApprover = ["OFFICER", "TL", "ASMAN", "MANAGER", "BRANCH_MANAGER", "ADMIN"].includes(user.role);
  const activeLemburs = lemburs.filter(l => l.status === "PENDING" || l.status === "REVISED");

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-start justify-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">

      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <p className="font-label-bold text-label-bold text-primary uppercase mb-1">Selamat datang,</p>
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-background uppercase tracking-tight">
            {user.name}
          </h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-error-container text-on-error-container font-label-bold text-label-bold rounded-full px-5 py-2 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all text-sm"
        >
          LOGOUT
        </button>
      </div>

      {/* Active Clock-In Banner */}
      {user.role === "PEGAWAI" && activeClock && (
        <Link href="/lembur/ajukan" className="block w-full mb-4">
          <div className="w-full bg-amber-400 border-2 border-on-background rounded-2xl px-5 py-4 hard-shadow flex items-center gap-3 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-on-background flex items-center justify-center shrink-0">
              <Timer size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-background text-sm">⏱ Lembur Sedang Berjalan!</p>
              <p className="text-xs text-amber-900">
                Clock In: {new Date(activeClock.clockIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                {activeClock.clockOut
                  ? ` — Clock Out: ${new Date(activeClock.clockOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                  : " — Ketuk untuk melanjutkan pengajuan"}
              </p>
            </div>
            <span className="font-label-bold text-xs uppercase text-amber-900 bg-white/60 px-3 py-1 rounded-full border border-amber-600 shrink-0">Lanjutkan →</span>
          </div>
        </Link>
      )}

      {/* User Info Card */}
      <div className="w-full bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] p-5 md:p-6 hard-shadow mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-tertiary-container text-on-tertiary border-2 border-on-background font-label-bold px-3 py-0.5 rounded-full text-xs uppercase">
            {user.bidang?.replace("_", " & ")}
          </span>
          <span className="bg-surface-variant text-on-surface border-2 border-on-background font-label-bold px-3 py-0.5 rounded-full text-xs uppercase">
            {user.role}
          </span>
        </div>
        <p className="font-body-md text-on-surface-variant">
          <span className="font-bold">NIP:</span> {user.nip} &nbsp;|&nbsp;
          <span className="font-bold">Jabatan:</span> {user.jenjangJabatan} &nbsp;|&nbsp;
          <span className="font-bold">Sub-Bidang:</span> {user.subBidang?.replace(/_/g, " ")}
        </p>
      </div>


      {/* ── Action Cards Grid ── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

        {/* Ajukan Lembur (PEGAWAI) */}
        {user.role === "PEGAWAI" && (
          <div className="bg-primary-container border-2 border-on-background rounded-[1.5rem] p-6 hard-shadow flex flex-col gap-4">
            <h2 className="font-headline-md text-xl sm:text-headline-md text-on-background uppercase">Absensi Lembur</h2>
            <p className="font-body-md text-on-surface-variant text-sm">Mulai pengajuan lembur baru untuk disetujui oleh atasan Anda.</p>
            <Link
              href="/lembur/ajukan"
              className="flex items-center justify-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold rounded-full px-6 py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all mt-auto"
            >
              <Plus size={18} /> AJUKAN LEMBUR BARU
            </Link>
          </div>
        )}

        {/* Antrian Approval (approver) */}
        {isApprover && (
          <div className="bg-secondary-container border-2 border-on-background rounded-[1.5rem] p-6 hard-shadow flex flex-col gap-4">
            <h2 className="font-headline-md text-xl sm:text-headline-md text-on-secondary-container uppercase">Antrian Approval</h2>
            <p className="font-body-md text-on-secondary-container text-sm">Terdapat pengajuan lembur yang menunggu persetujuan Anda.</p>
            <Link
              href="/approval"
              className="flex items-center justify-center gap-2 bg-on-secondary-container text-secondary-container font-label-bold text-label-bold rounded-full px-6 py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all mt-auto"
            >
              LIHAT ANTRIAN APPROVAL
            </Link>
          </div>
        )}

        {/* History Lembur */}
        <div className="bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] p-6 hard-shadow flex flex-col gap-4">
          <h2 className="font-headline-md text-xl sm:text-headline-md text-on-background uppercase">History Lembur</h2>
          <p className="font-body-md text-on-surface-variant text-sm">Lihat riwayat semua pengajuan lembur Anda beserta statusnya.</p>
          <Link
            href="/history"
            className="flex items-center justify-center gap-2 bg-surface-variant text-on-surface font-label-bold text-label-bold rounded-full px-6 py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all mt-auto"
          >
            LIHAT HISTORY
          </Link>
        </div>

        {/* Admin Rekap */}
        {user.role === "ADMIN" && (
          <div className="bg-tertiary-container border-2 border-on-background rounded-[1.5rem] p-6 hard-shadow flex flex-col gap-4">
            <h2 className="font-headline-md text-xl sm:text-headline-md text-on-tertiary uppercase">Rekap Admin</h2>
            <p className="font-body-md text-on-tertiary text-sm">Kelola dan rekap semua data lembur yang telah disetujui.</p>
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 bg-on-tertiary text-tertiary-container font-label-bold text-label-bold rounded-full px-6 py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all mt-auto"
            >
              BUKA REKAP ADMIN
            </Link>
          </div>
        )}
      </div>

      {/* ── Approval Progress Section (PEGAWAI only) ── */}
      {user.role === "PEGAWAI" && (
        <div className="w-full mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-label-bold text-xs uppercase text-on-surface-variant">
              Status Pengajuan Lembur Aktif
            </h2>
            <Link href="/history" className="font-label-bold text-xs text-primary underline">
              Lihat semua →
            </Link>
          </div>

          {loadingLembur ? (
            <div className="bg-surface-container-lowest border-2 border-on-background rounded-2xl p-6 hard-shadow flex items-center justify-center">
              <p className="font-label-bold text-xs uppercase animate-pulse text-on-surface-variant">Memuat data...</p>
            </div>
          ) : activeLemburs.length === 0 ? (
            <div className="bg-surface-container-lowest border-2 border-on-background border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 text-center">
              <Clock size={24} className="text-on-surface-variant" />
              <p className="font-body-md text-on-surface-variant text-sm">Belum ada pengajuan lembur yang sedang berjalan.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeLemburs.map(l => (
                <ApprovalProgressCard key={l.id} lembur={l} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
