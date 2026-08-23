"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsService } from "../../services/approvals.service";
import { useToast } from "../shared/toast-context";

export function useApprovalDecision(campaignId: string) {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  }

  const approve = useMutation({
    mutationFn: () => approvalsService.approve(campaignId),
    onSuccess: () => {
      invalidate();
      setStatusMessage("Campaña aprobada.");
      showToast("Campaña aprobada.", "approved");
    },
  });

  const reject = useMutation({
    mutationFn: (comment: string) => approvalsService.reject(campaignId, comment),
    onSuccess: () => {
      invalidate();
      setStatusMessage("Campaña rechazada.");
      showToast("Campaña rechazada.", "rejected");
    },
  });

  return {
    onApprove: () => approve.mutateAsync(),
    onReject: (comment: string) => reject.mutateAsync(comment),
    isDeciding: approve.isPending || reject.isPending,
    decisionError:
      approve.error instanceof Error
        ? approve.error.message
        : reject.error instanceof Error
          ? reject.error.message
          : null,
    statusMessage,
  };
}
