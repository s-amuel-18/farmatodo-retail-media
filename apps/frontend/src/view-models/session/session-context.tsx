"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService, type SessionUser } from "../../services/auth.service";

interface SessionContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  actions: {
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
  };
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Mirrors the Firebase session into two lightweight, non-httpOnly cookies
 * (`session`, `role`) so `middleware.ts` can gate routes at the edge without
 * calling Firebase itself. This is a UX convenience only — the cookies are
 * never trusted as proof of identity; every real authorization decision is
 * re-checked server-side by FirebaseAuthGuard/RolesGuard on each API call.
 */
function syncSessionCookies(user: SessionUser | null): void {
  if (!user) {
    document.cookie = "session=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    return;
  }
  document.cookie = `session=1; path=/; max-age=3600`;
  document.cookie = `role=${user.role ?? ""}; path=/; max-age=3600`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    return authService.onSessionChanged((nextUser) => {
      setUser(nextUser);
      syncSessionCookies(nextUser);
      setIsLoading(false);
    });
  }, []);

  const value: SessionContextValue = {
    user,
    isLoading,
    actions: {
      signInWithGoogle: async () => {
        await authService.signInWithGoogle();
      },
      signOut: async () => {
        await authService.signOut();
        // Evita que datos de campañas/aprobaciones ya cacheados queden visibles
        // en memoria tras cerrar sesión.
        queryClient.clear();
      },
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}
