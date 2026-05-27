import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const managers = await prisma.user.findMany({
    where: {
      role: { in: ["ASMAN", "MANAGER"] },
    },
    select: {
      id: true,
      nama: true,
      role: true,
      jenjangJabatan: true,
    },
    orderBy: [
      { role: "asc" },
      { nama: "asc" },
    ],
  });

  return NextResponse.json(managers);
}
