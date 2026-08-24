import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PetaloCampaign } from "@farmatodo-retail-media/types";
import ApprovalDetailPage from "./page";
import { useCampaign } from "../../../../view-models/campaigns/useCampaign";
import { useApprovalDecision } from "../../../../view-models/approvals/useApprovalDecision";
import { useReferenceData } from "../../../../view-models/campaigns/useReferenceData";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "camp-1" }),
}));

jest.mock("../../../../view-models/campaigns/useCampaign", () => ({
  useCampaign: jest.fn(),
}));

jest.mock("../../../../view-models/approvals/useApprovalDecision", () => ({
  useApprovalDecision: jest.fn(),
}));

jest.mock("../../../../view-models/campaigns/useReferenceData", () => ({
  useReferenceData: jest.fn(),
}));

function makeCampaign(overrides: Partial<PetaloCampaign> = {}): PetaloCampaign {
  return {
    id: "camp-1",
    name: "Campaña Uno",
    brandIds: ["brand-1"],
    productSkus: ["sku-1"],
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

describe("ApprovalDetailPage", () => {
  beforeEach(() => {
    (useReferenceData as jest.Mock).mockReturnValue({
      brands: [{ id: "brand-1", name: "Marca Uno" }],
      products: [],
      suppliers: [{ id: "sup-1", name: "Proveedor Uno" }],
      mediaCosts: [],
      isLoading: false,
    });
  });

  it("shows the loading state while the campaign is loading", () => {
    (useCampaign as jest.Mock).mockReturnValue({ campaign: null, history: [], isLoading: true, error: null });
    (useApprovalDecision as jest.Mock).mockReturnValue({
      onApprove: jest.fn(),
      onReject: jest.fn(),
      isDeciding: false,
      decisionError: null,
      statusMessage: null,
    });

    render(<ApprovalDetailPage />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("shows the error message when the campaign fails to load", () => {
    (useCampaign as jest.Mock).mockReturnValue({
      campaign: null,
      history: [],
      isLoading: false,
      error: "No se pudo cargar",
    });
    (useApprovalDecision as jest.Mock).mockReturnValue({
      onApprove: jest.fn(),
      onReject: jest.fn(),
      isDeciding: false,
      decisionError: null,
      statusMessage: null,
    });

    render(<ApprovalDetailPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar");
  });

  it("shows a not-found message when there is no campaign", () => {
    (useCampaign as jest.Mock).mockReturnValue({ campaign: null, history: [], isLoading: false, error: null });
    (useApprovalDecision as jest.Mock).mockReturnValue({
      onApprove: jest.fn(),
      onReject: jest.fn(),
      isDeciding: false,
      decisionError: null,
      statusMessage: null,
    });

    render(<ApprovalDetailPage />);
    expect(screen.getByText("No se encontró la campaña.")).toBeInTheDocument();
  });

  it("wires approver decision actions into CampaignDetailView", async () => {
    const user = userEvent.setup();
    const onApprove = jest.fn().mockResolvedValue(undefined);
    (useCampaign as jest.Mock).mockReturnValue({
      campaign: makeCampaign(),
      history: [],
      isLoading: false,
      error: null,
    });
    (useApprovalDecision as jest.Mock).mockReturnValue({
      onApprove,
      onReject: jest.fn(),
      isDeciding: false,
      decisionError: "Error previo",
      statusMessage: "Campaña aprobada.",
    });

    render(<ApprovalDetailPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Error previo");
    expect(screen.getByText("Campaña aprobada.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver/ })).toHaveAttribute("href", "/approvals");

    await user.click(screen.getByRole("button", { name: "Aprobar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar aprobación" }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it("falls back to the raw id when the supplier or brand isn't found in reference data", () => {
    (useReferenceData as jest.Mock).mockReturnValue({
      brands: [],
      products: [],
      suppliers: [],
      mediaCosts: [],
      isLoading: false,
    });
    (useCampaign as jest.Mock).mockReturnValue({
      campaign: makeCampaign({ supplierId: "unknown-supplier", brandIds: ["unknown-brand"] }),
      history: [],
      isLoading: false,
      error: null,
    });
    (useApprovalDecision as jest.Mock).mockReturnValue({
      onApprove: jest.fn(),
      onReject: jest.fn(),
      isDeciding: false,
      decisionError: null,
      statusMessage: null,
    });

    render(<ApprovalDetailPage />);

    expect(screen.getByText("unknown-supplier")).toBeInTheDocument();
    expect(screen.getByText("unknown-brand")).toBeInTheDocument();
  });
});
