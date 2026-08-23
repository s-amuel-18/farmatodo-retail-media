import type { MediaCost } from "@farmatodo-retail-media/types";

export const MEDIA_COST_REPOSITORY = Symbol("MEDIA_COST_REPOSITORY");

export interface MediaCostRepository {
  listAll(): Promise<MediaCost[]>;
}
