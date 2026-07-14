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
            'tap border-4 px-3 py-1.5 text-xs font-black uppercase transition-all',
            value === g.id
              ? 'border-black bg-[var(--color-comic-yellow)] text-black shadow-[4px_4px_0px_#000] translate-x-[2px] translate-y-[2px]'
              : 'border-black bg-white text-black hover:shadow-[4px_4px_0px_#000]',
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
      <motion.div variants={riseItem} initial="initial" animate="animate" className="flex flex-col items-center mb-6">
        <div className="comic-panel mb-4 overflow-hidden rounded-xl border-8 w-full max-w-[200px]">
          <img src="/comic_clipboard.png" alt="Comic clipboard" className="w-full h-auto object-cover" />
        </div>
        <div className="speech-bubble text-black font-bold text-[18px] uppercase max-w-sm">
          Now… the two of you 💞
          <p className="mt-2 text-xs font-semibold">A few details so I can read your one-of-a-kind connection.</p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-6 flex flex-col gap-4 pb-24"
      >
        <motion.div variants={riseItem} className="glass rounded-xl p-4">
          <div className="mb-2 text-sm font-black uppercase tracking-wider text-black">You</div>
          <Field label="Your Name" value={you.name} onChange={(v) => setYou({ name: v })} placeholder="Your first name" />
          <GenderChips value={you.gender} onChange={(g) => setYou({ gender: g })} />
        </motion.div>

        <div className="flex items-center justify-center">
          <span className="anim-glow text-4xl" style={{ filter: 'drop-shadow(4px 4px 0px #000)' }}>❤️</span>
        </div>

        <motion.div variants={riseItem} className="glass rounded-xl p-4">
          <div className="mb-2 text-sm font-black uppercase tracking-wider text-black">{partnerLabel}</div>
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
          className={!ready ? 'opacity-50' : 'comic-button'}
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
