import type {
  Campaign,
  CampaignListFilters,
  HistoryEntry,
  NewCampaignInput,
  Paginated,
} from "@farmatodo-retail-media/types";
import { CampaignNotFoundError } from "../../domain/errors";
import type { CampaignDraft, CampaignRepository, Decide } from "../ports/campaign-repository.port";

let nextId = 1;

export class InMemoryCampaignRepository implements CampaignRepository {
  readonly campaigns = new Map<string, Campaign>();
  readonly history: HistoryEntry[] = [];

  async findById(id: string): Promise<Campaign | null> {
    return this.campaigns.get(id) ?? null;
  }

  async create(draft: CampaignDraft): Promise<Campaign> {
    const now = new Date().toISOString();
    const campaign = {
      ...draft,
      id: `campaign-${nextId++}`,
      createdAt: now,
      updatedAt: now,
      status: "DRAFT",
    } as Campaign;
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async replaceEditableFields(
    id: string,
    input: NewCampaignInput,
    totalCostUsd: number,
  ): Promise<Campaign> {
    const current = this.campaigns.get(id);
    if (!current) throw new CampaignNotFoundError(id);
    const updated = {
      ...current,
      ...input,
      totalCostUsd,
      updatedAt: new Date().toISOString(),
    } as Campaign;
    this.campaigns.set(id, updated);
    return updated;
  }

  async transactionalUpdate(id: string, decide: Decide): Promise<Campaign> {
    const current = this.campaigns.get(id);
    if (!current) throw new CampaignNotFoundError(id);

    const { campaign, historyEntry } = decide(current);
    this.campaigns.set(id, campaign);
    this.history.push({ ...historyEntry, id: `history-${this.history.length + 1}` });
    return campaign;
  }

  async list(filters: CampaignListFilters): Promise<Paginated<Campaign>> {
    const items = [...this.campaigns.values()].filter((campaign) => {
      if (filters.createdBy && campaign.createdBy !== filters.createdBy) return false;
      if (filters.status && !filters.status.includes(campaign.status)) return false;
      return true;
    });
    return { items, nextCursor: null };
  }

  async listHistory(campaignId: string): Promise<HistoryEntry[]> {
    return this.history.filter((entry) => entry.campaignId === campaignId);
  }
}
