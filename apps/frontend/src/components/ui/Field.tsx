import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";

interface FieldProps {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean;
  /** Extra classes on the field's wrapper, e.g. `sm:col-span-2` inside a grid of fields. */
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const generatedId = useId();
  const controlId = (isValidElement(children) && (children as ReactElement<{ id?: string }>).props.id) || generatedId;
  const hintId = hint ? `${generatedId}-hint` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: controlId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required ? true : undefined,
        required: required ?? (children as ReactElement<{ required?: boolean }>).props.required,
      })
    : children;

  return (
    <div className={clsx("mb-3 block text-sm", className)}>
      <label htmlFor={controlId} className="mb-1 block text-text-muted">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-danger-600">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {control}
      {hint ? (
        <span id={hintId} className="mt-1 block text-xs text-text-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} role="alert" className="mt-1 block text-xs font-medium text-danger-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}
