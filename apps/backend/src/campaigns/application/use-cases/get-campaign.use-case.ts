import type { AuthenticatedUser, Campaign } from "@farmatodo-retail-media/types";
import { CampaignNotFoundError, ForbiddenActionError } from "../../domain/errors";
import type { CampaignRepository } from "../ports/campaign-repository.port";

export class GetCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(input: { campaignId: string; actor: AuthenticatedUser }): Promise<Campaign> {
    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign) throw new CampaignNotFoundError(input.campaignId);

    // A manager can audit any campaign; an analyst can only ever open their own.
    if (input.actor.role === "COMMERCIAL_ANALYST" && campaign.createdBy !== input.actor.uid) {
      throw new ForbiddenActionError("VIEW", input.actor.role);
    }

    return campaign;
  }
}
