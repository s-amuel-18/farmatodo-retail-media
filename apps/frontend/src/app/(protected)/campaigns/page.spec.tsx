import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PetaloCampaign } from "@farmatodo-retail-media/types";
import CampaignsInboxPage from "./page";
import { useCampaignsInbox } from "../../../view-models/campaigns/useCampaignsInbox";

jest.mock("../../../view-models/campaigns/useCampaignsInbox", () => ({
  useCampaignsInbox: jest.fn(),
}));

function makeCampaign(overrides: Partial<PetaloCampaign> = {}): PetaloCampaign {
  return {
    id: "camp-1",
    name: "Campaña Uno",
    brandIds: [],
    productSkus: [],
    supplierId: "supplier-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    campaignDate: "2026-01-01",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    createdBy: "user-1",
    status: "DRAFT",
    totalCostUsd: 10,
    channel: "PETALO",
    stores: ["Store 1"],
    quantity: 1,
    zone: "ENTRADA",
    ...overrides,
  };
}

describe("CampaignsInboxPage", () => {
  it("passes the hook's data and callbacks through to CampaignsInboxView", async () => {
    const user = userEvent.setup();
    const submit = jest.fn().mockResolvedValue(undefined);
    const setFilters = jest.fn();
    (useCampaignsInbox as jest.Mock).mockReturnValue({
      campaigns: [makeCampaign({ id: "camp-9", name: "Campaña Nueve", status: "DRAFT" })],
      isLoading: false,
      error: null,
      filters: { status: [], dateFrom: "", dateTo: "" },
      setFilters,
      pagination: { hasNextPage: false, hasPrevPage: false, onNext: jest.fn(), onPrev: jest.fn() },
      actions: { submit, isSubmitting: false, pendingCampaignId: null },
      submitError: null,
      statusMessage: null,
    });

    render(<CampaignsInboxPage />);

    expect(screen.getByRole("link", { name: "Campaña Nueve" })).toHaveAttribute("href", "/campaigns/camp-9");

    await user.click(screen.getByRole("button", { name: "Enviar a aprobación" }));
    expect(submit).toHaveBeenCalledWith("camp-9");
  });
});
