'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/content/questions';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { HeartScale } from '@/components/ui/HeartScale';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { useQuizStore } from '@/store/useQuizStore';
import { staggerContainer, riseItem } from '@/design/motion';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

export function EmotionQuestion({ question }: { question: Question }) {
  const answers = useQuizStore((s) => s.answers);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const next = useQuizStore((s) => s.next);
  const value = answers[question.id];
  const [locked, setLocked] = useState(false);

  const selectSingle = (val: string) => {
    if (locked) return;
    setLocked(true);
    setAnswer(question.id, val);
    track('AnswerQuestion', { q: question.id, a: val });
    haptic('select');
    setTimeout(() => next(), 380);
  };

  const isChallenge = ['oneword', 'connection', 'importance'].includes(question.id);
  const comicImage = isChallenge ? '/comic_challenge.png' : '/emotions_comic.png';

  return (
    <SceneShell>
      <ScrollHint />
      <motion.div variants={riseItem} initial="initial" animate="animate" className="flex flex-col items-center mb-8">
        <div className="comic-panel mb-6 overflow-hidden rounded-xl border-8 w-full max-w-[240px]">
          <img src={comicImage} alt="Comic illustration" className="w-full h-auto object-cover" />
        </div>
        <div className="speech-bubble text-black font-bold text-xl uppercase w-full max-w-sm">
          {question.prompt}
          {question.subtitle ? <p className="mt-2 text-sm text-gray-700 font-semibold">{question.subtitle}</p> : null}
        </div>
      </motion.div>

      {question.kind === 'single' ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-2 flex flex-col gap-4 pb-24"
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
        <div className="mt-4 pb-32">
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

      {question.kind === 'scale' ? (
        <StickyCta>
          <Button
            disabled={!value}
            onClick={() => {
              if (!value) return;
              haptic('tap');
              next();
            }}
            className={!value ? 'opacity-50' : 'comic-button'}
          >
            Continue
          </Button>
        </StickyCta>
      ) : null}
    </SceneShell>
  );
}
