import type { AuthenticatedUser, Campaign } from "@farmatodo-retail-media/types";
import { EDITABLE_CAMPAIGN_STATUSES } from "@farmatodo-retail-media/types";
import { ForbiddenActionError, InvalidTransitionError } from "./errors";

/**
 * "El analista puede editarlas libremente [...] en DRAFT" (or REJECTED, to fix
 * and resubmit). Throws instead of returning a Result because this always
 * guards an early-return in a use case — there is nothing useful to do with
 * a "not editable" value other than abort.
 */
export function assertEditable(campaign: Campaign, actor: AuthenticatedUser): void {
  if (actor.role !== "COMMERCIAL_ANALYST" || actor.uid !== campaign.createdBy) {
    throw new ForbiddenActionError("EDIT", actor.role);
  }
  if (!EDITABLE_CAMPAIGN_STATUSES.includes(campaign.status)) {
    throw new InvalidTransitionError(campaign.status, "EDIT");
  }
}
