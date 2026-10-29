"use client";

import { useRef } from "react";
import { EVENT } from "@/lib/content";

/** Top bar. Staff can press and hold the logo for 3 seconds to reset the game. */
export default function BrandBar({ onStaffReset, right }: { onStaffReset: () => void; right?: React.ReactNode }) {
  const timer = useRef<number | null>(null);
  const start = () => {
    timer.current = window.setTimeout(onStaffReset, 3000);
  };
  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <header className="flex h-[9vh] min-h-14 shrink-0 items-center justify-between px-[3vw]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-white.png"
        alt="Standard Bank"
        draggable={false}
        className="h-[4.2vh] pl-15 pt-14 min-h-34 w-auto"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
      />
      <div className="flex items-center gap-4 text-[1.6vh] font-bold uppercase tracking-[0.2em] text-white/70">
        {right ?? EVENT.title}
      </div>
    </header>
  );
}
