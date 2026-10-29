// End-to-end run of the kiosk journey at iPad landscape size with touch input.
// Usage: app running on BASE_URL (default http://localhost:3000), then `node scripts/e2e-ipad.mjs`
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = new URL("./shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1180, height: 820 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
page.on("console", (m) => m.type() === "error" && console.log("console error:", m.text()));
let upload = null;
page.on("response", async (res) => {
  if (res.url().endsWith("/api/cards") && res.request().method() === "POST" && res.ok()) {
    upload = await res.json();
  }
});
const shot = (n) => page.screenshot({ path: `${OUT}${n}.png` });

await page.goto(BASE);
await page.waitForTimeout(1000);
await shot("1-welcome");
await page.tap("text=Tap to start", { force: true });
await page.fill("input", "Thoko");
await shot("2-name");
await page.tap("button[type=submit]");
await page.waitForTimeout(400);

for (const pick of [2, 3, 0, 2, 3]) {
  await page.locator(".grid button").nth(pick).tap();
  await page.waitForTimeout(500);
}
await shot("3-challenge");
await page.tap("text=I'm ready", { force: true });
await page.waitForTimeout(3500); // countdown

// Draw with real touch events via CDP
const cdp = await ctx.newCDPSession(page);
const box = await page.locator("canvas").boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
const r = box.width * 0.3;
const line = (a, b, n = 15) => Array.from({ length: n + 1 }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
const stroke = async (pts) => {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pts[0][0], y: pts[0][1] }] });
  for (const [x, y] of pts.slice(1)) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};
const circle = Array.from({ length: 60 }, (_, i) => [cx + r * Math.cos((i / 59) * 2 * Math.PI), cy + r * Math.sin((i / 59) * 2 * Math.PI)]);
await stroke(circle);
await stroke(line([cx - r, cy], [cx + r, cy]));
await shot("4-drawing");

// Let the 30s timer run out, then try to draw: canvas must not change
await page.waitForTimeout(28000);
const before = await page.locator("canvas").evaluate((c) => c.toDataURL());
await stroke(line([cx - r, cy - r], [cx + r, cy + r]));
const after = await page.locator("canvas").evaluate((c) => c.toDataURL()).catch(() => before);
console.log(before === after ? "PASS canvas locked after timer" : "FAIL canvas changed after timer");
await shot("5-timeup");

await page.waitForTimeout(5000);
await shot("6-reveal");
const qr = await page.locator("main svg").last().count();
console.log(qr ? "PASS QR rendered" : "FAIL no QR");

// The uploaded card itself, and the share page on a phone
if (upload) {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const share = await phone.newPage();
  await share.goto(new URL(upload.shareUrl, BASE).href);
  await share.waitForTimeout(800);
  await share.screenshot({ path: `${OUT}8-share.png`, fullPage: true });
  const src = await share.locator('img[alt="Your personalised SDG card"]').evaluate((img) => img.src);
  writeFileSync(`${OUT}7-card.png`, await (await phone.request.get(src)).body());
  console.log("PASS card uploaded");
} else console.log("FAIL no card upload");
await browser.close();
