import type { ReactNode } from "react";

export type BadgeTone = "draft" | "pending" | "approved" | "rejected" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  draft: "bg-status-draft-bg text-status-draft-fg",
  pending: "bg-status-pending-bg text-status-pending-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
  neutral: "bg-navy-100 text-navy-900",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-pill px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
