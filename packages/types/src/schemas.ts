import { z } from "zod";
import { CAMPAIGN_STATUSES } from "./campaign";

/**
 * Mirrors `NewCampaignInput` from campaign.ts. Kept in this shared package so
 * the backend (request validation) and the frontend (form validation) run
 * the exact same rules instead of two hand-maintained copies drifting apart.
 */
const commonFields = {
  name: z.string().trim().min(1, "El nombre de la campaña es obligatorio"),
  brandIds: z.array(z.string().min(1)).min(1, "Selecciona al menos una marca"),
  productSkus: z.array(z.string().min(1)).min(1, "Selecciona al menos un producto"),
  supplierId: z.string().min(1, "Selecciona un proveedor"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().min(1, "La fecha de fin es obligatoria"),
  campaignDate: z.string().min(1, "La fecha de la campaña es obligatoria"),
};

const petaloCampaignSchema = z.object({
  ...commonFields,
  channel: z.literal("PETALO"),
  stores: z.array(z.string().min(1)).min(1, "Selecciona al menos una tienda"),
  quantity: z.number().int().positive(),
  zone: z.enum(["ENTRADA", "PASILLO_CENTRAL", "CAJAS"]),
});

const parrilleraCampaignSchema = z.object({
  ...commonFields,
  channel: z.literal("PARRILLERA"),
  stores: z.array(z.string().min(1)).min(1, "Selecciona al menos una tienda"),
  quantity: z.number().int().positive(),
  levels: z.number().int().positive(),
  category: z.string().min(1),
});

const smsCampaignSchema = z.object({
  ...commonFields,
  channel: z.literal("SMS"),
  segment: z.string().min(1),
  estimatedAudience: z.number().int().nonnegative(),
  template: z.string().min(1),
  sendWindow: z.object({ from: z.string().min(1), to: z.string().min(1) }),
});

const tiktokCampaignSchema = z.object({
  ...commonFields,
  channel: z.literal("TIKTOK"),
  adAccount: z.string().min(1),
  objective: z.string().min(1),
  creatives: z.array(z.string().min(1)).min(1, "Agrega al menos un creativo"),
  dailyBudgetUsd: z.number().positive(),
});

export const newCampaignInputSchema = z.discriminatedUnion("channel", [
  petaloCampaignSchema,
  parrilleraCampaignSchema,
  smsCampaignSchema,
  tiktokCampaignSchema,
]);

export const rejectCampaignSchema = z.object({
  comment: z.string().trim().min(1, "El comentario de rechazo es obligatorio"),
});

export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);

export const campaignListFiltersSchema = z.object({
  status: z.array(campaignStatusSchema).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  createdBy: z.string().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
});
