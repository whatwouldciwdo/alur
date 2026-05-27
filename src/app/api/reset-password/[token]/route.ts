import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { password } = await req.json();

  if (!password || password.length < 8)
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });

  let payload: { userId: string; purpose: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return NextResponse.json({ error: "Link tidak valid atau sudah kadaluarsa." }, { status: 400 });
  }

  if (payload.purpose !== "password-reset")
    return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: payload.userId },
    data: { password: hashed },
  });

  return NextResponse.json({ message: "Password berhasil diperbarui. Silakan login." });
}
