import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProtectedLayout from "./layout";
import { useSession } from "../../view-models/session/session-context";

jest.mock("../../view-models/session/session-context", () => ({
  useSession: jest.fn(),
}));

describe("ProtectedLayout", () => {
  it("renders the AppHeader with the user's role label and home link when a role is assigned", () => {
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: "1", email: "user@example.com", displayName: "User", role: "COMMERCIAL_ANALYST" },
      actions: { signOut: jest.fn() },
    });

    render(
      <ProtectedLayout>
        <p>contenido protegido</p>
      </ProtectedLayout>,
    );

    expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Analista comercial/)).toBeInTheDocument();
    expect(screen.getByText("contenido protegido")).toBeInTheDocument();
  });

  it("omits the header entirely when there is no user or no role yet", () => {
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: "1", email: "user@example.com", displayName: "User", role: null },
      actions: { signOut: jest.fn() },
    });

    render(
      <ProtectedLayout>
        <p>contenido protegido</p>
      </ProtectedLayout>,
    );

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.getByText("contenido protegido")).toBeInTheDocument();
  });

  it("calls signOut from the header button", async () => {
    const user = userEvent.setup();
    const signOut = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: "1", email: "user@example.com", displayName: "User", role: "APPROVER_MANAGER" },
      actions: { signOut },
    });

    render(
      <ProtectedLayout>
        <p>contenido</p>
      </ProtectedLayout>,
    );

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
