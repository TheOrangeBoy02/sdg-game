# Discover Your Impact

SDG mini-game for iPad kiosks (landscape). Welcome, optional first name, 5-question quiz, 30-second drawing challenge, reveal, and a 1080x1350 card that players save to their phone by scanning a QR code.

## Run locally

```bash
npm install
npm run dev -- -H 0.0.0.0   # open http://<your-mac-ip>:3000 on the iPad
```

Without `BLOB_READ_WRITE_TOKEN`, cards are kept in memory (lost on restart), which is fine for testing. The QR uses the Mac's Wi-Fi address automatically when the kiosk runs at `localhost`, so a phone on the same Wi-Fi can scan it. Set `NEXT_PUBLIC_SITE_URL` to override.

## Deploy (Vercel)

1. Import the repo as a Vercel project.
2. Storage, then Create Blob store, then connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`.
3. Deploy. Cards are stored at `cards/<id>.png`; the QR opens `/c/<id>`.

## Where to edit things

| What | File |
| --- | --- |
| Event name, hashtag, consent text, timer, idle reset | `src/lib/content.ts` (`EVENT`, `DRAW_SECONDS`, `IDLE_RESET_SECONDS`) |
| Questions, answers and scoring weights | `src/lib/content.ts` (`QUESTIONS`) |
| Identities, SDGs, messages, colours, drawing prompts | `src/lib/content.ts` (`THEMES`) |
| Scoring and tie-break rules | `src/lib/scoring.ts` |
| Card layout | `src/lib/card.ts` |
| Reference sketches | `src/components/ReferenceSketch.tsx` |
| SDG tile (placeholder for official icons) | `src/components/SdgTile.tsx` and the tile section of `card.ts` |
| Logo / fonts | `public/brand/`, `public/fonts/` |

Scoring: each answer gives +3 to its main theme and +1 to its secondary theme. If themes tie, the one picked most recently as a main answer wins, then the fixed `THEME_ORDER`. The same answers always produce the same identity.

## Kiosk setup on iPad

- Open the site in Safari, then Share and Add to Home Screen. It launches fullscreen.
- Turn on Guided Access (Settings, Accessibility) to lock the iPad to the app.
- Staff reset: press and hold the Standard Bank logo for 3 seconds.
- The game resets after 90 seconds without a touch (not during drawing).

## Notes

- The 30-second timer runs on the wall clock. Tapping, backgrounding the app or slow frames cannot extend it, and the canvas ignores input after the deadline.
- After an Apple Pencil is used, finger touches are ignored on the canvas (palm rejection).
- Official SDG icons: if you swap them in, follow the UN SDG logo usage guidelines.
