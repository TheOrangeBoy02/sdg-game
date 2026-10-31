# Discover Your Impact (SDG mini-game)

Kiosk web game for an event run with Standard Bank. Young people (12 to 19) play on shared iPads in landscape: optional first name, 5-question quiz, 30-second drawing challenge, identity reveal, then a personalised 1080x1350 PNG card they get onto their own phone by scanning a QR code.

The Next.js app is at the repo root. Brand files used by the app are in `public/brand/` and `public/fonts/`.

## Owner preferences

- TypeScript, React, Next.js App Router, Tailwind v4. Keep it that way.
- Never use the em dash character in code, copy, comments or docs. Use commas, colons or parentheses.
- Keep the first version lean: full journey working first, polish second.

## Commands

```bash
npm install
npm run dev -- -H 0.0.0.0     # test on the iPad at http://<mac-ip>:3000
npm run build && npm start
npx tsc --noEmit && npm run lint
```

If a build ever fails with EPERM on `.next/`, delete `.next` and rebuild (an earlier sandboxed build left a partial `.next`).

## Decisions already made (do not revisit without asking)

| Topic | Decision |
| --- | --- |
| Device | Shared kiosk iPads, landscape, touch first (finger and Apple Pencil) |
| Card handoff | Upload PNG to Vercel Blob, show QR to `/c/<id>`, player saves/shares from their phone |
| Retention | Keep cards indefinitely (no auto delete). Consent line shown on welcome screen |
| Name | Optional first name, letters only, max 14 chars, shown on card |
| Drawing tools | Single black pen only. No colours, undo or clear |
| Card format | Portrait 4:5, 1080x1350 |
| Connectivity | Venue has good Wi-Fi. No offline/PWA caching needed |
| Storage | Vercel Blob (`BLOB_READ_WRITE_TOKEN`). No database, no accounts, no admin |
| Branding | Standard Bank: BentonSans (Regular/Bold), Electric Blue #0051FF, SB Blue #0033A1, Deep Blue #00008C, Stature Blue #00164E, white logo |
| Themes | 6 themes, 1 SDG each (see below) |

### Themes

| Id | Identity | SDG | Colour | Drawing prompt |
| --- | --- | --- | --- | --- |
| climate | Planet Protector | 13 Climate Action | #3F7E44 | Sketch the Earth |
| forests | Forest Guardian | 15 Life on Land | #56C02B | Sketch a tree |
| water | Water Champion | 6 Clean Water and Sanitation | #26BDE2 | Sketch a water droplet |
| education | Knowledge Builder | 4 Quality Education | #C5192D | Sketch a book |
| energy | Energy Innovator | 7 Affordable and Clean Energy | #FCC30B | Sketch the sun |
| communities | Community Architect | 11 Sustainable Cities and Communities | #FD9D24 | Sketch a house |

Scoring (`src/lib/scoring.ts`): each answer gives +3 to its primary theme and +1 to its optional secondary. Highest total wins. Tie: the tied theme most recently chosen as a primary wins, then fixed `THEME_ORDER`. Must stay deterministic: the same answers always give the same identity. The result stays hidden until after drawing.

## Flow and architecture

`src/components/Game.tsx` is a single client state machine: `welcome -> name -> quiz -> draw -> reveal`. Reset bumps a `round` key to remount everything.

| File | Role |
| --- | --- |
| `src/lib/content.ts` | ALL copy and config: `EVENT`, `ACADEMY_LOGO` (Sustainability Academy crest, the event's umbrella brand: welcome screen, card header, share page), `DRAW_SECONDS` (30), `IDLE_RESET_SECONDS` (90), `THEMES`, `THEME_ORDER`, `QUESTIONS` |
| `src/lib/scoring.ts` | `scoreAnswers`, `resolveTheme` |
| `src/lib/strokes.ts` | `Stroke` type (normalized 0..1 points on a square canvas), smoothed rendering |
| `src/components/DrawingCanvas.tsx` | Pointer Events canvas, DPR aware, coalesced events, single active pointer, palm rejection after Pencil use, ignores input after `endAt` |
| `src/components/screens/Draw.tsx` | Challenge intro, 3-2-1 countdown, wall-clock timer (rAF display + hard `setTimeout` + `visibilitychange` check), "I'm finished", time's up, retry only if nothing drawn |
| `src/components/screens/Reveal.tsx` | Drumroll, renders card, uploads, shows QR (`qrcode.react`), retry on failure, "Done, next player" |
| `src/lib/card.ts` | Draws the 1080x1350 card on a canvas (Standard Bank logo left and Academy crest right, identity, sketch panel signed with name (Great Vibes script) and date (BentonSans Regular), SDG tile joined to a white belief panel, footer). Mission is on the reveal screen only |
| `src/lib/useIdle.ts` | Idle auto-reset (disabled on welcome and during drawing), 10s warning banner |
| `src/components/BrandBar.tsx` | Header. Staff reset: press and hold logo 3s |
| `src/app/api/cards/route.ts` | POST raw PNG body. Rate limit (30/min per IP, all venue iPads share one IP), then `x-kiosk-key` must equal `KIOSK_SECRET`, then PNG signature and max 4MB. Returns `{ id, shareUrl }` (absolute: `NEXT_PUBLIC_SITE_URL`, else request origin with `localhost` swapped for the Mac's LAN IP so phones can scan it) |
| `src/lib/rateLimit.ts` | In-memory fixed-window limiter (best effort per serverless instance), `clientIp` |
| `src/lib/kioskKey.ts` | Client: reads the key from `?kiosk=` (and stores it), sent by `Reveal.tsx` as `x-kiosk-key` |
| `src/lib/nameFilter.ts` | `isBlockedName`: name blocklist (substring list plus whole-word list for terms found inside real names). `NameEntry.tsx` blocks submit and shows a message |
| `src/lib/cardStore.ts` | Vercel Blob when `BLOB_READ_WRITE_TOKEN` or `BLOB_STORE_ID` (OIDC) is set, and always on Vercel; in-memory Map otherwise (local dev). Path `cards/<nanoid16>.png`. The Blob store is **private**: upload with `access: "private"`, read with `get()`, never link to Blob URLs |
| `src/app/api/cards/[id]/route.ts` | The only way to the card PNG (memory or streamed from private Blob). `?download=1` adds `Content-Disposition: attachment` |
| `src/app/c/[id]/page.tsx` + `ShareActions.tsx` | Phone landing page: card image (`/api/cards/<id>`), OG image meta. Share prefetches the PNG from `/api/cards/<id>` on load (iOS needs `navigator.share()` straight after the tap) and is hidden where file sharing is unsupported. Download is a plain link to `?download=1`. iOS leads with "Save to Photos" (share sheet, since downloads land in Files); Android and others lead with "Download image". Card is height-capped so the main button stays above the fold (checked down to iPhone SE) |
| `src/components/ReferenceSketch.tsx` | Reference photo per theme (`public/brand/sketchImage/`), `next/image` filling its tile |
| `src/components/SdgTile.tsx` | Official UN SDG icon (files in `public/brand/SDG/`). Welcome screen cycles all of `SDG_ICONS` 6 at a time every `WELCOME_PAGE_SECONDS`; `card.ts` draws the theme icon (`theme.sdgIcon`) |

Kiosk hardening already in place: `touch-action: none` on canvas, `manipulation` on body, no user scaling, `gesturestart`/`contextmenu` blocked, no text selection or callouts, `apple-mobile-web-app-capable` (added by hand in `layout.tsx`, Next only emits the standard tag), standalone landscape manifest, square `apple-touch-icon.png`.

Layout uses `vh`/`vw` units so it scales across iPad landscape sizes (1024x768 up to 1366x1024).

## Environment

- `BLOB_READ_WRITE_TOKEN`: set by connecting a Vercel Blob store to the project. Without it cards stay in memory.
- `KIOSK_SECRET`: shared secret for card uploads. If unset, uploads are open (fine for local dev, logs a warning). Set it in production.
- `NEXT_PUBLIC_SITE_URL` (optional): base URL used in the QR. Defaults to the origin the kiosk uses; `localhost` is replaced by the Mac's LAN IP automatically, so phones on the same Wi-Fi can scan it during local testing.

### Kiosk iPad setup (once per iPad)

Open `https://<site>/?kiosk=<KIOSK_SECRET>` in Safari, then Add to Home Screen from that page. To avoid typing the secret, run `npm run kiosk-qr` on the Mac (reads `.env`, opens a page with the setup link as a QR; optional site URL argument) and scan it with the iPad Camera. `Game.tsx` saves the key on load. The manifest deliberately has no `start_url`, so the Home Screen app launches at that URL with the key (iOS Home Screen apps do not share storage with Safari). The key is not stripped from the URL for the same reason; it is not visible in fullscreen mode. An iPad without the key gets the upload error/retry screen on reveal.

## Status

Done and verified in a headless iPad-sized browser (1180x820, touch): full journey, timer lock, card render with real drawing, upload, QR, share page on a 390px phone viewport. `tsc`, lint and `next build` pass.

Not yet verified on real hardware. Next steps, in priority order:

1. Test on a real iPad in Safari and as a Home Screen app: finger drawing, Apple Pencil, fonts on the card, no zoom/scroll, idle reset, staff reset.
2. Deploy to Vercel, connect Blob, scan QR with Android and iPhone, test Share and Download on `/c/<id>`. Share and Download go through the same-origin `/api/cards/<id>` proxy, so Blob CORS does not matter.
3. Done: `POST /api/cards` kiosk secret header and rate limit. Verify the iPad setup flow above on real hardware (Home Screen app keeps the key).
4. Done: name blocklist. Owner to review the word lists in `nameFilter.ts` (add local-language terms as needed).
5. Content review with the owner: questions, identities and messages in `content.ts`.
6. Replace placeholders when assets arrive: `EVENT.eventName` and `EVENT.hashtag`. Done: reference photos in `public/brand/sketchImage/`, official SDG icons (show them unaltered, per UN SDG logo guidelines).
7. Polish only after the above: contrast of red/green identity titles on blue in `Reveal.tsx`, sound effects, transitions.

Out of scope for v1: accounts, leaderboards, multiplayer, database, admin dashboard, offline mode.

## Testing

`scripts/e2e-ipad.mjs` drives the whole journey with Playwright at iPad landscape size and saves screenshots to `scripts/shots/`, including the uploaded card (`7-card.png`) and the share page at phone width (`8-share.png`). Setup once: `npm i -D playwright && npx playwright install chromium`. Run with the app on port 3000: `node scripts/e2e-ipad.mjs`. Pulsing buttons need `{ force: true }` on tap.
