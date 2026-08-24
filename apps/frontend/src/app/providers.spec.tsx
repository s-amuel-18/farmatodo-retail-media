import { render, screen } from "@testing-library/react";
import { Providers } from "./providers";

jest.mock("../view-models/session/session-context", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

jest.mock("../view-models/shared/toast-context", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}));

describe("Providers", () => {
  it("wraps children with the toast provider and session provider", () => {
    render(
      <Providers>
        <p>contenido</p>
      </Providers>,
    );

    const toast = screen.getByTestId("toast-provider");
    const session = screen.getByTestId("session-provider");
    expect(toast).toContainElement(session);
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });
});
