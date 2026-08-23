"use client";

import { useParams } from "next/navigation";
import { useCampaign } from "@/view-models/campaigns/useCampaign";
import { useApprovalDecision } from "@/view-models/approvals/useApprovalDecision";
import { CampaignDetailView } from "@/views/campaigns/CampaignDetailView";
import { ErrorText, LoadingState } from "@/components/ui";

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, history, isLoading, error } = useCampaign(id);
  const { onApprove, onReject, decisionError, statusMessage } = useApprovalDecision(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!campaign) return <p className="text-sm text-text-muted">No se encontró la campaña.</p>;

  return (
    <CampaignDetailView
      campaign={campaign}
      history={history}
      isLoading={false}
      error={null}
      approverActions={{ onApprove, onReject }}
      decisionError={decisionError}
      statusMessage={statusMessage}
    />
  );
}
