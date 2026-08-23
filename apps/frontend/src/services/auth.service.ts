import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import type { Role } from "@farmatodo-retail-media/types";
import { firebaseAuth } from "../lib/firebase-client";

export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role | null;
}

async function toSessionUser(user: User): Promise<SessionUser> {
  const result = await user.getIdTokenResult();
  const role = (result.claims.role as Role | undefined) ?? null;
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? user.email ?? "",
    role,
  };
}

export const authService = {
  async signInWithGoogle(): Promise<SessionUser> {
    const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
    return toSessionUser(credential.user);
  },

  async signOut(): Promise<void> {
    await signOut(firebaseAuth);
  },

  async getIdToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  },

  /** Fires immediately with the current user (or null), then on every change. */
  onSessionChanged(callback: (user: SessionUser | null) => void): () => void {
    return onIdTokenChanged(firebaseAuth, async (user) => {
      callback(user ? await toSessionUser(user) : null);
    });
  },
};
