import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        nip: { label: "NIP", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.nip || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { nip: credentials.nip },
          });

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            nip: user.nip,
            name: user.nama,
            email: user.emailPerusahaan,
            role: user.role,
            bidang: user.bidang,
            subBidang: user.subBidang,
            jenjangJabatan: user.jenjangJabatan,
            tlGroup: user.tlGroup ?? undefined,
            tipeKerja: user.tipeKerja,
          };
        } catch (err) {
          // Log error without exposing sensitive info
          if (process.env.NODE_ENV === 'development') {
            console.error("[auth] ERROR in authorize:", err);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nip = (user as any).nip;
        token.role = (user as any).role;
        token.bidang = (user as any).bidang;
        token.subBidang = (user as any).subBidang;
        token.jenjangJabatan = (user as any).jenjangJabatan;
        token.tlGroup = (user as any).tlGroup;
        token.tipeKerja = (user as any).tipeKerja;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.nip = token.nip as string;
      session.user.role = token.role as string;
      session.user.bidang = token.bidang as string;
      session.user.subBidang = token.subBidang as string;
      session.user.jenjangJabatan = token.jenjangJabatan as string;
      session.user.tlGroup = token.tlGroup as string | undefined;
      (session.user as any).tipeKerja = token.tipeKerja as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
