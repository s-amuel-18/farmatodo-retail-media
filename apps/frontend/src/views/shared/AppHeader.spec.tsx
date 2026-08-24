import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";

describe("AppHeader", () => {
  const props = {
    email: "user@example.com",
    roleLabel: "Analista comercial",
    homeHref: "/campaigns",
    onSignOut: jest.fn(),
  };

  it("renders the email and role label concatenated", () => {
    render(<AppHeader {...props} />);

    expect(
      screen.getByText(
        (_content, node) => node?.textContent === "user@example.com · Analista comercial",
      ),
    ).toBeInTheDocument();
  });

  it("links the logo to homeHref", () => {
    render(<AppHeader {...props} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/campaigns");
  });

  it("calls onSignOut when Cerrar sesión is clicked", async () => {
    const user = userEvent.setup();
    const onSignOut = jest.fn();
    render(<AppHeader {...props} onSignOut={onSignOut} />);

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
