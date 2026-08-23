"use client";

import { useCampaignForm } from "../../../../view-models/campaigns/useCampaignForm";
import { useReferenceData } from "../../../../view-models/campaigns/useReferenceData";
import { CampaignFormView } from "../../../../views/campaigns/CampaignFormView";

export default function NewCampaignPage() {
  const { brands, products, suppliers, mediaCosts } = useReferenceData();
  const { submit, isSubmitting, error } = useCampaignForm({ mode: "create" });

  return (
    <CampaignFormView
      mode="create"
      initialCampaign={null}
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
