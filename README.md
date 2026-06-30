# 💞 Love Compatibility Quiz Funnel

A mobile-first, highly addictive love-compatibility quiz funnel for cold Meta/Snapchat ad
traffic. Built to feel like an interactive romantic webtoon — not a form. Users land directly
on the first quiz screen, tap their way through an emotional journey, and reach a cinematic
results reveal that drives a micro-offer → checkout → one-click upsell → share loop.

**Everything is computed locally and deterministically — no AI, astrology, or external APIs.**
All art (mascots, aura rings, the shareable result card) is **generated in code at runtime**
(SVG + Canvas), so the app is fully self-contained.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand (+persist) · Vitest

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm test         # engine + funnel + render tests (Vitest)
```

Open on a phone (or device mode) — it's designed vertical-first.

## How it works

- **Single-page state machine.** One route (`/`) mounts `FunnelController`, which renders the
  current "scene" from a Zustand store inside an `AnimatePresence`. Transitions are instant and
  app-like; progress auto-saves to `localStorage` (resume on return).
- **Deterministic engine** (`src/engine`). A stable hash of the couple seeds a PRNG, so the same
  two people always get the same magical result (shareable, re-openable). Scores are warm-banded
  (typically 72–96%) — cold traffic is never told their love is doomed.
- **Event engine** (`src/events`). 20+ warm, never-shaming contextual comic triggers (same
  birthday, secret crush, master number, big age gap…) shown via mascot speech bubbles.
- **Runtime art** (`src/art`). Cupid / Cosmic Matchmaker / Fortune Cat mascots, the aura score
  ring, particle fields, and the Canvas share-card are all drawn in code.

## Funnel

Relationship select → 7 tap-only emotion questions → names + gender → magical DOB wheels →
cinematic analysis → partial results (score + locked sections) → micro-offer → simulated checkout
→ one-click upsell → full report → email capture → share.

## Configuration

- **Analytics:** copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_FB_PIXEL_ID` /
  `NEXT_PUBLIC_SNAP_PIXEL_ID` to fan funnel events to Meta/Snap pixels. Runs fine without them.
- **Payments:** checkout is **simulated** (no real charge). Swap `src/scenes/Checkout.tsx` +
  `app/api/checkout/route.ts` for a real Stripe integration when ready.

## Design spec

The full design (architecture, engine, CRO rationale, copy, mascots) lives in
[`docs/superpowers/specs/2026-07-01-love-compatibility-funnel-design.md`](docs/superpowers/specs/2026-07-01-love-compatibility-funnel-design.md).
