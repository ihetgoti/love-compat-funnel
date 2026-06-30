# Love Compatibility Quiz Funnel — Design Spec

**Date:** 2026-07-01
**Status:** Approved
**Goal:** A mobile-first, highly addictive Love Compatibility Quiz Funnel for cold Meta/Snapchat ad traffic. Maximize quiz start rate, completion rate, emotional engagement, micro-offer conversion, upsell conversion, AOV, and shareability. Feels like an interactive romantic webtoon, never a form.

---

## 1. Decisions locked

| Decision | Choice | Rationale |
|---|---|---|
| Routing | **Single-page state machine** (one `/` route, Zustand-driven scenes, `AnimatePresence`) | App-like instant transitions, free auto-save/resume, no route flashes. `?step=` synced for back-button + pixel events. |
| Checkout | **Simulated** (mock pay, real order/AOV state) | Validate funnel before wiring money. No keys to run. |
| Art / mascots | **Runtime code-generated** (SVG + Canvas + CSS), no static assets, no AI/image APIs | Honors "no external APIs"; fully self-contained; data-parametric; swappable component layer for future commissioned art. |
| Scope | **Full end-to-end funnel + design docs** | Per brief. |
| Score banding | **Feel-good floored band** (typ. 72–96%), deterministic | Never demoralize cold traffic; still shareable/repeatable. |
| Early questions | **Tap-only, 8 questions before any typing** | Build emotional investment before friction. |

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand (+persist), Vitest. Fonts via `next/font`. No external runtime APIs.

---

## 2. Architecture — single-page state machine

- One route `/` mounts `<FunnelController/>`.
- `useQuizStore` (Zustand + persist) is the single source of truth.
- `steps.ts` is an ordered registry mapping `StepId → { component, progress, analytics, allowBack }`.
- `FunnelController` renders the current scene inside `<AnimatePresence mode="wait">` for cinematic transitions.
- `useFunnelRouter` exposes `next() / back() / goto()`, syncs a shallow `?step=` to the URL (history) so hardware back navigates within the funnel and each step fires a pixel `ViewStep` event.
- Persistence key `lovecompat:v1`; on load, resume at saved step. Results cached, recomputed only when inputs change.

**Component tree**
```
RootLayout
└ Providers (MotionConfig, reduced-motion, haptics)
  └ FunnelController
    ├ BackgroundFX        (aurora + particles; intensity per scene)
    ├ TopProgressBar      (heart-trail; driven by step progress)
    ├ MascotLayer         (event-engine speech bubbles)
    ├ AnimatePresence → CurrentScene
    └ StickyCtaBar        (per-scene CTA, safe-area aware)
```

---

## 3. Folder structure

```
app/
  layout.tsx              fonts, metadata, pixel scripts, providers
  page.tsx                mounts FunnelController
  globals.css             Tailwind + tokens + keyframes
  api/checkout/route.ts   simulated checkout
  api/lead/route.ts       simulated email capture
src/
  funnel/    FunnelController.tsx, steps.ts, useFunnelRouter.ts
  store/     useQuizStore.ts, selectors.ts
  engine/    zodiac.ts, numerology.ts, archetype.ts, compatibility.ts,
             commonThings.ts, narrative.ts, seededRandom.ts, types.ts, __tests__/
  events/    eventEngine.ts, triggers.ts
  content/   relationshipTypes.ts, questions.ts, copy.ts, offers.ts
  design/    tokens.ts, motion.ts, haptics.ts
  art/       Mascot.tsx, mascots/*, SpeechBubble.tsx, ComicPanel.tsx,
             Particles.tsx, AuraRing.tsx, Constellation.tsx, ShareCard.ts,
             Avatar.tsx, backgrounds/*
  components/ui/  Button, Card, ProgressBar, ChoiceCard, Field, WheelPicker, Sheet, HeartScale
  scenes/    RelationshipSelect, QuizFlow, PersonalInfo, DobPicker, Analysis,
             PartialResults, MicroOffer, Checkout, Upsell, FinalReport,
             EmailCapture, ShareExperience
  analytics/ track.ts
  lib/       cn.ts, format.ts, useReducedMotion.ts, useHaptics.ts
docs/superpowers/specs/2026-07-01-love-compatibility-funnel-design.md
```

---

## 4. State architecture (Zustand + persist)

```ts
type Gender = 'male' | 'female' | 'nonbinary' | 'unspecified';
interface Person { name: string; gender: Gender; dob: string | null } // ISO yyyy-mm-dd

interface QuizState {
  // progress
  step: StepId;
  history: StepId[];
  completedSteps: StepId[];
  startedAt: number | null;
  lastActiveAt: number | null;
  // answers
  relationshipType: RelationshipTypeId | null;
  answers: Record<string, string | string[]>;
  // profile
  you: Person;
  partner: Person;
  // derived (cached)
  results: CompatibilityResult | null;
  // monetization
  order: { microOfferPurchased: boolean; upsellPurchased: boolean; items: OrderItem[]; total: number };
  email: string | null;
  // delight
  seenEvents: string[];
  shareCount: number;
  // actions
  setRelationship, answer, setYou, setPartner, computeResults,
  next, back, goto, purchaseMicro, purchaseUpsell, setEmail, markEventSeen, reset
}
```

- `persist` middleware → `localStorage['lovecompat:v1']`, version-migrated.
- `computeResults()` runs the engine once after DOB is set; memoized by a hash of `(you, partner, relationshipType, key answers)`.

---

## 5. Local compatibility engine (deterministic, no APIs)

All pure functions. A **stable seed** = hash of `(you.dob, partner.dob, normalized names)` drives all "random" selection via `mulberry32`, so the same couple always gets the same magical result (shareable, re-openable), yet results feel bespoke.

### 5.1 `zodiac.ts`
- `getZodiac(dob) → { sign, element, modality, polarity, rulingPlanet, glyph, dateRange }`. 12 signs via date-range table.
- Elements: Fire/Earth/Air/Water. Modalities: Cardinal/Fixed/Mutable.
- `elementCompat(a,b) → 0..1` matrix (same element high; Fire+Air, Earth+Water high; classic tension pairs lower but never 0).

### 5.2 `numerology.ts`
- `lifePath(dob) → number` — sum all digits of yyyy+mm+dd, reduce to 1–9, **preserve masters 11/22/33**.
- `expressionNumber(name) → number` — Pythagorean letter→digit sum (optional flavor).
- `lifePathCompat(a,b) → 0..1` matrix.

### 5.3 `archetype.ts`
- 8 archetypes: **Romantic Dreamer, Adventurer, Nurturer, Explorer, Visionary, Creator, Leader, Protector.**
- `getArchetype(person, answers) → Archetype` from (sun element + modality + life path + a couple of quiz answers). Each archetype: `{ id, title, blurb, strengths[], loveLanguageLean, emoji, palette }`.
- `archetypeSynergy(a,b) → 0..1` matrix (complementary pairs score high).

### 5.4 `compatibility.ts`
- `computeCompatibility(ctx) → CompatibilityResult`.
- Base score = weighted sum (0..1 → 0..100):
  - elementCompat ×0.22, modality harmony ×0.10, lifePathCompat ×0.20, archetypeSynergy ×0.20, answerAlignment ×0.18, seededOrganicJitter ×0.10.
  - `answerAlignment`: shared "destined=yes", high importance, positive vibe words add; "complicated/uncertain" softens but is reframed as growth.
- **Feel-good band:** final = clamp(round(raw), 62, 98), with a gentle curve pushing most into 75–95. Seeded ±3 jitter for organic feel.
- 7 subscores (each 0..100, banded warm), derived from weighted components emphasizing each theme:
  - Soulmate Potential, Future Together, Chemistry, Communication, Hidden Challenges (framed as "growth areas"), Emotional Connection, Long-Term Potential.
- `label(score)`: 92+ "Rare Soulmate Connection ❤️", 84–91 "Excellent Match", 76–83 "Strong & Promising", 68–75 "Growing Connection", else "Worth Nurturing". Always warm.

### 5.5 `commonThings.ts`
- Curated pools: activities, travel, food, movies, hobbies, communication, romance, lifestyle.
- `getCommonThings(ctx) → string[]` — seeded selection of 6–8 "You both may…" statements, biased by shared element/archetype so they feel earned. Warm, possibility-framed.

### 5.6 `narrative.ts`
- Assembles result copy from templates + seeded variation pools (no LLM, still varied): overview paragraph, per-section teaser + full text, advice list.

### 5.7 `seededRandom.ts`
- `hashSeed(...parts) → uint32`, `mulberry32(seed) → () => number`, `pick(rng, arr)`, `sample(rng, arr, n)`, `shuffle(rng, arr)`.

### 5.8 Tests (`__tests__`, Vitest)
- Determinism: same inputs → identical results.
- Score always in band, never NaN.
- Every sign/archetype reachable; life-path masters preserved.
- Common-things returns requested count, no dupes.

---

## 6. Event engine (contextual comic events)

```ts
interface Trigger {
  id: string;
  when: (ctx: EventContext) => boolean;
  mascot: 'cupid' | 'matchmaker' | 'fortuneCat';
  mood: string;
  message: (ctx: EventContext) => string;
  slot: 'afterRelationship' | 'afterDob' | 'analysis' | 'results' | 'any';
  weight: number;
  oncePerSession?: boolean;
}
```
- `EventContext` = store + engine outputs (rel type, ageGapYears, sameBirthday, sameZodiac, sameElement, masterLifePath, longMarriage, veryHighScore, …).
- `getEventsFor(ctx, slot) → Trigger[]` — filter by `when` + slot, exclude `seenEvents`, sort by weight, return top N.
- 20+ warm, never-shaming triggers. Examples:
  - Secret Crush → "Your secret is safe with us 🤫" / "Some of the best love stories begin with a secret crush ❤️"
  - Big age gap → "Love sometimes writes its own rules ❤️"
  - Same birthday → "Wow — sharing a birthday is incredibly special 🎉"
  - Same zodiac → "Two souls under the same stars… interesting ✨"
  - Same element → "Kindred energies — this could run deep 🌊🔥"
  - Master life path (11/22/33) → "A rare numerical signature is glowing here ✨"
  - Long marriage + curious → "Years together and still curious? That's beautiful 💕"
  - Ex partner → gentle/empowering, never bitter.
  - Just curious → playful.
  - Very high score → "Whoa… this connection is radiating unusually strong energy ✨"
- Tone rule: always warm, romantic, playful, positive. Never shame or judge.

---

## 7. Animation system (Framer Motion)

- `design/motion.ts` central variants: `sceneEnter/Exit` (slide+fade+scale), `cardSelect` (pop+glow+checkmark burst), `staggerChildren`, `bubblePop`, `sparkleBurst`, `scoreCountUp`, `lockShimmer`, `floatIdle`.
- `AnimatePresence mode="wait"` between scenes.
- `Particles.tsx`: shared hearts/sparkles/glow field; intensity per scene (calm → crescendo during analysis/reveal). Capped count; paused offscreen; Canvas where dense.
- **Reduced motion:** `prefers-reduced-motion` → fades only, particles off.
- **Haptics:** `useHaptics()` → `navigator.vibrate` on select/next/reveal where supported.
- **Perf:** transform/opacity only, `will-change`, lazy-mount heavy scenes, no layout thrash.

---

## 8. Mobile UI design system

- **Vibe:** premium romantic webtoon — cinematic, magical, elegant. Not kawaii/cartoon.
- **Color tokens:** indigo-night base (`#1a1230`-ish), plum, rose (`#ff5d8f`-ish), blush, gold (`#ffd27d`-ish), starlight. Layered radial gradients + animated aurora + drifting particles.
- **Surfaces:** glassmorphism (blur + translucency), 20–28px radius, soft shadow + rim-light glow.
- **Type:** display serif (Playfair-style) for headlines; humanist sans (Plus Jakarta Sans) for UI. `next/font`, self-hosted.
- **CTAs:** ≥56px, gradient fill, sticky bottom bar with `env(safe-area-inset-bottom)`, micro-press, glow.
- **Choice cards:** full-width, ≥48px, icon + label; selected = scale + gold ring + checkmark burst.
- **Progress:** top heart-trail gradient bar; milestone sparkles; "almost there" near end.
- **Layout:** 100dvh vertical scenes, safe-area aware, one action per screen, thumb-zone CTAs, 8pt spacing.

---

## 9. Screen-by-screen + copy

1. **Relationship Select** — "Who would you like to check compatibility with? 💞" 10 webtoon cards (Married 💍, Engaged 💍, Boyfriend/Girlfriend 💕, Secret Crush 😍, Secret Relationship 🤫, Someone I Like 💖, Friend/Best Friend 👫, Ex 💔, Future Life Partner 💍, Just Curious 👀). Cupid waves. Tap = satisfying select + auto-advance. Progress starts immediately.
2. **Q2 Motivation** — "What made you check compatibility today?" (I truly love them / Can't stop thinking about them / We have challenges / I want to know our future / Just curious).
3. **Q3 Curiosity** — "What are you most curious to discover?" (Soulmate potential / Future together / Chemistry / Communication / Hidden challenges / Emotional connection). Seeds the most-teased locked section.
4. **Q4 Importance** — "How important is this relationship to you?" 5-heart scale.
5. **Q5 One word** — "Describe this relationship in one word." (Magical / Exciting / Passionate / Complicated / Stable / Uncertain).
6. **Q6 Destiny** — "Do you believe some relationships are destined?" (Absolutely / Maybe / Not sure).
7. **Q7 Unusual connection** — "Have you ever felt an unusual connection with this person?" (Yes, often / Once or twice / Not yet).
8. **Q8 Surprise** — "What result would surprise you the most?" (We're soulmates / We're a perfect match / We have hidden challenges / We're meant to be).
9. **Personal Info** — dual card "You ❤️ [Partner]". Names + gender (optional). Labels adapt: "Your Crush's Name", "Your Spouse's Name", "Your Ex's Name", etc.
10. **Magical DOB Picker** — cosmic wheel selector for each birthday; on set → sparkles ✨ + hearts ❤️ + glow 🌙. Fires event engine (same birthday, age gap…).
11. **Cinematic Analysis (20–30s)** — rotating beats ("Reading emotional energies…", "Discovering hidden compatibility patterns…", "Calculating soulmate resonance…"), comic panels, building progress, mascot beats, particle crescendo. Results computed instantly under the hood; time is anticipation theater.
12. **Partial Results** — count-up aura ring "87% · Excellent Match ❤️". Unlocked: Overall Compatibility (+1–2 free "You both…"). Locked & shimmering: Soulmate Potential, Future Together, Hidden Challenges, Shared Interests, Emotional Compatibility, Communication, Long-Term, Personalized Advice. Maximum tension.
13. **Micro-Offer ($2–$5)** — "Unlock Your Full Compatibility Report". Value stack (what's inside), urgency (today-only reveal price, anchored vs. "full"), trust (secure, instant, N analyzed today, mini testimonials). Big CTA.
14. **Checkout (simulated)** — mobile checkout, order summary, trust badges, mock Apple/Google-Pay buttons → success.
15. **One-Click Upsell ($19–$39)** — Premium Deep-Dive: future forecast, marriage potential, intimacy compatibility, emotional growth plan, date ideas, conflict resolution, communication guide. One tap to add (no payment re-entry); "No thanks" continues. AOV.
16. **Final Report** — full unlocked report (score breakdown, all sections, common things, both archetype profiles, advice) with runtime visuals. Gated by purchases.
17. **Email Capture** — "Save your love report + get your weekly compatibility insight 💌". Single field, skip allowed (loss-framed).
18. **Share** — runtime Canvas → PNG brag card; share to Meta/Snap Stories; "Check YOUR match" viral loop + referral framing.

(1–2 mascot comic beats inserted between questions for delight.)

---

## 10. Runtime art + mascots (code-generated)

- **Mascots** — parametric SVG with moods:
  - **Cupid** — modern cherub, soft rose, little wings + glowing arrow; moods wave/wink/gasp/cheer/blush.
  - **Cosmic Matchmaker** — celestial mystic, starlit cloak, constellation freckles, glowing orb; moods knowing/reveal/ponder.
  - **Fortune Cat** — lucky, gold accents, waving paw + coin; moods lucky/giggle/surprised.
  - One `<Mascot variant mood/>` component; expression via SVG part swaps; idle float + blink.
- **Webtoon system** — `ComicPanel` frame + `SpeechBubble` + generative gradient backdrops + `Avatar` (initials + zodiac glyph + aura) for You/Partner.
- **Visuals** — `AuraRing` (animated score), `Constellation` (traits/zodiac), particle fields, aurora backgrounds — all procedural.
- **Share card** — hidden Canvas drawn at runtime → exported PNG.
- Swappable: `<Mascot/>`/`<Illustration/>` components isolate art so commissioned webtoon assets can replace internals later.

---

## 11. CRO recommendations (baked in)

- Land directly on Q1 (no LP); progress bar from first tap (endowment/sunk-cost).
- Tap-only early → high start→completion.
- Labeled progress + "almost there".
- Personalization echo (partner's name everywhere post-collection).
- Open loops + locked sections → curiosity gap → micro-offer.
- Price anchoring + value stacking + social-proof counters + trust badges + instant-delivery.
- One-click upsell (no payment re-entry) → AOV.
- Loss-framed skips ("Your report may not be saved").
- Share loop with prefilled brag card → virality.
- Auto-save + resume → recover abandoners.
- Analytics events at every micro-step.

---

## 12. Analytics

- `analytics/track.ts`: `track(event, props)` fans out to Meta Pixel (`fbq`) + Snap Pixel (`snaptr`) + console, **only when env IDs present** (`NEXT_PUBLIC_FB_PIXEL_ID`, `NEXT_PUBLIC_SNAP_PIXEL_ID`). None required to run.
- Events: `QuizStart, ViewStep(step), AnswerQuestion, ProfileComplete, AnalysisComplete, ViewResults, ViewOffer, InitiateCheckout, Purchase(value), ViewUpsell, UpsellPurchase(value), Lead, Share`.

---

## 13. Build order

1. Scaffold (Next 15, TS, Tailwind, Framer Motion, Zustand, Vitest) + tokens/fonts/globals.
2. Store + FunnelController + steps registry + transitions + progress + BackgroundFX.
3. Engine + tests.
4. Content (relationship types, questions, copy, offers).
5. UI primitives + art/mascots.
6. Scenes 1–18 wired to store + engine + events.
7. Event engine + triggers + MascotLayer.
8. Analysis + results + share card (Canvas).
9. Monetization scenes (micro-offer, mock checkout, upsell, final report).
10. Email + share + analytics + reduced-motion + perf pass.

---

## 14. Testing & quality

- Vitest unit tests for engine determinism + banding + masters.
- Manual mobile QA: 100dvh, safe-area, thumb reach, tap targets ≥48px.
- Reduced-motion verified.
- Lighthouse/perf: transforms-only animation, lazy scenes, capped particles.
- Never-shame copy review across all events.
