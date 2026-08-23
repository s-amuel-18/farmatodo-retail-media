"use client";

import type { ReactNode } from "react";
import { useSession } from "@/view-models/session/session-context";
import { AppHeader } from "@/views/shared/AppHeader";
import { ROLE_LABELS, ROLE_HOME_ROUTE } from "@/lib/campaign-vocabulary";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, actions } = useSession();

  return (
    <div className="min-h-screen bg-canvas">
      {user?.role ? (
        <AppHeader
          email={user.email}
          roleLabel={ROLE_LABELS[user.role]}
          homeHref={ROLE_HOME_ROUTE[user.role]}
          onSignOut={actions.signOut}
        />
      ) : null}
      <div className="p-6">{children}</div>
    </div>
  );
}
