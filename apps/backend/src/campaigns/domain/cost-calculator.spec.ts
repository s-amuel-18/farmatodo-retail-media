import type { MediaCost } from "@farmatodo-retail-media/types";
import { calculateTotalCost } from "./cost-calculator";
import { ValidationError } from "./errors";

const mediaCosts: MediaCost[] = [
  { id: "mc-1", supplierId: "supplier-1", channel: "PETALO", unitCostUsd: 100, pricingModel: "PER_UNIT" },
  { id: "mc-2", supplierId: "supplier-1", channel: "SMS", unitCostUsd: 250, pricingModel: "FLAT" },
  { id: "mc-3", supplierId: "supplier-1", channel: "PARRILLERA", unitCostUsd: 60, pricingModel: "PER_UNIT" },
  { id: "mc-4", supplierId: "supplier-1", channel: "TIKTOK", unitCostUsd: 500, pricingModel: "FLAT" },
  { id: "mc-5", supplierId: "supplier-2", channel: "PETALO", unitCostUsd: 100, pricingModel: "PER_UNIT" },
];

describe("calculateTotalCost", () => {
  it("multiplies the unit cost by quantity for PETALO", () => {
    const total = calculateTotalCost(
      { channel: "PETALO", supplierId: "supplier-1", quantity: 3 },
      mediaCosts,
    );
    expect(total).toBe(300);
  });

  it("multiplies the unit cost by quantity for PARRILLERA", () => {
    const total = calculateTotalCost(
      { channel: "PARRILLERA", supplierId: "supplier-1", quantity: 5 },
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

  it("uses the flat contracting cost for TIKTOK, separate from its own daily ad-spend budget", () => {
    const total = calculateTotalCost(
      { channel: "TIKTOK", supplierId: "supplier-1" },
      mediaCosts,
    );
    expect(total).toBe(500);
  });

  it("returns 0 for a PETALO/PARRILLERA quantity of 0 instead of throwing", () => {
    const total = calculateTotalCost(
      { channel: "PETALO", supplierId: "supplier-1", quantity: 0 },
      mediaCosts,
    );
    expect(total).toBe(0);
  });

  it("looks up the cost by the exact supplier + channel pair, not just the channel", () => {
    const total = calculateTotalCost(
      { channel: "PETALO", supplierId: "supplier-2", quantity: 2 },
      mediaCosts,
    );
    expect(total).toBe(200);
  });

  it("rounds to 2 decimals", () => {
    const total = calculateTotalCost(
      { channel: "PETALO", supplierId: "supplier-1", quantity: 1 },
      [{ id: "mc-6", supplierId: "supplier-1", channel: "PETALO", unitCostUsd: 10.005, pricingModel: "PER_UNIT" }],
    );
    expect(total).toBe(10.01);
  });

  it("throws ValidationError when no cost is configured for the supplier/channel pair", () => {
    expect(() =>
      calculateTotalCost({ channel: "TIKTOK", supplierId: "supplier-3" }, mediaCosts),
    ).toThrow(ValidationError);
  });

  it("throws ValidationError when the supplier has costs for other channels but not this one", () => {
    expect(() =>
      calculateTotalCost({ channel: "SMS", supplierId: "supplier-2" }, mediaCosts),
    ).toThrow(ValidationError);
  });

  it("follows the catalog's pricingModel, not the channel name — a FLAT-priced PETALO entry ignores quantity", () => {
    const total = calculateTotalCost(
      { channel: "PETALO", supplierId: "supplier-9", quantity: 7 },
      [{ id: "mc-7", supplierId: "supplier-9", channel: "PETALO", unitCostUsd: 42, pricingModel: "FLAT" }],
    );
    expect(total).toBe(42);
  });

  it("follows the catalog's pricingModel, not the channel name — a PER_UNIT-priced SMS entry multiplies by quantity", () => {
    const total = calculateTotalCost(
      { channel: "SMS", supplierId: "supplier-9", quantity: 4 },
      [{ id: "mc-8", supplierId: "supplier-9", channel: "SMS", unitCostUsd: 10, pricingModel: "PER_UNIT" }],
    );
    expect(total).toBe(40);
  });
});
