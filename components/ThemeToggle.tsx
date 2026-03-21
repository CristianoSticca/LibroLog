'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const options = [
  { value: 'light', label: 'Chiaro', icon: 'light_mode' },
  { value: 'dark',  label: 'Scuro',  icon: 'dark_mode' },
  { value: 'system', label: 'Sistema', icon: 'brightness_auto' },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="h-[72px] rounded-2xl bg-[var(--theme-surface-high)] animate-pulse" />
  );

  return (
    <div className="flex rounded-2xl bg-[var(--theme-surface-high)] p-1 gap-1">
      {options.map(({ value, label, icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 ${
              active
                ? 'bg-[var(--theme-bg)] text-[var(--theme-primary)] shadow-sm'
                : 'text-[var(--theme-outline)] hover:text-[var(--theme-fg)]'
            }`}
            aria-pressed={active}
          >
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
