import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui";

function renderModal(onClose = jest.fn()) {
  return render(
    <Modal title="Confirmar accion" onClose={onClose}>
      <button type="button">Primero</button>
      <button type="button">Segundo</button>
    </Modal>,
  );
}

describe("Modal", () => {
  it("renders with role=dialog, aria-modal, and a title referenced by aria-labelledby", () => {
    renderModal();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const title = screen.getByText("Confirmar accion");
    expect(title).toHaveAttribute("id", dialog.getAttribute("aria-labelledby"));
  });

  it("moves focus to the first focusable element inside the panel on mount", () => {
    renderModal();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Primero" }));
  });

  it("focuses the panel itself when there are no focusable children", () => {
    render(
      <Modal title="Sin botones" onClose={jest.fn()}>
        <p>Solo texto</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(document.activeElement).toBe(dialog);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = jest.fn();
    renderModal(onClose);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the backdrop but not when clicking inside the panel", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderModal(onClose);

    const dialog = screen.getByRole("dialog");
    await user.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    const backdrop = dialog.parentElement!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("wraps focus from the last element to the first on Tab", () => {
    renderModal();
    const first = screen.getByRole("button", { name: "Primero" });
    const last = screen.getByRole("button", { name: "Segundo" });

    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
  });

  it("wraps focus from the first element to the last on Shift+Tab", () => {
    renderModal();
    const first = screen.getByRole("button", { name: "Primero" });
    const last = screen.getByRole("button", { name: "Segundo" });

    first.focus();
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("restores focus to the previously focused element on unmount", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Abrir
          </button>
          {open ? (
            <Modal title="Modal" onClose={() => setOpen(false)}>
              <button type="button">Dentro</button>
            </Modal>
          ) : null}
        </div>
      );
    }

    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Abrir" });
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Dentro" }));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });
});
