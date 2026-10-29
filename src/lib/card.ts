import { ACADEMY_LOGO, EVENT, type Theme } from "./content";
import { drawStrokes, type Stroke } from "./strokes";

export const CARD_W = 1080;
export const CARD_H = 1350;

const FONT = "BentonSans, system-ui, sans-serif";
const BG_TOP = "#00164E"; // Stature Blue
const BG_BOTTOM = "#00008C"; // Deep Blue

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export async function renderCard(opts: {
  theme: Theme;
  strokes: Stroke[];
  name?: string;
}): Promise<HTMLCanvasElement> {
  const { theme, strokes } = opts;
  const name = opts.name?.trim();

  await Promise.all([
    document.fonts.load(`700 40px BentonSans`),
    document.fonts.load(`400 40px BentonSans`),
  ]).catch(() => {});
  const [bg, logo, academy, sdgIcon] = await Promise.all([
    loadImage(encodeURI("/brand/card wallpaper.png")).catch(() => null),
    loadImage("/brand/logo-white.png").catch(() => null),
    loadImage(ACADEMY_LOGO).catch(() => null),
    loadImage(theme.sdgIcon).catch(() => null),
  ]);

  const c = document.createElement("canvas");
  c.width = CARD_W;
  c.height = CARD_H;
  const ctx = c.getContext("2d")!;

  // Background: wallpaper artwork (1080x1350), gradient only if it fails to load
  if (bg) {
    ctx.drawImage(bg, 0, 0, CARD_W, CARD_H);
  } else {
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    g.addColorStop(0, BG_TOP);
    g.addColorStop(1, BG_BOTTOM);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  }

  // Header: Standard Bank logo left, Sustainability Academy crest right, sharing a centre line
  const headerMid = 108;
  if (logo) {
    const h = 80;
    ctx.drawImage(logo, 64, headerMid - h / 2, (logo.width / logo.height) * h, h);
  }
  if (academy) {
    const h = 144;
    const w = (academy.width / academy.height) * h;
    ctx.drawImage(academy, CARD_W - 64 - w, headerMid - h / 2, w, h);
  }

  // Title
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.font = `700 34px ${FONT}`;
  const lead = name ? `${name.toUpperCase()} IS THE` : "MEET THE";
  ctx.fillText(lead, 64, 200);

  let size = 96;
  const title = theme.identity.toUpperCase();
  do {
    ctx.font = `700 ${size}px ${FONT}`;
    size -= 2;
  } while (ctx.measureText(title).width > CARD_W - 128 && size > 40);
  ctx.fillStyle = theme.color;
  ctx.fillText(title, 64, 292);

  // Sketch panel
  const P = 660;
  const px = (CARD_W - P) / 2;
  const py = 340;
  ctx.save();
  ctx.translate(px + P / 2, py + P / 2);
  ctx.rotate((3 * Math.PI) / 180);
  ctx.fillStyle = theme.color;
  roundRect(ctx, -P / 2, -P / 2, P, P, 36);
  ctx.fill();
  ctx.rotate((-5 * Math.PI) / 180);
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = "#fff";
  roundRect(ctx, -P / 2, -P / 2, P, P, 36);
  ctx.fill();
  ctx.shadowColor = "transparent";
  const pad = 30;
  const inner = P - pad * 2;
  ctx.save();
  roundRect(ctx, -P / 2, -P / 2, P, P, 36);
  ctx.clip();
  drawStrokes(ctx, strokes, inner, -P / 2 + pad, -P / 2 + pad);
  ctx.restore();
  // little "original artwork" tag
  ctx.fillStyle = BG_TOP;
  ctx.font = `700 20px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("ORIGINAL ARTWORK", P / 2 - 28, P / 2 - 24);
  ctx.restore();

  // SDG tile: official UN icon, drawn unaltered (no rounding or recolouring). Drawn tile only if it fails to load.
  const T = 176;
  const tx = 64;
  const ty = 1068;
  ctx.textAlign = "left";
  if (sdgIcon) {
    ctx.drawImage(sdgIcon, tx, ty, T, T);
  } else {
    ctx.fillStyle = theme.color;
    roundRect(ctx, tx, ty, T, T, 20);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `700 72px ${FONT}`;
    ctx.fillText(String(theme.sdgNumber), tx + 18, ty + 80);
    ctx.font = `700 17px ${FONT}`;
    const sdgLines = wrapLines(ctx, theme.sdgName.toUpperCase(), T - 32);
    sdgLines.forEach((l, i) => ctx.fillText(l, tx + 18, ty + T - 18 - (sdgLines.length - 1 - i) * 20));
  }

  // Message
  const mx = tx + T + 36;
  const mw = CARD_W - mx - 64;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `700 22px ${FONT}`;
  ctx.fillText(`MY SDG: GOAL ${theme.sdgNumber}, ${theme.sdgName.toUpperCase()}`, mx, ty + 22);
  ctx.fillStyle = "#fff";
  ctx.font = `400 29px ${FONT}`;
  let y = ty + 66;
  for (const l of wrapLines(ctx, theme.belief, mw)) {
    ctx.fillText(l, mx, y);
    y += 37;
  }
  y += 8;
  ctx.font = `700 29px ${FONT}`;
  for (const l of wrapLines(ctx, `My mission: ${theme.mission}`, mw)) {
    ctx.fillText(l, mx, y);
    y += 37;
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `400 22px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(EVENT.eventName, 64, CARD_H - 40);
  ctx.textAlign = "right";
  ctx.font = `700 22px ${FONT}`;
  ctx.fillText(EVENT.hashtag, CARD_W - 64, CARD_H - 40);

  return c;
}

export function canvasToBlob(c: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
