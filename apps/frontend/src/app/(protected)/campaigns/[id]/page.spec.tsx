import { render, screen } from "@testing-library/react";
import type { PetaloCampaign } from "@farmatodo-retail-media/types";
import CampaignDetailPage from "./page";
import { useCampaign } from "../../../../view-models/campaigns/useCampaign";
import { useReferenceData } from "../../../../view-models/campaigns/useReferenceData";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "camp-1" }),
}));

jest.mock("../../../../view-models/campaigns/useCampaign", () => ({
  useCampaign: jest.fn(),
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

describe("CampaignDetailPage", () => {
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
    render(<CampaignDetailPage />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("shows the error message when the campaign fails to load", () => {
    (useCampaign as jest.Mock).mockReturnValue({
      campaign: null,
      history: [],
      isLoading: false,
      error: "No se pudo cargar",
    });
    render(<CampaignDetailPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar");
  });

  it("shows a not-found message when there is no campaign and no error", () => {
    (useCampaign as jest.Mock).mockReturnValue({ campaign: null, history: [], isLoading: false, error: null });
    render(<CampaignDetailPage />);
    expect(screen.getByText("No se encontró la campaña.")).toBeInTheDocument();
  });

  it("resolves supplier and brand labels from reference data and renders the detail view", () => {
    (useCampaign as jest.Mock).mockReturnValue({
      campaign: makeCampaign(),
      history: [],
      isLoading: false,
      error: null,
    });

    render(<CampaignDetailPage />);

    expect(screen.getByRole("heading", { name: "Campaña Uno" })).toBeInTheDocument();
    expect(screen.getByText("Proveedor Uno")).toBeInTheDocument();
    expect(screen.getByText("Marca Uno")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver/ })).toHaveAttribute("href", "/campaigns");
    // Analyst-facing detail view: no approver decision controls.
    expect(screen.queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument();
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

    render(<CampaignDetailPage />);

    expect(screen.getByText("unknown-supplier")).toBeInTheDocument();
    expect(screen.getByText("unknown-brand")).toBeInTheDocument();
  });
});
