import { createHash, timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { readOpen, writeOpen } from "@/lib/status-store";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 10 * 60 * 1000;
// Best-effort brute-force protection (per server instance).
const failures = new Map<string, { count: number; until: number }>();

function pinMatches(pin: string) {
  const expected = process.env.ADMIN_PIN;
  if (!expected) return false;
  // Compare hashes so the comparison is constant-time and length-independent.
  const a = createHash("sha256").update(pin).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET() {
  await connection();
  return Response.json({ open: await readOpen() }, { headers: { "Cache-Control": "no-store" } });
}

/** Body: { pin: string, open?: boolean }. Without `open`, only checks the PIN (used to unlock). */
export async function POST(request: Request) {
  if (!process.env.ADMIN_PIN) {
    return Response.json({ error: "ADMIN_PIN is not configured on the server." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const record = failures.get(ip);
  if (record && record.until > Date.now()) {
    const minutes = Math.ceil((record.until - Date.now()) / 60000);
    return Response.json(
      { error: `Too many wrong PINs. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { pin?: unknown; open?: unknown };
  if (typeof body.pin !== "string" || !pinMatches(body.pin)) {
    const count = (record && record.until <= Date.now() && record.count >= MAX_ATTEMPTS ? 0 : (record?.count ?? 0)) + 1;
    failures.set(ip, { count, until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 });
    return Response.json({ error: "Wrong PIN." }, { status: 401 });
  }
  failures.delete(ip);

  if (typeof body.open === "boolean") await writeOpen(body.open);
  return Response.json({ open: await readOpen() }, { headers: { "Cache-Control": "no-store" } });
}
