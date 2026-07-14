'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '@/store/useQuizStore';
import { type StepId, questionForStep, progressFor, showsProgressBar } from '@/funnel/steps';
import { sceneVariants } from '@/design/motion';
import { BackgroundFX } from '@/art/BackgroundFX';
import { TopProgressBar } from '@/components/ui/TopProgressBar';
import { track } from '@/analytics/track';

import { RelationshipSelect } from '@/scenes/RelationshipSelect';
import { EmotionQuestion } from '@/scenes/EmotionQuestion';
import { PersonalInfo } from '@/scenes/PersonalInfo';
import { DobPicker } from '@/scenes/DobPicker';
import { Analysis } from '@/scenes/Analysis';
import { PartialResults } from '@/scenes/PartialResults';
import { MicroOffer } from '@/scenes/MicroOffer';
import { Checkout } from '@/scenes/Checkout';
import { Upsell } from '@/scenes/Upsell';
import { FinalReport } from '@/scenes/FinalReport';
import { EmailCapture } from '@/scenes/EmailCapture';
import { ShareExperience } from '@/scenes/ShareExperience';

function renderScene(step: StepId) {
  if (step.startsWith('q-')) {
    const q = questionForStep(step);
    return q ? <EmotionQuestion question={q} /> : <RelationshipSelect />;
  }
  switch (step) {
    case 'relationship': return <RelationshipSelect />;
    case 'personal': return <PersonalInfo />;
    case 'dob': return <DobPicker />;
    case 'analysis': return <Analysis />;
    case 'results': return <PartialResults />;
    case 'offer': return <MicroOffer />;
    case 'checkout': return <Checkout />;
    case 'upsell': return <Upsell />;
    case 'report': return <FinalReport />;
    case 'email': return <EmailCapture />;
    case 'share': return <ShareExperience />;
    default: return <RelationshipSelect />;
  }
}

function intensityFor(step: StepId): 'calm' | 'normal' | 'intense' {
  if (step === 'analysis' || step === 'results' || step === 'share') return 'intense';
  return 'normal';
}

export function FunnelController() {
  const hydrated = useQuizStore((s) => s.hydrated);
  const step = useQuizStore((s) => s.step);
  const history = useQuizStore((s) => s.history);
  const back = useQuizStore((s) => s.back);

  // Rehydrate from localStorage on the client only (store uses skipHydration).
  useEffect(() => {
    void useQuizStore.persist.rehydrate();
  }, []);

  // Analytics + shallow URL sync per step.
  useEffect(() => {
    if (!hydrated) return;
    track('ViewStep', { step });
    try {
      window.history.replaceState(window.history.state, '', `?step=${step}`);
    } catch {
      /* ignore */
    }
  }, [step, hydrated]);

  // Keep the hardware/browser back button inside the funnel.
  useEffect(() => {
    if (!hydrated) return;
    window.history.pushState(null, '', window.location.href);
    const onPop = () => {
      const s = useQuizStore.getState();
      if (s.history.length > 0) {
        s.back();
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [hydrated]);

  if (!hydrated) {
    return (
      <>
        <BackgroundFX intensity="calm" />
        <div className="flex min-h-[100dvh] items-center justify-center">
          <div className="anim-glow drop-glow-rose text-5xl">💞</div>
        </div>
      </>
    );
  }

  const showBar = showsProgressBar(step);
  const progress = progressFor(step) ?? 0;
  const canBack = showBar && step !== 'analysis' && step !== 'results' && history.length > 0;

  return (
    <>
      <BackgroundFX intensity={intensityFor(step)} />
      {showBar ? <TopProgressBar progress={progress} canBack={canBack} onBack={back} /> : null}
      <main className="flex min-h-[100dvh] flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex min-h-[100dvh] flex-1 flex-col"
          >
            {renderScene(step)}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
