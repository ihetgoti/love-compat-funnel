'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { WheelColumn, type WheelItem } from '@/components/ui/WheelPicker';
import { Avatar } from '@/art/Avatar';
import { MascotInterstitial } from '@/art/MascotInterstitial';
import { useQuizStore } from '@/store/useQuizStore';
import { getRelationshipType } from '@/content/relationshipTypes';
import { getZodiac } from '@/engine/zodiac';
import { buildEventContext, pickEvent, type MascotEvent } from '@/events/eventEngine';
import { prettyDate, firstName } from '@/lib/format';
import { haptic } from '@/design/haptics';
import { track } from '@/analytics/track';

const MIN_YEAR = 1940;
const MAX_YEAR = new Date().getFullYear() - 13;
const MONTHS: WheelItem[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((label, i) => ({ value: i + 1, label }));

interface DMY {
  y: number;
  m: number;
  d: number;
}
const DEFAULT: DMY = { y: 2000, m: 6, d: 15 };

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: DMY) => `${d.y}-${pad(d.m)}-${pad(d.d)}`;
function parseISO(iso: string | null): DMY | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map((p) => parseInt(p, 10));
  return y && m && d ? { y, m, d } : null;
}
function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}
function daysIn(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function DateWheel({ date, onChange }: { date: DMY; onChange: (d: DMY) => void }) {
  const years = useMemo(() => range(MIN_YEAR, MAX_YEAR).map((y) => ({ value: y, label: String(y) })), []);
  const days = useMemo(
    () => range(1, daysIn(date.y, date.m)).map((d) => ({ value: d, label: String(d) })),
    [date.y, date.m],
  );
  const yearIdx = Math.max(0, years.findIndex((it) => it.value === date.y));

  return (
    <div className="relative flex justify-center gap-1 rounded-3xl border border-white/10 bg-[#1a1030] p-2">
      <WheelColumn
        ariaLabel="Month"
        items={MONTHS}
        index={date.m - 1}
        onIndexChange={(i) => {
          const m = i + 1;
          onChange({ ...date, m, d: Math.min(date.d, daysIn(date.y, m)) });
        }}
        className="w-[36%]"
      />
      <WheelColumn
        ariaLabel="Day"
        items={days}
        index={Math.min(date.d - 1, days.length - 1)}
        onIndexChange={(i) => onChange({ ...date, d: i + 1 })}
        className="w-[26%]"
      />
      <WheelColumn
        ariaLabel="Year"
        items={years}
        index={yearIdx}
        onIndexChange={(i) => {
          const y = years[i].value;
          onChange({ ...date, y, d: Math.min(date.d, daysIn(y, date.m)) });
        }}
        className="w-[38%]"
      />
    </div>
  );
}

function SparkleBurst({ trigger }: { trigger: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const dist = 70 + (i % 3) * 26;
        return { i, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, g: i % 2 ? '✨' : '❤️' };
      }),
    [],
  );
  if (!trigger) return null;
  return (
    <div key={trigger} className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      {items.map((it) => (
        <motion.span
          key={it.i}
          initial={{ opacity: 1, scale: 0.3, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.1, x: it.dx, y: it.dy }}
          transition={{ duration: 0.95, ease: 'easeOut' }}
          className="absolute text-2xl"
        >
          {it.g}
        </motion.span>
      ))}
    </div>
  );
}

export function DobPicker() {
  const relationshipType = useQuizStore((s) => s.relationshipType);
  const rt = getRelationshipType(relationshipType);
  const you = useQuizStore((s) => s.you);
  const partner = useQuizStore((s) => s.partner);
  const setYou = useQuizStore((s) => s.setYou);
  const setPartner = useQuizStore((s) => s.setPartner);
  const compute = useQuizStore((s) => s.compute);
  const next = useQuizStore((s) => s.next);

  const [stage, setStage] = useState<'you' | 'partner'>(you.dob ? 'partner' : 'you');
  const [youDate, setYouDate] = useState<DMY>(parseISO(you.dob) ?? DEFAULT);
  const [partnerDate, setPartnerDate] = useState<DMY>(parseISO(partner.dob) ?? DEFAULT);
  const [burst, setBurst] = useState(0);
  const [event, setEvent] = useState<MascotEvent | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const isYou = stage === 'you';
  const date = isYou ? youDate : partnerDate;
  const setDate = isYou ? setYouDate : setPartnerDate;
  const sign = getZodiac(toISO(date));
  const name = isYou ? firstName(you.name, 'You') : firstName(partner.name, rt?.partnerLabel ?? 'Them');

  const finishToAnalysis = useCallback(() => {
    compute();
    next();
  }, [compute, next]);

  const confirm = () => {
    if (advancing) return;
    haptic('success');
    setBurst((b) => b + 1);
    if (isYou) {
      setYou({ dob: toISO(youDate) });
      setTimeout(() => setStage('partner'), 460);
    } else {
      const pdob = toISO(partnerDate);
      setPartner({ dob: pdob });
      setAdvancing(true);
      const ctx = buildEventContext({
        relationshipType,
        you: { ...you, dob: toISO(youDate) },
        partner: { ...partner, dob: pdob },
        results: null,
      });
      const ev = pickEvent(ctx, 'afterDob', []);
      track('ProfileComplete');
      if (ev) {
        // Full-screen comic interstitial handles the advance (3s or tap).
        setEvent(ev);
      } else {
        setTimeout(finishToAnalysis, 700);
      }
    }
  };

  return (
    <SceneShell center>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <Avatar name={name} element={sign.element} glyph={sign.glyph} size={76} />
              <h1 className="mt-3 text-[1.5rem] font-extrabold leading-tight">
                {isYou ? (
                  <>
                    When were <span className="romance-text">you</span> born?
                  </>
                ) : (
                  <>
                    And <span className="romance-text">{name}</span>?
                  </>
                )}
              </h1>
              <p className="mt-1 text-sm text-muted">Spin the wheels — your stars are listening ✨</p>
            </div>

            <div className="relative">
              <DateWheel date={date} onChange={setDate} />
              <SparkleBurst trigger={burst} />
            </div>

            <div className="mt-3 text-center text-sm font-semibold text-blush">
              ✨ {prettyDate(toISO(date))} · {sign.name} {sign.glyph}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      <StickyCta>
        <Button onClick={confirm} disabled={advancing}>
          {isYou ? 'Continue →' : 'Reveal our connection ✨'}
        </Button>
      </StickyCta>

      <MascotInterstitial
        show={!!event}
        mascot={event?.mascot ?? 'cupid'}
        mood={event?.mood}
        message={event?.message ?? ''}
        onDismiss={finishToAnalysis}
      />
    </SceneShell>
  );
}
