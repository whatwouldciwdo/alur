import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const bm = await (prisma as any).user.findMany({ where: { role: "BRANCH_MANAGER" } });
  console.log("BRANCH_MANAGER count:", bm.length);
  bm.forEach((u: any) => console.log(" -", u.nama, "|", u.nip, "|", u.bidang));

  const admin = await (prisma as any).user.findMany({ where: { role: "ADMIN" } });
  console.log("\nADMIN count:", admin.length);
  admin.forEach((u: any) => console.log(" -", u.nama, "|", u.nip, "|", u.bidang));

  const mgr = await (prisma as any).user.findMany({ where: { role: "MANAGER" } });
  console.log("\nMANAGER count:", mgr.length);
  mgr.forEach((u: any) => console.log(" -", u.nama, "|", u.nip, "|", u.bidang));

  await (prisma as any).$disconnect();
}

main().catch(console.error);
