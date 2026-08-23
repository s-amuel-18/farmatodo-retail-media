import type { NewCampaignInput } from "@farmatodo-retail-media/types";
import type { CostCalculationInput } from "../domain/cost-calculator";

export function toCostInput(input: NewCampaignInput): CostCalculationInput {
  if (input.channel === "PETALO" || input.channel === "PARRILLERA") {
    return {
      channel: input.channel,
      supplierId: input.supplierId,
      quantity: input.quantity,
    };
  }
  return { channel: input.channel, supplierId: input.supplierId };
}
