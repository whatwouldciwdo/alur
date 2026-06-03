import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientIp, isOfficeIp, isOfficePublicIp, shouldBypassIpCheck } from "@/lib/ip";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bypass = shouldBypassIpCheck(session.user.role);
  if (bypass) {
    return NextResponse.json({ isOffice: true, bypass: true });
  }

  const localIp = req.headers.get("x-local-ip") ?? "";
  const publicIp = getClientIp(req);

  const isOffice = isOfficeIp(localIp) || isOfficePublicIp(publicIp);

  return NextResponse.json({ isOffice, bypass: false });
}
