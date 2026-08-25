import { ValidationError } from "../../domain/errors";
import { InMemoryMediaCostRepository } from "../testing/in-memory-media-cost-repository";
import { EstimateCostUseCase } from "./estimate-cost.use-case";

describe("EstimateCostUseCase", () => {
  it("multiplies unit cost by quantity for a PER_UNIT channel", async () => {
    const useCase = new EstimateCostUseCase(
      new InMemoryMediaCostRepository([
        { id: "mc-1", supplierId: "supplier-1", channel: "PETALO", unitCostUsd: 150, pricingModel: "PER_UNIT" },
      ]),
    );

    const result = await useCase.execute({ channel: "PETALO", supplierId: "supplier-1", quantity: 3 });

    expect(result).toEqual({ totalCostUsd: 450 });
  });

  it("ignores quantity for a FLAT channel", async () => {
    const useCase = new EstimateCostUseCase(
      new InMemoryMediaCostRepository([
        { id: "mc-1", supplierId: "supplier-1", channel: "SMS", unitCostUsd: 300, pricingModel: "FLAT" },
      ]),
    );

    const result = await useCase.execute({ channel: "SMS", supplierId: "supplier-1", quantity: 999 });

    expect(result).toEqual({ totalCostUsd: 300 });
  });

  it("rejects when no cost is configured for the supplier/channel pair", async () => {
    const useCase = new EstimateCostUseCase(new InMemoryMediaCostRepository([]));

    await expect(
      useCase.execute({ channel: "TIKTOK", supplierId: "supplier-1" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
