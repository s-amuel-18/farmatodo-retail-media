import type { AuthenticatedUser, Campaign, NewCampaignInput } from "@farmatodo-retail-media/types";
import { calculateTotalCost } from "../../domain/cost-calculator";
import { ForbiddenActionError } from "../../domain/errors";
import type { CampaignRepository } from "../ports/campaign-repository.port";
import type { MediaCostRepository } from "../ports/media-cost-repository.port";
import { toCostInput } from "../to-cost-input";

export class CreateCampaignUseCase {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly mediaCostRepository: MediaCostRepository,
  ) {}

  async execute(input: {
    data: NewCampaignInput;
    actor: AuthenticatedUser;
  }): Promise<Campaign> {
    if (input.actor.role !== "COMMERCIAL_ANALYST") {
      throw new ForbiddenActionError("CREATE", input.actor.role);
    }

    const mediaCosts = await this.mediaCostRepository.listAll();
    const totalCostUsd = calculateTotalCost(toCostInput(input.data), mediaCosts);

    return this.campaignRepository.create({
      ...input.data,
      createdBy: input.actor.uid,
      totalCostUsd,
    });
  }
}
