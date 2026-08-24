import { render, screen } from "@testing-library/react";
import { ErrorText } from "@/components/ui";

describe("ErrorText", () => {
  it("renders children", () => {
    render(<ErrorText>Something went wrong</ErrorText>);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("has role=alert", () => {
    render(<ErrorText>Failure</ErrorText>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Failure");
  });

  it("applies the expected classes", () => {
    render(<ErrorText>Failure</ErrorText>);
    expect(screen.getByRole("alert")).toHaveClass("text-danger-600", "font-medium");
  });
});
