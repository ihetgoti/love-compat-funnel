import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '../useQuizStore';
import { STEP_ORDER } from '@/funnel/steps';
import { SMALL_REPORT_PRICE, UPSELL_PRICE } from '@/content/offers';

const get = () => useQuizStore.getState();

describe('funnel store integration', () => {
  beforeEach(() => get().reset());

  it('drives the full journey and computes a feel-good result', () => {
    const s = get();
    s.setRelationship('crush');
    s.setAnswer('motivation', 'love');
    s.setAnswer('curiosity', 'soulmate');
    s.setAnswer('importance', '5');
    s.setAnswer('oneword', 'magical');
    s.setAnswer('destiny', 'absolutely');
    s.setAnswer('connection', 'often');
    s.setAnswer('surprise', 'soulmates');
    s.setYou({ name: 'Ava', gender: 'female', dob: '1996-05-10' });
    s.setPartner({ name: 'Liam', gender: 'male', dob: '1994-09-22' });
    s.compute();

    const r = get().results!;
    expect(r).toBeTruthy();
    expect(r.score).toBeGreaterThanOrEqual(62);
    expect(r.score).toBeLessThanOrEqual(98);
    expect(r.subscores).toHaveLength(7);
    expect(r.commonThings.length).toBeGreaterThan(0);
    expect(r.you.person.name).toBe('Ava');
  });

  it('advances through every step with next()', () => {
    expect(get().step).toBe('relationship');
    for (let i = 0; i < STEP_ORDER.length - 1; i++) get().next();
    expect(get().step).toBe(STEP_ORDER[STEP_ORDER.length - 1]); // 'share'
  });

  it('accumulates the order total across purchases', () => {
    get().purchaseMicro();
    get().purchaseUpsell();
    expect(get().order.microPurchased).toBe(true);
    expect(get().order.upsellPurchased).toBe(true);
    expect(get().order.total).toBeCloseTo(SMALL_REPORT_PRICE + UPSELL_PRICE, 2);
    // Upsell must be exactly 10× the small report.
    expect(UPSELL_PRICE).toBeCloseTo(SMALL_REPORT_PRICE * 10, 2);
  });

  it('charges PPP prices for the selected market (India)', () => {
    get().setCurrency('IN', true);
    get().purchaseMicro();
    expect(get().order.total).toBeCloseTo(99, 2);
    get().purchaseUpsell();
    expect(get().order.total).toBeCloseTo(99 + 990, 2);
    expect(get().order.currency).toBe('IN');
    expect(get().currencyChosen).toBe(true);
  });

  it('tracks chapter reads (deduped) and upsell decline', () => {
    get().openChapter('soulmate');
    get().openChapter('soulmate');
    get().openChapter('chemistry');
    expect(get().openedChapters).toEqual(['soulmate', 'chemistry']);
    get().declineUpsell();
    expect(get().upsellDeclined).toBe(true);
  });

  it('back() never lands on the cinematic analysis', () => {
    const s = get();
    s.goto('q-motivation');
    s.goto('dob');
    s.goto('analysis');
    s.goto('results');
    get().back();
    expect(get().step).toBe('dob');
  });
});
