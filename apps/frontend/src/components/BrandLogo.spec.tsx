import { render, screen } from "@testing-library/react";
import { BrandLogo } from "@/components/BrandLogo";

describe("BrandLogo", () => {
  it("renders an img with the expected src and alt", () => {
    render(<BrandLogo />);
    const img = screen.getByRole("img", { name: "Farmatodo" });
    expect(img).toHaveAttribute("src", "/brand/farmatodo-logo.svg");
    expect(img).toHaveAttribute("alt", "Farmatodo");
  });

  it("merges a passed className", () => {
    render(<BrandLogo className="h-8 w-auto" />);
    const img = screen.getByRole("img", { name: "Farmatodo" });
    expect(img).toHaveClass("h-8", "w-auto");
  });
});
