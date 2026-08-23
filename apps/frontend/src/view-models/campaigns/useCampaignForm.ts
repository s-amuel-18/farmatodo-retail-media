"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { newCampaignInputSchema, type NewCampaignInput } from "@farmatodo-retail-media/types";
import { campaignsService } from "../../services/campaigns.service";

type SaveTarget = { mode: "create" } | { mode: "edit"; campaignId: string };

export function useCampaignForm(target: SaveTarget) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: NewCampaignInput) =>
      target.mode === "create"
        ? campaignsService.create(data)
        : campaignsService.update(target.campaignId, data),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      router.push(`/campaigns/${campaign.id}`);
    },
  });

  function submit(rawPayload: NewCampaignInput): void {
    setValidationError(null);
    const result = newCampaignInputSchema.safeParse(rawPayload);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    mutation.mutate(result.data);
  }

  return {
    submit,
    isSubmitting: mutation.isPending,
    error: validationError ?? (mutation.error instanceof Error ? mutation.error.message : null),
  };
}
