import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientIp, isOfficeIp, shouldBypassIpCheck } from "@/lib/ip";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const bypass = shouldBypassIpCheck(session.user.role);
  const isOffice = bypass ? true : isOfficeIp(ip);

  const debug = {
    detectedIp: ip,
    "x-nf-client-connection-ip": req.headers.get("x-nf-client-connection-ip"),
    "x-real-ip": req.headers.get("x-real-ip"),
    "x-forwarded-for": req.headers.get("x-forwarded-for"),
    officeRanges: process.env.OFFICE_IP_RANGES ?? "(tidak diset)",
  };

  return NextResponse.json({ ip, isOffice, bypass, debug });
}
