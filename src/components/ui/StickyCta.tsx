import { cn } from '@/lib/cn';

interface StickyCtaProps {
  children: React.ReactNode;
  className?: string;
  /** Optional helper/microcopy line shown above the button. */
  caption?: React.ReactNode;
}

/** Fixed, thumb-zone CTA bar with a gradient fade so it reads cleanly over
 *  scrolling content. Safe-area aware. */
export function StickyCta({ children, className, caption }: StickyCtaProps) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-14 bottom-0"
        style={{
          background:
            'linear-gradient(to top, #0b0713 68%, rgba(11,7,19,0.94) 86%, transparent 100%)',
        }}
      />
      <div className={cn('relative mx-auto w-full max-w-md px-5 pb-4 pt-3', className)}>
        {caption ? (
          <div
            className="mb-2.5 text-center text-xs font-black uppercase tracking-wide text-white"
            style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
          >
            {caption}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
