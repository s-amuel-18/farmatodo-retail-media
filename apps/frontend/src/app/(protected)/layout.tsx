"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/view-models/session/session-context";
import { AppHeader } from "@/views/shared/AppHeader";
import { ROLE_LABELS } from "@/lib/campaign-vocabulary";
import { ROLE_HOME_ROUTE } from "@/lib/role-routes";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, actions } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user?.role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader
        email={user.email}
        roleLabel={ROLE_LABELS[user.role]}
        homeHref={ROLE_HOME_ROUTE[user.role]}
        onSignOut={actions.signOut}
      />
      {/* tabIndex + outline-none: skip-link landing target, not a normal focusable
          control — a visible ring around the whole content region reads as broken,
          and reaching it already comes with an obvious visual context change. */}
      <main id="main-content" tabIndex={-1} className="p-6 outline-none">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
