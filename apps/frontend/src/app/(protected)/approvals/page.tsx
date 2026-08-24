"use client";

import { useApprovalsQueue } from "@/view-models/approvals/useApprovalsQueue";
import { useReferenceData } from "@/view-models/campaigns/useReferenceData";
import { ApprovalsQueueView } from "@/views/approvals/ApprovalsQueueView";

export default function ApprovalsQueuePage() {
  const { campaigns, isLoading, error, filters, setFilters, pagination, actions, decision, statusMessage } =
    useApprovalsQueue();
  const { suppliers } = useReferenceData();

  return (
    <ApprovalsQueueView
      campaigns={campaigns}
      suppliers={suppliers}
      isLoading={isLoading}
      error={error}
      filters={filters}
      onFiltersChange={setFilters}
      pagination={pagination}
      onApprove={actions.approve}
      onReject={actions.reject}
      decisionError={decision.error}
      statusMessage={statusMessage}
      pendingCampaignId={actions.pendingCampaignId}
    />
  );
}
