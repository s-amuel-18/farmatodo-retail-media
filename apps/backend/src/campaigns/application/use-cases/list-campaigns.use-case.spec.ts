import type { AuthenticatedUser, NewCampaignInput } from "@farmatodo-retail-media/types";
import { InMemoryCampaignRepository } from "../testing/in-memory-campaign-repository";
import { InMemoryMediaCostRepository } from "../testing/in-memory-media-cost-repository";
import { CreateCampaignUseCase } from "./create-campaign.use-case";
import { ListCampaignsUseCase } from "./list-campaigns.use-case";

const analystA: AuthenticatedUser = { uid: "analyst-a", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
const analystB: AuthenticatedUser = { uid: "analyst-b", email: "b@x.com", role: "COMMERCIAL_ANALYST" };
const manager: AuthenticatedUser = { uid: "manager-1", email: "m@x.com", role: "APPROVER_MANAGER" };

const input: NewCampaignInput = {
  name: "Campaña",
  brandIds: ["brand-1"],
  productSkus: ["sku-1"],
  supplierId: "supplier-1",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  campaignDate: "2026-08-20",
  channel: "SMS",
  segment: "seg",
  estimatedAudience: 1000,
  template: "hola",
  sendWindow: { from: "08:00", to: "09:00" },
};

async function setup() {
  const campaignRepository = new InMemoryCampaignRepository();
  const mediaCostRepository = new InMemoryMediaCostRepository([
    { id: "mc-1", supplierId: "supplier-1", channel: "SMS", unitCostUsd: 10 },
  ]);
  const createUseCase = new CreateCampaignUseCase(campaignRepository, mediaCostRepository);
  await createUseCase.execute({ data: input, actor: analystA });
  await createUseCase.execute({ data: input, actor: analystB });
  return { listUseCase: new ListCampaignsUseCase(campaignRepository) };
}

describe("ListCampaignsUseCase", () => {
  it("forces createdBy to the caller's own uid for an analyst, even if a different value is requested", async () => {
    const { listUseCase } = await setup();
    const result = await listUseCase.execute({
      filters: { createdBy: "analyst-b" }, // attempting to read someone else's campaigns
      actor: analystA,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.createdBy).toBe("analyst-a");
  });

  it("lets a manager see campaigns from every analyst", async () => {
    const { listUseCase } = await setup();
    const result = await listUseCase.execute({ filters: {}, actor: manager });
    expect(result.items).toHaveLength(2);
  });
});
