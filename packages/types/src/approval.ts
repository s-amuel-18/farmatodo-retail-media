import type { Role } from "./user";

/**
 * One append-only record per state transition (submit/approve/reject), stored
 * in each campaign's `history` subcollection. This is the sole traceability
 * model — there is no separate `Approval` entity, since a decision is just
 * one more entry in the same chronological log the analyst's submission is.
 */
export interface HistoryEntry {
  id: string;
  campaignId: string;
  action: "SUBMITTED" | "APPROVED" | "REJECTED";
  actorUid: string;
  actorRole: Role;
  comment?: string;
  occurredAt: string;
}
