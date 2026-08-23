"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsService } from "../../services/approvals.service";

export function useApprovalDecision(campaignId: string) {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  }

  const approve = useMutation({
    mutationFn: () => approvalsService.approve(campaignId),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: (comment: string) => approvalsService.reject(campaignId, comment),
    onSuccess: invalidate,
  });

  return {
    onApprove: () => approve.mutate(),
    onReject: (comment: string) => reject.mutate(comment),
    isDeciding: approve.isPending || reject.isPending,
  };
}
