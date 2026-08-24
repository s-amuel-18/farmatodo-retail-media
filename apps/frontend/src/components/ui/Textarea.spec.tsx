import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea aria-label="notes" />);
    expect(screen.getByRole("textbox", { name: "notes" }).tagName).toBe("TEXTAREA");
  });

  it("applies the shared control classes plus resize-y", () => {
    render(<Textarea aria-label="notes" />);
    const textarea = screen.getByRole("textbox", { name: "notes" });
    expect(textarea).toHaveClass("rounded-control", "border", "w-full", "resize-y");
  });

  it("forwards a ref to the underlying textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="notes" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("forwards arbitrary props: value, onChange, placeholder, disabled", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Textarea aria-label="typed" placeholder="Escribe" onChange={onChange} />);
    const textarea = screen.getByPlaceholderText("Escribe");
    await user.type(textarea, "hola mundo");
    expect(onChange).toHaveBeenCalled();
    expect(textarea).toHaveValue("hola mundo");
  });

  it("respects the disabled prop", () => {
    render(<Textarea aria-label="disabled notes" disabled />);
    expect(screen.getByRole("textbox", { name: "disabled notes" })).toBeDisabled();
  });

  it("merges a custom className with the control classes", () => {
    render(<Textarea aria-label="merged notes" className="my-extra" />);
    const textarea = screen.getByRole("textbox", { name: "merged notes" });
    expect(textarea).toHaveClass("my-extra");
    expect(textarea).toHaveClass("rounded-control");
  });
});
