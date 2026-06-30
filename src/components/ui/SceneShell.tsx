import { cn } from '@/lib/cn';

interface SceneShellProps {
  children: React.ReactNode;
  className?: string;
  /** Vertically center the content (good for single-question scenes). */
  center?: boolean;
  /** Remove the bottom padding reserved for a sticky CTA. */
  flush?: boolean;
}

/** Standard mobile scene container: centered column, safe areas, clearance for
 *  the top progress bar and the bottom sticky CTA. */
export function SceneShell({ children, className, center, flush }: SceneShellProps) {
  return (
    <div
      className={cn(
        'relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-20',
        flush ? 'pb-6' : 'pb-32',
        center && 'justify-center',
        className,
      )}
    >
      {children}
    </div>
  );
}
