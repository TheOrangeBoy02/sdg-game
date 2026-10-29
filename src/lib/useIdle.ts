"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Calls onIdle after `seconds` without any touch/pointer/key input.
 * Returns seconds remaining (for a "restarting soon" warning).
 */
export function useIdle(active: boolean, seconds: number, onIdle: () => void) {
  const last = useRef(Date.now());
  const [left, setLeft] = useState(seconds);
  const cb = useRef(onIdle);
  cb.current = onIdle;

  useEffect(() => {
    if (!active) return;
    last.current = Date.now();
    setLeft(seconds);
    const bump = () => {
      last.current = Date.now();
    };
    const evs = ["pointerdown", "pointermove", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const t = window.setInterval(() => {
      const remaining = Math.ceil(seconds - (Date.now() - last.current) / 1000);
      setLeft(remaining);
      if (remaining <= 0) cb.current();
    }, 500);
    return () => {
      evs.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(t);
    };
  }, [active, seconds]);

  return active ? left : seconds;
}
