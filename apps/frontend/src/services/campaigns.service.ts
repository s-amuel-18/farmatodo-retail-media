import type {
  Campaign,
  CampaignListFilters,
  ChannelType,
  HistoryEntry,
  NewCampaignInput,
  Paginated,
} from "@farmatodo-retail-media/types";
import { apiClient } from "./api-client";

export interface CampaignWithHistory {
  campaign: Campaign;
  history: HistoryEntry[];
}

export interface EstimateCostParams {
  channel: ChannelType;
  supplierId: string;
  quantity?: number;
}

export interface CostEstimate {
  totalCostUsd: number;
}

function toCostEstimateQueryString(params: EstimateCostParams): string {
  const query = new URLSearchParams({ channel: params.channel, supplierId: params.supplierId });
  if (params.quantity !== undefined) query.set("quantity", String(params.quantity));
  return query.toString();
}

function toQueryString(filters: CampaignListFilters): string {
  const params = new URLSearchParams();
  if (filters.status?.length) params.set("status", filters.status.join(","));
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.cursor) params.set("cursor", filters.cursor);
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const campaignsService = {
  create(data: NewCampaignInput): Promise<Campaign> {
    return apiClient.post<Campaign>("/campaigns", data);
  },

  update(id: string, data: NewCampaignInput): Promise<Campaign> {
    return apiClient.patch<Campaign>(`/campaigns/${id}`, data);
  },

  get(id: string): Promise<CampaignWithHistory> {
    return apiClient.get<CampaignWithHistory>(`/campaigns/${id}`);
  },

  list(filters: CampaignListFilters): Promise<Paginated<Campaign>> {
    return apiClient.get<Paginated<Campaign>>(`/campaigns${toQueryString(filters)}`);
  },

  submit(id: string): Promise<Campaign> {
    return apiClient.post<Campaign>(`/campaigns/${id}/submit`);
  },

  estimateCost(params: EstimateCostParams): Promise<CostEstimate> {
    return apiClient.get<CostEstimate>(`/campaigns/cost-estimate?${toCostEstimateQueryString(params)}`);
  },
};
