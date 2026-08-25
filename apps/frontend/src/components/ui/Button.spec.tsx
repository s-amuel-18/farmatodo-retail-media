import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, buttonClassName } from "@/components/ui";

describe("Button", () => {
  it("renders the primary variant classes by default variant prop omitted (defaults to secondary)", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toHaveClass("bg-surface", "text-ink", "border", "border-border");
  });

  it.each<["primary" | "secondary" | "ghost" | "danger", string[]]>([
    ["primary", ["bg-brand-blue-700", "text-white"]],
    ["secondary", ["bg-surface", "text-ink"]],
    ["ghost", ["bg-transparent", "text-ink"]],
    ["danger", ["bg-danger-600", "text-white"]],
  ])("applies the %s variant classes", (variant, expectedClasses) => {
    render(<Button variant={variant}>Action</Button>);
    const button = screen.getByRole("button", { name: "Action" });
    expect(button).toHaveClass(...expectedClasses);
  });

  it("applies size classes for sm and md", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass("px-3", "py-1.5", "text-sm");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button", { name: "Medium" })).toHaveClass("px-4", "py-2", "text-sm");
  });

  it("passes disabled through to the DOM and disables interaction", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges a custom className with the variant/size classes instead of replacing them", () => {
    render(
      <Button variant="primary" size="md" className="my-custom-class">
        Merged
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Merged" });
    expect(button).toHaveClass("my-custom-class");
    expect(button).toHaveClass("bg-brand-blue-700");
    expect(button).toHaveClass("px-4", "py-2");
  });

  it("forwards a ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe("Ref button");
  });

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe("buttonClassName helper", () => {
    it("builds classes for primary/sm", () => {
      const className = buttonClassName("primary", "sm");
      expect(className).toContain("bg-brand-blue-700");
      expect(className).toContain("px-3");
      expect(className).toContain("py-1.5");
    });

    it("builds classes for danger/md and merges an extra className", () => {
      const className = buttonClassName("danger", "md", "extra-class");
      expect(className).toContain("bg-danger-600");
      expect(className).toContain("px-4");
      expect(className).toContain("extra-class");
    });

    it("defaults to secondary/md when called with no arguments", () => {
      const className = buttonClassName();
      expect(className).toContain("bg-surface");
      expect(className).toContain("px-4");
    });
  });
});
