import "server-only";

// Fixed-window counter per key, kept in memory. On Vercel each instance has its
// own memory, so this is best effort: it stops bursts, not a distributed attack.

type Window = { start: number; count: number };
const g = globalThis as unknown as { __rate?: Map<string, Window> };
const windows = (g.__rate ??= new Map());

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (windows.size > 5000) {
    for (const [k, w] of windows) if (now - w.start >= windowMs) windows.delete(k);
  }
  const w = windows.get(key);
  if (!w || now - w.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    return { ok: true, retryAfter: 0 };
  }
  w.count += 1;
  if (w.count > limit) {
    return { ok: false, retryAfter: Math.ceil((w.start + windowMs - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
