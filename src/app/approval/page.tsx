"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";

interface ApprovalItem {
  id: string;
  step: number;
  roleName: string;
  lembur: {
    id: string;
    status: string;
    currentStep: number;
    tanggalMulai: string;
    tanggalSelesai: string;
    deskripsi: string;
    user: { nama: string; nip: string; jenjangJabatan: string; subBidang: string };
    approvals: { step: number; status: string; approver: { nama: string } }[];
  };
}

export default function ApprovalPage() {
  const { data: session } = useSession();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/approval")
      .then((r) => r.json())
      .then((data) => { setApprovals(data); setLoading(false); });
  }, []);

  if (!session) return null;

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-start justify-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <p className="font-label-bold text-label-bold text-primary uppercase mb-1">Antrian Persetujuan</p>
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-background uppercase tracking-tight">
            APPROVAL LEMBUR
          </h1>
        </div>
        {!loading && (
          <span className="bg-tertiary-container text-on-tertiary border-2 border-on-background font-label-bold px-4 py-2 rounded-full text-sm">
            {approvals.length} Menunggu
          </span>
        )}
      </div>

      {loading ? (
        <div className="w-full flex items-center justify-center py-24">
          <p className="font-label-bold uppercase animate-pulse">Memuat antrian...</p>
        </div>
      ) : approvals.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container border-2 border-on-background flex items-center justify-center">
            <Clock size={28} className="text-on-primary" />
          </div>
          <p className="font-body-lg text-on-surface-variant text-center">
            Tidak ada pengajuan yang menunggu persetujuan Anda saat ini.
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {approvals.map((item) => {
            const lembur = item.lembur;
            return (
              <Link
                key={item.id}
                href={`/lembur/${lembur.id}`}
                className="w-full bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] p-5 hard-shadow hard-shadow-hover transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Pegawai Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-sm">{lembur.user.nama}</span>
                      <span className="bg-surface-variant text-on-surface border border-on-background/30 font-label-bold px-2 py-0.5 rounded-full text-xs uppercase">
                        {lembur.user.subBidang?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">
                      {new Date(lembur.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      {" → "}
                      {new Date(lembur.tanggalSelesai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="font-body-md text-sm line-clamp-2">{lembur.deskripsi}</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                    <span className="bg-secondary-container text-on-secondary-container border-2 border-on-background font-label-bold px-3 py-1 rounded-full text-xs">
                      Tahap {lembur.currentStep} — {item.roleName}
                    </span>
                    <ChevronRight size={20} className="text-on-surface-variant hidden sm:block" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
