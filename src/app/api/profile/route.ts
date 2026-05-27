import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { nomorHp, emailPersonal, password } = body;

  const updateData: Record<string, string> = {};
  if (nomorHp)      updateData.nomorHp      = nomorHp;
  if (emailPersonal) updateData.emailPersonal = emailPersonal;
  if (password)     updateData.password     = await bcrypt.hash(password, 10);

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "Tidak ada perubahan." });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  return NextResponse.json({ message: "Profil berhasil diperbarui." });
}
