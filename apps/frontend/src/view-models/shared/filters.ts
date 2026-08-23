import type { CampaignStatus } from "@farmatodo-retail-media/types";

/**
 * Shape of the shared date-range/status filter bar. Lives in view-models, not
 * in the `FiltersBar` view component: view-models own screen state and views
 * must depend on them, never the other way around.
 */
export interface FiltersBarValue {
  status: CampaignStatus[];
  dateFrom: string;
  dateTo: string;
}
