"use client";

import type { ReactNode } from "react";
import { useSession } from "@/view-models/session/session-context";
import { AppHeader } from "@/views/shared/AppHeader";
import { ROLE_LABELS } from "@/lib/campaign-vocabulary";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, actions } = useSession();

  return (
    <div className="min-h-screen bg-canvas">
      {user?.role ? (
        <AppHeader email={user.email} roleLabel={ROLE_LABELS[user.role]} onSignOut={actions.signOut} />
      ) : null}
      {/* tabIndex + outline-none: skip-link landing target, not a normal focusable
          control — a visible ring around the whole content region reads as broken,
          and reaching it already comes with an obvious visual context change. */}
      <main id="main-content" tabIndex={-1} className="p-6 outline-none">
        {children}
      </main>
    </div>
  );
}
