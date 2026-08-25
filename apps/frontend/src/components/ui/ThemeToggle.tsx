"use client";

import clsx from "clsx";
import { useTheme } from "@/view-models/theme/theme-context";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Both icons always render; only CSS (`dark:`) decides which is visible. The
 * `.dark` class is already on <html> before hydration (see layout.tsx's inline
 * script), so this never depends on client-only theme state — no flash, no
 * hydration mismatch.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar entre modo claro y oscuro"
      className={clsx(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-white transition-colors hover:bg-white/10",
        className,
      )}
    >
      <SunIcon className="h-[18px] w-[18px] dark:hidden" />
      <MoonIcon className="hidden h-[18px] w-[18px] dark:block" />
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.25M12 19.25v2.25M4.93 4.93l1.59 1.59M17.48 17.48l1.59 1.59M2.5 12h2.25M19.25 12h2.25M4.93 19.07l1.59-1.59M17.48 6.52l1.59-1.59"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
