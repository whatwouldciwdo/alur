import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import FooterBanner from "@/components/FooterBanner";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALUR — Absen Lembur Ranger",
  description: "Sistem informasi absensi lembur Ranger PLN Indonesia Power Services UBP Cilegon",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id">
      <body className="bg-background text-on-background min-h-screen flex flex-col">
        <SessionProvider session={session}>
          <Navbar />
          <div className="flex flex-col flex-grow">{children}</div>
          <FooterBanner />
        </SessionProvider>
      </body>
    </html>
  );
}
