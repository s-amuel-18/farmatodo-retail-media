import type { Role } from "./user";

export type ApprovalDecision = "APPROVED" | "REJECTED";

export interface HistoryEntry {
  id: string;
  campaignId: string;
  action: "SUBMITTED" | "APPROVED" | "REJECTED";
  actorUid: string;
  actorRole: Role;
  comment?: string;
  occurredAt: string;
}

export interface Approval {
  id: string;
  campaignId: string;
  decidedBy: string;
  decision: ApprovalDecision;
  comment?: string;
  decidedAt: string;
}
