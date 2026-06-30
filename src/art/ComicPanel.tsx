import { cn } from '@/lib/cn';

interface ComicPanelProps {
  children: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
}

/** A framed webtoon-style panel with a halftone wash and an optional caption box. */
export function ComicPanel({ children, caption, className }: ComicPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.75rem] border-2 border-white/15 bg-white/[0.04] p-4 shadow-[0_16px_50px_-16px_rgba(0,0,0,0.6)]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.4px)',
          backgroundSize: '10px 10px',
        }}
      />
      <div className="relative">{children}</div>
      {caption ? (
        <div className="relative mt-3 rounded-xl bg-night/70 px-3 py-2 text-center text-sm font-semibold text-blush">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
