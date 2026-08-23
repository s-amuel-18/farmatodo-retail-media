export type ChannelType = "PETALO" | "PARRILLERA" | "SMS" | "TIKTOK";

export type CampaignStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

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
