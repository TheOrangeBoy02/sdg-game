"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Theme } from "@/lib/content";
import { canvasToBlob, renderCard } from "@/lib/card";
import { KIOSK_HEADER, kioskKey } from "@/lib/kioskKey";
import type { Stroke } from "@/lib/strokes";

type Upload =
  | { status: "working" }
  | { status: "ready"; url: string }
  | { status: "error"; noKey?: boolean };

export default function Reveal({
  theme,
  strokes,
  name,
  onNext,
}: {
  theme: Theme;
  strokes: Stroke[];
  name: string;
  onNext: () => void;
}) {
  const [drum, setDrum] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [upload, setUpload] = useState<Upload>({ status: "working" });
  const blobRef = useRef<Blob | null>(null);

  const send = useCallback(async () => {
    if (!blobRef.current) return;
    setUpload({ status: "working" });
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "image/png", [KIOSK_HEADER]: kioskKey() ?? "" },
        body: blobRef.current,
      });
      if (res.status === 401) {
        setUpload({ status: "error", noKey: true });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const { shareUrl } = (await res.json()) as { shareUrl: string };
      setUpload({ status: "ready", url: shareUrl });
    } catch {
      setUpload({ status: "error" });
    }
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    (async () => {
      const canvas = await renderCard({ theme, strokes, name });
      const blob = await canvasToBlob(canvas);
      if (cancelled) return;
      blobRef.current = blob;
      objectUrl = URL.createObjectURL(blob);
      setPreview(objectUrl);
      send();
    })().catch(() => setUpload({ status: "error" }));
    const t = window.setTimeout(() => setDrum(false), 1900);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [theme, strokes, name, send]);

  if (drum) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center pb-[8vh]">
        <p className="animate-rise text-[3vh] font-bold uppercase tracking-[0.3em] text-white/70">
          {name ? `${name}, your impact is...` : "Your impact is..."}
        </p>
        <div className="mt-[4vh] flex gap-[1.5vw]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-[3vh] w-[3vh] animate-bounce rounded-full bg-white"
              style={{ animationDelay: `${i * 140}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center gap-[4vw] px-[5vw] pb-[4vh]">
      <div className="animate-pop h-[80vh] shrink-0" style={{ aspectRatio: "4 / 5" }}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your SDG card" className="h-full w-full rounded-[2.4vh] ring-[1vh] ring-white" />
        ) : (
          <div className="h-full w-full animate-pulse rounded-[2.4vh] bg-white/10" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="animate-rise text-[2.6vh] font-bold uppercase tracking-[0.25em] text-white/70">
          {name ? `${name}, meet the` : "Meet the"}
        </p>
        <h2
          className="animate-rise text-[7.5vh] font-bold uppercase leading-[0.95]"
          style={{ color: theme.color, animationDelay: "120ms" }}
        >
          {theme.identity}
        </h2>
        <p className="animate-rise mt-[2vh] text-[2.5vh] leading-snug text-white/85" style={{ animationDelay: "220ms" }}>
          {theme.belief}
        </p>
        <p className="animate-rise mt-[1vh] text-[2.5vh] font-bold leading-snug" style={{ animationDelay: "300ms" }}>
          Your mission: {theme.mission}
        </p>
      

        <div
          className="animate-rise mt-[3vh] flex items-center gap-[2vw] rounded-[3vh] bg-white p-[2vh] text-stature"
          style={{ animationDelay: "450ms" }}
        >
          <div className="flex h-[22vh] w-[22vh] shrink-0 items-center justify-center">
            {upload.status === "ready" ? (
              <QRCodeSVG value={upload.url} size={512} level="M" className="h-full w-full" />
            ) : upload.status === "error" ? (
              <button
                onClick={send}
                className="rounded-full bg-stature px-[2vw] py-[1.6vh] text-[2.2vh] font-bold text-white active:scale-95"
              >
                Retry
              </button>
            ) : (
              <div className="h-[8vh] w-[8vh] animate-spin rounded-full border-[0.8vh] border-stature/20 border-t-stature" />
            )}
          </div>
          <div>
            <p className="text-[3vh] font-bold leading-tight">
              {upload.status === "error" ? "Couldn't create your QR code" : "Scan to save & share your card"}
            </p>
            <p className="mt-[1vh] text-[2vh] leading-snug text-stature/70">
              {upload.status === "error"
                ? upload.noKey
                  ? "This iPad isn't set up for uploads yet. Ask a crew member."
                  : "Check the connection and tap Retry, or ask a crew member."
                : "Open your phone camera and point it at the code."}
            </p>
          </div>
        </div>

        <div className="mt-[3vh] flex gap-[1.5vw]">
          {preview && (
            <a
              href={preview}
              download={`${name ? name.toLowerCase() : "my"}-sdg-card.png`}
              className="rounded-full bg-white px-[3vw] py-[1.8vh] text-[2.4vh] font-bold text-stature active:scale-95"
            >
              Download card
            </a>
          )}
          <button
            onClick={onNext}
            className="rounded-full border-2 border-white/40 px-[3vw] py-[1.8vh] text-[2.4vh] font-bold active:scale-95"
          >
            Done, next player
          </button>
        </div>
      </div>
    </div>
  );
}
