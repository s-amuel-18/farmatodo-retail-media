import type { ChannelType } from "@farmatodo-retail-media/types";
import { calculateTotalCost } from "../../domain/cost-calculator";
import type { MediaCostRepository } from "../ports/media-cost-repository.port";

export interface EstimateCostInput {
  channel: ChannelType;
  supplierId: string;
  quantity?: number | undefined;
}

export interface EstimateCostResult {
  totalCostUsd: number;
}

/**
 * Read-only counterpart to the cost calculation embedded in create/update: lets
 * the form ask "what would this cost?" against the same catalog and the same
 * `calculateTotalCost`, without creating or mutating anything.
 */
export class EstimateCostUseCase {
  constructor(private readonly mediaCostRepository: MediaCostRepository) {}

  async execute(input: EstimateCostInput): Promise<EstimateCostResult> {
    const mediaCosts = await this.mediaCostRepository.listAll();
    const totalCostUsd = calculateTotalCost(input, mediaCosts);
    return { totalCostUsd };
  }
}
