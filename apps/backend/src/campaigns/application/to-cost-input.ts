import type { NewCampaignInput } from "@farmatodo-retail-media/types";
import type { CostCalculationInput } from "../domain/cost-calculator";

export function toCostInput(input: NewCampaignInput): CostCalculationInput {
  return {
    channel: input.channel,
    supplierId: input.supplierId,
    quantity: "quantity" in input ? input.quantity : undefined,
  };
}
