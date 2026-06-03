"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, Upload, X } from "lucide-react";

const LS_KEY = "alur_lembur_draft";

export default function AjukanLembur() {
  const { data: session } = useSession();
  const router = useRouter();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hariNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulanNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const formatTanggal = (d: Date) =>
    `${hariNames[d.getDay()]}, ${d.getDate()} ${bulanNames[d.getMonth()]} ${d.getFullYear()}`;
  const formatJam = (d: Date) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatJamShort = (d: Date) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const [kategori, setKategori] = useState<"LEMBUR" | "PIKET">("LEMBUR");
  const [clockIn, setClockIn] = useState<Date | null>(null);
  const [clockOut, setClockOut] = useState<Date | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.clockIn) setClockIn(new Date(saved.clockIn));
        if (saved.clockOut) setClockOut(new Date(saved.clockOut));
        if (saved.penugas) setPenugas(saved.penugas);
        if (saved.dasarPekerjaan) setDasarPekerjaan(saved.dasarPekerjaan);
        if (saved.uraianPekerjaan) setUraianPekerjaan(saved.uraianPekerjaan);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const draft = {
        clockIn: clockIn?.toISOString() ?? null,
        clockOut: clockOut?.toISOString() ?? null,
        penugas,
        dasarPekerjaan,
        uraianPekerjaan,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(draft));
    } catch {}
  }, [clockIn, clockOut]);

  const handleClockIn = () => {
    if (!clockIn) setClockIn(new Date());
  };
  const handleClockOut = () => {
    if (clockIn && !clockOut) setClockOut(new Date());
  };
  const confirmReset = () => {
    setClockIn(null);
    setClockOut(null);
    setShowResetModal(false);
    localStorage.removeItem(LS_KEY);
  };

  const [penugas, setPenugas] = useState("");

  const [dasarPekerjaan, setDasarPekerjaan] = useState("");
  const [uraianPekerjaan, setUraianPekerjaan] = useState("");
  const [dokFile, setDokFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clockIn || !clockOut) {
      setError("Harap tekan Clock In dan Clock Out terlebih dahulu.");
      return;
    }
    if (!penugas) {
      setError("Harap pilih Assistant Manager / Manager yang menugaskan.");
      return;
    }
    if (!dasarPekerjaan.trim() || !uraianPekerjaan.trim()) {
      setError("Dasar Pekerjaan dan Uraian Pekerjaan wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("tanggalMulai", clockIn.toISOString());
      formData.append("tanggalSelesai", clockOut.toISOString());
      formData.append("deskripsi", `DASAR: ${dasarPekerjaan}\n\nURAIAN: ${uraianPekerjaan}`);
      formData.append("penugas", penugas);
      formData.append("kategori", kategori);
      if (dokFile) {
        formData.append("evident", dokFile);
      }

      const res = await fetch("/api/lembur", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
      } else {
        localStorage.removeItem(LS_KEY);
        router.push(`/lembur/${data.lemburId}`);
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  const durasi = clockIn && clockOut
    ? Math.round((clockOut.getTime() - clockIn.getTime()) / 60000)
    : null;

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-center justify-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">

      {/* Back link */}
      <div className="w-full max-w-3xl mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-label-bold text-label-bold text-primary mb-1 hover:underline w-fit">
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-background tracking-tight">
            FORM PENGAJUAN
          </h1>
          {/* Toggle Kategori */}
          <div className="flex items-center border-2 border-on-background rounded-full overflow-hidden hard-shadow">
            <button
              type="button"
              onClick={() => setKategori("LEMBUR")}
              className={`px-5 py-2 font-label-bold text-sm transition-all ${
                kategori === "LEMBUR"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-variant"
              }`}
            >
              ⏱ LEMBUR
            </button>
            <button
              type="button"
              onClick={() => setKategori("PIKET")}
              className={`px-5 py-2 font-label-bold text-sm transition-all ${
                kategori === "PIKET"
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-variant"
              }`}
            >
              🏢 PIKET
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Clock Banner ── */}
      <div className="w-full max-w-3xl mb-6 bg-primary text-on-primary border-2 border-on-background rounded-2xl hard-shadow px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Clock size={28} className="shrink-0" />
          <div>
            <p className="font-label-bold text-xs uppercase opacity-80">Hari / Tanggal</p>
            <p className="font-headline-md text-lg font-bold">{formatTanggal(now)}</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <p className="font-label-bold text-xs uppercase opacity-80">Jam Sekarang</p>
          <p className="font-display-lg text-3xl font-extrabold tracking-widest tabular-nums">
            {formatJam(now)}
          </p>
        </div>
      </div>

      {/* ── Clock In / Out Panel ── */}
      <div className="w-full max-w-3xl mb-6 grid grid-cols-2 gap-4">
        {/* Clock In */}
        <div className={`border-2 border-on-background rounded-2xl p-4 hard-shadow flex flex-col items-center gap-2 transition-all ${clockIn ? "bg-primary-container" : "bg-surface-container-lowest"}`}>
          <p className="font-label-bold text-xs uppercase text-on-surface-variant">JAM MULAI</p>
          <p className="font-display-lg text-2xl font-extrabold tabular-nums tracking-wider">
            {clockIn ? formatJamShort(clockIn) : "–– : ––"}
          </p>
          <p className="font-body-sm text-on-surface-variant text-xs">
            {clockIn ? formatTanggal(clockIn) : "Belum Clock In"}
          </p>
          <button
            type="button"
            onClick={handleClockIn}
            disabled={!!clockIn}
            className={`mt-1 w-full rounded-full px-4 py-2 font-label-bold text-sm border-2 border-on-background transition-all hard-shadow-active
              ${clockIn
                ? "bg-primary text-on-primary cursor-default"
                : "bg-surface-container hard-shadow hard-shadow-hover hover:bg-primary hover:text-on-primary"
              }`}
          >
            {clockIn ? <span className="flex items-center justify-center gap-1"><CheckCircle size={14}/> Tercatat</span> : "⏱ CLOCK IN"}
          </button>
        </div>

        {/* Clock Out */}
        <div className={`border-2 border-on-background rounded-2xl p-4 hard-shadow flex flex-col items-center gap-2 transition-all ${clockOut ? "bg-tertiary-container" : "bg-surface-container-lowest"}`}>
          <p className="font-label-bold text-xs uppercase text-on-surface-variant">JAM SELESAI</p>
          <p className="font-display-lg text-2xl font-extrabold tabular-nums tracking-wider">
            {clockOut ? formatJamShort(clockOut) : "–– : ––"}
          </p>
          <p className="font-body-sm text-on-surface-variant text-xs">
            {clockOut ? `Durasi: ${durasi} menit` : clockIn ? "Siap Clock Out" : "Clock In dulu"}
          </p>
          <button
            type="button"
            onClick={handleClockOut}
            disabled={!clockIn || !!clockOut}
            className={`mt-1 w-full rounded-full px-4 py-2 font-label-bold text-sm border-2 border-on-background transition-all hard-shadow-active
              ${clockOut
                ? "bg-tertiary text-on-tertiary cursor-default"
                : !clockIn
                  ? "opacity-40 cursor-not-allowed bg-surface-container"
                  : "bg-surface-container hard-shadow hard-shadow-hover hover:bg-tertiary hover:text-on-tertiary"
              }`}
          >
            {clockOut ? <span className="flex items-center justify-center gap-1"><CheckCircle size={14}/> Tercatat</span> : "⏹ CLOCK OUT"}
          </button>
        </div>
      </div>

      {/* Reset */}
      {(clockIn || clockOut) && (
        <div className="w-full max-w-3xl mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-xs text-on-surface-variant hover:text-error underline flex items-center gap-1"
          >
            <X size={12}/> Reset jam
          </button>
        </div>
      )}

      {/* ── Modal Konfirmasi Reset ── */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white border-2 border-on-background rounded-2xl hard-shadow w-full max-w-sm p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-error-container border-2 border-on-background mx-auto">
              <X size={28} className="text-error" />
            </div>

            {/* Title */}
            <div className="text-center">
              <h3 className="font-headline-md text-lg font-bold text-on-background mb-1">Reset Jam Lembur?</h3>
              <p className="font-body-md text-on-surface-variant text-sm">
                Data jam yang sudah tercatat akan dihapus dan tidak bisa dikembalikan.
              </p>
            </div>

            {/* Recorded times */}
            <div className="bg-surface-variant rounded-xl border-2 border-on-background border-dashed p-3 grid grid-cols-2 gap-3 text-center text-sm">
              <div>
                <p className="font-label-bold text-xs uppercase text-on-surface-variant mb-0.5">Clock In</p>
                <p className="font-bold">{clockIn ? formatJamShort(clockIn) : "–"}</p>
              </div>
              <div>
                <p className="font-label-bold text-xs uppercase text-on-surface-variant mb-0.5">Clock Out</p>
                <p className="font-bold">{clockOut ? formatJamShort(clockOut) : "–"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-full rounded-full py-3 px-4 font-label-bold text-sm border-2 border-on-background bg-surface-container hard-shadow hard-shadow-hover transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="w-full rounded-full py-3 px-4 font-label-bold text-sm border-2 border-on-background bg-error text-white hard-shadow hard-shadow-hover transition-all"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Card ── */}
      <div className="w-full max-w-3xl bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hard-shadow mx-auto">

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="text-error font-body-md bg-error-container px-4 py-3 rounded-xl text-center border-2 border-on-background">
              {error}
            </div>
          )}

          {/* Penugas (2 pilihan statis) */}
          <div className="flex flex-col mb-2">
            <p className="font-body-md mb-2 flex items-center gap-2 flex-wrap">
              <select
                value={penugas}
                onChange={(e) => { setPenugas(e.target.value); }}
                className="border-2 border-on-background rounded-lg px-2 py-1 font-bold text-sm bg-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="" disabled>-- Pilih Jabatan --</option>
                <option value="Assistant Manager">Assistant Manager</option>
                <option value="Manager">Manager</option>
              </select>
              menugaskan kerja lembur pada:
            </p>
          </div>

          {/* Header info pegawai */}
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-variant rounded-xl border-2 border-on-background border-dashed">
            <div>
              <p className="font-label-bold text-xs uppercase text-on-surface-variant mb-0.5">Nama</p>
              <p className="font-body-md font-bold">{session.user.name}</p>
            </div>
            <div>
              <p className="font-label-bold text-xs uppercase text-on-surface-variant mb-0.5">NIP</p>
              <p className="font-body-md font-bold">{session.user.nip}</p>
            </div>
            <div>
              <p className="font-label-bold text-xs uppercase text-on-surface-variant mb-0.5">Bidang / Jabatan</p>
              <p className="font-body-md font-bold leading-tight">
                {session.user.bidang?.replace(/_/g, " ")}{" "}
                <span className="text-on-surface-variant font-normal">·</span>{" "}
                {session.user.jenjangJabatan}
              </p>
            </div>
          </div>

          {/* Dasar Pekerjaan */}
          <div className="flex flex-col">
            <label className="font-label-bold text-xs uppercase mb-2">
              Dasar Pekerjaan Lembur <span className="text-error">*</span>
            </label>
            <textarea
              value={dasarPekerjaan}
              onChange={(e) => setDasarPekerjaan(e.target.value)}
              required
              rows={3}
              placeholder="Contoh: SPK No. 001/SPK/2025, Instruksi Atasan, dll..."
              className="w-full border-2 border-on-background bg-white rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Uraian Pekerjaan */}
          <div className="flex flex-col">
            <label className="font-label-bold text-xs uppercase mb-2">
              Uraian Pekerjaan <span className="text-error">*</span>
            </label>
            <textarea
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
              required
              rows={4}
              placeholder="Jelaskan secara detail pekerjaan yang dilakukan selama lembur..."
              className="w-full border-2 border-on-background bg-white rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Dokumentasi (opsional) */}
          <div className="flex flex-col">
            <label className="font-label-bold text-xs uppercase mb-2 flex items-center gap-2">
              Dokumentasi Pekerjaan
              <span className="text-on-surface-variant font-normal normal-case text-xs">(opsional)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-on-background rounded-xl px-4 py-6 flex flex-col items-center gap-2 hover:bg-surface-variant transition-all"
            >
              {dokFile ? (
                <>
                  <CheckCircle size={24} className="text-primary" />
                  <p className="font-body-md font-bold text-center break-all">{dokFile.name}</p>
                  <p className="text-xs text-on-surface-variant">{(dokFile.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDokFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="text-xs text-error underline mt-1"
                  >
                    Hapus file
                  </button>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-on-surface-variant" />
                  <p className="font-body-md text-on-surface-variant text-center text-sm">
                    Klik untuk upload foto / dokumen
                  </p>
                  <p className="text-xs text-on-surface-variant">PNG, JPG, PDF — maks 5 MB</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size <= 5 * 1024 * 1024) setDokFile(f);
                else if (f) alert("Ukuran file maksimal 5 MB");
              }}
            />
          </div>

          {/* Summary sebelum submit */}
          {clockIn && clockOut && (
            <div className="bg-primary-container border-2 border-on-background rounded-xl p-4 text-sm">
              <p className="font-label-bold uppercase text-xs mb-2 text-on-surface-variant">Ringkasan Pengajuan</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-on-surface-variant text-xs">Mulai</p>
                  <p className="font-bold">{formatJamShort(clockIn)}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Selesai</p>
                  <p className="font-bold">{formatJamShort(clockOut)}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Durasi</p>
                  <p className="font-bold">{durasi} menit</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !clockIn || !clockOut}
            className={`w-full font-label-bold text-label-bold rounded-full px-6 py-4 mt-2 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              kategori === "PIKET"
                ? "bg-secondary text-on-secondary"
                : "bg-primary text-on-primary"
            }`}
          >
            {isLoading ? "MENGAJUKAN..." : `SUBMIT PENGAJUAN ${kategori}`}
          </button>
          {(!clockIn || !clockOut) && (
            <p className="text-center text-xs text-on-surface-variant -mt-3">
              {!clockIn ? "⚠ Tekan Clock In untuk mulai" : "⚠ Tekan Clock Out untuk menyelesaikan"}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
