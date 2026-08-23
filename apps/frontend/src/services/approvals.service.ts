import type { Campaign } from "@farmatodo-retail-media/types";
import { apiClient } from "./api-client";

export const approvalsService = {
  approve(campaignId: string): Promise<Campaign> {
    return apiClient.post<Campaign>(`/campaigns/${campaignId}/approve`);
  },

  reject(campaignId: string, comment: string): Promise<Campaign> {
    return apiClient.post<Campaign>(`/campaigns/${campaignId}/reject`, { comment });
  },
};
