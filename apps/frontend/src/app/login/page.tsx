"use client";

import { useLogin } from "../../view-models/session/use-login";
import { LoginView } from "../../views/auth/LoginView";

export default function LoginPage() {
  const { isLoading, pendingAccess, error, actions } = useLogin();

  return (
    <LoginView
      isLoading={isLoading}
      pendingAccess={pendingAccess}
      error={error}
      onSignIn={actions.signInWithGoogle}
      onSignOut={actions.signOut}
    />
  );
}
