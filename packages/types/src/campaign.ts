import type { DistributiveOmit } from "./utils";

export type ChannelType = "PETALO" | "PARRILLERA" | "SMS" | "TIKTOK";

/**
 * Single source of truth for the campaign status enum. Both the zod schema
 * (schemas.ts) and every place that needs to enumerate statuses (frontend
 * filters, backend query parsing) derive from this instead of re-listing the
 * four strings.
 */
export const CAMPAIGN_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

/**
 * "El analista puede editarlas libremente [...] en DRAFT" (or REJECTED, to fix
 * and resubmit). Shared so the backend's edit guard and the frontend's "can
 * this campaign be edited" checks never drift apart.
 */
export const EDITABLE_CAMPAIGN_STATUSES: readonly CampaignStatus[] = [
  "DRAFT",
  "REJECTED",
];

export type PetaloZone = "ENTRADA" | "PASILLO_CENTRAL" | "CAJAS";

export interface CampaignBase {
  id: string;
  name: string;
  brandIds: string[];
  productSkus: string[];
  supplierId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  status: CampaignStatus;
  totalCostUsd: number;
  currentApprovalComment?: string;
}

export interface PetaloCampaign extends CampaignBase {
  channel: "PETALO";
  stores: string[];
  quantity: number;
  zone: PetaloZone;
}

export interface ParrilleraCampaign extends CampaignBase {
  channel: "PARRILLERA";
  stores: string[];
  quantity: number;
  levels: number;
  category: string;
}

export interface SmsCampaign extends CampaignBase {
  channel: "SMS";
  segment: string;
  estimatedAudience: number;
  template: string;
  sendWindow: { from: string; to: string };
}

export interface TiktokCampaign extends CampaignBase {
  channel: "TIKTOK";
  adAccount: string;
  objective: string;
  creatives: string[];
  dailyBudgetUsd: number;
}

export type Campaign =
  | PetaloCampaign
  | ParrilleraCampaign
  | SmsCampaign
  | TiktokCampaign;

/**
 * Shape used both by the create/edit form (frontend) and the create/update
 * use cases (backend) — server-assigned fields (id, status, totalCostUsd,
 * createdBy, createdAt, currentApprovalComment) are never part of client input.
 */
export type NewCampaignInput = DistributiveOmit<
  Campaign,
  | "id"
  | "createdAt"
  | "status"
  | "totalCostUsd"
  | "createdBy"
  | "currentApprovalComment"
>;

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  sku: string;
  name: string;
  brandId: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface MediaCost {
  id: string;
  supplierId: string;
  channel: ChannelType;
  unitCostUsd: number;
}

export interface CampaignListFilters {
  status?: CampaignStatus[];
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  pageSize?: number;
  cursor?: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}
