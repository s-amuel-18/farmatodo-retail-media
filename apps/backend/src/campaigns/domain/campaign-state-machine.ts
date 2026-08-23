import type {
  AuthenticatedUser,
  Campaign,
  CampaignStatus,
} from "@farmatodo-retail-media/types";
import {
  ForbiddenActionError,
  InvalidTransitionError,
  ValidationError,
} from "./errors";

export type CampaignAction =
  | { type: "SUBMIT" }
  | { type: "APPROVE" }
  | { type: "REJECT"; comment: string };

export type HistoryAction = "SUBMITTED" | "APPROVED" | "REJECTED";

export type TransitionResult =
  | { ok: true; campaign: Campaign; historyAction: HistoryAction }
  | { ok: false; error: InvalidTransitionError | ForbiddenActionError | ValidationError };

const ALLOWED_SOURCE_STATUSES: Record<CampaignAction["type"], CampaignStatus[]> = {
  SUBMIT: ["DRAFT", "REJECTED"],
  APPROVE: ["PENDING_APPROVAL"],
  REJECT: ["PENDING_APPROVAL"],
};

/**
 * Sole source of truth for valid campaign transitions. Pure: given the same
 * campaign, action and actor it always returns the same result, with no I/O.
 * The application layer is the only caller, and it persists `result.campaign`
 * verbatim — nothing outside this function decides whether a transition holds.
 */
export function transition(
  campaign: Campaign,
  action: CampaignAction,
  actor: AuthenticatedUser,
): TransitionResult {
  const roleCheck = checkRole(campaign, action, actor);
  if (roleCheck) return { ok: false, error: roleCheck };

  const allowedSources = ALLOWED_SOURCE_STATUSES[action.type];
  if (!allowedSources.includes(campaign.status)) {
    return {
      ok: false,
      error: new InvalidTransitionError(campaign.status, action.type),
    };
  }

  switch (action.type) {
    case "SUBMIT": {
      const { currentApprovalComment, ...rest } = campaign;
      return {
        ok: true,
        campaign: { ...rest, status: "PENDING_APPROVAL" },
        historyAction: "SUBMITTED",
      };
    }

    case "APPROVE":
      return {
        ok: true,
        campaign: { ...campaign, status: "APPROVED" },
        historyAction: "APPROVED",
      };

    case "REJECT": {
      if (!action.comment.trim()) {
        return {
          ok: false,
          error: new ValidationError("A comment is required to reject a campaign"),
        };
      }
      return {
        ok: true,
        campaign: {
          ...campaign,
          status: "REJECTED",
          currentApprovalComment: action.comment.trim(),
        },
        historyAction: "REJECTED",
      };
    }
  }
}

function checkRole(
  campaign: Campaign,
  action: CampaignAction,
  actor: AuthenticatedUser,
): ForbiddenActionError | null {
  if (action.type === "SUBMIT") {
    const allowed =
      actor.role === "COMMERCIAL_ANALYST" && actor.uid === campaign.createdBy;
    return allowed ? null : new ForbiddenActionError(action.type, actor.role);
  }

  // APPROVE / REJECT
  const allowed = actor.role === "APPROVER_MANAGER";
  return allowed ? null : new ForbiddenActionError(action.type, actor.role);
}
