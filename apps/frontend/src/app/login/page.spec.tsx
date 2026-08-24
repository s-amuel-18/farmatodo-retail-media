import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import { useLogin } from "../../view-models/session/use-login";

jest.mock("../../view-models/session/use-login", () => ({
  useLogin: jest.fn(),
}));

describe("LoginPage", () => {
  it("wires useLogin's state and actions into LoginView", async () => {
    const user = userEvent.setup();
    const signInWithGoogle = jest.fn();
    const signOut = jest.fn();
    (useLogin as jest.Mock).mockReturnValue({
      isLoading: false,
      pendingAccess: false,
      error: "Ocurrió un error",
      actions: { signInWithGoogle, signOut },
    });

    render(<LoginPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Ocurrió un error");
    await user.click(screen.getByRole("button", { name: "Ingresar con Google" }));
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("shows the pending-access state and wires signOut", async () => {
    const user = userEvent.setup();
    const signInWithGoogle = jest.fn();
    const signOut = jest.fn();
    (useLogin as jest.Mock).mockReturnValue({
      isLoading: false,
      pendingAccess: true,
      error: null,
      actions: { signInWithGoogle, signOut },
    });

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signInWithGoogle).not.toHaveBeenCalled();
  });
});
