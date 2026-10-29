import { cardFileName, cardImage, ID_RE } from "@/lib/cardStore";

export const runtime = "nodejs";

// Same-origin copy of the card image. The share page fetches it for Web Share and links to it
// with ?download=1 for a plain download, so neither depends on Blob CORS headers.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_RE.test(id)) return new Response("Not found", { status: 404 });
  const body = await cardImage(id);
  if (!body) return new Response("Not found", { status: 404 });
  const headers: Record<string, string> = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (new URL(req.url).searchParams.has("download")) {
    headers["Content-Disposition"] = `attachment; filename="${cardFileName(id)}"`;
  }
  return new Response(body, { headers });
}
