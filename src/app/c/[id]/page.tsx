import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cardFileName, cardImageUrl, ID_RE } from "@/lib/cardStore";
import { ACADEMY_LOGO, EVENT } from "@/lib/content";
import ShareActions from "./ShareActions";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

async function getUrl(id: string) {
  if (!ID_RE.test(id)) return null;
  return cardImageUrl(id);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const url = await getUrl(id);
  return {
    title: `My SDG card | ${EVENT.title}`,
    description: EVENT.subtitle,
    robots: { index: false },
    openGraph: url ? { images: [{ url, width: 1080, height: 1350 }] } : undefined,
  };
}

export default async function CardPage({ params }: Params) {
  const { id } = await params;
  const url = await getUrl(id);
  if (!url) notFound();

  return (
    <main className="share-page mx-auto flex min-h-dvh max-w-md flex-col items-center gap-5 px-4 py-6 text-white">
      <div className="flex items-center gap-4 self-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-white.png" alt="Standard Bank" className="h-8 w-auto" />
        <span className="h-10 w-px bg-white/30" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ACADEMY_LOGO} alt="Sustainability Academy" className="h-16 w-auto" />
      </div>
      <h1 className="self-start text-2xl font-bold leading-tight">Your impact card is ready</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Your personalised SDG card"
        className="w-full rounded-2xl shadow-2xl"
        width={1080}
        height={1350}
      />
      <ShareActions imageUrl={`/api/cards/${id}`} fileName={cardFileName(id)} />
      <p className="text-center text-sm text-white/60">
        Tip: on iPhone, tap Share, then &quot;Save Image&quot;. You can also press and hold the image.
      </p>
      <p className="text-sm font-bold text-white/70">{EVENT.hashtag}</p>
    </main>
  );
}
