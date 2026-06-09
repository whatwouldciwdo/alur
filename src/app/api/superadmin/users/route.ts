import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isSuperAdmin(role?: string) {
  return role === "SUPER_ADMIN";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const bidang = searchParams.get("bidang") ?? "";
  const role   = searchParams.get("role") ?? "";

  const users = await prisma.user.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { nama: { contains: search, mode: "insensitive" } },
                { nip:  { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        bidang ? { bidang: bidang as any } : {},
        role   ? { role:   role as any   } : {},
      ],
    },
    select: {
      id:              true,
      nip:             true,
      nama:            true,
      jenjangJabatan:  true,
      bidang:          true,
      subBidang:       true,
      role:            true,
      emailPerusahaan: true,
      emailPersonal:   true,
      phone:           true,
      tlGroup:         true,
      tipeKerja:       true,
      createdAt:       true,
      _count: { select: { lemburs: true } },
    },
    orderBy: [{ bidang: "asc" }, { nama: "asc" }],
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    nip, nama, jenjangJabatan, bidang, subBidang,
    role, emailPerusahaan, emailPersonal, phone, tlGroup, password,
  } = body;

  if (!nip || !nama || !jenjangJabatan || !bidang || !subBidang || !role || !emailPerusahaan || !password)
    return NextResponse.json({ error: "Field wajib tidak lengkap." }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });

  const dupNip   = await prisma.user.findUnique({ where: { nip } });
  if (dupNip)    return NextResponse.json({ error: "NIP sudah digunakan." }, { status: 409 });
  const dupEmail = await prisma.user.findUnique({ where: { emailPerusahaan } });
  if (dupEmail)  return NextResponse.json({ error: "Email perusahaan sudah digunakan." }, { status: 409 });

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      nip, nama, jenjangJabatan,
      bidang:          bidang as any,
      subBidang:       subBidang as any,
      role:            role as any,
      emailPerusahaan,
      emailPersonal:   emailPersonal || null,
      phone:           phone || null,
      tlGroup:         tlGroup || null,
      tipeKerja:       (body.tipeKerja ?? "NON_SHIFT") as any,
      password:        hashed,
    },
    select: {
      id: true, nip: true, nama: true, jenjangJabatan: true,
      bidang: true, subBidang: true, role: true,
      emailPerusahaan: true, emailPersonal: true, phone: true,
      tlGroup: true, tipeKerja: true,
      createdAt: true, _count: { select: { lemburs: true } },
    },
  });

  return NextResponse.json(user, { status: 201 });
}
