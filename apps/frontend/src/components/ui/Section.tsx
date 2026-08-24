import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

/** Groups related fields or rows under a labeled heading — used by both the campaign form and its read-only detail view so the two describe the same data with one structural language. */
export function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
      {children}
    </div>
  );
}
