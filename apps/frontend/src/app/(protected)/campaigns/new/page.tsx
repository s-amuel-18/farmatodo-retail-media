"use client";

import { useCampaignForm } from "@/view-models/campaigns/useCampaignForm";
import { useReferenceData } from "@/view-models/campaigns/useReferenceData";
import { CampaignFormView } from "@/views/campaigns/CampaignFormView";

export default function NewCampaignPage() {
  const { brands, products, suppliers, mediaCosts } = useReferenceData();
  const {
    register,
    onSubmit,
    values,
    filteredProducts,
    onBrandsChange,
    onProductsChange,
    estimatedCost,
    isSubmitting,
    error,
  } = useCampaignForm({ target: { mode: "create" }, initialCampaign: null, products, mediaCosts });

  return (
    <CampaignFormView
      mode="create"
      register={register}
      values={values}
      onSubmit={onSubmit}
      brands={brands}
      filteredProducts={filteredProducts}
      onBrandsChange={onBrandsChange}
      onProductsChange={onProductsChange}
      suppliers={suppliers}
      estimatedCost={estimatedCost}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
}
