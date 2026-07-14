import { describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RelationshipSelect } from '@/scenes/RelationshipSelect';
import { EmotionQuestion } from '@/scenes/EmotionQuestion';
import { MicroOffer } from '@/scenes/MicroOffer';
import { FinalReport } from '@/scenes/FinalReport';
import { QUIZ_QUESTIONS } from '@/content/questions';
import { useQuizStore } from '@/store/useQuizStore';

/**
 * Server-render smoke tests: the funnel renders client-side after hydration, so
 * SSR only shows a splash. These exercise the real scene trees (framer-motion,
 * runtime SVG mascots, store hooks) and fail loudly on any render-time crash.
 */
describe('scene rendering (smoke)', () => {
  beforeEach(() => useQuizStore.getState().reset());

  it('renders the relationship select with all cards', () => {
    const html = renderToStaticMarkup(<RelationshipSelect />);
    expect(html.toLowerCase()).toContain('compatibility');
    expect(html).toContain('Married Partner');
    expect(html).toContain('Just Curious');
  });

  it('renders every quiz question (single + scale)', () => {
    for (const q of QUIZ_QUESTIONS) {
      const html = renderToStaticMarkup(<EmotionQuestion question={q} />);
      expect(html).toContain(q.prompt.slice(0, 12));
    }
  });

  it('renders the micro-offer', () => {
    const html = renderToStaticMarkup(<MicroOffer />);
    expect(html).toContain('Unlock Your Full');
  });

  it('mounts the full report scene cleanly', () => {
    // zustand returns its INITIAL snapshot during server rendering, so the report
    // shows its no-results shell here. This proves the scene imports + mounts
    // without crashing; the results-populated render is covered by the engine and
    // funnel integration tests (which read live state via getState()).
    const html = renderToStaticMarkup(<FinalReport />);
    expect(typeof html).toBe('string');
    expect(html).toContain('max-w-md');
  });
});
