import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Search for Ahmad Yani
  const users = await prisma.user.findMany({
    where: { nama: { contains: "Yani", mode: "insensitive" } },
    select: { nip: true, nama: true, bidang: true, subBidang: true, role: true, emailPerusahaan: true },
  });
  console.log("=== SEARCH AHMAD YANI ===");
  console.log(JSON.stringify(users, null, 2));

  // Also list all users to check
  const allUsers = await prisma.user.findMany({
    select: { nip: true, nama: true, role: true },
    orderBy: { nama: "asc" },
  });
  console.log("\n=== ALL USERS ===");
  for (const u of allUsers) {
    console.log(`${u.nip.padEnd(15)} | ${u.role.padEnd(16)} | ${u.nama}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
