import type { ReactNode } from "react";

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mb-3 text-sm font-medium text-danger-600">
      {children}
    </p>
  );
}
