jest.mock("../../services/auth.service", () => ({
  authService: {
    onSessionChanged: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  },
}));

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { authService, type SessionUser } from "../../services/auth.service";
import { SessionProvider, useSession } from "./session-context";

const mockOnSessionChanged = authService.onSessionChanged as jest.Mock;
const mockUnsubscribe = jest.fn();

function Consumer() {
  const { user, isLoading, actions } = useSession();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.email : "none"}</span>
      <button onClick={() => actions.signInWithGoogle()}>sign in</button>
      <button onClick={() => actions.signOut()}>sign out</button>
    </div>
  );
}

function getSessionChangedCallback(): (user: SessionUser | null) => void {
  return mockOnSessionChanged.mock.calls[0][0];
}

describe("SessionProvider / useSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSessionChanged.mockReturnValue(mockUnsubscribe);
    document.cookie = "session=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
  });

  it("starts with isLoading true and no user", () => {
    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(mockOnSessionChanged).toHaveBeenCalledTimes(1);
  });

  it("sets isLoading false and populates user when onSessionChanged fires with a user", () => {
    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );

    const user: SessionUser = {
      uid: "u1",
      email: "analyst@example.com",
      displayName: "Analyst",
      role: "APPROVER_MANAGER",
    };

    act(() => {
      getSessionChangedCallback()(user);
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("analyst@example.com");
  });

  it("clears the user when onSessionChanged fires with null", () => {
    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );

    const user: SessionUser = {
      uid: "u1",
      email: "analyst@example.com",
      displayName: "Analyst",
      role: "COMMERCIAL_ANALYST",
    };

    act(() => {
      getSessionChangedCallback()(user);
    });
    expect(screen.getByTestId("user").textContent).toBe("analyst@example.com");

    act(() => {
      getSessionChangedCallback()(null);
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("mirrors the user's role into a role cookie when a user is set", () => {
    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );

    const user: SessionUser = {
      uid: "u1",
      email: "manager@example.com",
      displayName: "Manager",
      role: "APPROVER_MANAGER",
    };

    act(() => {
      getSessionChangedCallback()(user);
    });

    expect(document.cookie).toContain("role=APPROVER_MANAGER");
    expect(document.cookie).toContain("session=1");
  });

  it("clears the session/role cookies when the user logs out (null)", () => {
    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );

    const user: SessionUser = {
      uid: "u1",
      email: "manager@example.com",
      displayName: "Manager",
      role: "APPROVER_MANAGER",
    };

    act(() => {
      getSessionChangedCallback()(user);
    });
    expect(document.cookie).toContain("session=1");

    act(() => {
      getSessionChangedCallback()(null);
    });

    // jsdom drops cookies set with max-age=0 on the next read.
    expect(document.cookie).not.toContain("session=1");
  });

  it("calls the unsubscribe function returned by onSessionChanged on unmount", () => {
    const { unmount } = render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("delegates signInWithGoogle and signOut actions to authService", async () => {
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );

    await user.click(screen.getByText("sign in"));
    expect(authService.signInWithGoogle).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("sign out"));
    expect(authService.signOut).toHaveBeenCalledTimes(1);
  });

  it("throws when useSession is called outside a SessionProvider", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(
      "useSession must be used within a SessionProvider",
    );

    consoleErrorSpy.mockRestore();
  });
});
