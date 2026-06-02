import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Find all approvers in the K3 chain by their role criteria
  console.log("=== Finding K3 Approvers ===\n");

  // Officer K3 (OFFICER + subBidang K3)
  const officerK3 = await prisma.user.findFirst({
    where: { role: "OFFICER", subBidang: "K3" },
    select: { id: true, nip: true, nama: true, role: true, subBidang: true, emailPerusahaan: true },
  });
  console.log("Officer K3:", JSON.stringify(officerK3));

  // Asman K3L (ASMAN + subBidang K3)
  const asmanK3 = await prisma.user.findFirst({
    where: { role: "ASMAN", subBidang: "K3" },
    select: { id: true, nip: true, nama: true, role: true, subBidang: true, emailPerusahaan: true },
  });
  console.log("Asman K3L:", JSON.stringify(asmanK3));

  // Manager Operasi (MANAGER + bidang OPERASI)
  const mgrOps = await prisma.user.findFirst({
    where: { role: "MANAGER", bidang: "OPERASI" },
    select: { id: true, nip: true, nama: true, role: true, bidang: true, emailPerusahaan: true },
  });
  console.log("Manager Operasi:", JSON.stringify(mgrOps));

  // Branch Manager
  const bm = await prisma.user.findFirst({
    where: { role: "BRANCH_MANAGER" },
    select: { id: true, nip: true, nama: true, role: true, emailPerusahaan: true },
  });
  console.log("Branch Manager:", JSON.stringify(bm));

  // Admin
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, nip: true, nama: true, role: true, emailPerusahaan: true },
  });
  console.log("Admin:", JSON.stringify(admin));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
