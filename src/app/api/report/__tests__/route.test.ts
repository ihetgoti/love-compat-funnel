import { describe, it, expect } from 'vitest';
import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID = {
  you: { name: 'Ava', gender: 'female', dob: '1996-05-10' },
  partner: { name: 'Liam', gender: 'male', dob: '1994-09-22' },
  relationshipType: 'crush',
  answers: { motivation: 'love', curiosity: 'chemistry', importance: '5', oneword: 'passionate', destiny: 'absolutely', connection: 'often', surprise: 'soulmates' },
};

describe('POST /api/report (backend content generation)', () => {
  it('generates a full report server-side from quiz inputs', async () => {
    const res = await POST(req(VALID));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.report.sections).toHaveLength(8);
    expect(data.report.premiumSections).toHaveLength(8);
    // Curiosity focus (chemistry) is hoisted first + starred
    expect(data.report.sections[0].key).toBe('chemistry');
    expect(data.report.sections[0].starred).toBe(true);
    // Personalized with names from the request
    expect(JSON.stringify(data.report)).toContain('Ava');
    expect(typeof data.score).toBe('number');
  });

  it('is deterministic across calls', async () => {
    const a = await (await POST(req(VALID))).json();
    const b = await (await POST(req(VALID))).json();
    expect(a).toEqual(b);
  });

  it('rejects missing DOBs with 400', async () => {
    const res = await POST(req({ you: { name: 'A' }, partner: { name: 'B' } }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
  });

  it('rejects invalid JSON with 400', async () => {
    const res = await POST(new Request('http://localhost/api/report', { method: 'POST', body: '{nope' }));
    expect(res.status).toBe(400);
  });

  it('survives malformed answers (sanitized to defaults)', async () => {
    const res = await POST(req({ ...VALID, answers: { motivation: 123, nested: { a: 1 } } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.report.sections).toHaveLength(8);
  });
});
