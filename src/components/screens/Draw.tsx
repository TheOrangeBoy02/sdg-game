"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DRAW_SECONDS, type Theme } from "@/lib/content";
import type { Stroke } from "@/lib/strokes";
import DrawingCanvas from "../DrawingCanvas";
import ReferenceSketch from "../ReferenceSketch";

type Phase = "intro" | "countdown" | "drawing" | "timeup";

export default function Draw({
  theme,
  strokesRef,
  onDone,
}: {
  theme: Theme;
  strokesRef: React.MutableRefObject<Stroke[]>;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(3);
  const [endAt, setEndAt] = useState(0);
  const [left, setLeft] = useState(DRAW_SECONDS);
  const [hasInk, setHasInk] = useState(false);
  const lockedRef = useRef(false);

  const lock = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLeft(0);
    setPhase("timeup");
  }, []);

  // 3-2-1 before the clock starts
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      setEndAt(Date.now() + DRAW_SECONDS * 1000);
      setPhase("drawing");
      return;
    }
    const t = window.setTimeout(() => setCount((c) => c - 1), 750);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  // Wall-clock timer: cannot be paused by tapping, backgrounding or slow frames
  useEffect(() => {
    if (phase !== "drawing" || !endAt) return;
    let raf = 0;
    const tick = () => {
      const ms = endAt - Date.now();
      if (ms <= 0) return lock();
      setLeft(Math.ceil(ms / 1000));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const hard = window.setTimeout(lock, Math.max(0, endAt - Date.now()));
    const vis = () => {
      if (Date.now() >= endAt) lock();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hard);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [phase, endAt, lock]);

  // After time's up, move on automatically (only if they drew something)
  useEffect(() => {
    if (phase !== "timeup" || strokesRef.current.length === 0) return;
    const t = window.setTimeout(onDone, 1600);
    return () => window.clearTimeout(t);
  }, [phase, onDone, strokesRef]);

  const retry = () => {
    strokesRef.current = [];
    lockedRef.current = false;
    setHasInk(false);
    setLeft(DRAW_SECONDS);
    setCount(3);
    setPhase("countdown");
  };

  if (phase === "intro") {
    return (
      <div className="flex flex-1 items-center gap-[5vw] px-[7vw] pb-[6vh]">
        <div className="animate-pop relative h-[56vh] w-[56vh] shrink-0 overflow-hidden rounded-[4vh] bg-white shadow-2xl">
          <ReferenceSketch theme={theme.id} sizes="56vh" />
        </div>
        <div className="animate-rise flex flex-col items-start">
          <p className="text-[2.2vh] font-bold uppercase tracking-[0.2em] text-white/60">Your drawing challenge</p>
          <h2 className="mt-[1.5vh] text-[8vh] font-bold leading-none">{theme.sketchPrompt}</h2>
          <p className="mt-[3vh] max-w-[38vw] text-[2.8vh] leading-snug text-white/80">
            You have {DRAW_SECONDS} seconds. Use your finger. There are no wrong drawings, just make it yours.
          </p>
          <button
            onClick={() => setPhase("countdown")}
            className="animate-pulse-soft mt-[5vh] rounded-full bg-white px-[4.5vw] py-[2.4vh] text-[3.2vh] font-bold text-stature active:scale-95"
          >
            I&apos;m ready
          </button>
        </div>
      </div>
    );
  }

  const pct = left / DRAW_SECONDS;
  const urgent = phase === "drawing" && left <= 5;
  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative flex flex-1 gap-[3vw] px-[4vw] pb-[4vh]">
      {/* Left rail: timer + reference */}
      <aside className="flex w-[28vw] flex-col items-center justify-between py-[1vh]">
        <div className="relative h-[26vh] w-[26vh]">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={urgent ? "#FF4D4D" : "#fff"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (phase === "countdown" ? 1 : pct))}
              style={{ transition: "stroke-dashoffset 0.25s linear" }}
            />
          </svg>
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center ${urgent ? "text-[#FF4D4D]" : ""}`}
          >
            <span className="text-[10vh] font-bold leading-none tabular-nums">
              {phase === "countdown" ? DRAW_SECONDS : left}
            </span>
            <span className="text-[1.8vh] font-bold uppercase tracking-[0.2em] text-white/60">seconds</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[4.4vh] font-bold leading-tight">{theme.sketchPrompt}</p>
        </div>

        <div className="relative h-[22vh] w-[22vh] overflow-hidden rounded-[3vh] bg-white/10">
          <ReferenceSketch theme={theme.id} sizes="22vh" />
        </div>

        <button
          onClick={lock}
          disabled={phase !== "drawing" || !hasInk}
          className="w-full rounded-full bg-white py-[2vh] text-[2.6vh] font-bold text-stature active:scale-95 disabled:opacity-30"
        >
          I&apos;m finished
        </button>
      </aside>

      {/* Canvas */}
      <div className="relative flex-1">
        <DrawingCanvas
          strokesRef={strokesRef}
          endAt={phase === "drawing" ? endAt : 0}
          locked={phase !== "drawing"}
          onFirstStroke={() => setHasInk(true)}
        />
      </div>

      {phase === "countdown" && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-stature/60 backdrop-blur-sm">
          <span key={count} className="animate-pop text-[30vh] font-bold leading-none">
            {count === 0 ? "Go!" : count}
          </span>
        </div>
      )}

      {phase === "timeup" && (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-[3vh] bg-stature/70 backdrop-blur-sm">
          <span className="animate-pop text-[12vh] font-bold leading-none">
            {strokesRef.current.length ? "Time's up!" : "Oops, nothing drawn"}
          </span>
          {strokesRef.current.length === 0 && (
            <button
              onClick={retry}
              className="rounded-full bg-white px-[4vw] py-[2vh] text-[3vh] font-bold text-stature active:scale-95"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
