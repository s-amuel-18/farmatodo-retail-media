const mockUseSession = jest.fn();
jest.mock("./session-context", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

import { act, renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useLogin } from "./use-login";

const mockPush = jest.fn();
const mockReplace = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: mockReplace });

const mockSignInWithGoogle = jest.fn();
const mockSignOut = jest.fn();

function setSession(overrides: Partial<{ user: unknown; isLoading: boolean }>) {
  mockUseSession.mockReturnValue({
    user: null,
    isLoading: false,
    actions: { signInWithGoogle: mockSignInWithGoogle, signOut: mockSignOut },
    ...overrides,
  });
}

describe("useLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not redirect and pendingAccess is false when there is no user", () => {
    setSession({ user: null, isLoading: false });
    const { result } = renderHook(() => useLogin());

    expect(mockReplace).not.toHaveBeenCalled();
    expect(result.current.pendingAccess).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("pendingAccess is true when user has no role, and no redirect happens", () => {
    setSession({ user: { uid: "u1", role: null }, isLoading: false });
    const { result } = renderHook(() => useLogin());

    expect(mockReplace).not.toHaveBeenCalled();
    expect(result.current.pendingAccess).toBe(true);
  });

  it("redirects to ROLE_HOME_ROUTE when user has a role", () => {
    setSession({ user: { uid: "u1", role: "APPROVER_MANAGER" }, isLoading: false });
    renderHook(() => useLogin());

    expect(mockReplace).toHaveBeenCalledWith("/approvals");
  });

  it("redirects COMMERCIAL_ANALYST to /campaigns", () => {
    setSession({ user: { uid: "u1", role: "COMMERCIAL_ANALYST" }, isLoading: false });
    renderHook(() => useLogin());

    expect(mockReplace).toHaveBeenCalledWith("/campaigns");
  });

  it("does not redirect while isLoading is true, even if user has a role", () => {
    setSession({ user: { uid: "u1", role: "APPROVER_MANAGER" }, isLoading: true });
    renderHook(() => useLogin());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("isLoading reflects session isLoading OR isSigningIn", () => {
    setSession({ user: null, isLoading: true });
    const { result } = renderHook(() => useLogin());

    expect(result.current.isLoading).toBe(true);
  });

  describe("actions.signInWithGoogle", () => {
    it("clears error, sets isSigningIn during the call, and calls the session's signInWithGoogle", async () => {
      setSession({ user: null, isLoading: false });
      mockSignInWithGoogle.mockResolvedValue(undefined);
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.actions.signInWithGoogle();
      });

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("sets isLoading true while signing in", async () => {
      setSession({ user: null, isLoading: false });
      let resolveSignIn: () => void;
      mockSignInWithGoogle.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        }),
      );
      const { result } = renderHook(() => useLogin());

      let signInPromise: Promise<void>;
      act(() => {
        signInPromise = result.current.actions.signInWithGoogle();
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));

      await act(async () => {
        resolveSignIn!();
        await signInPromise!;
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it("sets the Spanish fallback error message and resets isSigningIn when signInWithGoogle rejects", async () => {
      setSession({ user: null, isLoading: false });
      mockSignInWithGoogle.mockRejectedValue(new Error("popup closed"));
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.actions.signInWithGoogle();
      });

      expect(result.current.error).toBe("No se pudo iniciar sesión con Google. Intenta de nuevo.");
      expect(result.current.isLoading).toBe(false);
    });

    it("clears a previous error at the start of a new attempt", async () => {
      setSession({ user: null, isLoading: false });
      mockSignInWithGoogle.mockRejectedValueOnce(new Error("fail once"));
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.actions.signInWithGoogle();
      });
      expect(result.current.error).toBe("No se pudo iniciar sesión con Google. Intenta de nuevo.");

      mockSignInWithGoogle.mockResolvedValueOnce(undefined);
      await act(async () => {
        await result.current.actions.signInWithGoogle();
      });

      expect(result.current.error).toBeNull();
    });
  });

  it("actions.signOut delegates directly to the session's signOut", () => {
    setSession({ user: null, isLoading: false });
    const { result } = renderHook(() => useLogin());

    expect(result.current.actions.signOut).toBe(mockSignOut);
  });
});
