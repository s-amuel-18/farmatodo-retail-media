import {
  CAMPAIGN_STATUSES,
  EDITABLE_CAMPAIGN_STATUSES as EDITABLE_CAMPAIGN_STATUSES_LIST,
} from "@farmatodo-retail-media/types";
import type { CampaignStatus, ChannelType, HistoryEntry, PetaloZone, Role } from "@farmatodo-retail-media/types";

/**
 * Single source of truth for every enum -> label / order / style-key mapping the UI needs.
 * Nothing here should be re-declared inline in a view; add a new entry here instead.
 */

export { CAMPAIGN_STATUSES };

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: "Borrador",
  PENDING_APPROVAL: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const EDITABLE_CAMPAIGN_STATUSES: ReadonlySet<CampaignStatus> = new Set(
  EDITABLE_CAMPAIGN_STATUSES_LIST,
);

export const CHANNEL_TYPES: readonly ChannelType[] = ["PETALO", "PARRILLERA", "SMS", "TIKTOK"];

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  PETALO: "Pétalo",
  PARRILLERA: "Parrillera",
  SMS: "SMS",
  TIKTOK: "TikTok",
};

export const PETALO_ZONES: readonly PetaloZone[] = ["ENTRADA", "PASILLO_CENTRAL", "CAJAS"];

export const PETALO_ZONE_LABELS: Record<PetaloZone, string> = {
  ENTRADA: "Entrada",
  PASILLO_CENTRAL: "Pasillo central",
  CAJAS: "Cajas",
};

export const ROLE_LABELS: Record<Role, string> = {
  COMMERCIAL_ANALYST: "Analista comercial",
  APPROVER_MANAGER: "Gerente de aprobación",
};

export const HISTORY_ACTION_LABELS: Record<HistoryEntry["action"], string> = {
  SUBMITTED: "Enviada a aprobación",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};
