import type { AuthenticatedUser, NewCampaignInput } from "@farmatodo-retail-media/types";
import { ForbiddenActionError } from "../../domain/errors";
import { InMemoryCampaignRepository } from "../testing/in-memory-campaign-repository";
import { InMemoryMediaCostRepository } from "../testing/in-memory-media-cost-repository";
import { CreateCampaignUseCase } from "./create-campaign.use-case";

const analyst: AuthenticatedUser = {
  uid: "analyst-1",
  email: "analyst@farmatodo.com",
  role: "COMMERCIAL_ANALYST",
};
const manager: AuthenticatedUser = {
  uid: "manager-1",
  email: "manager@farmatodo.com",
  role: "APPROVER_MANAGER",
};

const petaloInput: NewCampaignInput = {
  name: "Lanzamiento vitaminas",
  brandIds: ["brand-1"],
  productSkus: ["sku-1"],
  supplierId: "supplier-1",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  channel: "PETALO",
  stores: ["store-1", "store-2"],
  quantity: 4,
  zone: "ENTRADA",
};

function makeUseCase() {
  const campaignRepository = new InMemoryCampaignRepository();
  const mediaCostRepository = new InMemoryMediaCostRepository([
    { id: "mc-1", supplierId: "supplier-1", channel: "PETALO", unitCostUsd: 50 },
  ]);
  return { useCase: new CreateCampaignUseCase(campaignRepository, mediaCostRepository), campaignRepository };
}

describe("CreateCampaignUseCase", () => {
  it("creates a DRAFT campaign with the total cost computed from the media cost catalog", async () => {
    const { useCase } = makeUseCase();
    const campaign = await useCase.execute({ data: petaloInput, actor: analyst });

    expect(campaign.status).toBe("DRAFT");
    expect(campaign.createdBy).toBe(analyst.uid);
    expect(campaign.totalCostUsd).toBe(200); // 50 * 4
  });

  it("rejects creation by a manager", async () => {
    const { useCase } = makeUseCase();
    await expect(useCase.execute({ data: petaloInput, actor: manager })).rejects.toBeInstanceOf(
      ForbiddenActionError,
    );
  });
});
