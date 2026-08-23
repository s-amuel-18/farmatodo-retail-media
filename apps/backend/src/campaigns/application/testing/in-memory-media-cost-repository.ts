import type { MediaCost } from "@farmatodo-retail-media/types";
import type { MediaCostRepository } from "../ports/media-cost-repository.port";

export class InMemoryMediaCostRepository implements MediaCostRepository {
  constructor(private readonly costs: MediaCost[] = []) {}

  async listAll(): Promise<MediaCost[]> {
    return this.costs;
  }
}
