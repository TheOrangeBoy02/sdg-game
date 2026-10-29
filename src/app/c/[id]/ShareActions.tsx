"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/content";

export default function ShareActions({ imageUrl, fileName }: { imageUrl: string; fileName: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [shareable, setShareable] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Load the image up front: iOS only allows navigator.share() right after a tap,
  // so there is no time to fetch it inside the click handler.
  useEffect(() => {
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
      if ((e as Error).name !== "AbortError") setMsg("Sharing didn't work. Try Download instead.");
    }
  };

  const primary = "w-full rounded-full bg-white py-4 text-center text-lg font-bold text-[#00164E] active:scale-[0.98]";
  const secondary =
    "w-full rounded-full border-2 border-white/70 py-4 text-center text-lg font-bold text-white active:scale-[0.98]";

  return (
    <div className="flex w-full flex-col gap-3">
      {shareable !== false && (
        <button onClick={share} disabled={!file} className={`${primary} disabled:opacity-60`}>
          {file ? "Share or save" : "Preparing..."}
        </button>
      )}
      {/* Server sends Content-Disposition: attachment, so this works without JS on any phone */}
      <a href={`${imageUrl}?download=1`} download={fileName} className={shareable === false ? primary : secondary}>
        Download PNG
      </a>
      {msg && <p className="text-center text-sm text-amber-200">{msg}</p>}
    </div>
  );
}
