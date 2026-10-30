import { timingSafeEqual } from "node:crypto";
import { networkInterfaces } from "node:os";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveCard } from "@/lib/cardStore";
import { KIOSK_HEADER } from "@/lib/kioskKey";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5MB body limit
const PNG_SIG = [0x89, 0x50, 0x4e, 0x47];
// All kiosks at the venue share one public IP, so this has to cover every iPad together
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

let warnedNoSecret = false;

function kioskAllowed(req: Request) {
  const secret = process.env.KIOSK_SECRET;
  if (!secret) {
    if (!warnedNoSecret) {
      console.warn("KIOSK_SECRET is not set: POST /api/cards is open to anyone");
      warnedNoSecret = true;
    }
    return true;
  }
  const given = Buffer.from(req.headers.get(KIOSK_HEADER) ?? "");
  const want = Buffer.from(secret);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function POST(req: Request) {
  const limit = rateLimit(`cards:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  if (!kioskAllowed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const buf = await req.arrayBuffer();
  // Anything shorter than the PNG signature would also make the Uint8Array view below throw
  if (buf.byteLength < PNG_SIG.length || buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid size" }, { status: 413 });
  }
  const head = new Uint8Array(buf, 0, 4);
  if (!PNG_SIG.every((b, i) => head[i] === b)) {
    return NextResponse.json({ error: "PNG only" }, { status: 415 });
  }
  const id = nanoid(16);
  try {
    await saveCard(id, buf);
  } catch (err) {
    console.error("card upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }
  return NextResponse.json({ id, shareUrl: `${siteOrigin(req)}/c/${id}` });
}

// Base URL for the QR. Phones can't open "localhost", so when the kiosk runs on this Mac
// at localhost, swap in its Wi-Fi address (the phone must be on the same network).
function siteOrigin(req: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const url = new URL(req.url);
  if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    const lan = Object.values(networkInterfaces())
      .flat()
      .find((a) => a?.family === "IPv4" && !a.internal);
    if (lan) url.hostname = lan.address;
  }
  return url.origin;
}
