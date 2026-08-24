import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "@/components/ui";

describe("Field", () => {
  it("renders the label text", () => {
    render(
      <Field label="Nombre">
        <input />
      </Field>,
    );
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("wires the label htmlFor to the child's generated id and focuses it on label click", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Nombre">
        <input />
      </Field>,
    );
    const input = screen.getByLabelText("Nombre");
    const label = screen.getByText("Nombre").closest("label");
    expect(label).toHaveAttribute("for", input.id);
    expect(input.id).toBeTruthy();

    await user.click(screen.getByText("Nombre"));
    expect(document.activeElement).toBe(input);
  });

  it("preserves an explicit id on the child instead of generating one", () => {
    render(
      <Field label="Correo">
        <input id="explicit-id" />
      </Field>,
    );
    const input = screen.getByLabelText("Correo");
    expect(input).toHaveAttribute("id", "explicit-id");
  });

  it("shows an aria-hidden asterisk and sets aria-required when required", () => {
    render(
      <Field label="Nombre" required>
        <input />
      </Field>,
    );
    const input = screen.getByLabelText(/Nombre/);
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toBeRequired();

    const asterisk = screen.getByText("*");
    expect(asterisk).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the error text with role=alert and marks the control invalid, wiring aria-describedby", () => {
    render(
      <Field label="Nombre" error="Campo requerido">
        <input />
      </Field>,
    );
    const input = screen.getByLabelText("Nombre");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Campo requerido");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  });

  it("wires aria-describedby to the hint when only a hint is present, without aria-invalid", () => {
    render(
      <Field label="Nombre" hint="Usa tu nombre legal">
        <input />
      </Field>,
    );
    const input = screen.getByLabelText("Nombre");
    const hint = screen.getByText("Usa tu nombre legal");
    expect(input.getAttribute("aria-describedby")).toBe(hint.id);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("includes both hint and error ids, space-separated, in aria-describedby when both are present", () => {
    render(
      <Field label="Nombre" hint="Usa tu nombre legal" error="Campo requerido">
        <input />
      </Field>,
    );
    const input = screen.getByLabelText("Nombre");
    const hint = screen.getByText("Usa tu nombre legal");
    const alert = screen.getByRole("alert");
    expect(input.getAttribute("aria-describedby")).toBe(`${hint.id} ${alert.id}`);
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("renders children as-is when children is not a single valid element", () => {
    render(<Field label="Info">Just some text</Field>);
    expect(screen.getByText("Just some text")).toBeInTheDocument();
  });
});
