export type Role = "COMMERCIAL_ANALYST" | "APPROVER_MANAGER";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role | null;
}

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: Role;
}
