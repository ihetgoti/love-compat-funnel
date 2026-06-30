import type { Person, ResultFlags, ZodiacSign, CompatibilityResult } from '@/engine/types';
import { getZodiac } from '@/engine/zodiac';
import { lifePathFromDob, isMasterNumber } from '@/engine/numerology';
import type { RelationshipTypeId } from '@/content/relationshipTypes';
import type { MascotName } from '@/art/Mascot';
import { TRIGGERS } from './triggers';

export type EventSlot = 'afterRelationship' | 'afterDob' | 'results';

export interface EventContext {
  relationshipType: RelationshipTypeId | null;
  you: Person;
  partner: Person;
  youSign: ZodiacSign;
  partnerSign: ZodiacSign;
  flags: ResultFlags | null;
  score: number | null;
}

export interface Trigger {
  id: string;
  slot: EventSlot;
  weight: number;
  mascot: MascotName;
  mood: string;
  when: (ctx: EventContext) => boolean;
  message: (ctx: EventContext) => string;
}

export interface MascotEvent {
  id: string;
  mascot: MascotName;
  mood: string;
  message: string;
}

function yearsDiff(aIso: string, bIso: string): number {
  const a = Date.parse(aIso);
  const b = Date.parse(bIso);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.abs(Math.round((a - b) / (365.25 * 86_400_000)));
}

/** Build the context the triggers evaluate against. Works before full results
 *  exist (for the afterDob slot) by deriving lightweight flags from the DOBs. */
export function buildEventContext(args: {
  relationshipType: RelationshipTypeId | null;
  you: Person;
  partner: Person;
  results: CompatibilityResult | null;
}): EventContext {
  const { relationshipType, you, partner, results } = args;
  const youSign = getZodiac(you.dob);
  const partnerSign = getZodiac(partner.dob);

  let flags = results?.flags ?? null;
  if (!flags && you.dob && partner.dob) {
    flags = {
      sameSign: youSign.id === partnerSign.id,
      sameElement: youSign.element === partnerSign.element,
      sameBirthday: you.dob.slice(5) === partner.dob.slice(5),
      ageGapYears: yearsDiff(you.dob, partner.dob),
      masterNumber: isMasterNumber(lifePathFromDob(you.dob)) || isMasterNumber(lifePathFromDob(partner.dob)),
      sharedLifePath: lifePathFromDob(you.dob) === lifePathFromDob(partner.dob),
      veryHighScore: false,
    };
  }

  return {
    relationshipType,
    you,
    partner,
    youSign,
    partnerSign,
    flags,
    score: results?.score ?? null,
  };
}

/** Highest-priority unseen event for a slot, or null. */
export function pickEvent(ctx: EventContext, slot: EventSlot, seen: string[]): MascotEvent | null {
  const matches = TRIGGERS.filter(
    (t) => t.slot === slot && !seen.includes(t.id) && safeWhen(t, ctx),
  ).sort((a, b) => b.weight - a.weight);
  const t = matches[0];
  if (!t) return null;
  return { id: t.id, mascot: t.mascot, mood: t.mood, message: t.message(ctx) };
}

function safeWhen(t: Trigger, ctx: EventContext): boolean {
  try {
    return t.when(ctx);
  } catch {
    return false;
  }
}
