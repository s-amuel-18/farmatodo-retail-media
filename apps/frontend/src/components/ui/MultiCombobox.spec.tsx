import { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiCombobox } from "@/components/ui";
import type { ComboboxOption } from "@/components/ui";

const OPTIONS: ComboboxOption[] = [
  { value: "farmatodo", label: "Farmatodo" },
  { value: "cruz-verde", label: "Cruz Verde" },
  { value: "locatel", label: "Locatel" },
  { value: "farmacenter", label: "Farmacenter" },
];

function Combobox({
  initialValue = [],
  onChange,
  disabled,
  emptyMessage,
}: {
  initialValue?: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  emptyMessage?: string;
}) {
  const [value, setValue] = useState<string[]>(initialValue);
  return (
    <MultiCombobox
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      placeholder="Selecciona una marca"
      {...(emptyMessage !== undefined ? { emptyMessage } : {})}
      {...(disabled !== undefined ? { disabled } : {})}
    />
  );
}

describe("MultiCombobox", () => {
  it("renders selected values as removable chips with their labels", () => {
    render(
      <MultiCombobox
        options={OPTIONS}
        value={["farmatodo", "locatel"]}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Farmatodo")).toBeInTheDocument();
    expect(screen.getByText("Locatel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar Farmatodo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar Locatel" })).toBeInTheDocument();
  });

  it("filters the visible listbox options by label, case-insensitively", async () => {
    const user = userEvent.setup();
    render(<MultiCombobox options={OPTIONS} value={[]} onChange={jest.fn()} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "CRUZ");

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Cruz Verde")).toBeInTheDocument();
    expect(within(listbox).queryByText("Farmatodo")).not.toBeInTheDocument();
    expect(within(listbox).queryByText("Locatel")).not.toBeInTheDocument();
  });

  it("shows a 'Sin resultados' message when the query matches nothing", async () => {
    const user = userEvent.setup();
    render(<MultiCombobox options={OPTIONS} value={[]} onChange={jest.fn()} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "xyz-no-match");

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Sin resultados.")).toBeInTheDocument();
  });

  it("clicking an unselected option calls onChange with that value appended", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiCombobox options={OPTIONS} value={["farmatodo"]} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));

    await user.click(screen.getByRole("option", { name: "Locatel" }));
    expect(onChange).toHaveBeenCalledWith(["farmatodo", "locatel"]);
  });

  it("clicking a selected option calls onChange with it removed", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiCombobox options={OPTIONS} value={["farmatodo", "locatel"]} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));

    const listbox = screen.getByRole("listbox");
    await user.click(within(listbox).getByText("Farmatodo"));
    expect(onChange).toHaveBeenCalledWith(["locatel"]);
  });

  it("clicking a chip's Quitar button removes that value and does not open the listbox", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiCombobox options={OPTIONS} value={["farmatodo", "locatel"]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Quitar Farmatodo" }));
    expect(onChange).toHaveBeenCalledWith(["locatel"]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ArrowDown then Enter selects the highlighted option (advances from the initial highlight)", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiCombobox options={OPTIONS} value={[]} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);

    // Opening the listbox highlights the first option (index 0, "Farmatodo").
    expect(screen.getAllByRole("option")[0]).toHaveClass("bg-highlight");

    // ArrowDown advances the highlight to index 1, "Cruz Verde".
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(["cruz-verde"]);
  });

  it("Enter with no ArrowDown selects the initially highlighted first option", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiCombobox options={OPTIONS} value={[]} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(["farmatodo"]);
  });

  it("ArrowDown moves the highlighted option's styling forward", async () => {
    const user = userEvent.setup();
    render(<MultiCombobox options={OPTIONS} value={[]} onChange={jest.fn()} />);
    const input = screen.getByRole("combobox");
    await user.click(input);

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveClass("bg-highlight");
    expect(options[1]).not.toHaveClass("bg-highlight");

    await user.keyboard("{ArrowDown}");
    const optionsAfter = screen.getAllByRole("option");
    expect(optionsAfter[1]).toHaveClass("bg-highlight");
    expect(optionsAfter[0]).not.toHaveClass("bg-highlight");

    await user.keyboard("{ArrowUp}");
    const optionsAfterUp = screen.getAllByRole("option");
    expect(optionsAfterUp[0]).toHaveClass("bg-highlight");
  });

  it("Escape closes the listbox and clears the query", async () => {
    const user = userEvent.setup();
    render(<MultiCombobox options={OPTIONS} value={[]} onChange={jest.fn()} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "cruz");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("Backspace with an empty query removes the last selected value", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiCombobox options={OPTIONS} value={["farmatodo", "locatel"]} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith(["farmatodo"]);
  });

  it("does not remove a value on Backspace when the query is non-empty", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiCombobox options={OPTIONS} value={["farmatodo"]} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "a");
    onChange.mockClear();
    await user.keyboard("{Backspace}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders emptyMessage instead of the input when disabled, and prevents opening the listbox", async () => {
    const user = userEvent.setup();
    render(
      <MultiCombobox
        options={OPTIONS}
        value={[]}
        onChange={jest.fn()}
        disabled
        emptyMessage="Selecciona una marca primero"
      />,
    );
    expect(screen.getByText("Selecciona una marca primero")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    const container = screen.getByText("Selecciona una marca primero").closest("div");
    if (container) await user.click(container);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the listbox when clicking outside the component", async () => {
    const user = userEvent.setup();
    render(<MultiCombobox options={OPTIONS} value={[]} onChange={jest.fn()} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports a full type -> select -> remove flow with cumulative state", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Combobox onChange={onChange} />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "loc");
    await user.click(screen.getByRole("option", { name: "Locatel" }));

    expect(onChange).toHaveBeenLastCalledWith(["locatel"]);
    expect(screen.getByRole("button", { name: "Quitar Locatel" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Quitar Locatel" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("button", { name: "Quitar Locatel" })).not.toBeInTheDocument();
  });
});
