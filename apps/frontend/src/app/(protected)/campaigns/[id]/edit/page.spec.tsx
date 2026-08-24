import { render, screen } from "@testing-library/react";
import type { PetaloCampaign } from "@farmatodo-retail-media/types";
import EditCampaignPage from "./page";
import { useCampaign } from "../../../../../view-models/campaigns/useCampaign";
import { useCampaignForm } from "../../../../../view-models/campaigns/useCampaignForm";
import { useReferenceData } from "../../../../../view-models/campaigns/useReferenceData";
import type { CampaignFormValues } from "../../../../../view-models/campaigns/useCampaignForm";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "camp-1" }),
}));

jest.mock("../../../../../view-models/campaigns/useCampaign", () => ({
  useCampaign: jest.fn(),
}));

jest.mock("../../../../../view-models/campaigns/useCampaignForm", () => ({
  useCampaignForm: jest.fn(),
}));

jest.mock("../../../../../view-models/campaigns/useReferenceData", () => ({
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
    status: "DRAFT",
    totalCostUsd: 10,
    channel: "PETALO",
    stores: ["Store 1"],
    quantity: 1,
    zone: "ENTRADA",
    ...overrides,
  };
}

const FORM_VALUES: CampaignFormValues = {
  name: "Campaña Uno",
  brandIds: ["brand-1"],
  productSkus: ["sku-1"],
  supplierId: "sup-1",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  channel: "PETALO",
  stores: "Store 1",
  quantity: 1,
  zone: "ENTRADA",
  levels: 1,
  category: "",
  segment: "",
  estimatedAudience: 0,
  template: "",
  sendWindowFrom: "",
  sendWindowTo: "",
  adAccount: "",
  objective: "",
  creatives: "",
  dailyBudgetUsd: 0,
};

describe("EditCampaignPage", () => {
  beforeEach(() => {
    (useReferenceData as jest.Mock).mockReturnValue({
      brands: [],
      products: [],
      suppliers: [],
      mediaCosts: [],
      isLoading: false,
    });
    (useCampaignForm as jest.Mock).mockReturnValue({
      register: jest.fn((name: string) => ({ name })),
      errors: {},
      onSubmit: jest.fn(),
      values: FORM_VALUES,
      filteredProducts: [],
      onBrandsChange: jest.fn(),
      onProductsChange: jest.fn(),
      estimatedCost: null,
      isSubmitting: false,
      fieldErrors: {},
      error: null,
    });
  });

  it("shows the loading state while the campaign is loading", () => {
    (useCampaign as jest.Mock).mockReturnValue({ campaign: null, history: [], isLoading: true, error: null });
    render(<EditCampaignPage />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("shows a not-found message when there is no campaign", () => {
    (useCampaign as jest.Mock).mockReturnValue({ campaign: null, history: [], isLoading: false, error: null });
    render(<EditCampaignPage />);
    expect(screen.getByText("No se encontró la campaña.")).toBeInTheDocument();
  });

  it("renders CampaignFormView in edit mode with the channel select disabled", () => {
    (useCampaign as jest.Mock).mockReturnValue({
      campaign: makeCampaign(),
      history: [],
      isLoading: false,
      error: null,
    });

    render(<EditCampaignPage />);

    expect(screen.getByRole("heading", { name: "Editar campaña" })).toBeInTheDocument();
    expect(screen.getByLabelText("Medio de exhibición")).toBeDisabled();
  });
});
