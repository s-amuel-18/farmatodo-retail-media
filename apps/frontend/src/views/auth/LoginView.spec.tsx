import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginView } from "./LoginView";

function baseProps() {
  return {
    isLoading: false,
    pendingAccess: false,
    error: null as string | null,
    onSignIn: jest.fn(),
    onSignOut: jest.fn(),
  };
}

describe("LoginView", () => {
  it("shows the pending-access message and a sign-out button, but no sign-in button, when pendingAccess is true", async () => {
    const user = userEvent.setup();
    const onSignOut = jest.fn();
    render(<LoginView {...baseProps()} pendingAccess onSignOut={onSignOut} />);

    expect(screen.getByText(/todavía no tiene un rol asignado/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ingresar con Google/ })).not.toBeInTheDocument();

    const signOutButton = screen.getByRole("button", { name: "Cerrar sesión" });
    await user.click(signOutButton);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows an enabled sign-in button and no error when not loading and no error", async () => {
    const user = userEvent.setup();
    const onSignIn = jest.fn();
    render(<LoginView {...baseProps()} onSignIn={onSignIn} />);

    const signInButton = screen.getByRole("button", { name: "Ingresar con Google" });
    expect(signInButton).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.click(signInButton);
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it("shows a disabled, loading-labeled button when isLoading is true", () => {
    render(<LoginView {...baseProps()} isLoading />);

    const button = screen.getByRole("button", { name: "Ingresando..." });
    expect(button).toBeDisabled();
  });

  it("renders the error message via ErrorText with role alert", () => {
    render(<LoginView {...baseProps()} error="Algo salió mal" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Algo salió mal");
  });
});
