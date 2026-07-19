'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { BrandMark } from '@/components/ui/BrandMark';
import { AuraRing } from '@/art/AuraRing';
import { Avatar } from '@/art/Avatar';
import { Mascot } from '@/art/Mascot';
import { Particles } from '@/art/Particles';
import { useQuizStore } from '@/store/useQuizStore';
import type { ReportSection } from '@/engine/report';
import { staggerContainer, riseItem } from '@/design/motion';
import { firstName } from '@/lib/format';
import { haptic } from '@/design/haptics';
import type { PersonProfile } from '@/engine/types';

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="cta-gradient h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function ArchetypeCard({ profile, who }: { profile: PersonProfile; who: string }) {
  return (
    <div className="flex-1 rounded-3xl glass p-4">
      <div className="flex items-center gap-3">
        <Avatar
          name={profile.person.name || who}
          gender={profile.person.gender}
          dob={profile.person.dob}
          element={profile.zodiac.element}
          glyph={profile.zodiac.glyph}
          size={52}
        />
        <div>
          <div className="text-xs font-semibold text-muted">{firstName(profile.person.name, who)}</div>
          <div className="text-[15px] font-extrabold text-starlight">
            {profile.archetype.emoji} {profile.archetype.short}
          </div>
          <div className="text-xs text-muted">
            {profile.zodiac.name} {profile.zodiac.glyph} · Life Path {profile.lifePath}
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-starlight/85">{profile.archetype.blurb}</p>
    </div>
  );
}

/** A sealed chapter — tap to break the seal and reveal the content. */
function ChapterCard({
  section,
  index,
  opened,
  onOpen,
  teaser,
  premiumUnlocked,
}: {
  section: ReportSection;
  index: number;
  opened: boolean;
  onOpen: () => void;
  teaser?: { icon: string; title: string; headline: string };
  premiumUnlocked: boolean;
}) {
  if (!opened) {
    return (
      <motion.button
        variants={riseItem}
        onClick={() => {
          haptic('success');
          onOpen();
        }}
        className="lock-shimmer tap relative w-full overflow-hidden rounded-2xl border border-rose/25 bg-white/[0.05] px-4 py-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose/15 text-2xl">
            {section.icon}
          </span>
          <span className="flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
              Chapter {index + 1}
              {section.starred ? ' · ⭐ what you came for' : ''}
            </span>
            <span className="block text-[15px] font-extrabold text-starlight">{section.title}</span>
          </span>
          <span className="rounded-full bg-rose/20 px-3 py-1.5 text-xs font-bold text-blush">
            Tap to open 💌
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="rounded-2xl border border-white/12 bg-white/[0.05] p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-starlight">
          {section.icon} {section.title}
        </span>
        {typeof section.score === 'number' ? (
          <span className="shrink-0 text-sm font-extrabold gold-text">{section.score}%</span>
        ) : null}
      </div>
      {section.starred ? (
        <div className="mt-1.5 inline-block rounded-full bg-rose/20 px-2 py-0.5 text-[11px] font-bold text-blush">
          ⭐ What you came to discover
        </div>
      ) : null}
      {typeof section.score === 'number' ? <ScoreBar value={section.score} /> : null}

      <p className="mt-2.5 text-[13px] font-bold text-blush">{section.headline}</p>
      {section.body.map((p, i) => (
        <p key={i} className="mt-1.5 text-sm leading-relaxed text-starlight/90">
          {p}
        </p>
      ))}
      {section.bullets?.length ? (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-starlight/85">
              <span className="text-rose">›</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Curiosity hook: what the premium deep-dive adds on this exact topic. */}
      {teaser && !premiumUnlocked ? (
        <div className="mt-3 rounded-xl border border-gold/25 bg-gold/[0.07] px-3 py-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gold">
            🔒 In the Premium Deep-Dive
          </div>
          <div className="mt-0.5 text-[13px] font-semibold text-starlight/90">
            {teaser.icon} {teaser.title} — <span className="text-muted">{teaser.headline}</span>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

/** Gold, already-open premium chapter (rendered after the upsell purchase). */
function PremiumCard({ section }: { section: ReportSection }) {
  return (
    <motion.div variants={riseItem} className="rounded-2xl border border-gold/25 bg-gold/[0.06] p-4">
      <div className="text-sm font-bold text-gold">
        {section.icon} {section.title}
      </div>
      <p className="mt-2 text-[13px] font-bold text-blush">{section.headline}</p>
      {section.body.map((p, i) => (
        <p key={i} className="mt-1.5 text-sm leading-relaxed text-starlight/90">
          {p}
        </p>
      ))}
      {section.bullets?.length ? (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-starlight/85">
              <span className="text-gold">›</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </motion.div>
  );
}

/** Full-screen celebration when the last chapter is read → flows into the upsell. */
function FinishedOverlay({ show, onContinue }: { show: boolean; onContinue: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {show ? (
        <motion.div
          key="finished"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-6 text-center"
          style={{
            background: 'radial-gradient(125% 95% at 50% 38%, rgba(52,27,84,0.99), #0e0820 78%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <Particles count={20} variant="mixed" />
          <motion.div
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="relative flex flex-col items-center"
          >
            <Mascot name="cupid" mood="cheer" size={140} />
            <h2 className="mt-4 text-2xl font-extrabold text-starlight">
              You’ve read your full reading ✨
            </h2>
            <p className="mt-2 max-w-[19rem] text-sm leading-relaxed text-muted">
              But there’s a deeper layer we couldn’t fit in this report — the part that tells you
              what to <span className="font-bold text-blush">do</span> about everything you just learned…
            </p>
            <div className="mt-6 w-64">
              <Button
                variant="gold"
                onClick={() => {
                  haptic('success');
                  onContinue();
                }}
              >
                Show me what’s next →
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function FinalReport() {
  const results = useQuizStore((s) => s.results);
  const report = useQuizStore((s) => s.report);
  const reportLoading = useQuizStore((s) => s.reportLoading);
  const reportError = useQuizStore((s) => s.reportError);
  const fetchReport = useQuizStore((s) => s.fetchReport);
  const openedChapters = useQuizStore((s) => s.openedChapters);
  const openChapter = useQuizStore((s) => s.openChapter);
  const order = useQuizStore((s) => s.order);
  const upsellDeclined = useQuizStore((s) => s.upsellDeclined);
  const hydrated = useQuizStore((s) => s.hydrated);
  const goto = useQuizStore((s) => s.goto);
  const next = useQuizStore((s) => s.next);

  // Deep-link guard: no report without the micro purchase.
  useEffect(() => {
    if (hydrated && !order.microPurchased) goto('offer');
  }, [hydrated, order.microPurchased, goto]);

  // Content is generated on the backend; fetch (cached) once purchased.
  useEffect(() => {
    if (order.microPurchased) void fetchReport();
  }, [order.microPurchased, fetchReport]);

  const openedCount = useMemo(
    () => (report ? report.sections.filter((s) => openedChapters.includes(s.id)).length : 0),
    [report, openedChapters],
  );
  const total = report?.sections.length ?? 0;
  const allOpened = total > 0 && openedCount >= total;
  const upsellPending = allOpened && !order.upsellPurchased && !upsellDeclined;
  const [overlayDismissed, setOverlayDismissed] = useState(false);

  if (!results) return <SceneShell flush>{null}</SceneShell>;

  return (
    <SceneShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={riseItem} className="mb-1 flex justify-center">
          <BrandMark />
        </motion.div>
        <motion.div variants={riseItem} className="text-center text-sm font-semibold text-blush">
          {report?.title ?? 'Your Full Love Report'} 💞
        </motion.div>
        <motion.div variants={riseItem} className="mt-1 text-center text-xs text-muted">
          {report?.subtitle ?? ''}
        </motion.div>

        <motion.div variants={riseItem} className="mt-4 flex flex-col items-center">
          <AuraRing score={results.score} label={results.label} sub={results.tagline} size={170} stroke={12} />
        </motion.div>

        {/* ---------- backend generation states ---------- */}
        {reportLoading || (!report && !reportError) ? (
          <motion.div variants={riseItem} className="mt-6 rounded-3xl glass p-5 text-center">
            <div className="anim-glow text-3xl">🖋️</div>
            <div className="mt-2 text-sm font-bold text-starlight">Writing your report…</div>
            <div className="mt-1 text-xs text-muted">
              Weaving your answers into {total || 8} personal chapters
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="lock-shimmer h-3 overflow-hidden rounded-full bg-white/10" />
              ))}
            </div>
          </motion.div>
        ) : null}

        {reportError && !report ? (
          <motion.div variants={riseItem} className="mt-6 rounded-3xl glass p-5 text-center">
            <div className="text-3xl">💔</div>
            <div className="mt-2 text-sm font-bold text-starlight">
              We couldn’t reach the report writer
            </div>
            <div className="mx-auto mt-3 w-44">
              <Button variant="secondary" glow={false} onClick={() => void fetchReport()}>
                Try again
              </Button>
            </div>
          </motion.div>
        ) : null}

        {report ? (
          <>
            {/* Intro — written from their answers, on the backend */}
            <motion.div variants={riseItem} className="mt-5 rounded-3xl glass p-4">
              {report.intro.map((p, i) => (
                <p key={i} className={`text-sm leading-relaxed text-starlight/90 ${i > 0 ? 'mt-2' : ''}`}>
                  {p}
                </p>
              ))}
            </motion.div>

            <motion.div variants={riseItem} className="mt-6 flex gap-3">
              <ArchetypeCard profile={results.you} who="You" />
              <ArchetypeCard profile={results.partner} who="Them" />
            </motion.div>

            {/* Reading progress */}
            <motion.div variants={riseItem} className="mt-7">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-starlight">Your Chapters</h2>
                <span className="text-xs font-bold text-gold">
                  {openedCount} of {total} opened
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="cta-gradient h-full rounded-full"
                  initial={false}
                  animate={{ width: `${total ? (openedCount / total) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              {!allOpened ? (
                <p className="mt-1.5 text-xs text-muted">
                  Tap each sealed chapter to reveal it 💌
                </p>
              ) : null}
            </motion.div>

            <div className="mt-4 flex flex-col gap-3">
              {report.sections.map((s, i) => (
                <ChapterCard
                  key={s.id}
                  section={s}
                  index={i}
                  opened={openedChapters.includes(s.id)}
                  onOpen={() => openChapter(s.id)}
                  teaser={s.teaser}
                  premiumUnlocked={order.upsellPurchased}
                />
              ))}
            </div>

            {/* Bonus after finishing */}
            {allOpened ? (
              <>
                <h2 className="mb-3 mt-8 text-lg font-extrabold text-starlight">
                  Bonus · What You Share
                </h2>
                <ul className="flex flex-col gap-2">
                  {results.commonThings.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-2xl bg-white/[0.04] px-3.5 py-2.5 text-sm text-starlight/90"
                    >
                      <span className="text-rose">💕</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {/* Premium chapters — only exist visually once purchased */}
            {order.upsellPurchased ? (
              <>
                <h2 className="mb-3 mt-8 text-lg font-extrabold text-starlight">
                  Premium Deep-Dive 🔓
                </h2>
                <div className="flex flex-col gap-3">
                  {report.premiumSections.map((s) => (
                    <PremiumCard key={s.id} section={s} />
                  ))}
                </div>
              </>
            ) : null}

            {allOpened && upsellDeclined && !order.upsellPurchased ? (
              <button
                onClick={() => {
                  haptic('tap');
                  goto('upsell');
                }}
                className="lock-shimmer tap mt-6 w-full overflow-hidden rounded-2xl border border-gold/30 bg-gold/[0.06] p-4 text-left"
              >
                <div className="text-sm font-bold text-gold">🔒 Changed your mind?</div>
                <div className="mt-1 text-xs text-muted">
                  The 8-chapter Premium Deep-Dive is still waiting for you two.
                </div>
              </button>
            ) : null}

            <motion.div
              variants={riseItem}
              className="mt-6 rounded-3xl border border-rose/25 bg-rose/[0.06] p-4 text-center"
            >
              <p className="text-sm font-semibold leading-relaxed text-starlight">{report.closing}</p>
            </motion.div>
          </>
        ) : null}
      </motion.div>

      {/* CTA only once the reading is complete (and the upsell moment has passed) */}
      {allOpened && !upsellPending ? (
        <StickyCta caption="Don’t lose your reading 💌">
          <Button
            variant="primary"
            onClick={() => {
              haptic('tap');
              goto('email');
            }}
          >
            Save My Report →
          </Button>
        </StickyCta>
      ) : null}

      <FinishedOverlay
        show={upsellPending && !overlayDismissed}
        onContinue={() => {
          setOverlayDismissed(true);
          next(); // → upsell scene
        }}
      />
    </SceneShell>
  );
}
