import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, getBaseUrl } from "@/lib/email";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nama: true, emailPersonal: true, emailPerusahaan: true },
  });

  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const targetEmail = user.emailPersonal ?? user.emailPerusahaan;
  if (!targetEmail)
    return NextResponse.json({ error: "User tidak memiliki email yang dapat dihubungi." }, { status: 400 });

  const token = jwt.sign(
    { userId: user.id, purpose: "password-reset" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const base = getBaseUrl();
  const resetUrl = `${base}/reset-password/${token}`;

  await sendPasswordResetEmail({
    to: targetEmail,
    pegawaiName: user.nama,
    resetUrl,
  });

  return NextResponse.json({
    message: `Link reset password berhasil dikirim ke ${targetEmail}`,
    email: targetEmail,
  });
}
