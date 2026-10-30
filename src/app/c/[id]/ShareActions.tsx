"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/content";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac, so check for touch too
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export default function ShareActions({ imageUrl, fileName }: { imageUrl: string; fileName: string }) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [shareable, setShareable] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Load the image up front: iOS only allows navigator.share() right after a tap,
  // so there is no time to fetch it inside the click handler.
  useEffect(() => {
    setPlatform(detectPlatform());
    if (!navigator.share) {
      setShareable(false);
      return;
    }
    let cancelled = false;
    fetch(imageUrl)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const f = new File([blob], fileName, { type: "image/png" });
        setFile(f);
        setShareable(Boolean(navigator.canShare?.({ files: [f] })));
      })
      .catch(() => {
        if (!cancelled) setShareable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl, fileName]);

  const share = async () => {
    if (!file) return;
    setMsg(null);
    try {
      await navigator.share({ files: [file], text: `I discovered my impact! ${EVENT.hashtag}` });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setMsg("That didn't work. Try Download image instead.");
    }
  };

  const primary =
    "w-full rounded-full bg-white py-4 text-center text-lg font-bold text-[#00164E] active:scale-[0.98] disabled:opacity-60";
  const secondary =
    "w-full rounded-full border-2 border-white/70 py-4 text-center text-lg font-bold text-white active:scale-[0.98] disabled:opacity-60";

  // iPhone: the share sheet's "Save Image" puts the card in Photos, a download lands in Files where few look.
  // Android: a download shows up in the gallery, and the share sheet often has no save option.
  const shareFirst = platform === "ios" && shareable !== false;
  const canShare = platform !== null && shareable !== false;

  const shareButton = canShare && (
    <button onClick={share} disabled={!file} className={shareFirst ? primary : secondary}>
      {!file ? "Preparing..." : shareFirst ? "Save to Photos" : "Share"}
    </button>
  );

  // Server sends Content-Disposition: attachment, so this works without JS on any phone
  const downloadLink = (
    <a
      href={`${imageUrl}?download=1`}
      download={fileName}
      className={shareFirst ? "py-2 text-center text-base font-bold text-white/80 underline underline-offset-4" : primary}
    >
      {shareFirst ? "Download file instead" : "Download image"}
    </a>
  );

  const hint =
    platform === "ios"
      ? shareFirst
        ? 'In the menu that opens, tap "Save Image".'
        : 'Press and hold the image, then tap "Save to Photos".'
      : platform === "android"
        ? "Your card will be in your gallery or Downloads. You can also press and hold the image."
        : null;

  return (
    <div className="flex w-full flex-col gap-3">
      {shareFirst ? (
        <>
          {shareButton}
          {downloadLink}
        </>
      ) : (
        <>
          {downloadLink}
          {shareButton}
        </>
      )}
      {msg && <p className="text-center text-sm text-amber-200">{msg}</p>}
      {hint && <p className="text-center text-sm text-white/60">{hint}</p>}
    </div>
  );
}
