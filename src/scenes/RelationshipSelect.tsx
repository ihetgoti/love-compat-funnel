'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RELATIONSHIP_TYPES, type RelationshipTypeId } from '@/content/relationshipTypes';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { SceneShell } from '@/components/ui/SceneShell';
import { useQuizStore } from '@/store/useQuizStore';
import { staggerContainer, riseItem } from '@/design/motion';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

const getImageForRel = (id: RelationshipTypeId) => {
  if (id === 'crush') return '/rel_crush_comic.png';
  if (id === 'married') return '/rel_married_comic.png';
  if (id === 'ex') return '/rel_ex_comic.png';
  if (id === 'engaged') return '/rel_engaged_comic.png';
  if (id === 'partner') return '/rel_partner_comic.png';
  if (id === 'secret') return '/rel_secret_comic.png';
  if (id === 'like') return '/rel_like_comic.png';
  if (id === 'curious') return '/comic_thinking.png';
  return undefined;
};

export function RelationshipSelect() {
  const setRelationship = useQuizStore((s) => s.setRelationship);
  const start = useQuizStore((s) => s.start);
  const next = useQuizStore((s) => s.next);
  const current = useQuizStore((s) => s.relationshipType);
  const [picked, setPicked] = useState<RelationshipTypeId | null>(current);

  const choose = (id: RelationshipTypeId) => {
    if (picked) return;
    setPicked(id);
    setRelationship(id);
    start();
    track('QuizStart', { relationship: id });
    haptic('success');
    setTimeout(() => next(), 460);
  };

  return (
    <SceneShell>
      <motion.div variants={riseItem} initial="initial" animate="animate" className="mb-6 flex flex-col items-center">
        <div className="comic-panel mb-4 overflow-hidden rounded-xl border-8 w-full max-w-sm">
           <img src="/relationship_comic.png" alt="Happy couple comic" className="w-full h-auto object-cover" />
        </div>
        <div className="speech-bubble text-black font-bold text-xl uppercase max-w-xs">
          Let's discover your match!
        </div>
      </motion.div>

      <motion.h1
        variants={riseItem}
        initial="initial"
        animate="animate"
        className="text-[2rem] font-extrabold leading-tight text-center"
      >
        WHO ARE YOU CHECKING <br/><span className="text-[var(--color-comic-red)]">COMPATIBILITY</span> WITH?
      </motion.h1>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-6 grid grid-cols-2 gap-4"
      >
        {RELATIONSHIP_TYPES.map((rt) => {
          const bgImage = getImageForRel(rt.id);
          return (
            <ChoiceCard
              key={rt.id}
              layout={bgImage ? 'image' : 'tile'}
              emoji={!bgImage ? rt.emoji : undefined}
              label={rt.label}
              subtitle={!bgImage ? rt.subtitle : undefined}
              selected={picked === rt.id}
              onSelect={() => choose(rt.id)}
              bgImage={bgImage}
            />
          );
        })}
      </motion.div>
    </SceneShell>
  );
}
