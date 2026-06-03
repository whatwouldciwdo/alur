import { createHmac, timingSafeEqual } from "crypto";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinOffice(lat: number, lng: number): boolean {
  const officeLat = parseFloat(process.env.OFFICE_LAT ?? "");
  const officeLng = parseFloat(process.env.OFFICE_LNG ?? "");
  const radius = parseFloat(process.env.OFFICE_RADIUS_METERS ?? "300");

  if (isNaN(officeLat) || isNaN(officeLng)) {
    console.warn("[location] OFFICE_LAT/OFFICE_LNG tidak diset");
    return false;
  }

  const distance = haversineDistance(lat, lng, officeLat, officeLng);
  return distance <= radius;
}

export function validateGpsIntegrity(
  accuracy: number,
  timestamp: number
): { valid: boolean; reason?: string } {
  if (accuracy <= 0) return { valid: false, reason: "accuracy_zero" };
  if (accuracy < 1) return { valid: false, reason: "accuracy_unrealistic" };
  if (accuracy > 300) return { valid: false, reason: "accuracy_too_poor" };

  const now = Date.now();
  const age = now - timestamp;
  if (age < 0) return { valid: false, reason: "future_timestamp" };
  if (age > 30_000) return { valid: false, reason: "stale_location" };

  return { valid: true };
}

function getSecret(): string {
  const secret = process.env.LOCATION_TOKEN_SECRET;
  if (!secret) throw new Error("[location] LOCATION_TOKEN_SECRET tidak diset");
  return secret;
}

export function signLocationToken(
  lat: number,
  lng: number,
  userId: string,
  timestamp: number
): string {
  const payload = `${lat.toFixed(6)},${lng.toFixed(6)},${userId},${timestamp}`;
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function verifyLocationToken(
  lat: number,
  lng: number,
  userId: string,
  timestamp: number,
  token: string
): boolean {
  try {
    const expected = signLocationToken(lat, lng, userId, timestamp);
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isTokenExpired(timestamp: number): boolean {
  return Date.now() - timestamp > 10 * 60 * 1000;
}

const BYPASS_ROLES = ["ADMIN", "SUPERADMIN"] as const;

export function shouldBypassLocationCheck(role: string | undefined | null): boolean {
  return BYPASS_ROLES.includes(role as (typeof BYPASS_ROLES)[number]);
}
