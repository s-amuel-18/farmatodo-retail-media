import type { AuthenticatedUser, NewCampaignInput } from "@farmatodo-retail-media/types";
import { ForbiddenActionError } from "../../domain/errors";
import { InMemoryCampaignRepository } from "../testing/in-memory-campaign-repository";
import { InMemoryMediaCostRepository } from "../testing/in-memory-media-cost-repository";
import { CreateCampaignUseCase } from "./create-campaign.use-case";
import { SubmitCampaignUseCase } from "./submit-campaign.use-case";
import { ApproveCampaignUseCase } from "./approve-campaign.use-case";
import { RejectCampaignUseCase } from "./reject-campaign.use-case";

const analyst: AuthenticatedUser = { uid: "analyst-1", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
const manager: AuthenticatedUser = { uid: "manager-1", email: "m@x.com", role: "APPROVER_MANAGER" };

const tiktokInput: NewCampaignInput = {
  name: "Pauta TikTok lanzamiento",
  brandIds: ["brand-1"],
  productSkus: ["sku-1"],
  supplierId: "supplier-1",
  startDate: "2026-09-01",
  endDate: "2026-09-15",
  channel: "TIKTOK",
  adAccount: "ftd-ads-1",
  objective: "TRAFFIC",
  creatives: ["creative-1"],
  dailyBudgetUsd: 80,
};

async function setup() {
  const campaignRepository = new InMemoryCampaignRepository();
  const mediaCostRepository = new InMemoryMediaCostRepository([
    { id: "mc-1", supplierId: "supplier-1", channel: "TIKTOK", unitCostUsd: 500 },
  ]);
  const created = await new CreateCampaignUseCase(campaignRepository, mediaCostRepository).execute({
    data: tiktokInput,
    actor: analyst,
  });
  return {
    campaignRepository,
    created,
    submit: new SubmitCampaignUseCase(campaignRepository),
    approve: new ApproveCampaignUseCase(campaignRepository),
    reject: new RejectCampaignUseCase(campaignRepository),
  };
}

describe("campaign transition use cases (through the repository port)", () => {
  it("runs the full DRAFT -> PENDING_APPROVAL -> APPROVED happy path and records history", async () => {
    const { submit, approve, created, campaignRepository } = await setup();

    await submit.execute({ campaignId: created.id, actor: analyst });
    const approved = await approve.execute({ campaignId: created.id, actor: manager });

    expect(approved.status).toBe("APPROVED");
    expect(campaignRepository.history.map((h) => h.action)).toEqual(["SUBMITTED", "APPROVED"]);
  });

  it("rejects with a comment and allows resubmission afterwards", async () => {
    const { submit, reject, created, campaignRepository } = await setup();

    await submit.execute({ campaignId: created.id, actor: analyst });
    const rejected = await reject.execute({
      campaignId: created.id,
      comment: "Presupuesto muy alto para esta marca",
      actor: manager,
    });
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.currentApprovalComment).toBe("Presupuesto muy alto para esta marca");

    const resubmitted = await submit.execute({ campaignId: created.id, actor: analyst });
    expect(resubmitted.status).toBe("PENDING_APPROVAL");
    expect(campaignRepository.history.map((h) => h.action)).toEqual([
      "SUBMITTED",
      "REJECTED",
      "SUBMITTED",
    ]);
  });

  it("cannot be approved by calling the API as an analyst, even directly against the use case", async () => {
    const { submit, approve, created } = await setup();
    await submit.execute({ campaignId: created.id, actor: analyst });

    await expect(approve.execute({ campaignId: created.id, actor: analyst })).rejects.toBeInstanceOf(
      ForbiddenActionError,
    );
  });
});
