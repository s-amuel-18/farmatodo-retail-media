import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltersBar } from "./FiltersBar";
import type { FiltersBarValue } from "../../view-models/shared/filters";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-vocabulary";

function baseValue(overrides: Partial<FiltersBarValue> = {}): FiltersBarValue {
  return {
    status: ["PENDING_APPROVAL"],
    dateFrom: "2026-01-01",
    dateTo: "2026-01-31",
    ...overrides,
  };
}

describe("FiltersBar", () => {
  it("renders a toggle chip for every campaign status with aria-checked reflecting the value", () => {
    const value = baseValue({ status: ["PENDING_APPROVAL", "APPROVED"] });
    render(<FiltersBar value={value} onChange={jest.fn()} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(CAMPAIGN_STATUSES.length);

    for (const status of CAMPAIGN_STATUSES) {
      const chip = screen.getByRole("checkbox", { name: CAMPAIGN_STATUS_LABELS[status] });
      const expected = value.status.includes(status);
      expect(chip).toHaveAttribute("aria-checked", String(expected));
    }
  });

  it("renders the Desde and Hasta date inputs with the current value", () => {
    const value = baseValue();
    render(<FiltersBar value={value} onChange={jest.fn()} />);

    expect(screen.getByLabelText("Desde")).toHaveValue(value.dateFrom);
    expect(screen.getByLabelText("Hasta")).toHaveValue(value.dateTo);
  });

  it("calls onChange with the status appended when clicking an unselected chip", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const value = baseValue({ status: ["PENDING_APPROVAL"] });
    render(<FiltersBar value={value} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: CAMPAIGN_STATUS_LABELS.APPROVED }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...value,
      status: ["PENDING_APPROVAL", "APPROVED"],
    });
  });

  it("calls onChange with the status removed when clicking an already-selected chip", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const value = baseValue({ status: ["PENDING_APPROVAL", "APPROVED"] });
    render(<FiltersBar value={value} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: CAMPAIGN_STATUS_LABELS.PENDING_APPROVAL }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...value,
      status: ["APPROVED"],
    });
  });

  it("calls onChange with an updated dateFrom, leaving the rest of value unchanged", () => {
    const onChange = jest.fn();
    const value = baseValue();
    render(<FiltersBar value={value} onChange={onChange} />);

    const desde = screen.getByLabelText("Desde");
    fireEvent.change(desde, { target: { value: "2026-02-15" } });

    expect(onChange).toHaveBeenCalledWith({ ...value, dateFrom: "2026-02-15" });
  });

  it("calls onChange with an updated dateTo, leaving the rest of value unchanged", () => {
    const onChange = jest.fn();
    const value = baseValue();
    render(<FiltersBar value={value} onChange={onChange} />);

    const hasta = screen.getByLabelText("Hasta");
    fireEvent.change(hasta, { target: { value: "2026-03-20" } });

    expect(onChange).toHaveBeenCalledWith({ ...value, dateTo: "2026-03-20" });
  });
});
