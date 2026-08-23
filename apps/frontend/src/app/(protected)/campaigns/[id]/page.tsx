"use client";

import { useParams } from "next/navigation";
import { useCampaign } from "@/view-models/campaigns/useCampaign";
import { useReferenceData } from "@/view-models/campaigns/useReferenceData";
import { CampaignDetailView } from "@/views/campaigns/CampaignDetailView";
import { ErrorText, LoadingState } from "@/components/ui";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, history, isLoading, error } = useCampaign(id);
  const { suppliers, brands } = useReferenceData();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!campaign) return <p className="text-sm text-text-muted">No se encontró la campaña.</p>;

  const supplierLabel = suppliers.find((s) => s.id === campaign.supplierId)?.name ?? campaign.supplierId;
  const brandLabels = campaign.brandIds
    .map((brandId) => brands.find((b) => b.id === brandId)?.name ?? brandId)
    .join(", ");

  return (
    <CampaignDetailView
      campaign={campaign}
      history={history}
      isLoading={false}
      error={null}
      supplierLabel={supplierLabel}
      brandLabels={brandLabels}
    />
  );
}
