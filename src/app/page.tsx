"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nip || !password) {
      setError("NIP dan Password tidak boleh kosong.");
      return;
    }

    setIsLoading(true);

    const result = await signIn("credentials", {
      nip,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("NIP atau Password salah. Silakan coba lagi.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-center justify-center flex-grow relative pt-32 pb-24 min-h-screen overflow-x-hidden">
      {/* Logo Artwork */}
      <div className="relative flex flex-col items-center justify-center mb-12 md:mb-16 w-full">
        <h1 className="font-display-lg text-4xl sm:text-5xl md:text-display-lg text-on-background uppercase tracking-tight leading-none text-center break-words px-2">
          ABSEN LEMBUR RANGER
        </h1>
        <p className="font-body-lg text-on-surface-variant text-center max-w-2xl mt-4 md:mt-6 px-4">
          Sistem informasi digital terpadu untuk pencatatan dan persetujuan absensi lembur bagi Ranger PLN Indonesia Power Services - UBP Cilegon.
        </p>
      </div>

      {/* Main Content Container: Left Image, Right Form */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 w-full max-w-5xl mt-2 md:mt-4">

        {/* Left: Illustration */}
        <div className="relative w-full max-w-[16rem] md:max-w-sm flex items-center justify-center">
          <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-on-background rounded-[2rem] md:rounded-[3rem] bg-surface-container-lowest hard-shadow relative overflow-hidden flex items-center justify-center p-6 md:p-8 group transition-transform duration-500 hover:rotate-3">
            <img
              alt="Minimalist 2D line-art illustration of a person clocking in with ALUR text"
              className="w-full h-full object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-euNsdpfKx5UrwHcB6HamkK6L7bs7_8oPbalz06a3A20NOMXuMtF_m66XQ4s1fj5xhYS5k4siCHc_9UGUTWywktp-KoO5Njng8vlsvJCWclziTYoEURjblsbPfC83L2sLzwHzhk6SPYzUGZeDPXsPHy7aVbP1iTyp_iwN9SeypW1tFlOunLyTiHTg9fahUkpMI1mIVakqphGWagyd8DJDKBxKV-wZtfw7VlPtr_Jq9cZYtziPXYogQbAN1KXMtf-UqNQpEHZzunIH"
            />
          </div>
        </div>

        {/* Right: Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-xs gap-4 px-4 md:px-0">
          {error && (
            <div className="text-error font-body-md bg-error-container px-4 py-2 rounded-lg w-full text-center border-2 border-on-background">
              {error}
            </div>
          )}
          <input
            type="text"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="NIP / Username"
            className="w-full border-2 border-on-background bg-surface-container-lowest rounded-full px-6 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary hard-shadow transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border-2 border-on-background bg-surface-container-lowest rounded-full px-6 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-primary hard-shadow transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-container text-on-primary font-label-bold text-label-bold rounded-full px-6 py-3 mt-4 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "LOADING..." : "SIGN IN"}
          </button>
        </form>
      </div>
    </main>
  );
}
