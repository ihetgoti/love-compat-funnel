'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Mascot } from '@/art/Mascot';
import { SpeechBubble } from '@/art/SpeechBubble';
import { useQuizStore } from '@/store/useQuizStore';
import { riseItem, staggerContainer } from '@/design/motion';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailCapture() {
  const setEmail = useQuizStore((s) => s.setEmail);
  const existing = useQuizStore((s) => s.email);
  const next = useQuizStore((s) => s.next);
  const [val, setVal] = useState(existing ?? '');
  const valid = EMAIL_RE.test(val.trim());

  const save = () => {
    if (!valid) return;
    haptic('success');
    setEmail(val.trim());
    track('Lead');
    void fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: val.trim() }),
    }).catch(() => {});
    next();
  };

  return (
    <SceneShell center>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col items-center text-center pb-24">
        <motion.div variants={riseItem} className="flex flex-col items-center mb-6">
          <div className="comic-panel mb-4 overflow-hidden rounded-xl border-8 w-full max-w-[200px]">
            <img src="/comic_envelope.png" alt="Comic envelope" className="w-full h-auto object-cover" />
          </div>
          <div className="speech-bubble text-black font-bold text-[18px] uppercase max-w-sm">
            Save your <span className="romance-text">love report</span>
            <p className="mt-2 text-xs font-semibold">Where should I send your full report + weekly compatibility insights? 💌</p>
          </div>
        </motion.div>

        <motion.div variants={riseItem} className="mt-6 w-full text-left">
          <Field
            label="Your email"
            value={val}
            onChange={setVal}
            placeholder="you@email.com"
            type="email"
            inputMode="email"
            maxLength={64}
          />
        </motion.div>
      </motion.div>

      <StickyCta
        caption={
          <button onClick={() => { haptic('tap'); next(); }} className="tap underline-offset-2 hover:underline">
            No thanks — I’ll risk losing my report
          </button>
        }
      >
        <Button variant="primary" disabled={!valid} className={!valid ? 'opacity-50' : ''} onClick={save}>
          Send My Report 💌
        </Button>
      </StickyCta>
    </SceneShell>
  );
}
