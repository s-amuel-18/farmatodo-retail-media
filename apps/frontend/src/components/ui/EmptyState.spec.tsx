import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui";

describe("EmptyState", () => {
  it("renders the message prop as text content", () => {
    render(<EmptyState message="No hay resultados" />);
    expect(screen.getByText("No hay resultados")).toBeInTheDocument();
  });

  it("applies the expected container classes", () => {
    render(<EmptyState message="Nothing here" />);
    const node = screen.getByText("Nothing here");
    expect(node).toHaveClass("rounded-control", "border-dashed", "text-center");
  });
});
