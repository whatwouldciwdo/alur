import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isSuperAdmin(role?: string) {
  return role === "SUPER_ADMIN";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, nip: true, nama: true, jenjangJabatan: true,
      bidang: true, subBidang: true, role: true,
      emailPerusahaan: true, emailPersonal: true, phone: true, tlGroup: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const {
    nama, nip, jenjangJabatan, bidang, subBidang,
    role, emailPerusahaan, emailPersonal, phone, tlGroup,
    newPassword,
  } = body;

  if (nip) {
    const existing = await prisma.user.findFirst({ where: { nip, NOT: { id } } });
    if (existing) return NextResponse.json({ error: "NIP sudah digunakan user lain." }, { status: 409 });
  }
  if (emailPerusahaan) {
    const existing = await prisma.user.findFirst({ where: { emailPerusahaan, NOT: { id } } });
    if (existing) return NextResponse.json({ error: "Email perusahaan sudah digunakan user lain." }, { status: 409 });
  }

  const data: Record<string, any> = {};
  if (nama            !== undefined) data.nama            = nama;
  if (nip             !== undefined) data.nip             = nip;
  if (jenjangJabatan  !== undefined) data.jenjangJabatan  = jenjangJabatan;
  if (bidang          !== undefined) data.bidang          = bidang;
  if (subBidang       !== undefined) data.subBidang       = subBidang;
  if (role            !== undefined) data.role            = role;
  if (emailPerusahaan !== undefined) data.emailPerusahaan = emailPerusahaan;
  if (emailPersonal   !== undefined) data.emailPersonal   = emailPersonal;
  if (phone           !== undefined) data.phone           = phone;
  if (tlGroup         !== undefined) data.tlGroup         = tlGroup;
  if (newPassword)                   data.password        = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true, nip: true, nama: true, jenjangJabatan: true,
      bidang: true, subBidang: true, role: true,
      emailPerusahaan: true, emailPersonal: true, phone: true, tlGroup: true,
    },
  });

  return NextResponse.json(updated);
}
