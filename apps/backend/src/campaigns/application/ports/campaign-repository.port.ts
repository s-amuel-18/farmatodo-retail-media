import type {
  Campaign,
  CampaignListFilters,
  HistoryEntry,
  NewCampaignInput,
  Paginated,
} from "@farmatodo-retail-media/types";

export const CAMPAIGN_REPOSITORY = Symbol("CAMPAIGN_REPOSITORY");

// `&` on a union distributes (A|B) & X = (A&X)|(B&X); an `interface extends`
// clause cannot target a union type at all, so this must stay a type alias.
export type CampaignDraft = NewCampaignInput & {
  createdBy: string;
  totalCostUsd: number;
};

/**
 * `decide` is a pure function (typically a closure around domain/transition)
 * that receives the campaign as currently persisted and returns the new state
 * plus its history entry, or throws a DomainError. The adapter is responsible
 * for calling it inside a single atomic read-modify-write — this is what
 * keeps the state machine race-free under concurrent requests.
 */
export type Decide = (current: Campaign) => {
  campaign: Campaign;
  historyEntry: Omit<HistoryEntry, "id">;
};

export interface CampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  create(draft: CampaignDraft): Promise<Campaign>;
  replaceEditableFields(id: string, input: NewCampaignInput, totalCostUsd: number): Promise<Campaign>;
  transactionalUpdate(id: string, decide: Decide): Promise<Campaign>;
  list(filters: CampaignListFilters): Promise<Paginated<Campaign>>;
}
