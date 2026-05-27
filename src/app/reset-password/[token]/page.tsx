"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<"success" | "error" | null>(null);
  const [message, setMessage]       = useState("");

  const isMatch  = confirm === password;
  const isStrong = password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStrong || !isMatch) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult("success");
        setMessage(data.message);
        setTimeout(() => router.push("/"), 2500);
      } else {
        setResult("error");
        setMessage(data.error ?? "Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/image/Logo-PLN-Indonesiapower-Services.png" alt="PLN" className="h-8 object-contain" />
          <img src="/image/ranger-application-logo.jpg" alt="ALUR" className="w-10 h-10 rounded-full object-cover border-2 border-on-background" />
        </div>

        <div className="bg-surface-container-lowest border-2 border-on-background rounded-[2rem] p-8 hard-shadow">
          {result === "success" ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary-container border-2 border-on-background flex items-center justify-center">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h1 className="font-headline-md text-xl font-bold uppercase">Password Berhasil!</h1>
              <p className="text-on-surface-variant text-sm">{message}</p>
              <p className="text-xs text-on-surface-variant animate-pulse">Mengalihkan ke halaman login...</p>
            </div>
          ) : result === "error" ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-error-container border-2 border-on-background flex items-center justify-center">
                <XCircle size={32} className="text-error" />
              </div>
              <h1 className="font-headline-md text-xl font-bold uppercase">Link Tidak Valid</h1>
              <p className="text-on-surface-variant text-sm">{message}</p>
              <p className="text-xs text-on-surface-variant">Link reset password sudah kadaluarsa atau telah digunakan. Hubungi Super Admin untuk mendapatkan link baru.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-container border-2 border-on-background flex items-center justify-center">
                  <Lock size={20} className="text-on-primary" />
                </div>
                <div>
                  <h1 className="font-headline-md text-lg font-bold uppercase leading-tight">Reset Password</h1>
                  <p className="text-xs text-on-surface-variant uppercase font-label-bold">ALUR — Absen Lembur Ranger</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Password Baru */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-bold text-xs uppercase text-on-surface-variant">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Minimal 8 karakter"
                      className="w-full border-2 border-on-background bg-surface-variant rounded-xl px-4 py-3 pr-12 font-body-md text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && !isStrong && (
                    <p className="text-xs text-error font-label-bold">Password minimal 8 karakter.</p>
                  )}
                </div>

                {/* Konfirmasi Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-bold text-xs uppercase text-on-surface-variant">
                    Konfirmasi Password
                  </label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Ulangi password baru"
                    className={`w-full border-2 bg-surface-variant rounded-xl px-4 py-3 font-body-md text-sm focus:outline-none transition-colors ${
                      confirm && !isMatch ? "border-error focus:border-error" : "border-on-background focus:border-primary"
                    }`}
                  />
                  {confirm && !isMatch && (
                    <p className="text-xs text-error font-label-bold">Password tidak cocok.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isStrong || !isMatch}
                  className="mt-2 bg-primary text-on-primary font-label-bold text-sm rounded-full py-3.5 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "MEMPROSES..." : "SIMPAN PASSWORD BARU"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
