import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui";
import { Badge as BadgeDirect } from "./Badge";

describe("Badge", () => {
  it("renders children with the tone-specific classes", () => {
    render(<Badge tone="approved">Aprobada</Badge>);
    const badge = screen.getByText("Aprobada");
    expect(badge).toHaveClass("bg-status-approved-bg", "text-status-approved-fg");
  });

  it("is re-exported identically from the barrel and the direct module", () => {
    expect(Badge).toBe(BadgeDirect);
  });
});
