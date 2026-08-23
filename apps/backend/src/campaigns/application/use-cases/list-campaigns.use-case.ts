import type {
  AuthenticatedUser,
  Campaign,
  CampaignListFilters,
  Paginated,
} from "@farmatodo-retail-media/types";
import type { CampaignRepository } from "../ports/campaign-repository.port";

export class ListCampaignsUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  execute(input: {
    filters: CampaignListFilters;
    actor: AuthenticatedUser;
  }): Promise<Paginated<Campaign>> {
    // An analyst only ever sees their own campaigns — enforced here, not just
    // in the UI, so a crafted request can't read someone else's pipeline.
    const filters: CampaignListFilters =
      input.actor.role === "COMMERCIAL_ANALYST"
        ? { ...input.filters, createdBy: input.actor.uid }
        : input.filters;

    return this.campaignRepository.list(filters);
  }
}
