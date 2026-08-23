"use client";

import { useParams } from "next/navigation";
import { useCampaign } from "../../../../view-models/campaigns/useCampaign";
import { useApprovalDecision } from "../../../../view-models/approvals/useApprovalDecision";
import { CampaignDetailView } from "../../../../views/campaigns/CampaignDetailView";

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, history, isLoading, error } = useCampaign(id);
  const { onApprove, onReject } = useApprovalDecision(id);

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "#c0392b" }}>{error}</p>;
  if (!campaign) return <p>No se encontró la campaña.</p>;

  return (
    <CampaignDetailView
      campaign={campaign}
      history={history}
      isLoading={false}
      error={null}
      approverActions={{ onApprove, onReject }}
    />
  );
}
