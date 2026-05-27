"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";

interface Approval {
  id: string;
  step: number;
  roleName: string;
  status: string;
  catatan?: string;
  respondedAt?: string;
  approver: { nama: string; role: string; jenjangJabatan: string };
}

interface Lembur {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  evidentUrl?: string;
  lokasiKerja?: string;
  penugas?: string;
  submittedAt: string;
  user: { nama: string; nip: string; jenjangJabatan: string; bidang: string; subBidang: string };
  approvals: Approval[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Menunggu Approval", color: "bg-secondary-container text-on-secondary-container", icon: <Clock size={14} /> },
  APPROVED: { label: "Disetujui", color: "bg-primary-container text-on-primary", icon: <CheckCircle size={14} /> },
  REJECTED: { label: "Ditolak", color: "bg-error-container text-on-error-container", icon: <XCircle size={14} /> },
  REVISED: { label: "Perlu Revisi", color: "bg-tertiary-container text-on-tertiary", icon: <AlertCircle size={14} /> },
  DRAFT: { label: "Draft", color: "bg-surface-variant text-on-surface", icon: <Clock size={14} /> },
};

export default function DetailLembur({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [lembur, setLembur] = useState<Lembur | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | "REVISED" | null>(null);

  const fetchLembur = async () => {
    const res = await fetch(`/api/lembur/${id}`);
    if (res.ok) setLembur(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchLembur(); }, [id]);

  const handleAction = async (action: "APPROVED" | "REJECTED" | "REVISED") => {
    setActionLoading(true);
    const res = await fetch(`/api/lembur/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, catatan }),
    });

    if (res.ok) {
      setCatatan("");
      setShowNotes(false);
      setActionType(null);
      await fetchLembur();
    }
    setActionLoading(false);
  };

  if (loading) return <main className="w-full flex items-center justify-center min-h-screen"><p className="animate-pulse font-label-bold uppercase">Memuat...</p></main>;
  if (!lembur) return <main className="w-full flex items-center justify-center min-h-screen"><p className="font-label-bold uppercase text-error">Data tidak ditemukan.</p></main>;

  const cfg = statusConfig[lembur.status] ?? statusConfig.DRAFT;
  const isCurrentApprover = session && lembur.approvals.some(
    (a) => a.step === lembur.currentStep && a.approver?.nama === session.user.name && a.status === "PENDING"
  );

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-center justify-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <Link href="/history" className="flex items-center gap-2 font-label-bold text-label-bold text-primary mb-2 hover:underline">
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-background uppercase tracking-tight">
              DETAIL LEMBUR
            </h1>
          </div>
          <span className={`flex items-center gap-2 font-label-bold text-sm px-4 py-2 rounded-full border-2 border-on-background ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Info Card */}
        <div className="bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] p-6 hard-shadow mb-6">
          <p className="text-sm font-medium text-on-surface mb-6">
            Assistant Manager/Manager(*) <span className="font-bold underline px-1">{lembur.penugas || "................................"}</span> menugaskan kerja lembur kepada:
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-primary" />
            <span className="font-label-bold text-xs uppercase text-on-surface-variant">Info Pengaju</span>
          </div>
          <p className="font-headline-md text-lg font-bold uppercase">{lembur.user.nama}</p>
          <p className="text-on-surface-variant text-sm">{lembur.user.jenjangJabatan} — {lembur.user.subBidang?.replace(/_/g, " ")}</p>

          <hr className="border-on-background my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className="font-bold block text-xs uppercase text-on-surface-variant mb-1">Tanggal Mulai</span>{new Date(lembur.tanggalMulai).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</div>
            <div><span className="font-bold block text-xs uppercase text-on-surface-variant mb-1">Tanggal Selesai</span>{new Date(lembur.tanggalSelesai).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</div>
            {lembur.lokasiKerja && <div className="sm:col-span-2"><span className="font-bold block text-xs uppercase text-on-surface-variant mb-1">Lokasi Kerja</span>{lembur.lokasiKerja}</div>}
            {(() => {
              const dasarMatch = lembur.deskripsi.match(/DASAR:\s*([\s\S]*?)(?:\n\n|\nURAIAN:|\nUraian:|$)/i);
              const uraianMatch = lembur.deskripsi.match(/URAIAN:\s*([\s\S]*?)$/i);
              const dasar = dasarMatch?.[1]?.trim();
              const uraian = uraianMatch?.[1]?.trim();
              if (dasar || uraian) {
                return (
                  <>
                    {dasar && (
                      <div className="sm:col-span-2">
                        <span className="font-bold block text-xs uppercase text-on-surface-variant mb-1">Dasar Pekerjaan</span>
                        <p className="text-on-surface leading-relaxed">{dasar}</p>
                      </div>
                    )}
                    {uraian && (
                      <div className="sm:col-span-2">
                        <span className="font-bold block text-xs uppercase text-on-surface-variant mb-1">Uraian Pekerjaan</span>
                        <p className="text-on-surface leading-relaxed">{uraian}</p>
                      </div>
                    )}
                  </>
                );
              }
              return (
                <div className="sm:col-span-2">
                  <span className="font-bold block text-xs uppercase text-on-surface-variant mb-1">Deskripsi</span>
                  <p className="text-on-surface leading-relaxed">{lembur.deskripsi}</p>
                </div>
              );
            })()}
          </div>

          <hr className="border-on-background my-4" />

          {/* Bukti Evident (Read-only) */}
          <div className="mt-4">
            <span className="font-bold block text-xs uppercase text-on-surface-variant mb-2">Evident / Foto Pekerjaan</span>
            {lembur.evidentUrl ? (
              <div className="border-2 border-on-background rounded-xl overflow-hidden hard-shadow w-fit">
                <img src={lembur.evidentUrl} alt="Bukti Pekerjaan" className="max-h-64 object-cover" />
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant italic">Tidak ada foto / evident yang dilampirkan.</p>
            )}
          </div>
        </div>

        {/* Timeline Approval */}
        <div className="bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] p-6 hard-shadow mb-6">
          <h2 className="font-label-bold text-xs uppercase text-on-surface-variant mb-5">Alur Persetujuan</h2>
          <div className="flex flex-col gap-4">
            {lembur.approvals.map((approval, idx) => {
              const aCfg = statusConfig[approval.status] ?? statusConfig.PENDING;
              const isCurrent = approval.step === lembur.currentStep && lembur.status === "PENDING";
              return (
                <div key={approval.id} className={`flex gap-4 items-start p-4 rounded-xl border-2 ${isCurrent ? "border-primary bg-primary-container/30" : "border-on-background/30 bg-surface-variant/30"}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 border-on-background flex items-center justify-center font-label-bold text-sm ${aCfg.color}`}>
                    {approval.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between gap-2 mb-1">
                      <span className="font-bold text-sm">{approval.roleName}</span>
                      <span className={`flex items-center gap-1 font-label-bold text-xs px-2 py-0.5 rounded-full border border-on-background/30 ${aCfg.color}`}>
                        {aCfg.icon} {aCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{approval.approver?.nama}</p>
                    {approval.catatan && <p className="text-xs text-on-surface mt-1 italic">Catatan: {approval.catatan}</p>}
                    {approval.respondedAt && <p className="text-xs text-on-surface-variant mt-1">{new Date(approval.respondedAt).toLocaleString("id-ID")}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons (untuk approver yang berhak) */}
        {isCurrentApprover && lembur.status === "PENDING" && (
          <div className="bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] p-6 hard-shadow">
            <h2 className="font-label-bold text-xs uppercase text-on-surface-variant mb-4">Tindakan Anda</h2>

            {showNotes && (
              <div className="mb-4">
                <label className="font-label-bold text-xs uppercase mb-2 block">Catatan {actionType === "APPROVED" ? "(Opsional)" : "(Wajib)"}</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full border-2 border-on-background bg-surface-container-lowest rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleAction(actionType!)}
                    disabled={actionLoading || (actionType !== "APPROVED" && !catatan)}
                    className="flex-1 bg-primary text-on-primary font-label-bold text-label-bold rounded-full py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "MEMPROSES..." : "KONFIRMASI"}
                  </button>
                  <button onClick={() => { setShowNotes(false); setActionType(null); }} className="px-6 py-3 border-2 border-on-background rounded-full font-label-bold text-label-bold transition-all hover:bg-surface-variant">
                    BATAL
                  </button>
                </div>
              </div>
            )}

            {!showNotes && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setActionType("APPROVED"); setShowNotes(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary font-label-bold text-label-bold rounded-full py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all"
                >
                  <CheckCircle size={16} /> SETUJUI
                </button>
                <button
                  onClick={() => { setActionType("REVISED"); setShowNotes(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-tertiary-container text-on-tertiary font-label-bold text-label-bold rounded-full py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all"
                >
                  <AlertCircle size={16} /> MINTA REVISI
                </button>
                <button
                  onClick={() => { setActionType("REJECTED"); setShowNotes(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-error-container text-on-error-container font-label-bold text-label-bold rounded-full py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all"
                >
                  <XCircle size={16} /> TOLAK
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
