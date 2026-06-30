'use client';

import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { AuraRing } from '@/art/AuraRing';
import { Avatar } from '@/art/Avatar';
import { useQuizStore } from '@/store/useQuizStore';
import { UPSELL } from '@/content/offers';
import { staggerContainer, riseItem } from '@/design/motion';
import { firstName } from '@/lib/format';
import { haptic } from '@/design/haptics';
import type { PersonProfile } from '@/engine/types';

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="cta-gradient h-full rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function ArchetypeCard({ profile, who }: { profile: PersonProfile; who: string }) {
  return (
    <div className="flex-1 rounded-3xl glass p-4">
      <div className="flex items-center gap-3">
        <Avatar name={profile.person.name || who} element={profile.zodiac.element} glyph={profile.zodiac.glyph} size={52} />
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-8 text-lg font-extrabold text-starlight">{children}</h2>;
}

export function FinalReport() {
  const results = useQuizStore((s) => s.results);
  const order = useQuizStore((s) => s.order);
  const you = useQuizStore((s) => s.you);
  const partner = useQuizStore((s) => s.partner);
  const goto = useQuizStore((s) => s.goto);
  const next = useQuizStore((s) => s.next);

  if (!results) return <SceneShell flush>{null}</SceneShell>;

  return (
    <SceneShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={riseItem} className="text-center text-sm font-semibold text-blush">
          Your Love Report 💞
        </motion.div>
        <motion.div variants={riseItem} className="mt-1 text-center text-xs text-muted">
          {firstName(you.name, 'You')} <span className="text-rose">❤</span> {firstName(partner.name, 'Them')}
        </motion.div>

        <motion.div variants={riseItem} className="mt-4 flex flex-col items-center">
          <AuraRing score={results.score} label={results.label} sub={results.tagline} size={170} stroke={12} />
        </motion.div>

        <motion.div variants={riseItem} className="mt-5 rounded-3xl glass p-4">
          <p className="text-sm leading-relaxed text-starlight/90">{results.overview}</p>
        </motion.div>

        <SectionTitle>Your Archetypes</SectionTitle>
        <motion.div variants={riseItem} className="flex gap-3">
          <ArchetypeCard profile={results.you} who="You" />
          <ArchetypeCard profile={results.partner} who="Them" />
        </motion.div>

        <SectionTitle>Compatibility Breakdown</SectionTitle>
        <div className="flex flex-col gap-3.5">
          {results.subscores.map((s) => (
            <motion.div key={s.key} variants={riseItem} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-starlight">
                  {s.icon} {s.label}
                </span>
                <span className="text-sm font-extrabold gold-text">{s.score}%</span>
              </div>
              <ScoreBar value={s.score} />
              <p className="mt-2 text-xs leading-relaxed text-muted">{s.detail}</p>
            </motion.div>
          ))}
        </div>

        <SectionTitle>What You Share</SectionTitle>
        <motion.ul variants={riseItem} className="flex flex-col gap-2">
          {results.commonThings.map((c, i) => (
            <li key={i} className="flex items-start gap-2.5 rounded-2xl bg-white/[0.04] px-3.5 py-2.5 text-sm text-starlight/90">
              <span className="text-rose">💕</span>
              <span>{c}</span>
            </li>
          ))}
        </motion.ul>

        <SectionTitle>Your Highlights</SectionTitle>
        <motion.div variants={riseItem} className="grid grid-cols-1 gap-2.5">
          {results.highlights.map((h) => (
            <div key={h.title} className="rounded-2xl glass p-3.5">
              <div className="text-sm font-bold text-blush">{h.icon} {h.title}</div>
              <p className="mt-1 text-sm text-starlight/90">{h.text}</p>
            </div>
          ))}
        </motion.div>

        <SectionTitle>Your Personalized Advice</SectionTitle>
        <motion.ol variants={riseItem} className="flex flex-col gap-2.5">
          {results.advice.map((a, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] px-3.5 py-3 text-sm text-starlight/90">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose/25 text-xs font-bold text-blush">
                {i + 1}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </motion.ol>

        {/* Premium */}
        <SectionTitle>Premium Deep-Dive {order.upsellPurchased ? '🔓' : '🔒'}</SectionTitle>
        {order.upsellPurchased ? (
          <motion.div variants={riseItem} className="grid grid-cols-1 gap-2.5">
            {UPSELL.sections.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gold/25 bg-gold/[0.06] p-3.5">
                <div className="text-sm font-bold text-gold">{s.icon} {s.title}</div>
                <p className="mt-1 text-xs text-starlight/85">{s.text}</p>
                <p className="mt-1.5 text-xs italic text-muted">
                  Tailored to your {results.score}% {results.label.toLowerCase()} match.
                </p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.button
            variants={riseItem}
            onClick={() => {
              haptic('tap');
              goto('upsell');
            }}
            className="lock-shimmer tap w-full overflow-hidden rounded-2xl border border-gold/30 bg-gold/[0.06] p-4 text-left"
          >
            <div className="text-sm font-bold text-gold">🔒 Unlock the Premium Deep-Dive</div>
            <div className="mt-1 text-xs text-muted">
              12-month forecast, marriage potential, intimacy, 50 date ideas & more.
            </div>
          </motion.button>
        )}
      </motion.div>

      <StickyCta caption="Don’t lose your reading 💌">
        <Button variant="primary" onClick={() => { haptic('tap'); next(); }}>
          Save My Report →
        </Button>
      </StickyCta>
    </SceneShell>
  );
}
