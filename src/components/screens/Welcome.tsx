"use client";

import { useEffect, useState } from "react";
import { ACADEMY_LOGO, SDG_ICONS, WELCOME_PAGE_SECONDS } from "@/lib/content";
import SdgTile from "../SdgTile";

const PER_PAGE = 6;
const PAGES = Array.from({ length: Math.ceil(SDG_ICONS.length / PER_PAGE) }, (_, p) =>
  SDG_ICONS.slice(p * PER_PAGE, (p + 1) * PER_PAGE),
);
const OUT_MS = 650; // pop-out duration plus stagger, see .animate-pop-out

export default function Welcome({ onStart }: { onStart: () => void }) {
  const [page, setPage] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Warm the cache so later sets don't pop in blank.
  useEffect(() => {
    SDG_ICONS.forEach(({ src }) => {
      new Image().src = src;
    });
  }, []);

  useEffect(() => {
    const total = WELCOME_PAGE_SECONDS * 1000;
    const out = setTimeout(() => setLeaving(true), total - OUT_MS);
    const next = setTimeout(() => {
      setLeaving(false);
      setPage((p) => (p + 1) % PAGES.length);
    }, total);
    return () => {
      clearTimeout(out);
      clearTimeout(next);
    };
  }, [page]);

  return (
    <div className="flex flex-1 items-center gap-[4vw] px-[6vw] pb-[6vh]">
      <div className="flex flex-1 flex-col items-start animate-rise">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ACADEMY_LOGO} alt="Sustainability Academy" draggable={false} className="mb-[3vh] h-[14vh] w-auto" />

        <h1 className="text-[10vh] font-bold leading-[0.95]">
          Discover
          <br />
          Your <span className="text-[#27a3ff]">Impact</span>
        </h1>

        <button
          onClick={onStart}
          className="animate-pulse-soft mt-[5vh] rounded-full bg-white px-[5vw] py-[2.6vh] text-[3.4vh] font-bold text-stature shadow-[0_20px_60px_rgba(0,81,255,0.5)] active:scale-95"
        >
          Tap to Start
        </button>

      </div>

      <div key={page} className="grid grid-cols-3 grid-rows-2 gap-[1.6vh]" aria-hidden>
        {PAGES[page].map((icon, i) => (
          <div
            key={icon.number}
            className={`${leaving ? "animate-pop-out" : "animate-pop"} shadow-xl`}
            style={{ animationDelay: leaving ? `${i * 50}ms` : `${150 + i * 90}ms` }}
          >
            <SdgTile src={icon.src} number={icon.number} className="h-[22vh] w-[22vh]" />
          </div>
        ))}
      </div>
    </div>
  );
}
