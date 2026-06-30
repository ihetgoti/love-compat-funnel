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
        className="pointer-events-none absolute inset-x-0 -top-10 bottom-0"
        style={{
          background:
            'linear-gradient(to top, #0e0820 18%, rgba(14,8,32,0.85) 55%, transparent 100%)',
        }}
      />
      <div className={cn('relative mx-auto w-full max-w-md px-5 pb-4 pt-2', className)}>
        {caption ? (
          <div className="mb-2 text-center text-xs font-medium text-muted">{caption}</div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
