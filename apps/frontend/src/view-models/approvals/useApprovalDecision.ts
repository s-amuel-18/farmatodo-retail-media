"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsService } from "../../services/approvals.service";
import { useToast } from "../shared/toast-context";

export function useApprovalDecision(campaignId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  }

  const approve = useMutation({
    mutationFn: () => approvalsService.approve(campaignId),
    onSuccess: () => {
      invalidate();
      showToast("Campaña aprobada.", "approved");
    },
  });

  const reject = useMutation({
    mutationFn: (comment: string) => approvalsService.reject(campaignId, comment),
    onSuccess: () => {
      invalidate();
      showToast("Campaña rechazada.", "rejected");
    },
  });

  return {
    onApprove: () => approve.mutate(),
    onReject: (comment: string) => reject.mutate(comment),
    isDeciding: approve.isPending || reject.isPending,
  };
}
