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
  const { register, errors, onSubmit, values, filteredProducts, estimatedCost, isSubmitting, error } =
    useCampaignForm({
      target: { mode: "edit", campaignId: id },
      initialCampaign: campaign,
      products,
      mediaCosts,
    });

  if (isLoading) return <LoadingState />;
  if (!campaign) return <p className="text-sm text-text-muted">No se encontró la campaña.</p>;

  return (
    <CampaignFormView
      mode="edit"
      register={register}
      errors={errors}
      values={values}
      onSubmit={onSubmit}
      brands={brands}
      filteredProducts={filteredProducts}
      suppliers={suppliers}
      estimatedCost={estimatedCost}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
}
