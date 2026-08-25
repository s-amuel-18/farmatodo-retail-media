import type { ChannelType, MediaCost } from "@farmatodo-retail-media/types";
import { ValidationError } from "./errors";

export interface CostCalculationInput {
  channel: ChannelType;
  supplierId: string;
  quantity?: number | undefined;
}

/**
 * Total cost is always derived server-side from the media cost catalog, never
 * trusted from the client. Whether the unit cost is multiplied by `quantity`
 * or charged flat is decided by each catalog entry's `pricingModel` — never
 * by branching on `channel` here, so adding a new channel or repricing an
 * existing one is a catalog change, not a code change.
 */
export function calculateTotalCost(
  input: CostCalculationInput,
  mediaCosts: MediaCost[],
): number {
  const mediaCost = findMediaCost(input.supplierId, input.channel, mediaCosts);
  const quantity = mediaCost.pricingModel === "PER_UNIT" ? (input.quantity ?? 0) : 1;
  return round2(mediaCost.unitCostUsd * quantity);
}

function findMediaCost(
  supplierId: string,
  channel: ChannelType,
  mediaCosts: MediaCost[],
): MediaCost {
  const found = mediaCosts.find(
    (cost) => cost.supplierId === supplierId && cost.channel === channel,
  );
  if (!found) {
    throw new ValidationError(
      `No cost configured for supplier '${supplierId}' and channel '${channel}'`,
    );
  }
  return found;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
