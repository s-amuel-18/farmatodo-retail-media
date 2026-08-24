import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui";
import { CONTROL_CLASSES } from "./controls";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input aria-label="text field" />);
    expect(screen.getByRole("textbox", { name: "text field" }).tagName).toBe("INPUT");
  });

  it("applies the shared control classes", () => {
    render(<Input aria-label="text field" />);
    const input = screen.getByRole("textbox", { name: "text field" });
    expect(CONTROL_CLASSES).toContain("rounded-control");
    expect(input).toHaveClass("rounded-control", "border", "border-border", "w-full");
  });

  it("forwards a ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="ref field" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("forwards arbitrary props: value, onChange, placeholder, disabled", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Input aria-label="typed field" placeholder="Escribe aqui" onChange={onChange} />,
    );
    const input = screen.getByPlaceholderText("Escribe aqui");
    await user.type(input, "hola");
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue("hola");
  });

  it("respects the disabled prop", () => {
    render(<Input aria-label="disabled field" disabled />);
    expect(screen.getByRole("textbox", { name: "disabled field" })).toBeDisabled();
  });

  it("merges a custom className with the control classes", () => {
    render(<Input aria-label="merged field" className="my-extra" />);
    const input = screen.getByRole("textbox", { name: "merged field" });
    expect(input).toHaveClass("my-extra");
    expect(input).toHaveClass("rounded-control");
  });
});
