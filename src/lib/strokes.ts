// Strokes are stored in normalized (0..1) coordinates of a square canvas,
// so the same drawing can be re-rendered crisply on the card at any size.

export type Stroke = {
  /** flat [x0, y0, x1, y1, ...] in 0..1 */
  pts: number[];
  /** line width as a fraction of canvas size */
  w: number;
};

export const PEN_WIDTH = 0.014;
export const PEN_COLOR = "#0B0B12";

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  s: Stroke,
  size: number,
  ox = 0,
  oy = 0,
) {
  const p = s.pts;
  if (p.length < 2) return;
  ctx.strokeStyle = PEN_COLOR;
  ctx.fillStyle = PEN_COLOR;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = s.w * size;

  const X = (i: number) => ox + p[i] * size;
  const Y = (i: number) => oy + p[i + 1] * size;

  if (p.length === 2) {
    // a single tap: draw a dot
    ctx.beginPath();
    ctx.arc(X(0), Y(0), (s.w * size) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(X(0), Y(0));
  // quadratic smoothing through midpoints
  for (let i = 2; i < p.length - 2; i += 2) {
    const mx = (X(i) + X(i + 2)) / 2;
    const my = (Y(i) + Y(i + 2)) / 2;
    ctx.quadraticCurveTo(X(i), Y(i), mx, my);
  }
  ctx.lineTo(X(p.length - 2), Y(p.length - 2));
  ctx.stroke();
}

export function drawStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  size: number,
  ox = 0,
  oy = 0,
) {
  for (const s of strokes) drawStroke(ctx, s, size, ox, oy);
}
