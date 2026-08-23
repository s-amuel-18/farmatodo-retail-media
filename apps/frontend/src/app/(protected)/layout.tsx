"use client";

import type { ReactNode } from "react";
import { useSession } from "../../view-models/session/session-context";
import { AppHeader } from "../../views/shared/AppHeader";

const ROLE_LABELS: Record<string, string> = {
  COMMERCIAL_ANALYST: "Analista comercial",
  APPROVER_MANAGER: "Gerente de aprobación",
};

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, actions } = useSession();

  return (
    <div>
      {user ? (
        <AppHeader
          email={user.email}
          roleLabel={ROLE_LABELS[user.role ?? ""] ?? ""}
          onSignOut={actions.signOut}
        />
      ) : null}
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}
