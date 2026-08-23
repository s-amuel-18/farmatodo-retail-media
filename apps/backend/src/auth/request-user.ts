import type { Role } from "@farmatodo-retail-media/types";

/**
 * Shape attached to the request right after token verification, before role
 * membership is known to be sufficient for the route. RolesGuard narrows this
 * into a full AuthenticatedUser once it confirms `role` is present and allowed.
 */
export interface RequestUser {
  uid: string;
  email: string;
  role: Role | undefined;
}
