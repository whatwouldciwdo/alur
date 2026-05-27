import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 30) + "...");

  const user = await prisma.user.findUnique({ where: { nip: "8912345Z" } });
  console.log("\nUSER 8912345Z FOUND:", user ? "YA" : "TIDAK");
  if (user) {
    console.log("  Nama:", user.nama);
    console.log("  Hash exists:", !!user.password);
    const valid = await bcrypt.compare("password123", user.password!);
    console.log("  Password match:", valid);
  }

  const u2 = await prisma.user.findUnique({ where: { nip: "1793259708" } });
  console.log("\nFirmanulloh (1793259708) FOUND:", u2 ? "YA" : "TIDAK");
  if (u2) {
    const valid2 = await bcrypt.compare("password123", u2.password!);
    console.log("  Password match:", valid2);
  }

  await (prisma as any).$disconnect();
}

main().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
