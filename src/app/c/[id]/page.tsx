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
    <main className="share-page mx-auto flex min-h-dvh max-w-md flex-col items-center gap-4 px-[max(1rem,env(safe-area-inset-left))] pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white">
      <div className="flex items-center gap-3 self-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-white.png" alt="Standard Bank" className="h-6 w-auto" />
        <span className="h-8 w-px bg-white/30" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ACADEMY_LOGO} alt="Sustainability Academy" className="h-11 w-auto" />
      </div>
      <div className="self-start">
        <h1 className="text-2xl font-bold leading-tight">Your impact card is ready</h1>
        <p className="mt-1 text-base text-white/75">Save it to your phone and share it.</p>
      </div>
      {/* Capped by height so the save button stays above the fold */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Your personalised SDG card"
        className="h-auto w-full max-w-[calc(48dvh*0.8)] rounded-2xl shadow-2xl"
        width={1080}
        height={1350}
      />
      <ShareActions imageUrl={`/api/cards/${id}`} fileName={cardFileName(id)} />
      <p className="mt-2 text-sm font-bold text-white/70">Post it with {EVENT.hashtag}</p>
    </main>
  );
}
