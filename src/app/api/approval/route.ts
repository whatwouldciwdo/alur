import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const approvals = await prisma.approval.findMany({
    where: {
      approverId: session.user.id,
      status: "PENDING",
      lembur: { status: "PENDING" },
    },
    include: {
      lembur: {
        include: {
          user: {
            select: { nama: true, nip: true, jenjangJabatan: true, bidang: true, subBidang: true },
          },
          approvals: {
            orderBy: { step: "asc" },
            include: { approver: { select: { nama: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(approvals);
}
