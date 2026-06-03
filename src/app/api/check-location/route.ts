import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  isWithinOffice,
  validateGpsIntegrity,
  signLocationToken,
  shouldBypassLocationCheck,
} from "@/lib/location";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (shouldBypassLocationCheck(session.user.role)) {
    const token = signLocationToken(0, 0, session.user.id, Date.now());
    return NextResponse.json({ isOffice: true, bypass: true, token });
  }

  let body: { lat?: number; lng?: number; accuracy?: number; timestamp?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { lat, lng, accuracy, timestamp } = body;

  if (typeof lat !== "number" || typeof lng !== "number" ||
      typeof accuracy !== "number" || typeof timestamp !== "number") {
    return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
  }

  const integrity = validateGpsIntegrity(accuracy, timestamp);
  if (!integrity.valid) {
    return NextResponse.json({ isOffice: false, reason: integrity.reason }, { status: 422 });
  }

  const officeLat = parseFloat(process.env.OFFICE_LAT ?? "");
  const officeLng = parseFloat(process.env.OFFICE_LNG ?? "");
  const radius = parseFloat(process.env.OFFICE_RADIUS_METERS ?? "300");

  const inOffice = isWithinOffice(lat, lng);
  if (!inOffice) {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(officeLat - lat);
    const dLng = toRad(officeLng - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(officeLat)) * Math.sin(dLng / 2) ** 2;
    const distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    return NextResponse.json({ isOffice: false, debug: { userLat: lat, userLng: lng, officeLat, officeLng, distanceMeters: distance, radiusMeters: radius } });
  }

  const token = signLocationToken(lat, lng, session.user.id, timestamp);
  return NextResponse.json({ isOffice: true, bypass: false, token });
}
