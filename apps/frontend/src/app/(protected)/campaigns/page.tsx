"use client";

import { useCampaignsInbox } from "@/view-models/campaigns/useCampaignsInbox";
import { useReferenceData } from "@/view-models/campaigns/useReferenceData";
import { CampaignsInboxView } from "@/views/campaigns/CampaignsInboxView";

export default function CampaignsInboxPage() {
  const { campaigns, isLoading, error, filters, setFilters, pagination, actions, submitError, statusMessage } =
    useCampaignsInbox();
  const { suppliers } = useReferenceData();

  return (
    <CampaignsInboxView
      campaigns={campaigns}
      suppliers={suppliers}
      isLoading={isLoading}
      error={error}
      filters={filters}
      onFiltersChange={setFilters}
      pagination={pagination}
      onSubmit={actions.submit}
      submitError={submitError}
      statusMessage={statusMessage}
      pendingCampaignId={actions.pendingCampaignId}
    />
  );
}
