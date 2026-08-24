import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleChip } from "@/components/ui";

describe("ToggleChip", () => {
  it("renders as role=checkbox with aria-checked reflecting the pressed prop", () => {
    const { rerender } = render(
      <ToggleChip tone="approved" pressed={false}>
        Aprobada
      </ToggleChip>,
    );
    const chip = screen.getByRole("checkbox", { name: "Aprobada" });
    expect(chip).toHaveAttribute("aria-checked", "false");

    rerender(
      <ToggleChip tone="approved" pressed={true}>
        Aprobada
      </ToggleChip>,
    );
    expect(screen.getByRole("checkbox", { name: "Aprobada" })).toHaveAttribute("aria-checked", "true");
  });

  it("calls the passed onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <ToggleChip tone="pending" pressed={false} onClick={onClick}>
        Pendiente
      </ToggleChip>,
    );
    await user.click(screen.getByRole("checkbox", { name: "Pendiente" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies a different tone class when pressed vs when not pressed", () => {
    const { rerender } = render(
      <ToggleChip tone="rejected" pressed={false}>
        Rechazada
      </ToggleChip>,
    );
    const unpressedChip = screen.getByRole("checkbox", { name: "Rechazada" });
    expect(unpressedChip).toHaveClass("border-border", "bg-surface", "text-text-muted");
    expect(unpressedChip).not.toHaveClass("bg-status-rejected-bg");

    rerender(
      <ToggleChip tone="rejected" pressed={true}>
        Rechazada
      </ToggleChip>,
    );
    const pressedChip = screen.getByRole("checkbox", { name: "Rechazada" });
    expect(pressedChip).toHaveClass("bg-status-rejected-bg", "text-status-rejected-fg");
    expect(pressedChip).not.toHaveClass("bg-surface");
  });

  it("merges a custom className", () => {
    render(
      <ToggleChip tone="neutral" pressed={false} className="my-extra">
        Neutral
      </ToggleChip>,
    );
    expect(screen.getByRole("checkbox", { name: "Neutral" })).toHaveClass("my-extra");
  });
});
