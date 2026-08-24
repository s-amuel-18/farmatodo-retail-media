import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/ui";

describe("Select", () => {
  it("renders a select element with option children", () => {
    render(
      <Select aria-label="fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "fruit" });
    expect(select.tagName).toBe("SELECT");
    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
  });

  it("applies the shared control classes", () => {
    render(
      <Select aria-label="fruit">
        <option value="apple">Apple</option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "fruit" })).toHaveClass("rounded-control", "border", "w-full");
  });

  it("forwards a ref to the underlying select element", () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="fruit">
        <option value="apple">Apple</option>
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("allows selecting an option via change events", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Select aria-label="fruit" onChange={onChange}>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "fruit" }) as HTMLSelectElement;
    await user.selectOptions(select, "banana");
    expect(select.value).toBe("banana");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects the disabled prop", () => {
    render(
      <Select aria-label="fruit" disabled>
        <option value="apple">Apple</option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "fruit" })).toBeDisabled();
  });

  it("merges a custom className with the control classes", () => {
    render(
      <Select aria-label="fruit" className="my-extra">
        <option value="apple">Apple</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "fruit" });
    expect(select).toHaveClass("my-extra");
    expect(select).toHaveClass("rounded-control");
  });
});
