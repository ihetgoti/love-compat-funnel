import { computeCompatibility } from '@/engine/compatibility';
import { generateReport } from '@/engine/report';
import type { EngineInput, Gender, Person } from '@/engine/types';

/**
 * Backend content-generation endpoint.
 *
 * The client posts the raw quiz inputs (profiles + answers) AFTER the micro
 * purchase; the deterministic rule engine runs HERE on the server and returns
 * the fully-written report JSON. No external APIs, no LLMs — pure rules — but
 * the generation logic and copy never ship to the browser bundle, and this is
 * where real payment verification will live once a gateway is wired in.
 */

const GENDERS: ReadonlySet<string> = new Set(['male', 'female', 'nonbinary', 'unspecified']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function sanitizePerson(raw: unknown): Person | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const name = typeof p.name === 'string' ? p.name.slice(0, 40) : '';
  const gender = (typeof p.gender === 'string' && GENDERS.has(p.gender) ? p.gender : 'unspecified') as Gender;
  const dob = typeof p.dob === 'string' && ISO_DATE.test(p.dob) ? p.dob : null;
  if (!dob) return null; // a DOB is required to generate anything meaningful
  return { name, gender, dob };
}

function sanitizeAnswers(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string' && k.length <= 32 && v.length <= 64) out[k] = v;
  }
  return out;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const you = sanitizePerson(b.you);
  const partner = sanitizePerson(b.partner);
  if (!you || !partner) {
    return Response.json({ ok: false, error: 'missing-profiles' }, { status: 400 });
  }

  const input: EngineInput = {
    you,
    partner,
    relationshipType: typeof b.relationshipType === 'string' ? b.relationshipType.slice(0, 24) : null,
    answers: sanitizeAnswers(b.answers),
  };

  try {
    const result = computeCompatibility(input);
    const report = generateReport({
      result,
      answers: input.answers,
      relationshipType: input.relationshipType,
    });
    return Response.json({ ok: true, report, score: result.score, label: result.label });
  } catch {
    return Response.json({ ok: false, error: 'generation-failed' }, { status: 500 });
  }
}
