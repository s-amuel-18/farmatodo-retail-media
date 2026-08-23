"use client";

import { useApprovalsQueue } from "../../../view-models/approvals/useApprovalsQueue";
import { ApprovalsQueueView } from "../../../views/approvals/ApprovalsQueueView";

export default function ApprovalsQueuePage() {
  const { campaigns, isLoading, error, filters, setFilters, pagination, actions } =
    useApprovalsQueue();

  return (
    <ApprovalsQueueView
      campaigns={campaigns}
      isLoading={isLoading}
      error={error}
      filters={filters}
      onFiltersChange={setFilters}
      pagination={pagination}
      onApprove={actions.approve}
      onReject={actions.reject}
    />
  );
}
