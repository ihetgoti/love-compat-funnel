'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RELATIONSHIP_TYPES, type RelationshipTypeId } from '@/content/relationshipTypes';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { SceneShell } from '@/components/ui/SceneShell';
import { BrandMark } from '@/components/ui/BrandMark';
import { Mascot } from '@/art/Mascot';
import { SpeechBubble } from '@/art/SpeechBubble';
import { useQuizStore } from '@/store/useQuizStore';
import { staggerContainer, riseItem } from '@/design/motion';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';
import { ScrollHint } from '@/components/ui/ScrollHint';

export function RelationshipSelect() {
  const setRelationship = useQuizStore((s) => s.setRelationship);
  const start = useQuizStore((s) => s.start);
  const next = useQuizStore((s) => s.next);
  const current = useQuizStore((s) => s.relationshipType);
  const [picked, setPicked] = useState<RelationshipTypeId | null>(current);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  // Re-selection is always allowed (users coming back to change their answer).
  // A quick second tap just replaces the choice and restarts the short advance.
  const choose = (id: RelationshipTypeId) => {
    setPicked(id);
    setRelationship(id);
    start();
    track('QuizStart', { relationship: id });
    haptic('success');
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => next(), 460);
  };

  return (
    <SceneShell>
      <ScrollHint />
      <motion.div variants={riseItem} initial="initial" animate="animate" className="mb-2 flex justify-center">
        <BrandMark size="md" />
      </motion.div>
      <motion.div variants={riseItem} initial="initial" animate="animate" className="mb-3 flex items-end gap-2">
        <Mascot name="cupid" mood="wink" size={62} />
        <SpeechBubble tail="left" className="mb-1">
          Hi, I’m Cupid 💘 Let’s discover your match…
        </SpeechBubble>
      </motion.div>

      <motion.h1
        variants={riseItem}
        initial="initial"
        animate="animate"
        className="text-[1.7rem] font-extrabold leading-tight"
      >
        Who would you like to check <span className="romance-text">compatibility</span> with?
      </motion.h1>
      <p className="mt-1.5 text-sm text-muted">Tap one to begin — this stays completely private. 🔒</p>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-5 grid grid-cols-2 gap-3"
      >
        {RELATIONSHIP_TYPES.map((rt) => (
          <ChoiceCard
            key={rt.id}
            layout="tile"
            emoji={rt.emoji}
            label={rt.label}
            subtitle={rt.subtitle}
            selected={picked === rt.id}
            onSelect={() => choose(rt.id)}
          />
        ))}
      </motion.div>
    </SceneShell>
  );
}
