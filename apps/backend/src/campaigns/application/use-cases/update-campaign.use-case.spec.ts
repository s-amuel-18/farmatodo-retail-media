import type { AuthenticatedUser, NewCampaignInput } from "@farmatodo-retail-media/types";
import { CampaignNotFoundError, ForbiddenActionError, InvalidTransitionError } from "../../domain/errors";
import { InMemoryCampaignRepository } from "../testing/in-memory-campaign-repository";
import { InMemoryMediaCostRepository } from "../testing/in-memory-media-cost-repository";
import { CreateCampaignUseCase } from "./create-campaign.use-case";
import { UpdateCampaignUseCase } from "./update-campaign.use-case";

const owner: AuthenticatedUser = { uid: "analyst-1", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
const otherAnalyst: AuthenticatedUser = { uid: "analyst-2", email: "b@x.com", role: "COMMERCIAL_ANALYST" };
const manager: AuthenticatedUser = { uid: "manager-1", email: "m@x.com", role: "APPROVER_MANAGER" };

const baseInput: NewCampaignInput = {
  name: "Campaña SMS",
  brandIds: ["brand-1"],
  productSkus: ["sku-1"],
  supplierId: "supplier-1",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  campaignDate: "2026-08-20",
  channel: "SMS",
  segment: "clientes-frecuentes",
  estimatedAudience: 10000,
  template: "Promo",
  sendWindow: { from: "08:00", to: "10:00" },
};

async function setup() {
  const campaignRepository = new InMemoryCampaignRepository();
  const mediaCostRepository = new InMemoryMediaCostRepository([
    { id: "mc-1", supplierId: "supplier-1", channel: "SMS", unitCostUsd: 300 },
  ]);
  const created = await new CreateCampaignUseCase(campaignRepository, mediaCostRepository).execute({
    data: baseInput,
    actor: owner,
  });
  const useCase = new UpdateCampaignUseCase(campaignRepository, mediaCostRepository);
  return { useCase, campaignRepository, created };
}

describe("UpdateCampaignUseCase", () => {
  it("lets the owner edit a DRAFT campaign and recompute its cost", async () => {
    const { useCase, created } = await setup();
    const updated = await useCase.execute({
      campaignId: created.id,
      data: { ...baseInput, name: "Campaña SMS (v2)" },
      actor: owner,
    });
    expect(updated.name).toBe("Campaña SMS (v2)");
    expect(updated.totalCostUsd).toBe(300);
  });

  it("forbids a different analyst from editing someone else's campaign", async () => {
    const { useCase, created } = await setup();
    await expect(
      useCase.execute({ campaignId: created.id, data: baseInput, actor: otherAnalyst }),
    ).rejects.toBeInstanceOf(ForbiddenActionError);
  });

  it("forbids a manager from editing", async () => {
    const { useCase, created } = await setup();
    await expect(
      useCase.execute({ campaignId: created.id, data: baseInput, actor: manager }),
    ).rejects.toBeInstanceOf(ForbiddenActionError);
  });

  it("rejects editing once the campaign is no longer DRAFT/REJECTED", async () => {
    const { useCase, campaignRepository, created } = await setup();
    campaignRepository.campaigns.set(created.id, { ...created, status: "PENDING_APPROVAL" });

    await expect(
      useCase.execute({ campaignId: created.id, data: baseInput, actor: owner }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it("throws CampaignNotFoundError for an unknown id", async () => {
    const { useCase } = await setup();
    await expect(
      useCase.execute({ campaignId: "does-not-exist", data: baseInput, actor: owner }),
    ).rejects.toBeInstanceOf(CampaignNotFoundError);
  });
});
