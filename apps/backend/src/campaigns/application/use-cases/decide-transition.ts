import type { AuthenticatedUser } from "@farmatodo-retail-media/types";
import { transition, type CampaignAction } from "../../domain/campaign-state-machine";
import type { Decide } from "../ports/campaign-repository.port";

/**
 * Shared by every transition use case (submit/approve/reject): wraps the pure
 * `transition()` call into the `Decide` shape the repository port expects —
 * new state + history entry on success, or a thrown DomainError on failure.
 */
export function decideTransition(action: CampaignAction, actor: AuthenticatedUser): Decide {
  return (current) => {
    const result = transition(current, action, actor);
    if (!result.ok) throw result.error;

    return {
      campaign: result.campaign,
      historyEntry: {
        campaignId: current.id,
        action: result.historyAction,
        actorUid: actor.uid,
        actorRole: actor.role,
        occurredAt: new Date().toISOString(),
        ...(action.type === "REJECT" ? { comment: action.comment.trim() } : {}),
      },
    };
  };
}
