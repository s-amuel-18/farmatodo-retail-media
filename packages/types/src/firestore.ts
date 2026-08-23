/**
 * Firestore collection/subcollection names, read by the backend (admin SDK,
 * seed script) and the frontend (client SDK, for reference-data reads that
 * bypass the API). Centralized so a rename can't silently diverge between
 * the two.
 */
export const FIRESTORE_COLLECTIONS = {
  campaigns: "campaigns",
  brands: "brands",
  products: "products",
  suppliers: "suppliers",
  mediaCosts: "mediaCosts",
} as const;

/** Subcollection of `campaigns/{id}` holding the append-only history log. */
export const CAMPAIGN_HISTORY_SUBCOLLECTION = "history";
