"use client";

import { useCallback, useEffect, useRef } from "react";
import { drawStrokes, PEN_COLOR, PEN_WIDTH, type Stroke } from "@/lib/strokes";

type Props = {
  /** Shared stroke store, owned by the parent */
  strokesRef: React.MutableRefObject<Stroke[]>;
  /** Wall-clock deadline (Date.now() ms). Input after this is ignored. */
  endAt: number;
  locked: boolean;
  onFirstStroke?: () => void;
};

export default function DrawingCanvas({ strokesRef, endAt, locked, onFirstStroke }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef(0);
  const activeId = useRef<number | null>(null);
  const current = useRef<Stroke | null>(null);
  const sawPen = useRef(false);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  const canDraw = useCallback(() => !lockedRef.current && Date.now() < endAt, [endAt]);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, sizeRef.current, sizeRef.current);
    drawStrokes(ctx, strokesRef.current, sizeRef.current);
  }, [strokesRef]);

  // Keep canvas square and crisp at device pixel ratio
  useEffect(() => {
    const wrap = wrapRef.current;
    const c = canvasRef.current;
    if (!wrap || !c) return;
    const ro = new ResizeObserver(() => {
      const size = Math.floor(Math.min(wrap.clientWidth, wrap.clientHeight));
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = size;
      c.style.width = `${size}px`;
      c.style.height = `${size}px`;
      c.width = Math.round(size * dpr);
      c.height = Math.round(size * dpr);
      redraw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [redraw]);

  // End any in-progress stroke the moment we lock
  useEffect(() => {
    if (locked) {
      activeId.current = null;
      current.current = null;
    }
  }, [locked]);

  const toNorm = (e: PointerEvent | React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    return [x, y] as const;
  };

  const segment = (x0: number, y0: number, x1: number, y1: number) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const s = sizeRef.current;
    ctx.strokeStyle = PEN_COLOR;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = PEN_WIDTH * s;
    ctx.beginPath();
    ctx.moveTo(x0 * s, y0 * s);
    ctx.lineTo(x1 * s, y1 * s);
    ctx.stroke();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canDraw()) return;
    if (e.pointerType === "pen") sawPen.current = true;
    // Palm rejection: once a pencil is used, ignore finger touches
    if (sawPen.current && e.pointerType === "touch") return;
    if (activeId.current !== null) return; // single pointer only
    activeId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = toNorm(e);
    const stroke: Stroke = { pts: [x, y], w: PEN_WIDTH };
    current.current = stroke;
    if (strokesRef.current.length === 0) onFirstStroke?.();
    strokesRef.current.push(stroke);
    segment(x, y, x, y);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activeId.current || !current.current) return;
    if (!canDraw()) {
      activeId.current = null;
      current.current = null;
      return;
    }
    const native = e.nativeEvent;
    const events =
      typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [native];
    const pts = current.current.pts;
    for (const ev of events.length ? events : [native]) {
      const [x, y] = toNorm(ev);
      const lx = pts[pts.length - 2];
      const ly = pts[pts.length - 1];
      if (Math.abs(x - lx) + Math.abs(y - ly) < 0.0015) continue;
      pts.push(x, y);
      segment(lx, ly, x, y);
    }
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activeId.current) return;
    activeId.current = null;
    current.current = null;
    // Redraw with smoothing for a cleaner final line
    redraw();
  };

  return (
    <div ref={wrapRef} className="flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        aria-label="Drawing canvas"
        className="block rounded-3xl bg-white shadow-2xl"
        style={{ touchAction: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
