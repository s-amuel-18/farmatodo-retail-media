const mockSignInWithPopup = jest.fn();
const mockSignOut = jest.fn();
const mockOnIdTokenChanged = jest.fn();

// jest.mock factories run before the module body (they're hoisted above
// imports/const declarations), so the provider class must be declared
// inside the factory rather than referenced from outer scope.
jest.mock("firebase/auth", () => {
  class MockGoogleAuthProvider {}
  return {
    GoogleAuthProvider: MockGoogleAuthProvider,
    signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
    signOut: (...args: unknown[]) => mockSignOut(...args),
    onIdTokenChanged: (...args: unknown[]) => mockOnIdTokenChanged(...args),
  };
});

jest.mock("../lib/firebase-client", () => ({
  firebaseAuth: { currentUser: null },
}));

import { GoogleAuthProvider } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase-client";
import { authService } from "./auth.service";

const MockGoogleAuthProvider = GoogleAuthProvider;

function makeFirebaseUser(overrides: Record<string, unknown> = {}) {
  return {
    uid: "uid-1",
    email: "user@example.com",
    displayName: "User Name",
    getIdTokenResult: jest.fn().mockResolvedValue({ claims: { role: "APPROVER_MANAGER" } }),
    getIdToken: jest.fn().mockResolvedValue("id-token-value"),
    ...overrides,
  };
}

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (firebaseAuth as unknown as { currentUser: unknown }).currentUser = null;
  });

  describe("signInWithGoogle", () => {
    it("signs in via popup and maps the firebase user to a SessionUser", async () => {
      const firebaseUser = makeFirebaseUser();
      mockSignInWithPopup.mockResolvedValue({ user: firebaseUser });

      const result = await authService.signInWithGoogle();

      expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
      expect(mockSignInWithPopup.mock.calls[0][0]).toBe(firebaseAuth);
      expect(mockSignInWithPopup.mock.calls[0][1]).toBeInstanceOf(MockGoogleAuthProvider);
      expect(result).toEqual({
        uid: "uid-1",
        email: "user@example.com",
        displayName: "User Name",
        role: "APPROVER_MANAGER",
      });
    });

    it("maps to role: null when claims.role is absent", async () => {
      const firebaseUser = makeFirebaseUser({
        getIdTokenResult: jest.fn().mockResolvedValue({ claims: {} }),
      });
      mockSignInWithPopup.mockResolvedValue({ user: firebaseUser });

      const result = await authService.signInWithGoogle();

      expect(result.role).toBeNull();
    });

    it("falls back displayName to email when displayName is null", async () => {
      const firebaseUser = makeFirebaseUser({ displayName: null });
      mockSignInWithPopup.mockResolvedValue({ user: firebaseUser });

      const result = await authService.signInWithGoogle();

      expect(result.displayName).toBe("user@example.com");
    });

    it("falls back email to empty string when email is null", async () => {
      const firebaseUser = makeFirebaseUser({ email: null, displayName: null });
      mockSignInWithPopup.mockResolvedValue({ user: firebaseUser });

      const result = await authService.signInWithGoogle();

      expect(result.email).toBe("");
      expect(result.displayName).toBe("");
    });
  });

  describe("signOut", () => {
    it("calls firebase signOut with the firebaseAuth instance", async () => {
      mockSignOut.mockResolvedValue(undefined);

      await authService.signOut();

      expect(mockSignOut).toHaveBeenCalledWith(firebaseAuth);
    });
  });

  describe("getIdToken", () => {
    it("returns null when there is no current user", async () => {
      (firebaseAuth as unknown as { currentUser: unknown }).currentUser = null;

      const token = await authService.getIdToken();

      expect(token).toBeNull();
    });

    it("returns the token from the current user's getIdToken", async () => {
      const user = { getIdToken: jest.fn().mockResolvedValue("tok-xyz") };
      (firebaseAuth as unknown as { currentUser: unknown }).currentUser = user;

      const token = await authService.getIdToken();

      expect(user.getIdToken).toHaveBeenCalledTimes(1);
      expect(token).toBe("tok-xyz");
    });
  });

  describe("onSessionChanged", () => {
    it("registers via onIdTokenChanged with the firebaseAuth instance and returns its unsubscribe fn", () => {
      const unsubscribe = jest.fn();
      mockOnIdTokenChanged.mockReturnValue(unsubscribe);
      const callback = jest.fn();

      const result = authService.onSessionChanged(callback);

      expect(mockOnIdTokenChanged).toHaveBeenCalledTimes(1);
      expect(mockOnIdTokenChanged.mock.calls[0][0]).toBe(firebaseAuth);
      expect(typeof mockOnIdTokenChanged.mock.calls[0][1]).toBe("function");
      expect(result).toBe(unsubscribe);
    });

    it("maps a firebase user through toSessionUser before invoking the callback", async () => {
      let registeredHandler: (user: unknown) => Promise<void> = async () => {};
      mockOnIdTokenChanged.mockImplementation((_auth, handler) => {
        registeredHandler = handler;
        return jest.fn();
      });
      const callback = jest.fn();

      authService.onSessionChanged(callback);
      const firebaseUser = makeFirebaseUser();
      await registeredHandler(firebaseUser);

      expect(callback).toHaveBeenCalledWith({
        uid: "uid-1",
        email: "user@example.com",
        displayName: "User Name",
        role: "APPROVER_MANAGER",
      });
    });

    it("invokes the callback with null when the firebase user is null", async () => {
      let registeredHandler: (user: unknown) => Promise<void> = async () => {};
      mockOnIdTokenChanged.mockImplementation((_auth, handler) => {
        registeredHandler = handler;
        return jest.fn();
      });
      const callback = jest.fn();

      authService.onSessionChanged(callback);
      await registeredHandler(null);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });
});
