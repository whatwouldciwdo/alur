"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Lock, Phone, Mail, IdCard, Briefcase, Building2, Moon, Sun } from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [phone, setPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const user = session?.user;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorHp: phone || undefined,
          emailPersonal: personalEmail || undefined,
          password: password || undefined,
        }),
      });

      if (res.ok) {
        setSuccessMessage("Profil berhasil diperbarui!");
        setPassword("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Gagal menyimpan perubahan.");
      }
    } catch {
      setErrorMessage("Tidak dapat menghubungi server.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="w-full flex items-center justify-center min-h-screen">
        <p className="font-label-bold uppercase animate-pulse">Memuat...</p>
      </main>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-start justify-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="font-headline-lg text-3xl sm:text-headline-lg text-on-background uppercase tracking-tight">
          Profil Saya
        </h1>
        <button
          onClick={() => router.back()}
          className="bg-surface-variant text-on-surface font-label-bold text-label-bold rounded-full px-6 py-2 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all"
        >
          KEMBALI
        </button>
      </div>

      <div className="w-full max-w-2xl bg-surface-container-lowest border-2 border-on-background rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hard-shadow mx-auto overflow-hidden">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary border-4 border-on-background flex items-center justify-center hard-shadow">
            <User size={36} className="text-on-primary" />
          </div>
          <div className="text-center">
            <p className="font-headline-md text-xl font-bold text-on-background">{user.name}</p>
            <p className="font-body-md text-on-surface-variant text-sm">{user.jenjangJabatan}</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-primary-container text-on-primary font-body-md px-4 py-3 rounded-xl text-center border-2 border-on-background">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-error-container text-on-error-container font-body-md px-4 py-3 rounded-xl text-center border-2 border-on-background">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">

          {/* ── Read-Only: Info Pekerjaan ── */}
          <div className="flex flex-col gap-4 p-4 md:p-5 bg-surface-variant rounded-xl border-2 border-on-background border-dashed">
            <h2 className="font-label-bold text-xs uppercase text-on-surface-variant flex items-center gap-2">
              <Briefcase size={14} /> Informasi Pekerjaan
              <span className="ml-auto font-normal normal-case text-[10px] bg-surface-container px-2 py-0.5 rounded-full border border-on-background/30">
                Tidak bisa diubah
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="font-label-bold text-xs uppercase mb-1 flex items-center gap-1">
                  <User size={11} /> Nama
                </label>
                <input
                  type="text" disabled value={user.name ?? ""}
                  className="bg-surface-container-highest border border-on-background/30 rounded-lg px-3 py-2 font-body-md text-on-surface-variant cursor-not-allowed w-full text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label-bold text-xs uppercase mb-1 flex items-center gap-1">
                  <IdCard size={11} /> NIP
                </label>
                <input
                  type="text" disabled value={user.nip ?? ""}
                  className="bg-surface-container-highest border border-on-background/30 rounded-lg px-3 py-2 font-body-md text-on-surface-variant cursor-not-allowed w-full text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label-bold text-xs uppercase mb-1 flex items-center gap-1">
                  <Building2 size={11} /> Bidang
                </label>
                <input
                  type="text" disabled value={user.bidang?.replace(/_/g, " ") ?? ""}
                  className="bg-surface-container-highest border border-on-background/30 rounded-lg px-3 py-2 font-body-md text-on-surface-variant cursor-not-allowed w-full text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label-bold text-xs uppercase mb-1 flex items-center gap-1">
                  <Briefcase size={11} /> Sub-Bidang
                </label>
                <input
                  type="text" disabled value={user.subBidang?.replace(/_/g, " ") ?? ""}
                  className="bg-surface-container-highest border border-on-background/30 rounded-lg px-3 py-2 font-body-md text-on-surface-variant cursor-not-allowed w-full text-sm"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="font-label-bold text-xs uppercase mb-1 flex items-center gap-1">
                  <Briefcase size={11} /> Jenjang Jabatan
                </label>
                <input
                  type="text" disabled value={user.jenjangJabatan ?? ""}
                  className="bg-surface-container-highest border border-on-background/30 rounded-lg px-3 py-2 font-body-md text-on-surface-variant cursor-not-allowed w-full text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label-bold text-xs uppercase mb-1 flex items-center gap-1">
                  <Lock size={11} /> Role
                </label>
                <input
                  type="text" disabled value={user.role ?? ""}
                  className="bg-surface-container-highest border border-on-background/30 rounded-lg px-3 py-2 font-body-md text-on-surface-variant cursor-not-allowed w-full text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-label-bold text-xs uppercase mb-1 flex items-center gap-1">
                  {(user as any).tipeKerja === "SHIFT" ? <Moon size={11} /> : <Sun size={11} />} Kategori Kerja
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {(user as any).tipeKerja === "SHIFT" ? (
                    <span className="inline-flex items-center gap-1.5 font-label-bold text-sm px-3 py-1.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-300">
                      <Moon size={13} /> SHIFT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-label-bold text-sm px-3 py-1.5 rounded-full border bg-orange-50 text-orange-700 border-orange-300">
                      <Sun size={13} /> NON-SHIFT
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Editable: Kontak & Keamanan ── */}
          <div className="flex flex-col gap-4">
            <h2 className="font-label-bold text-xs uppercase text-on-surface-variant flex items-center gap-2">
              <Phone size={14} /> Kontak &amp; Keamanan
            </h2>

            <div className="flex flex-col">
              <label className="font-label-bold text-xs uppercase mb-2 flex items-center gap-1">
                <Phone size={11} /> Nomor Handphone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full border-2 border-on-background bg-surface-container-lowest rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-label-bold text-xs uppercase mb-2 flex items-center gap-1">
                <Mail size={11} /> Email Personal
              </label>
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="Contoh: nama@gmail.com"
                className="w-full border-2 border-on-background bg-surface-container-lowest rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-label-bold text-xs uppercase mb-2 flex items-center gap-1">
                <Lock size={11} /> Password Baru
                <span className="font-normal normal-case text-xs text-on-surface-variant ml-1">(opsional)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah"
                className="w-full border-2 border-on-background bg-surface-container-lowest rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-on-primary font-label-bold text-label-bold rounded-full px-6 py-4 mt-2 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
          </button>
        </form>
      </div>
    </main>
  );
}
