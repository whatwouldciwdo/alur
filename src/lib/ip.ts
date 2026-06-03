import { NextRequest } from "next/server";

function ipToInt(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isInCidr(ip: string, cidr: string): boolean {
  if (ip.includes(":")) return false;

  const [range, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);

  if (isNaN(bits) || bits < 0 || bits > 32) return false;

  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
}

function getOfficeRanges(): string[] {
  const raw = process.env.OFFICE_IP_RANGES ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isOfficeIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;

  const ranges = getOfficeRanges();
  if (ranges.length === 0) {
    console.warn("[ip] OFFICE_IP_RANGES tidak diset");
    return true;
  }

  return ranges.some((cidr) => isInCidr(ip, cidr));
}

export function getClientIp(req: NextRequest): string {
  const nfIp = req.headers.get("x-nf-client-connection-ip");
  if (nfIp) return nfIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

const BYPASS_ROLES = ["ADMIN", "SUPERADMIN"] as const;

export function shouldBypassIpCheck(role: string | undefined | null): boolean {
  return BYPASS_ROLES.includes(role as (typeof BYPASS_ROLES)[number]);
}
