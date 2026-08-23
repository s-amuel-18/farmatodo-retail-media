"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CampaignListFilters } from "@farmatodo-retail-media/types";
import { approvalsService } from "../../services/approvals.service";
import { campaignsService } from "../../services/campaigns.service";
import type { FiltersBarValue } from "../shared/filters";
import { useToast } from "../shared/toast-context";

const DEFAULT_FILTERS: FiltersBarValue = { status: ["PENDING_APPROVAL"], dateFrom: "", dateTo: "" };

export function useApprovalsQueue() {
  const [filters, setFiltersState] = useState<FiltersBarValue>(DEFAULT_FILTERS);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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
    queryKey: ["campaigns", "approvals", apiFilters],
    queryFn: () => campaignsService.list(apiFilters),
  });

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ["campaigns", "approvals"] });
  }

  const approve = useMutation({
    mutationFn: (campaignId: string) => approvalsService.approve(campaignId),
    onSuccess: () => {
      invalidate();
      setStatusMessage("Campaña aprobada.");
      showToast("Campaña aprobada.", "approved");
    },
  });

  const reject = useMutation({
    mutationFn: (input: { campaignId: string; comment: string }) =>
      approvalsService.reject(input.campaignId, input.comment),
    onSuccess: () => {
      invalidate();
      setStatusMessage("Campaña rechazada.");
      showToast("Campaña rechazada.", "rejected");
    },
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
      approve: (campaignId: string) => approve.mutateAsync(campaignId),
      reject: (campaignId: string, comment: string) => reject.mutateAsync({ campaignId, comment }),
      pendingCampaignId: approve.isPending
        ? (approve.variables ?? null)
        : reject.isPending
          ? (reject.variables?.campaignId ?? null)
          : null,
    },
    decision: {
      isPending: approve.isPending || reject.isPending,
      error:
        approve.error instanceof Error
          ? approve.error.message
          : reject.error instanceof Error
            ? reject.error.message
            : null,
    },
    statusMessage,
  };
}
