import type { AuthenticatedUser, NewCampaignInput } from "@farmatodo-retail-media/types";
import { CampaignsController } from "./campaigns.controller";

const actor: AuthenticatedUser = { uid: "u1", email: "a@x.com", role: "COMMERCIAL_ANALYST" };

const petaloInput: NewCampaignInput = {
  name: "Campaña",
  brandIds: ["brand-1"],
  productSkus: ["sku-1"],
  supplierId: "supplier-1",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  channel: "PETALO",
  stores: ["store-1"],
  quantity: 1,
  zone: "ENTRADA",
};

function makeController() {
  const createCampaign = { execute: jest.fn().mockResolvedValue("created") };
  const updateCampaign = { execute: jest.fn().mockResolvedValue("updated") };
  const getCampaign = { execute: jest.fn().mockResolvedValue("fetched") };
  const listCampaigns = { execute: jest.fn().mockResolvedValue("listed") };
  const submitCampaign = { execute: jest.fn().mockResolvedValue("submitted") };
  const approveCampaign = { execute: jest.fn().mockResolvedValue("approved") };
  const rejectCampaign = { execute: jest.fn().mockResolvedValue("rejected") };

  const controller = new CampaignsController(
    createCampaign as never,
    updateCampaign as never,
    getCampaign as never,
    listCampaigns as never,
    submitCampaign as never,
    approveCampaign as never,
    rejectCampaign as never,
  );

  return {
    controller,
    createCampaign,
    updateCampaign,
    getCampaign,
    listCampaigns,
    submitCampaign,
    approveCampaign,
    rejectCampaign,
  };
}

describe("CampaignsController (routing/wiring)", () => {
  it("create() forwards the body and actor to CreateCampaignUseCase", async () => {
    const { controller, createCampaign } = makeController();
    await expect(controller.create(petaloInput, actor)).resolves.toBe("created");
    expect(createCampaign.execute).toHaveBeenCalledWith({ data: petaloInput, actor });
  });

  it("update() forwards the campaign id, body and actor to UpdateCampaignUseCase", async () => {
    const { controller, updateCampaign } = makeController();
    await expect(controller.update("campaign-1", petaloInput, actor)).resolves.toBe("updated");
    expect(updateCampaign.execute).toHaveBeenCalledWith({
      campaignId: "campaign-1",
      data: petaloInput,
      actor,
    });
  });

  it("list() parses the raw query into filters before calling ListCampaignsUseCase", async () => {
    const { controller, listCampaigns } = makeController();
    await expect(
      controller.list({ status: "DRAFT,REJECTED", pageSize: "10" }, actor),
    ).resolves.toBe("listed");
    expect(listCampaigns.execute).toHaveBeenCalledWith({
      filters: { status: ["DRAFT", "REJECTED"], pageSize: 10 },
      actor,
    });
  });

  it("get() forwards the campaign id and actor to GetCampaignUseCase", async () => {
    const { controller, getCampaign } = makeController();
    await expect(controller.get("campaign-1", actor)).resolves.toBe("fetched");
    expect(getCampaign.execute).toHaveBeenCalledWith({ campaignId: "campaign-1", actor });
  });

  it("submit() forwards the campaign id and actor to SubmitCampaignUseCase", async () => {
    const { controller, submitCampaign } = makeController();
    await expect(controller.submit("campaign-1", actor)).resolves.toBe("submitted");
    expect(submitCampaign.execute).toHaveBeenCalledWith({ campaignId: "campaign-1", actor });
  });

  it("approve() forwards the campaign id and actor to ApproveCampaignUseCase", async () => {
    const { controller, approveCampaign } = makeController();
    await expect(controller.approve("campaign-1", actor)).resolves.toBe("approved");
    expect(approveCampaign.execute).toHaveBeenCalledWith({ campaignId: "campaign-1", actor });
  });

  it("reject() forwards the campaign id, comment and actor to RejectCampaignUseCase", async () => {
    const { controller, rejectCampaign } = makeController();
    await expect(
      controller.reject("campaign-1", { comment: "Presupuesto excede el límite" }, actor),
    ).resolves.toBe("rejected");
    expect(rejectCampaign.execute).toHaveBeenCalledWith({
      campaignId: "campaign-1",
      comment: "Presupuesto excede el límite",
      actor,
    });
  });
});
