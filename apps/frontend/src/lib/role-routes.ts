import type { Role } from "@farmatodo-retail-media/types";

/**
 * Landing route for each role once authenticated. Single source of truth for
 * both the root redirect (page.tsx) and the post-login redirect (use-login.ts).
 */
export const ROLE_HOME_ROUTE: Record<Role, string> = {
  COMMERCIAL_ANALYST: "/campaigns",
  APPROVER_MANAGER: "/approvals",
};
