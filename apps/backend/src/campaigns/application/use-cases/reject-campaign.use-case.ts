import type { AuthenticatedUser, Campaign } from "@farmatodo-retail-media/types";
import type { CampaignRepository } from "../ports/campaign-repository.port";
import { decideTransition } from "./decide-transition";

export class RejectCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  execute(input: {
    campaignId: string;
    comment: string;
    actor: AuthenticatedUser;
  }): Promise<Campaign> {
    return this.campaignRepository.transactionalUpdate(
      input.campaignId,
      decideTransition({ type: "REJECT", comment: input.comment }, input.actor),
    );
  }
}
