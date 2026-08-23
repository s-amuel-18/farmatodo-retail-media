import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import type { BadgeTone } from "./Badge";

/** Same tone families as Badge, restyled for a pressable filter control instead of a static label. */
const TONE_ACTIVE_CLASSES: Record<BadgeTone, string> = {
  draft: "border-status-draft-fg/25 bg-status-draft-bg text-status-draft-fg",
  pending: "border-status-pending-fg/25 bg-status-pending-bg text-status-pending-fg",
  approved: "border-status-approved-fg/25 bg-status-approved-bg text-status-approved-fg",
  rejected: "border-status-rejected-fg/25 bg-status-rejected-bg text-status-rejected-fg",
  neutral: "border-navy-900/20 bg-navy-100 text-navy-900",
};

interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  tone: BadgeTone;
  pressed: boolean;
}

/**
 * A toggleable pill built from the same tone tokens as Badge/StatusBadge, so a status
 * filter reads as an interactive version of the status it filters rather than a generic
 * checkbox. Renders as `role="checkbox"` since it's a multi-select toggle, not a single choice.
 */
export function ToggleChip({ tone, pressed, className, children, ...props }: ToggleChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={pressed}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-semibold transition-colors",
        pressed
          ? TONE_ACTIVE_CLASSES[tone]
          : "border-border bg-surface text-text-muted hover:border-navy-700 hover:text-ink",
        className,
      )}
      {...props}
    >
      <CheckMark pressed={pressed} />
      {children}
    </button>
  );
}

function CheckMark({ pressed }: { pressed: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={clsx("h-3 w-3 shrink-0 transition-opacity duration-150", pressed ? "opacity-100" : "opacity-0")}
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
