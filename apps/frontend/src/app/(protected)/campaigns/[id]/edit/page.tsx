"use client";

import { useParams } from "next/navigation";
import { useCampaign } from "@/view-models/campaigns/useCampaign";
import { useCampaignForm } from "@/view-models/campaigns/useCampaignForm";
import { useReferenceData } from "@/view-models/campaigns/useReferenceData";
import { CampaignFormView } from "@/views/campaigns/CampaignFormView";
import { LoadingState } from "@/components/ui";

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, isLoading } = useCampaign(id);
  const { brands, products, suppliers, mediaCosts } = useReferenceData();
  const { submit, isSubmitting, error } = useCampaignForm({ mode: "edit", campaignId: id });

  if (isLoading) return <LoadingState />;
  if (!campaign) return <p className="text-sm text-text-muted">No se encontró la campaña.</p>;

  return (
    <CampaignFormView
      mode="edit"
      initialCampaign={campaign}
      brands={brands}
      products={products}
      suppliers={suppliers}
      mediaCosts={mediaCosts}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={submit}
    />
  );
}
