import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  const errorId = useId();

  return (
    <label className="mb-3 block text-sm">
      <span className="mb-1 block text-text-muted">{label}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? errorId : undefined,
          })
        : children}
      {error ? (
        <span id={errorId} className="mt-1 block text-xs font-medium text-danger-600">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
