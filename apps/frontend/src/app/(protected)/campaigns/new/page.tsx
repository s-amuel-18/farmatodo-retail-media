"use client";

import { useCampaignForm } from "@/view-models/campaigns/useCampaignForm";
import { useReferenceData } from "@/view-models/campaigns/useReferenceData";
import { CampaignFormView } from "@/views/campaigns/CampaignFormView";

export default function NewCampaignPage() {
  const { brands, products, suppliers, mediaCosts } = useReferenceData();
  const {
    register,
    errors,
    onSubmit,
    values,
    filteredProducts,
    onBrandsChange,
    onProductsChange,
    estimatedCost,
    isEstimatingCost,
    availableChannels,
    isSubmitting,
    error,
    fieldErrors,
  } = useCampaignForm({ target: { mode: "create" }, initialCampaign: null, products, mediaCosts });

  return (
    <CampaignFormView
      mode="create"
      register={register}
      errors={errors}
      values={values}
      onSubmit={onSubmit}
      brands={brands}
      filteredProducts={filteredProducts}
      onBrandsChange={onBrandsChange}
      onProductsChange={onProductsChange}
      suppliers={suppliers}
      availableChannels={availableChannels}
      estimatedCost={estimatedCost}
      isEstimatingCost={isEstimatingCost}
      isSubmitting={isSubmitting}
      error={error}
      fieldErrors={fieldErrors}
      backHref="/campaigns"
    />
  );
}
