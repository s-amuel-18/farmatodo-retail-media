import type { MediaCost } from "@farmatodo-retail-media/types";
import { calculateTotalCost } from "./cost-calculator";
import { ValidationError } from "./errors";

const mediaCosts: MediaCost[] = [
  { id: "mc-1", supplierId: "supplier-1", channel: "PETALO", unitCostUsd: 100 },
  { id: "mc-2", supplierId: "supplier-1", channel: "SMS", unitCostUsd: 250 },
];

describe("calculateTotalCost", () => {
  it("multiplies the unit cost by quantity for PETALO", () => {
    const total = calculateTotalCost(
      { channel: "PETALO", supplierId: "supplier-1", quantity: 3 },
      mediaCosts,
    );
    expect(total).toBe(300);
  });

  it("uses the flat cost for SMS regardless of quantity fields", () => {
    const total = calculateTotalCost(
      { channel: "SMS", supplierId: "supplier-1" },
      mediaCosts,
    );
    expect(total).toBe(250);
  });

  it("rounds to 2 decimals", () => {
    const total = calculateTotalCost(
      { channel: "PETALO", supplierId: "supplier-1", quantity: 1 },
      [{ id: "mc-3", supplierId: "supplier-1", channel: "PETALO", unitCostUsd: 10.005 }],
    );
    expect(total).toBe(10.01);
  });

  it("throws ValidationError when no cost is configured for the supplier/channel pair", () => {
    expect(() =>
      calculateTotalCost({ channel: "TIKTOK", supplierId: "supplier-1" }, mediaCosts),
    ).toThrow(ValidationError);
  });
});
