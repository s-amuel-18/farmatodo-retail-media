"use client";

import { useQuery } from "@tanstack/react-query";
import { campaignsService } from "../../services/campaigns.service";

export function useCampaign(campaignId: string) {
  const query = useQuery({
    queryKey: ["campaigns", "detail", campaignId],
    queryFn: () => campaignsService.get(campaignId),
  });

  return {
    campaign: query.data?.campaign ?? null,
    history: query.data?.history ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
