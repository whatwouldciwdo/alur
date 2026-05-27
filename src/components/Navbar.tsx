"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = !!session;

  return (
    <nav className="bg-surface-container-lowest fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-max md:max-w-max rounded-[2rem] border-2 border-on-background px-4 md:px-6 py-2 shadow-[4px_4px_0px_0px_rgba(27,28,28,1)] flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 z-50 transition-all">
      <div className="flex items-center justify-between w-full md:w-auto">
        <Link 
          className="font-headline-md text-headline-md text-on-surface uppercase whitespace-nowrap flex items-center gap-2 md:gap-3" 
          href={isLoggedIn ? "/dashboard" : "/"}
        >
          <img src="/image/Logo-PLN-Indonesiapower-Services.png" alt="PLN IP Services" className="h-5 md:h-6 object-contain" />
          <img src="/image/ranger-application-logo.jpg" alt="Ranger Logo" className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover border border-on-background" />
          <span className="hidden sm:inline">ALUR</span>
        </Link>
        
        {isLoggedIn && (
          <button 
            className="md:hidden flex items-center justify-center p-1 border-2 border-transparent focus:border-on-background rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>
      
      {isLoggedIn ? (
        <div className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center justify-center flex-grow gap-4 md:gap-6 font-label-bold text-label-bold uppercase text-on-surface w-full md:w-auto pt-4 md:pt-0 border-t-2 md:border-t-0 border-on-background md:border-transparent`}>
          <Link className={`hover:text-primary transition-colors duration-200 ${pathname === '/dashboard' ? 'text-primary' : ''}`} href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
            DASHBOARD
          </Link>
          <Link className={`hover:text-primary transition-colors duration-200 ${pathname === '/history' ? 'text-primary' : ''}`} href="/history" onClick={() => setIsMobileMenuOpen(false)}>
            HISTORY LEMBUR
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              className={`hover:text-primary transition-colors duration-200 ${pathname === '/admin' ? 'text-primary' : ''}`}
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ADMIN PANEL
            </Link>
          )}
          {session?.user?.role === "SUPER_ADMIN" && (
            <Link
              className={`hover:text-purple-600 transition-colors duration-200 ${pathname === '/superadmin' ? 'text-purple-600' : ''}`}
              href="/superadmin"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              SUPER ADMIN
            </Link>
          )}
          <div className="flex items-center gap-4 mt-2 md:mt-0 ml-auto md:ml-0">
            <Link href="/profile" className="flex items-center justify-center bg-surface-variant text-on-surface border-2 border-on-background rounded-full p-1.5 hard-shadow hard-shadow-hover hard-shadow-active transition-all" title="Profile" onClick={() => setIsMobileMenuOpen(false)}>
              <User size={24} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 font-label-bold text-label-bold uppercase">
          <Link href="/" className="bg-primary text-on-primary border-2 border-on-background rounded-full px-4 py-1 hard-shadow hard-shadow-hover hard-shadow-active transition-all block text-sm md:text-base">
            LOGIN
          </Link>
        </div>
      )}
    </nav>
  );
}
