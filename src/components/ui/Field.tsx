'use client';

import { cn } from '@/lib/cn';

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  type?: 'text' | 'email';
  inputMode?: 'text' | 'email';
  className?: string;
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  maxLength = 24,
  type = 'text',
  inputMode = 'text',
  className,
}: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-semibold text-blush">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        type={type}
        inputMode={inputMode}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        className="w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-lg font-semibold text-starlight outline-none transition placeholder:text-muted/50 focus:border-rose/70 focus:bg-white/[0.1]"
      />
    </label>
  );
}
