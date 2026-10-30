import "server-only";
import { get, head, put } from "@vercel/blob";

// Cards go to Vercel Blob when it is configured (read-write token, or BLOB_STORE_ID with Vercel's
// OIDC token), and always on Vercel, where memory is per instance and would lose cards.
// Otherwise (local dev / testing on the iPad over LAN) they are kept in memory.
// The store is private, so images are only ever served through /api/cards/<id>.

const hasBlobToken = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID || process.env.VERCEL);
const pathFor = (id: string) => `cards/${id}.png`;

type Mem = Map<string, Buffer>;
const g = globalThis as unknown as { __cards?: Mem };
const mem: Mem = (g.__cards ??= new Map());

export async function saveCard(id: string, data: ArrayBuffer) {
  if (hasBlobToken()) {
    await put(pathFor(id), data, {
      access: "private",
      contentType: "image/png",
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return;
  }
  mem.set(id, Buffer.from(data));
}

export async function cardExists(id: string): Promise<boolean> {
  if (hasBlobToken()) {
    try {
      await head(pathFor(id));
      return true;
    } catch {
      return false;
    }
  }
  return mem.has(id);
}

/** PNG bytes of the card, or null if not found */
export async function cardImage(id: string): Promise<BodyInit | null> {
  if (hasBlobToken()) {
    const res = await get(pathFor(id), { access: "private" });
    return res?.statusCode === 200 ? res.stream : null;
  }
  const data = mem.get(id);
  return data ? new Uint8Array(data) : null;
}

export const cardFileName = (id: string) => `my-sdg-card-${id.slice(0, 6)}.png`;

export const ID_RE = /^[A-Za-z0-9_-]{10,32}$/;
