"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CampaignListFilters } from "@farmatodo-retail-media/types";
import { campaignsService } from "../../services/campaigns.service";
import type { FiltersBarValue } from "../shared/filters";

const EMPTY_FILTERS: FiltersBarValue = { status: [], dateFrom: "", dateTo: "" };

export function useCampaignsInbox() {
  const [filters, setFiltersState] = useState<FiltersBarValue>(EMPTY_FILTERS);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const apiFilters: CampaignListFilters = useMemo(
    () => ({
      ...(filters.status.length ? { status: filters.status } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
      ...(cursorStack.length ? { cursor: cursorStack[cursorStack.length - 1] } : {}),
    }),
    [filters, cursorStack],
  );

  const query = useQuery({
    queryKey: ["campaigns", "inbox", apiFilters],
    queryFn: () => campaignsService.list(apiFilters),
  });

  const submit = useMutation({
    mutationFn: (campaignId: string) => campaignsService.submit(campaignId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns", "inbox"] }),
  });

  return {
    campaigns: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    filters,
    setFilters: (next: FiltersBarValue) => {
      setCursorStack([]);
      setFiltersState(next);
    },
    pagination: {
      hasNextPage: Boolean(query.data?.nextCursor),
      hasPrevPage: cursorStack.length > 0,
      onNext: () => {
        const next = query.data?.nextCursor;
        if (next) setCursorStack((stack) => [...stack, next]);
      },
      onPrev: () => setCursorStack((stack) => stack.slice(0, -1)),
    },
    actions: {
      submit: (campaignId: string) => submit.mutate(campaignId),
      isSubmitting: submit.isPending,
    },
  };
}
