"use client";

import { useEffect } from "react";

export interface ToastData {
  id: number;
  message: string;
  tone: "approved" | "rejected" | "pending";
}

const TONE_CLASSES: Record<ToastData["tone"], string> = {
  approved: "border-status-approved-fg/25 bg-status-approved-bg text-status-approved-fg",
  rejected: "border-status-rejected-fg/25 bg-status-rejected-bg text-status-rejected-fg",
  pending: "border-status-pending-fg/25 bg-status-pending-bg text-status-pending-fg",
};

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto rounded-control border px-4 py-3 text-sm font-medium ${TONE_CLASSES[toast.tone]}`}
    >
      {toast.message}
    </div>
  );
}
