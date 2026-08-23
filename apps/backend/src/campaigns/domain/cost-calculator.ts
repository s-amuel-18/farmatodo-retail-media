import type { ChannelType, MediaCost } from "@farmatodo-retail-media/types";
import { ValidationError } from "./errors";

export type CostCalculationInput =
  | { channel: "PETALO"; supplierId: string; quantity: number }
  | { channel: "PARRILLERA"; supplierId: string; quantity: number }
  | { channel: "SMS"; supplierId: string }
  | { channel: "TIKTOK"; supplierId: string };

/**
 * Total cost is always derived server-side from the media cost catalog, never
 * trusted from the client. Assumption (documented in the README): the catalog
 * entry is a per-unit cost for PETALO/PARRILLERA (multiplied by how many are
 * contracted) and a flat contracting cost for SMS/TIKTOK — separate from
 * TikTok's own ad-spend `dailyBudgetUsd`, which the provider bills directly.
 */
export function calculateTotalCost(
  input: CostCalculationInput,
  mediaCosts: MediaCost[],
): number {
  const mediaCost = findMediaCost(input.supplierId, input.channel, mediaCosts);
  const quantity = "quantity" in input ? input.quantity : 1;
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
