"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./session-context";
import { ROLE_HOME_ROUTE } from "@/lib/campaign-vocabulary";

export function useLogin() {
  const { user, isLoading, actions } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (isLoading || !user?.role) return;
    router.replace(ROLE_HOME_ROUTE[user.role]);
  }, [user, isLoading, router]);

  return {
    isLoading: isLoading || isSigningIn,
    pendingAccess: !!user && !user.role,
    error,
    actions: {
      signInWithGoogle: async () => {
        setError(null);
        setIsSigningIn(true);
        try {
          await actions.signInWithGoogle();
        } catch {
          setError("No se pudo iniciar sesión con Google. Intenta de nuevo.");
        } finally {
          setIsSigningIn(false);
        }
      },
      signOut: actions.signOut,
    },
  };
}
