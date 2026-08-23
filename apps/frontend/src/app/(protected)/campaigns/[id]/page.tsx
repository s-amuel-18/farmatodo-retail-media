"use client";

import { useParams } from "next/navigation";
import { useCampaign } from "@/view-models/campaigns/useCampaign";
import { CampaignDetailView } from "@/views/campaigns/CampaignDetailView";
import { ErrorText, LoadingState } from "@/components/ui";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, history, isLoading, error } = useCampaign(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!campaign) return <p className="text-sm text-text-muted">No se encontró la campaña.</p>;

  return (
    <CampaignDetailView
      campaign={campaign}
      history={history}
      isLoading={false}
      error={null}
      backHref="/campaigns"
    />
  );
}
