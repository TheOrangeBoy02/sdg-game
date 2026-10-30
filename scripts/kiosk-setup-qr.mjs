// Shows the kiosk setup link (/?kiosk=<KIOSK_SECRET>) as a QR code on this Mac,
// so each iPad can scan it with the Camera app instead of typing the secret.
// Run: npm run kiosk-qr [-- https://other-site.example]

import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";

const secret = process.env.KIOSK_SECRET;
if (!secret) {
  console.error("KIOSK_SECRET is not set in .env");
  process.exit(1);
}
const site = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://sdg-game-orpin.vercel.app").replace(/\/$/, "");
const url = `${site}/?kiosk=${encodeURIComponent(secret)}`;

const qr = renderToStaticMarkup(createElement(QRCodeSVG, { value: url, size: 520, level: "M", marginSize: 4 }));
const html = `<!doctype html>
<meta charset="utf-8">
<title>Kiosk setup</title>
<style>
  body { font-family: system-ui, sans-serif; background: #00164e; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; }
  main { display: flex; gap: 48px; align-items: center; padding: 32px; }
  .qr { background: #fff; border-radius: 24px; padding: 8px; line-height: 0; }
  ol { font-size: 20px; line-height: 1.6; max-width: 420px; }
  small { opacity: 0.6; }
</style>
<main>
  <div class="qr">${qr}</div>
  <div>
    <h1>Kiosk iPad setup</h1>
    <ol>
      <li>Delete any old Home Screen icon for the game.</li>
      <li>Open the Camera app and point it at this code, then tap the link.</li>
      <li>In Safari, tap Share, then Add to Home Screen. Make sure "Open as Web App" is on.</li>
      <li>Open the game from the new icon.</li>
    </ol>
    <small>${site}<br>Contains the kiosk secret: close this page when done.</small>
  </div>
</main>`;

const file = join(tmpdir(), "sdg-kiosk-setup.html");
writeFileSync(file, html, { mode: 0o600 });
execFile("open", [file]);
console.log(`Opened the setup QR for ${site}`);
