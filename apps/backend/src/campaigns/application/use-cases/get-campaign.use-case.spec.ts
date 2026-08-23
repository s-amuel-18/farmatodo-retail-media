import type { AuthenticatedUser, NewCampaignInput } from "@farmatodo-retail-media/types";
import { CampaignNotFoundError, ForbiddenActionError } from "../../domain/errors";
import { InMemoryCampaignRepository } from "../testing/in-memory-campaign-repository";
import { InMemoryMediaCostRepository } from "../testing/in-memory-media-cost-repository";
import { CreateCampaignUseCase } from "./create-campaign.use-case";
import { GetCampaignUseCase } from "./get-campaign.use-case";

const owner: AuthenticatedUser = { uid: "analyst-a", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
const otherAnalyst: AuthenticatedUser = { uid: "analyst-b", email: "b@x.com", role: "COMMERCIAL_ANALYST" };
const manager: AuthenticatedUser = { uid: "manager-1", email: "m@x.com", role: "APPROVER_MANAGER" };

const input: NewCampaignInput = {
  name: "Campaña",
  brandIds: ["brand-1"],
  productSkus: ["sku-1"],
  supplierId: "supplier-1",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  channel: "TIKTOK",
  adAccount: "acc-1",
  objective: "REACH",
  creatives: ["c-1"],
  dailyBudgetUsd: 20,
};

async function setup() {
  const campaignRepository = new InMemoryCampaignRepository();
  const mediaCostRepository = new InMemoryMediaCostRepository([
    { id: "mc-1", supplierId: "supplier-1", channel: "TIKTOK", unitCostUsd: 15 },
  ]);
  const created = await new CreateCampaignUseCase(campaignRepository, mediaCostRepository).execute({
    data: input,
    actor: owner,
  });
  return { useCase: new GetCampaignUseCase(campaignRepository), created };
}

describe("GetCampaignUseCase", () => {
  it("lets the owner analyst view their own campaign, with its (empty) history", async () => {
    const { useCase, created } = await setup();
    const result = await useCase.execute({ campaignId: created.id, actor: owner });
    expect(result.campaign.id).toBe(created.id);
    expect(result.history).toEqual([]);
  });

  it("lets a manager view any campaign", async () => {
    const { useCase, created } = await setup();
    const result = await useCase.execute({ campaignId: created.id, actor: manager });
    expect(result.campaign.id).toBe(created.id);
  });

  it("forbids a different analyst from viewing someone else's campaign by guessing its id", async () => {
    const { useCase, created } = await setup();
    await expect(
      useCase.execute({ campaignId: created.id, actor: otherAnalyst }),
    ).rejects.toBeInstanceOf(ForbiddenActionError);
  });

  it("throws CampaignNotFoundError for an unknown id", async () => {
    const { useCase } = await setup();
    await expect(
      useCase.execute({ campaignId: "missing", actor: manager }),
    ).rejects.toBeInstanceOf(CampaignNotFoundError);
  });
});
