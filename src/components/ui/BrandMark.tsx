import { cn } from '@/lib/cn';

/** The softncute wordmark — soft·n·cute with a glowing heart dotting the “n”. */
export function BrandMark({ size = 'sm', className }: { size?: 'sm' | 'md'; className?: string }) {
  return (
    <span
      aria-label="softncute"
      className={cn(
        'inline-flex select-none items-baseline font-display font-bold tracking-tight',
        size === 'sm' ? 'text-[15px]' : 'text-xl',
        className,
      )}
    >
      <span className="text-starlight">soft</span>
      <span className="romance-text px-[1px]">n</span>
      <span className="text-starlight">cute</span>
      <span className={cn('ml-1 self-center leading-none', size === 'sm' ? 'text-[11px]' : 'text-sm')} aria-hidden>
        💞
      </span>
    </span>
  );
}
