import type { AuthenticatedUser, Campaign, NewCampaignInput } from "@farmatodo-retail-media/types";
import { assertEditable } from "../../domain/editable";
import { calculateTotalCost } from "../../domain/cost-calculator";
import { CampaignNotFoundError } from "../../domain/errors";
import type { CampaignRepository } from "../ports/campaign-repository.port";
import type { MediaCostRepository } from "../ports/media-cost-repository.port";
import { toCostInput } from "../to-cost-input";

export class UpdateCampaignUseCase {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly mediaCostRepository: MediaCostRepository,
  ) {}

  async execute(input: {
    campaignId: string;
    data: NewCampaignInput;
    actor: AuthenticatedUser;
  }): Promise<Campaign> {
    const current = await this.campaignRepository.findById(input.campaignId);
    if (!current) throw new CampaignNotFoundError(input.campaignId);

    assertEditable(current, input.actor);

    const mediaCosts = await this.mediaCostRepository.listAll();
    const totalCostUsd = calculateTotalCost(toCostInput(input.data), mediaCosts);

    return this.campaignRepository.replaceEditableFields(
      input.campaignId,
      input.data,
      totalCostUsd,
    );
  }
}
