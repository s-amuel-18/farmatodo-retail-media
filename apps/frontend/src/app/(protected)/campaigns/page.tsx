"use client";

import { useCampaignsInbox } from "@/view-models/campaigns/useCampaignsInbox";
import { CampaignsInboxView } from "@/views/campaigns/CampaignsInboxView";

export default function CampaignsInboxPage() {
  const { campaigns, isLoading, error, filters, setFilters, pagination, actions, submitError, statusMessage } =
    useCampaignsInbox();

  return (
    <CampaignsInboxView
      campaigns={campaigns}
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
