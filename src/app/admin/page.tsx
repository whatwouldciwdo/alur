"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  CalendarDays,
  Download,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface Approval {
  step: number;
  roleName: string;
  status: string;
  approver: { nama: string; role: string };
}

interface LemburItem {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVISED" | "DRAFT";
  currentStep: number;
  totalSteps: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  penugas: string | null;
  submittedAt: string;
  user: {
    nama: string;
    nip: string;
    jenjangJabatan: string;
    bidang: string;
    subBidang: string;
    emailPerusahaan: string;
  };
  approvals: Approval[];
}

const BIDANG_OPTIONS = [
  { value: "", label: "Semua Bidang" },
  { value: "OPERASI", label: "Operasi" },
  { value: "SDM_KEU", label: "SDM & Keuangan" },
  { value: "PEMELIHARAAN", label: "Pemeliharaan" },
  { value: "ENGINEERING", label: "Engineering" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "PENDING", label: "Menunggu Approval" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "REVISED", label: "Perlu Revisi" },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  APPROVED: { label: "Disetujui", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle size={13} /> },
  PENDING: { label: "Menunggu", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock size={13} /> },
  REJECTED: { label: "Ditolak", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle size={13} /> },
  REVISED: { label: "Revisi", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: <AlertCircle size={13} /> },
  DRAFT: { label: "Draft", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: <Clock size={13} /> },
};

function formatTanggal(dt: string) {
  return new Date(dt).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDurasi(mulai: string, selesai: string) {
  const diff = new Date(selesai).getTime() - new Date(mulai).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}j ${mins}m`;
}

function getCurrentMonthValue() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ReactNode;
}) {
  return (
    <div className={`bg-surface-container-lowest border-2 border-on-background rounded-2xl p-5 hard-shadow flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl border-2 border-on-background flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="font-label-bold text-xs uppercase text-on-surface-variant">{label}</p>
        <p className="font-headline-md text-2xl text-on-background font-bold leading-tight">{value}</p>
        {sub && <p className="font-body-md text-xs text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [lemburs, setLemburs] = useState<LemburItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [bulan, setBulan] = useState("");
  const [bidang, setBidang] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasFilter = bulan !== "" || bidang !== "" || statusFilter !== "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (bulan) params.set("bulan", bulan);
      if (bidang) params.set("bidang", bidang);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/lembur?${params}`);
      const data = await res.json();
      setLemburs(Array.isArray(data) ? data : []);
    } catch {
      setLemburs([]);
    } finally {
      setLoading(false);
    }
  }, [bulan, bidang, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/");
    if (sessionStatus === "authenticated" && session?.user?.role !== "ADMIN") router.push("/dashboard");
  }, [sessionStatus, session, router]);

  if (sessionStatus === "loading" || !session) {
    return (
      <main className="w-full flex items-center justify-center min-h-screen">
        <p className="font-label-bold uppercase animate-pulse">Memuat...</p>
      </main>
    );
  }

  if (session.user.role !== "ADMIN") return null;

  const totalApproved = lemburs.filter(l => l.status === "APPROVED").length;
  const totalPending = lemburs.filter(l => l.status === "PENDING").length;
  const totalRejected = lemburs.filter(l => l.status === "REJECTED").length;
  const uniqueUsers = new Set(lemburs.map(l => l.user.nip)).size;
  // Count total approval steps that have been approved across all lemburs
  const totalStepsApproved = lemburs.reduce((acc, l) => acc + l.approvals.filter(a => a.status === "APPROVED").length, 0);

  async function handleAdminApprove(lemburId: string) {
    setApprovingId(lemburId);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lemburId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyetujui lembur");
        return;
      }
      await fetchData();
    } catch {
      alert("Terjadi kesalahan saat menyetujui");
    } finally {
      setApprovingId(null);
    }
  }

  // Helper: check if this lembur is waiting for Admin to approve (current step role = ADMIN)
  function isAdminTurn(l: LemburItem): boolean {
    if (l.status !== "PENDING") return false;
    const currentApproval = l.approvals.find(a => a.step === l.currentStep && a.status === "PENDING");
    if (!currentApproval) return false;
    // Check by approver role OR by roleName (in case approverId hasn't been updated yet)
    return currentApproval.approver?.role === "ADMIN" || currentApproval.roleName?.toLowerCase().includes("admin");
  }


  async function handleExportXlsx() {
    setExporting("xlsx");
    try {
      const params = new URLSearchParams();
      if (bulan) params.set("bulan", bulan);
      if (bidang) params.set("bidang", bidang);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/export?${params}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-lembur${bulan ? "-" + bulan : ""}${bidang ? "-" + bidang.toLowerCase() : ""}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  async function handleExportPdf() {
    setExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      async function imageToBase64(url: string): Promise<{ data: string; format: "PNG" | "JPEG" }> {
        const res = await fetch(url);
        const blob = await res.blob();
        const isJpeg = blob.type.includes("jpeg") || blob.type.includes("jpg") || url.endsWith(".jpg") || url.endsWith(".jpeg");
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ data: reader.result as string, format: isJpeg ? "JPEG" : "PNG" });
          };
          reader.readAsDataURL(blob);
        });
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.width;

      let logoPln: { data: string; format: "PNG" | "JPEG" } | null = null;
      let logoApp: { data: string; format: "PNG" | "JPEG" } | null = null;
      try { logoPln = await imageToBase64("/image/Logo-PLN-Indonesiapower-Services.png"); } catch { /* skip */ }
      try { logoApp = await imageToBase64("/image/ranger-application-logo.jpg"); } catch { /* skip */ }

      const kopH = 28;

      const logoH = 18;
      const plnLogoW = 52;
      const appLogoW = 18;
      const marginX = 8;

      if (logoPln) {
        doc.addImage(logoPln.data, logoPln.format, marginX, 5, plnLogoW, logoH);
      }

      if (logoApp) {
        doc.addImage(logoApp.data, logoApp.format, pageW - marginX - appLogoW, 5, appLogoW, appLogoW);
      }

      const centerX = pageW / 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 105, 52);
      doc.text("PT PLN INDONESIA POWER SERVICES", centerX, 10, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text("Unit Bisnis Pembangkitan Cilegon", centerX, 16, { align: "center" });

      doc.setDrawColor(0, 105, 52);
      doc.setLineWidth(0.8);
      doc.line(marginX, kopH, pageW - marginX, kopH);
      doc.setLineWidth(0.3);
      doc.line(marginX, kopH + 1.2, pageW - marginX, kopH + 1.2);

      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);

      const bulanLabel = bulan
        ? new Date(bulan + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })
        : "Semua Periode";
      const bidangLabel = BIDANG_OPTIONS.find(b => b.value === bidang)?.label ?? "Semua Bidang";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("REKAP DATA LEMBUR KARYAWAN", centerX, kopH + 8, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Periode: ${bulanLabel}   |   Bidang: ${bidangLabel}   |   Total: ${lemburs.length} pengajuan`, centerX, kopH + 14, { align: "center" });

      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Dicetak oleh: ${session?.user?.name ?? "Admin"}   |   ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
        centerX, kopH + 19,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);

      const rows = lemburs.map((l, idx) => [
        idx + 1,
        l.user.nama,
        l.user.nip,
        l.user.jenjangJabatan,
        l.user.bidang.replace("_", " & "),
        l.user.subBidang.replace(/_/g, " "),
        formatTanggal(l.tanggalMulai),
        formatTanggal(l.tanggalSelesai),
        formatDurasi(l.tanggalMulai, l.tanggalSelesai),
        (() => {
          const dasar = l.deskripsi.match(/DASAR:\s*([\s\S]*?)(?:\n\n|$)/i)?.[1]?.trim();
          const uraian = l.deskripsi.match(/URAIAN:\s*([\s\S]*?)$/i)?.[1]?.trim();
          if (dasar || uraian) {
            const parts = [];
            if (dasar) parts.push(`Dasar: ${dasar.substring(0, 40)}${dasar.length > 40 ? "..." : ""}`);
            if (uraian) parts.push(`Uraian: ${uraian.substring(0, 40)}${uraian.length > 40 ? "..." : ""}`);
            return parts.join(" | ");
          }
          return l.deskripsi.substring(0, 60) + (l.deskripsi.length > 60 ? "..." : "");
        })(),
        l.status,
      ]);

      const drawKopOnPage = async () => {
        if (logoPln) doc.addImage(logoPln.data, logoPln.format, marginX, 5, plnLogoW, logoH);
        if (logoApp) doc.addImage(logoApp.data, logoApp.format, pageW - marginX - appLogoW, 5, appLogoW, appLogoW);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 105, 52);
        doc.text("PT PLN INDONESIA POWER SERVICES", centerX, 10, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text("Unit Bisnis Pembangkitan Cilegon", centerX, 16, { align: "center" });
        doc.setDrawColor(0, 105, 52);
        doc.setLineWidth(0.8);
        doc.line(marginX, kopH, pageW - marginX, kopH);
        doc.setLineWidth(0.3);
        doc.line(marginX, kopH + 1.2, pageW - marginX, kopH + 1.2);
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
      };

      autoTable(doc, {
        startY: kopH + 22,
        head: [["No", "Nama", "NIP", "Jabatan", "Bidang", "Sub Bidang", "Tgl Mulai", "Tgl Selesai", "Durasi", "Deskripsi", "Status"]],
        body: rows,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [0, 105, 52], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 250, 247] },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 35 },
          2: { cellWidth: 22 },
          3: { cellWidth: 28 },
          4: { cellWidth: 22 },
          5: { cellWidth: 25 },
          6: { cellWidth: 22 },
          7: { cellWidth: 22 },
          8: { cellWidth: 15 },
          9: { cellWidth: 55 },
          10: { cellWidth: 18 },
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            drawKopOnPage();
          }
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(
            `Halaman ${data.pageNumber} dari ${pageCount}`,
            centerX, doc.internal.pageSize.height - 5,
            { align: "center" }
          );
          doc.setTextColor(0, 0, 0);
        },
      });

      const filename = `rekap-lembur${bulan ? "-" + bulan : ""}${bidang ? "-" + bidang.toLowerCase() : ""}.pdf`;
      doc.save(filename);
    } finally {
      setExporting(null);
    }
  }

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-start justify-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">

      {/* ── Header ── */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-primary" />
            <p className="font-label-bold text-label-bold text-primary uppercase">Panel Admin</p>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-background uppercase tracking-tight">
            REKAP LEMBUR
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchData}
            disabled={loading}
            id="btn-refresh"
            title="Refresh data"
            className="flex items-center gap-2 bg-surface-container-lowest text-on-surface font-label-bold text-xs rounded-full px-3 py-2.5 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportXlsx}
            disabled={exporting !== null || lemburs.length === 0}
            id="btn-export-xlsx"
            className="flex items-center gap-2 bg-primary text-on-primary font-label-bold text-xs rounded-full px-4 py-2.5 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === "xlsx" ? <RefreshCw size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
            EXPORT XLSX
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting !== null || lemburs.length === 0}
            id="btn-export-pdf"
            className="flex items-center gap-2 bg-tertiary-container text-on-tertiary font-label-bold text-xs rounded-full px-4 py-2.5 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === "pdf" ? <RefreshCw size={15} className="animate-spin" /> : <FileText size={15} />}
            EXPORT PDF
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="w-full bg-surface-container-lowest border-2 border-on-background rounded-2xl p-5 hard-shadow mb-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-primary" />
            <p className="font-label-bold text-label-bold text-on-surface uppercase text-xs">Filter Data</p>
            {hasFilter && (
              <span className="font-label-bold text-xs bg-primary text-on-primary px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          {hasFilter && (
            <button
              onClick={() => { setBulan(""); setBidang(""); setStatusFilter(""); }}
              className="flex items-center gap-1 font-label-bold text-xs text-on-surface-variant border border-on-background/30 px-2.5 py-1 rounded-full hover:bg-surface-variant transition-colors"
            >
              <XCircle size={12} /> Reset Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filter Bulan */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-bold text-xs uppercase text-on-surface-variant flex items-center gap-1.5">
              <CalendarDays size={13} /> Periode Bulan
            </label>
            <input
              id="filter-bulan"
              type="month"
              value={bulan}
              onChange={e => setBulan(e.target.value)}
              placeholder="Semua bulan"
              className="bg-surface-variant border-2 border-on-background rounded-xl px-3 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Filter Bidang */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-bold text-xs uppercase text-on-surface-variant flex items-center gap-1.5">
              <Users size={13} /> Bidang
            </label>
            <select
              id="filter-bidang"
              value={bidang}
              onChange={e => setBidang(e.target.value)}
              className="bg-surface-variant border-2 border-on-background rounded-xl px-3 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              {BIDANG_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-bold text-xs uppercase text-on-surface-variant flex items-center gap-1.5">
              <TrendingUp size={13} /> Status
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-surface-variant border-2 border-on-background rounded-xl px-3 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      {!loading && (
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Pengajuan"
            value={lemburs.length}
            color="bg-primary-container"
            icon={<Download size={22} className="text-on-primary" />}
          />
          <StatCard
            label="Fully Disetujui"
            value={totalApproved}
            sub={totalStepsApproved > 0 ? `${totalStepsApproved} step approved` : undefined}
            color="bg-emerald-100"
            icon={<CheckCircle size={22} className="text-emerald-700" />}
          />
          <StatCard
            label="Menunggu"
            value={totalPending}
            color="bg-amber-100"
            icon={<Clock size={22} className="text-amber-700" />}
          />
          {totalRejected > 0 ? (
            <StatCard
              label="Ditolak"
              value={totalRejected}
              color="bg-red-100"
              icon={<XCircle size={22} className="text-red-700" />}
            />
          ) : (
            <StatCard
              label="Pegawai"
              value={uniqueUsers}
              sub="orang terlibat"
              color="bg-secondary-container"
              icon={<Users size={22} className="text-on-secondary-container" />}
            />
          )}
        </div>
      )}

      {/* ── Table / List ── */}
      {loading ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-label-bold text-xs uppercase text-on-surface-variant animate-pulse">Memuat data...</p>
          </div>
        </div>
      ) : lemburs.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-variant border-2 border-on-background flex items-center justify-center">
            <FileSpreadsheet size={28} className="text-on-surface-variant" />
          </div>
          <p className="font-body-lg text-on-surface-variant text-center">
            Tidak ada data lembur untuk filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="w-full">
          {/* Desktop: Table */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <div className="min-w-full bg-surface-container-lowest border-2 border-on-background rounded-2xl hard-shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-on-primary border-b-2 border-on-background">
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">No</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">Nama / NIP</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">Bidang</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">Sub Bidang</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">Periode Lembur</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">Durasi</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">Deskripsi</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">Status</th>
                    <th className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  {lemburs.map((l, idx) => {
                    const cfg = STATUS_CFG[l.status] ?? STATUS_CFG.DRAFT;
                    return (
                      <tr
                        key={l.id}
                        className={`border-b border-on-background/10 hover:bg-surface-container transition-colors ${idx % 2 === 1 ? "bg-surface-container-low/40" : ""}`}
                      >
                        <td className="px-4 py-3 text-on-surface-variant font-medium">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-on-background text-sm">{l.user.nama}</p>
                          <p className="text-xs text-on-surface-variant">{l.user.nip}</p>
                          <p className="text-xs text-on-surface-variant">{l.user.jenjangJabatan}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-on-surface">
                          {l.user.bidang.replace("_", " & ")}
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">
                          {l.user.subBidang.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-on-surface font-medium">{formatTanggal(l.tanggalMulai)}</p>
                          <p className="text-xs text-on-surface-variant">s/d {formatTanggal(l.tanggalSelesai)}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-on-surface whitespace-nowrap">
                          {formatDurasi(l.tanggalMulai, l.tanggalSelesai)}
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          {(() => {
                            const dasar = l.deskripsi.match(/DASAR:\s*([\s\S]*?)(?:\n\n|$)/i)?.[1]?.trim();
                            const uraian = l.deskripsi.match(/URAIAN:\s*([\s\S]*?)$/i)?.[1]?.trim();
                            if (dasar || uraian) return (
                              <>
                                {dasar && <p className="text-xs font-medium text-on-surface line-clamp-1"><span className="text-on-surface-variant">Dasar: </span>{dasar}</p>}
                                {uraian && <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5"><span className="">Uraian: </span>{uraian}</p>}
                              </>
                            );
                            return <p className="text-xs text-on-surface line-clamp-2">{l.deskripsi}</p>;
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 font-label-bold text-xs px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          {l.status === "PENDING" && (
                            <p className="text-xs text-on-surface-variant mt-1">
                              Tahap {l.currentStep}/{l.totalSteps}
                            </p>
                          )}
                          {isAdminTurn(l) && (
                            <span className="inline-flex items-center gap-1 font-label-bold text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 mt-1">
                              <CheckCircle size={11} /> Giliran Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {isAdminTurn(l) && (
                              <button
                                onClick={() => handleAdminApprove(l.id)}
                                disabled={approvingId === l.id}
                                title="Setujui & Rekap"
                                className="flex items-center gap-1 font-label-bold text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded-full border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {approvingId === l.id
                                  ? <RefreshCw size={12} className="animate-spin" />
                                  : <CheckCircle size={12} />}
                                Rekap
                              </button>
                            )}
                            <Link
                              href={`/lembur/${l.id}`}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-variant border-2 border-on-background hover:bg-primary hover:text-on-primary transition-colors"
                              title="Lihat Detail"
                            >
                              <ChevronRight size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>

                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {lemburs.map((l, idx) => {
              const cfg = STATUS_CFG[l.status] ?? STATUS_CFG.DRAFT;
              return (
                <div
                  key={l.id}
                  className="w-full bg-surface-container-lowest border-2 border-on-background rounded-2xl p-4 hard-shadow transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-sm text-on-background">{l.user.nama}</span>
                        <span className="font-label-bold text-xs text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full border border-on-background/20">
                          {l.user.bidang.replace("_", " & ")}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{l.user.nip} · {l.user.jenjangJabatan}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 font-label-bold text-xs px-2.5 py-1 rounded-full border shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-1.5">
                    {formatTanggal(l.tanggalMulai)} → {formatTanggal(l.tanggalSelesai)} · {formatDurasi(l.tanggalMulai, l.tanggalSelesai)}
                  </p>
                  {(() => {
                    const dasar = l.deskripsi.match(/DASAR:\s*([\s\S]*?)(?:\n\n|$)/i)?.[1]?.trim();
                    const uraian = l.deskripsi.match(/URAIAN:\s*([\s\S]*?)$/i)?.[1]?.trim();
                    if (dasar || uraian) return (
                      <>
                        {dasar && <p className="text-xs font-medium text-on-surface line-clamp-1"><span className="text-on-surface-variant">Dasar: </span>{dasar}</p>}
                        {uraian && <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5"><span className="">Uraian: </span>{uraian}</p>}
                      </>
                    );
                    return <p className="text-xs text-on-surface line-clamp-2">{l.deskripsi}</p>;
                  })()}
                  <div className="flex items-center gap-2 mt-3">
                    {isAdminTurn(l) && (
                      <button
                        onClick={() => handleAdminApprove(l.id)}
                        disabled={approvingId === l.id}
                        className="flex items-center gap-1.5 font-label-bold text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full border-2 border-on-background hard-shadow hard-shadow-active transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {approvingId === l.id
                          ? <RefreshCw size={12} className="animate-spin" />
                          : <CheckCircle size={12} />}
                        Rekap & Setujui
                      </button>
                    )}
                    <Link
                      href={`/lembur/${l.id}`}
                      className="flex items-center gap-1 font-label-bold text-xs text-on-surface-variant border border-on-background/30 px-3 py-1.5 rounded-full hover:bg-surface-variant transition-colors"
                    >
                      <ChevronRight size={13} /> Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="font-label-bold text-xs uppercase text-on-surface-variant">
              Menampilkan {lemburs.length} data
            </p>
            <div className="flex items-center gap-2">
              {totalRejected > 0 && (
                <span className="font-label-bold text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full">
                  {totalRejected} Ditolak
                </span>
              )}
              {totalPending > 0 && (
                <span className="font-label-bold text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                  {totalPending} Menunggu
                </span>
              )}
              <span className="font-label-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                {totalApproved} Disetujui
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
