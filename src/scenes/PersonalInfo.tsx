'use client';

import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useQuizStore } from '@/store/useQuizStore';
import { getRelationshipType } from '@/content/relationshipTypes';
import type { Gender } from '@/engine/types';
import { riseItem, staggerContainer } from '@/design/motion';
import { haptic } from '@/design/haptics';
import { track } from '@/analytics/track';
import { cn } from '@/lib/cn';
import { ScrollHint } from '@/components/ui/ScrollHint';

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'nonbinary', label: 'Non-binary' },
  { id: 'unspecified', label: 'Prefer not to say' },
];

function GenderChips({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {GENDERS.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => {
            haptic('select');
            onChange(g.id);
          }}
          className={cn(
            'tap rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors',
            value === g.id
              ? 'border-rose/70 bg-rose/20 text-starlight shadow-[0_0_15px_rgba(255,93,143,0.3)]'
              : 'border-white/15 bg-white/5 text-muted hover:bg-white/10',
          )}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

export function PersonalInfo() {
  const rt = getRelationshipType(useQuizStore((s) => s.relationshipType));
  const you = useQuizStore((s) => s.you);
  const partner = useQuizStore((s) => s.partner);
  const setYou = useQuizStore((s) => s.setYou);
  const setPartner = useQuizStore((s) => s.setPartner);
  const next = useQuizStore((s) => s.next);

  const ready = you.name.trim().length > 0 && partner.name.trim().length > 0;
  const partnerLabel = rt?.partnerLabel ?? 'Your Partner';
  const partnerNameLabel = rt?.nameLabel ?? "Your Partner's Name";

  return (
    <SceneShell>
      <ScrollHint />
      <motion.h1
        variants={riseItem}
        initial="initial"
        animate="animate"
        className="text-[1.6rem] font-extrabold leading-tight"
      >
        Now… the <span className="romance-text">two of you</span> 💞
      </motion.h1>
      <p className="mt-1.5 text-sm text-muted">A few details so I can read your one-of-a-kind connection.</p>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-6 flex flex-col gap-3"
      >
        <motion.div variants={riseItem} className="glass rounded-3xl p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blush">You</div>
          <Field label="Your Name" value={you.name} onChange={(v) => setYou({ name: v })} placeholder="Your first name" />
          <GenderChips value={you.gender} onChange={(g) => setYou({ gender: g })} />
        </motion.div>

        <div className="flex items-center justify-center">
          <span className="anim-glow text-3xl">❤️</span>
        </div>

        <motion.div variants={riseItem} className="glass rounded-3xl p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blush">{partnerLabel}</div>
          <Field
            label={partnerNameLabel}
            value={partner.name}
            onChange={(v) => setPartner({ name: v })}
            placeholder="Their first name"
          />
          <GenderChips value={partner.gender} onChange={(g) => setPartner({ gender: g })} />
        </motion.div>
      </motion.div>

      <StickyCta caption={ready ? '🔒 Private — never shared' : 'Enter both names to continue'}>
        <Button
          disabled={!ready}
          className={!ready ? 'opacity-50' : ''}
          onClick={() => {
            if (!ready) return;
            haptic('tap');
            track('AnswerQuestion', { q: 'names', a: 'filled' });
            next();
          }}
        >
          Continue →
        </Button>
      </StickyCta>
    </SceneShell>
  );
}
