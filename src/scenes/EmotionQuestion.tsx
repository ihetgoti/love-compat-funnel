'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Question } from '@/content/questions';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { HeartScale } from '@/components/ui/HeartScale';
import { MascotBeat } from '@/art/MascotBeat';
import { useQuizStore } from '@/store/useQuizStore';
import { staggerContainer, riseItem } from '@/design/motion';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

export function EmotionQuestion({ question }: { question: Question }) {
  const answers = useQuizStore((s) => s.answers);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const next = useQuizStore((s) => s.next);
  const value = answers[question.id];
  const [beatShown, setBeatShown] = useState(false);
  const [locked, setLocked] = useState(false);

  const selectSingle = (val: string) => {
    if (locked) return;
    setLocked(true);
    setAnswer(question.id, val);
    track('AnswerQuestion', { q: question.id, a: val });
    if (question.beat) {
      setBeatShown(true);
      haptic('success');
      setTimeout(() => next(), 1650);
    } else {
      haptic('select');
      setTimeout(() => next(), 380);
    }
  };

  return (
    <SceneShell>
      <motion.h1
        variants={riseItem}
        initial="initial"
        animate="animate"
        className="text-[1.55rem] font-extrabold leading-tight"
      >
        {question.prompt}
      </motion.h1>
      {question.subtitle ? <p className="mt-1.5 text-sm text-muted">{question.subtitle}</p> : null}

      {question.kind === 'single' ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-6 flex flex-col gap-3"
        >
          {question.options!.map((o) => (
            <ChoiceCard
              key={o.id}
              layout="row"
              emoji={o.emoji}
              label={o.label}
              selected={value === o.id}
              onSelect={() => selectSingle(o.id)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="mt-10">
          <HeartScale
            value={Number(value) || 0}
            onChange={(v) => {
              setAnswer(question.id, String(v));
              track('AnswerQuestion', { q: question.id, a: v });
            }}
            lowLabel={question.scale!.lowLabel}
            highLabel={question.scale!.highLabel}
          />
        </div>
      )}

      <AnimatePresence>
        {beatShown && question.beat ? (
          <motion.div className="mt-7" exit={{ opacity: 0 }}>
            <MascotBeat mascot={question.beat.mascot} mood={question.beat.mood}>
              {question.beat.line}
            </MascotBeat>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {question.kind === 'scale' ? (
        <StickyCta>
          <Button
            disabled={!value}
            onClick={() => {
              if (!value) return;
              haptic('tap');
              next();
            }}
            className={!value ? 'opacity-50' : ''}
          >
            Continue
          </Button>
        </StickyCta>
      ) : null}
    </SceneShell>
  );
}
