"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertCircle, Plus, Timer, Building2 } from "lucide-react";

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
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Menunggu Approval", color: "bg-secondary-container text-on-secondary-container", icon: <Clock size={14} /> },
  APPROVED: { label: "Disetujui", color: "bg-primary-container text-on-primary", icon: <CheckCircle size={14} /> },
  REJECTED: { label: "Ditolak", color: "bg-error-container text-on-error-container", icon: <XCircle size={14} /> },
  REVISED: { label: "Perlu Revisi", color: "bg-tertiary-container text-on-tertiary", icon: <AlertCircle size={14} /> },
  DRAFT: { label: "Draft", color: "bg-surface-variant text-on-surface", icon: <Clock size={14} /> },
};

export default function HistoryLembur() {
  const { data: session } = useSession();
  const [lemburs, setLemburs] = useState<Lembur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lembur")
      .then((r) => r.json())
      .then((data) => { setLemburs(data); setLoading(false); });
  }, []);

  if (!session) return null;

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-start justify-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-background uppercase tracking-tight">
          HISTORY LEMBUR
        </h1>
        {session.user.role === "PEGAWAI" && (
          <Link
            href="/lembur/ajukan"
            className="flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold rounded-full px-5 py-2 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all text-sm"
          >
            <Plus size={16} /> AJUKAN LEMBUR
          </Link>
        )}
      </div>

      {loading ? (
        <div className="w-full flex items-center justify-center py-24">
          <p className="font-label-bold uppercase animate-pulse">Memuat data...</p>
        </div>
      ) : lemburs.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
          <p className="font-body-lg text-on-surface-variant text-center">Belum ada pengajuan lembur.</p>
          {session.user.role === "PEGAWAI" && (
            <Link href="/lembur/ajukan" className="flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold rounded-full px-5 py-3 border-2 border-on-background hard-shadow transition-all">
              <Plus size={16} /> Ajukan Lembur Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {lemburs.map((lembur) => {
            const cfg = statusConfig[lembur.status] ?? statusConfig.DRAFT;
            return (
              <Link
                key={lembur.id}
                href={`/lembur/${lembur.id}`}
                className="w-full bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] p-5 hard-shadow hard-shadow-hover transition-all flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {lembur.kategori && (
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-label-bold text-xs px-2.5 py-0.5 rounded-full border border-on-background/30 ${
                        lembur.kategori === "PIKET"
                          ? "bg-amber-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}>
                        {lembur.kategori === "PIKET" ? <><Building2 size={11} /> Piket</> : <><Timer size={11} /> Lembur</>}
                      </span>
                    )}
                    <p className="font-body-md font-bold line-clamp-1">
                      {lembur.deskripsi.match(/DASAR:\s*([\s\S]*?)(?:\n\n|$)/i)?.[1]?.trim() ?? lembur.deskripsi.split("\n")[0]}
                    </p>
                  </div>
                  {lembur.deskripsi.match(/URAIAN:\s*([\s\S]*?)$/i)?.[1]?.trim() && (
                    <p className="text-xs text-on-surface-variant mb-1 line-clamp-1">
                      {lembur.deskripsi.match(/URAIAN:\s*([\s\S]*?)$/i)?.[1]?.trim()}
                    </p>
                  )}
                  <p className="text-xs text-on-surface-variant">
                    {new Date(lembur.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    {" → "}
                    {new Date(lembur.tanggalSelesai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {lembur.nomorSpkl && (
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{lembur.nomorSpkl}</p>
                  )}
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                  <span className={`flex items-center gap-1.5 font-label-bold text-xs px-3 py-1 rounded-full border-2 border-on-background ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {lembur.status === "PENDING" && (
                    <span className="text-xs text-on-surface-variant">Tahap {lembur.currentStep} / {lembur.totalSteps}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
