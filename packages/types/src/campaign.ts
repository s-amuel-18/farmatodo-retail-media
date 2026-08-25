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
  /**
   * "Fecha de registro de la campaña" captured by the analyst on the form —
   * distinct from `createdAt` (the immutable Firestore write timestamp) so it
   * can be used to sort/filter the inbox without depending on infra internals.
   */
  campaignDate: string;
  createdAt: string;
  updatedAt: string;
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
 * createdBy, createdAt, updatedAt, currentApprovalComment) are never part of
 * client input. `campaignDate` IS part of client input — the analyst sets it.
 */
export type NewCampaignInput = DistributiveOmit<
  Campaign,
  | "id"
  | "createdAt"
  | "updatedAt"
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

/**
 * Drives how `calculateTotalCost` turns a unit cost into a total — data the
 * catalog owns, so the domain layer never has to branch on `ChannelType` to
 * know whether a channel is billed per unit or as a flat fee.
 */
export type PricingModel = "PER_UNIT" | "FLAT";

export interface MediaCost {
  id: string;
  supplierId: string;
  channel: ChannelType;
  unitCostUsd: number;
  pricingModel: PricingModel;
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
