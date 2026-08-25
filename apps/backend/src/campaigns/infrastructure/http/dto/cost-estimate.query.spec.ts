import { costEstimateQuerySchema } from "./cost-estimate.query";

describe("costEstimateQuerySchema", () => {
  it("parses a valid query with quantity", () => {
    const result = costEstimateQuerySchema.safeParse({
      channel: "PETALO",
      supplierId: "supplier-1",
      quantity: "3",
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      channel: "PETALO",
      supplierId: "supplier-1",
      quantity: 3,
    });
  });

  it("allows quantity to be omitted for flat-fee channels", () => {
    const result = costEstimateQuerySchema.safeParse({ channel: "SMS", supplierId: "supplier-1" });

    expect(result.success).toBe(true);
    expect(result.success && result.data.quantity).toBeUndefined();
  });

  it("rejects an unknown channel", () => {
    const result = costEstimateQuerySchema.safeParse({ channel: "EMAIL", supplierId: "supplier-1" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing supplierId", () => {
    const result = costEstimateQuerySchema.safeParse({ channel: "PETALO" });
    expect(result.success).toBe(false);
  });

  it.each(["-1", "3.5", "abc"])("rejects an invalid quantity (%s)", (quantity) => {
    const result = costEstimateQuerySchema.safeParse({
      channel: "PETALO",
      supplierId: "supplier-1",
      quantity,
    });
    expect(result.success).toBe(false);
  });
});
