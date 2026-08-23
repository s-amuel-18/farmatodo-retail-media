/**
 * Plain `Omit` collapses a discriminated union into its shared fields only
 * (keyof a union is the intersection of each member's keys). This distributes
 * the Omit over each member instead, so channel-specific fields survive.
 */
export type DistributiveOmit<T, K extends keyof any> = T extends unknown
  ? Omit<T, K>
  : never;
