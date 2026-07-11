# adeelsedits.com

Direct Response Video Editor portfolio. Built with Next.js 14 (App Router), deployed on Vercel.

## Stack

- **Framework:** Next.js 14 App Router (JavaScript)
- **Fonts:** `next/font/google` — Instrument Serif, Inter, JetBrains Mono
- **Styling:** Plain CSS (`app/globals.css`) — no Tailwind, no CSS-in-JS
- **Hosting:** Vercel free tier

## Files

- `app/layout.js` — Root layout, fonts, page metadata (title/OG/Twitter cards)
- `app/page.jsx` — Single-page portfolio (Client Component — uses `useState` for filter chips + FAQ accordion)
- `app/globals.css` — All styles (design tokens as CSS variables + component styles)
- `package.json` — Dependencies (Next.js 14, React 18)
- `next.config.js` — Next.js config (React Strict Mode)
- `jsconfig.json` — Path aliases (`@/*` → project root)
- `.gitignore` — Standard Next.js ignores
- `SETUP.md` — Step-by-step: get this live on Vercel in ~30 minutes (no terminal needed)

## Local development (optional — not needed to launch)

If you install Node.js later:

```bash
npm install
npm run dev
```

Then open http://localhost:3000

You don't need to do this to launch. Vercel builds the site in the cloud when you push to GitHub — see `SETUP.md`.

## Content to swap later

- Reel embed (hero background) — replace the placeholder marker with a self-hosted MP4
- Proof card logos — replace icons with real DM / Editing Machine / Jaleed logos
- Work tile thumbnails — replace placeholders with real video loops
- BYOB case study video embed
- About photo — real headshot
- Testimonials — 3 written + 1–2 video once collected
- Cal.com link — wire the `Book a 15-min intro` buttons to your booking URL

## Design direction (locked)

Cinematic dark + warm amber accent. Editorial serif for headlines, clean sans for body, mono for the AI-workflow section. See `positioning.md` in the parent folder for the reasoning.
