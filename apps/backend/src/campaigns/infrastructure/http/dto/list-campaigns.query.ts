import type { CampaignListFilters, CampaignStatus } from "@farmatodo-retail-media/types";

const VALID_STATUSES: CampaignStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
];

export interface ListCampaignsQueryDto {
  status?: string; // comma-separated, e.g. "DRAFT,REJECTED"
  dateFrom?: string;
  dateTo?: string;
  pageSize?: string;
  cursor?: string;
}

export function parseListFilters(query: ListCampaignsQueryDto): CampaignListFilters {
  const filters: CampaignListFilters = {};

  if (query.status) {
    const statuses = query.status
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is CampaignStatus => VALID_STATUSES.includes(s as CampaignStatus));
    if (statuses.length > 0) filters.status = statuses;
  }
  if (query.dateFrom) filters.dateFrom = query.dateFrom;
  if (query.dateTo) filters.dateTo = query.dateTo;
  if (query.cursor) filters.cursor = query.cursor;
  if (query.pageSize) {
    const parsed = Number(query.pageSize);
    if (Number.isInteger(parsed) && parsed > 0) filters.pageSize = parsed;
  }

  return filters;
}
