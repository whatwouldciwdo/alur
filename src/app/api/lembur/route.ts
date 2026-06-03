import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkflowSteps, getTotalSteps } from "@/lib/workflow";
import { sendApprovalRequestEmail } from "@/lib/email";
import { uploadEvidensi } from "@/lib/supabase";
import { SubBidang, Kategori } from "@prisma/client";
import crypto from "crypto";
import { getClientIp, isOfficeIp, shouldBypassIpCheck } from "@/lib/ip";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function tokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

const BULAN_ROMAWI = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

async function generateNomorSpkl(tanggalMulai: Date): Promise<string> {
  const tahun = tanggalMulai.getFullYear();
  const bulanRomawi = BULAN_ROMAWI[tanggalMulai.getMonth()];

  // Count existing lembur this year to get sequence
  const count = await prisma.lembur.count({
    where: {
      nomorSpkl: { not: null },
      tanggalMulai: {
        gte: new Date(tahun, 0, 1),
        lt: new Date(tahun + 1, 0, 1),
      },
    },
  });

  const noUrut = String(count + 1).padStart(3, "0");
  return `${noUrut}/PLNIPS/SPKL/${bulanRomawi}/${tahun}/UNIT CILEGON`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lemburs = await prisma.lembur.findMany({
    where: { userId: session.user.id },
    include: {
      approvals: {
        include: { approver: { select: { nama: true, role: true } } },
        orderBy: { step: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(lemburs);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!shouldBypassIpCheck(session.user.role)) {
      const clientIp = getClientIp(req);
      if (!isOfficeIp(clientIp)) {
        console.warn(`[POST /api/lembur] Akses ditolak — IP: ${clientIp}, User: ${session.user.id}`);
        return NextResponse.json(
          { error: "Pengajuan hanya dapat dilakukan dari jaringan kantor." },
          { status: 403 }
        );
      }
    }

    const formData = await req.formData();
    const tanggalMulai   = formData.get("tanggalMulai") as string;
    const tanggalSelesai = formData.get("tanggalSelesai") as string;
    const deskripsi      = formData.get("deskripsi") as string;
    const penugas        = formData.get("penugas") as string | null;
    const kategoriRaw    = formData.get("kategori") as string | null;
    const evidentFile    = formData.get("evident") as File | null;

    if (!tanggalMulai || !tanggalSelesai || !deskripsi) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const kategori: Kategori =
      kategoriRaw === "PIKET" ? "PIKET" : "LEMBUR";

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    let evidentUrl: string | undefined;
    if (evidentFile && evidentFile.size > 0) {
      try {
        const bytes  = await evidentFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        evidentUrl   = await uploadEvidensi(buffer, evidentFile.name, evidentFile.type);
      } catch (uploadErr) {
        console.warn("[POST /api/lembur] Upload evidensi gagal, lanjut tanpa file:", uploadErr);
      }
    }

    const tanggalMulaiDate = new Date(tanggalMulai);
    const subBidang  = user.subBidang as SubBidang;
    const steps      = getWorkflowSteps(subBidang);
    const totalSteps = getTotalSteps(subBidang);
    const nomorSpkl  = await generateNomorSpkl(tanggalMulaiDate);

    const lembur = await prisma.lembur.create({
      data: {
        userId:        user.id,
        tanggalMulai:  tanggalMulaiDate,
        tanggalSelesai: new Date(tanggalSelesai),
        deskripsi,
        penugas:       penugas || null,
        evidentUrl,
        status:        "PENDING",
        currentStep:   1,
        totalSteps,
        nomorSpkl,
        kategori,
        submittedAt:   new Date(),
      },
    });

    await prisma.approval.createMany({
      data: steps.map((s) => ({
        lemburId:   lembur.id,
        approverId: user.id,
        step:       s.step,
        roleName:   s.roleName,
        status:     "PENDING",
        token:      generateToken(),
        expiresAt:  tokenExpiry(),
      })),
    });

    const firstStep     = steps[0];
    const firstApprover = await findApprover(firstStep, user.tlGroup ?? undefined);

    if (firstApprover) {
      await prisma.approval.updateMany({
        where: { lemburId: lembur.id, step: 1 },
        data:  { approverId: firstApprover.id },
      });

      const approval1 = await prisma.approval.findFirst({
        where: { lemburId: lembur.id, step: 1 },
      });

      if (approval1?.token) {
        await sendApprovalRequestEmail({
          to:             firstApprover.emailPersonal || firstApprover.emailPerusahaan,
          approverName:   firstApprover.nama,
          pegawaiName:    user.nama,
          subBidang:      user.subBidang,
          tanggalMulai:   lembur.tanggalMulai,
          tanggalSelesai: lembur.tanggalSelesai,
          deskripsi:      lembur.deskripsi,
          lemburId:       lembur.id,
          roleName:       firstStep.roleName,
          token:          approval1.token,
        });
      }
    }

    return NextResponse.json({ success: true, lemburId: lembur.id }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/lembur] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function findApprover(
  step: { requiredRole: string; bidang?: string; subBidang?: string },
  tlGroup?: string
) {
  const where: Record<string, string> = { role: step.requiredRole };
  if (step.subBidang) where.subBidang = step.subBidang;
  else if (step.bidang) where.bidang = step.bidang;
  if (step.requiredRole === "TL" && step.subBidang === "OPERATOR_SHIFT" && tlGroup) {
    where.tlGroup = tlGroup;
  }
  return await prisma.user.findFirst({ where });
}
