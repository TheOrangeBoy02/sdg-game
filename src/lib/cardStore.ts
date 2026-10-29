import "server-only";
import { head, put } from "@vercel/blob";

// Cards go to Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
// Without it (local dev / testing on the iPad over LAN) they are kept in memory.

const hasBlobToken = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const pathFor = (id: string) => `cards/${id}.png`;

type Mem = Map<string, Buffer>;
const g = globalThis as unknown as { __cards?: Mem };
const mem: Mem = (g.__cards ??= new Map());

export async function saveCard(id: string, data: ArrayBuffer) {
  if (hasBlobToken()) {
    await put(pathFor(id), data, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return;
  }
  mem.set(id, Buffer.from(data));
}

/** Public URL for the image, or null if not found */
export async function cardImageUrl(id: string): Promise<string | null> {
  if (hasBlobToken()) {
    try {
      const meta = await head(pathFor(id));
      return meta.url;
    } catch {
      return null;
    }
  }
  return mem.has(id) ? `/api/cards/${id}` : null;
}

/** PNG bytes of the card, or null if not found */
export async function cardImage(id: string): Promise<BodyInit | null> {
  if (hasBlobToken()) {
    const url = await cardImageUrl(id);
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? res.body : null;
  }
  const data = mem.get(id);
  return data ? new Uint8Array(data) : null;
}

export const cardFileName = (id: string) => `my-sdg-card-${id.slice(0, 6)}.png`;

export const ID_RE = /^[A-Za-z0-9_-]{10,32}$/;
