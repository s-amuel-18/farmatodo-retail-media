import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies the base card classes", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("rounded-control", "border", "border-border", "bg-surface", "p-6");
  });

  it("merges a custom className with the base classes", () => {
    render(
      <Card data-testid="card" className="my-extra-class">
        content
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("my-extra-class");
    expect(card).toHaveClass("rounded-control");
  });

  it("passes through arbitrary div props", () => {
    render(
      <Card data-testid="card" aria-label="my card" id="card-1">
        content
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("aria-label", "my card");
    expect(card).toHaveAttribute("id", "card-1");
  });
});
