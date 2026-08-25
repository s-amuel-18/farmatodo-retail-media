import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";
import { ThemeProvider } from "@/view-models/theme/theme-context";

function renderHeader(props: React.ComponentProps<typeof AppHeader>) {
  return render(
    <ThemeProvider>
      <AppHeader {...props} />
    </ThemeProvider>,
  );
}

describe("AppHeader", () => {
  const props = {
    email: "user@example.com",
    roleLabel: "Analista comercial",
    homeHref: "/campaigns",
    onSignOut: jest.fn(),
  };

  it("renders the email and role label concatenated", () => {
    renderHeader(props);

    expect(
      screen.getByText(
        (_content, node) => node?.textContent === "user@example.com · Analista comercial",
      ),
    ).toBeInTheDocument();
  });

  it("links the logo to homeHref", () => {
    renderHeader(props);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/campaigns");
  });

  it("calls onSignOut when Cerrar sesión is clicked", async () => {
    const user = userEvent.setup();
    const onSignOut = jest.fn();
    renderHeader({ ...props, onSignOut });

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
