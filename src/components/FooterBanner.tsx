"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FooterBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = document.cookie.includes("alur_cookie_accepted=true");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    document.cookie = "alur_cookie_accepted=true; max-age=31536000; path=/";
    setIsVisible(false);
  };
  if (!isVisible || pathname.startsWith("/validate")) return null;

  return (
    <div className="bg-surface fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 md:w-80 rounded-[1.5rem] border-2 border-on-background p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(27,28,28,1)] flex flex-col gap-4 z-50">
      <p className="font-label-bold text-label-bold text-primary mb-2 text-center md:text-left">
        © 2026 PLN INDONESIA POWER SERVICES - UBP CILEGON
      </p>
      <div className="flex flex-col gap-3 font-label-bold text-label-bold uppercase">
        <button 
          onClick={handleClose}
          className="w-full border-2 border-on-background text-on-background rounded-full px-4 py-2 hover:translate-x-[1px] hover:translate-y-[1px] transition-transform active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
        >
          DISMISS
        </button>
        <button 
          onClick={handleClose}
          className="w-full bg-primary text-on-primary rounded-full px-6 py-2 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all"
        >
          ACCEPT
        </button>
      </div>
    </div>
  );
}
