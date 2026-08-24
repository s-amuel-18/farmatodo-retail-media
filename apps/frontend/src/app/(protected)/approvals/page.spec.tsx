import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PetaloCampaign } from "@farmatodo-retail-media/types";
import ApprovalsQueuePage from "./page";
import { useApprovalsQueue } from "../../../view-models/approvals/useApprovalsQueue";

jest.mock("../../../view-models/approvals/useApprovalsQueue", () => ({
  useApprovalsQueue: jest.fn(),
}));

function makeCampaign(overrides: Partial<PetaloCampaign> = {}): PetaloCampaign {
  return {
    id: "camp-1",
    name: "Campaña Uno",
    brandIds: [],
    productSkus: [],
    supplierId: "sup-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "user-1",
    status: "PENDING_APPROVAL",
    totalCostUsd: 10,
    channel: "PETALO",
    stores: ["Store 1"],
    quantity: 1,
    zone: "ENTRADA",
    ...overrides,
  };
}

describe("ApprovalsQueuePage", () => {
  it("passes the hook's data and decision actions through to ApprovalsQueueView", async () => {
    const user = userEvent.setup();
    const approve = jest.fn().mockResolvedValue(undefined);
    (useApprovalsQueue as jest.Mock).mockReturnValue({
      campaigns: [makeCampaign({ id: "camp-5", name: "Campaña Cinco" })],
      isLoading: false,
      error: null,
      filters: { status: ["PENDING_APPROVAL"], dateFrom: "", dateTo: "" },
      setFilters: jest.fn(),
      pagination: { hasNextPage: false, hasPrevPage: false, onNext: jest.fn(), onPrev: jest.fn() },
      actions: { approve, reject: jest.fn(), pendingCampaignId: null },
      decision: { isPending: false, error: null },
      statusMessage: null,
    });

    render(<ApprovalsQueuePage />);

    expect(screen.getByRole("link", { name: "Campaña Cinco" })).toHaveAttribute("href", "/approvals/camp-5");

    await user.click(screen.getByRole("button", { name: "Aprobar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar aprobación" }));
    expect(approve).toHaveBeenCalledWith("camp-5");
  });

  it("surfaces the decision error from the hook", () => {
    (useApprovalsQueue as jest.Mock).mockReturnValue({
      campaigns: [],
      isLoading: false,
      error: null,
      filters: { status: [], dateFrom: "", dateTo: "" },
      setFilters: jest.fn(),
      pagination: { hasNextPage: false, hasPrevPage: false, onNext: jest.fn(), onPrev: jest.fn() },
      actions: { approve: jest.fn(), reject: jest.fn(), pendingCampaignId: null },
      decision: { isPending: false, error: "No se pudo procesar la decisión" },
      statusMessage: null,
    });

    render(<ApprovalsQueuePage />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo procesar la decisión");
  });
});
