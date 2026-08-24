import { render, screen } from "@testing-library/react";
import { LoadingState } from "@/components/ui";

describe("LoadingState", () => {
  it("renders the default message when none is given", () => {
    render(<LoadingState />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("renders a custom message when provided", () => {
    render(<LoadingState message="Un momento por favor" />);
    expect(screen.getByText("Un momento por favor")).toBeInTheDocument();
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
  });

  it("has role=status and aria-live=polite", () => {
    render(<LoadingState />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Cargando...");
  });
});
