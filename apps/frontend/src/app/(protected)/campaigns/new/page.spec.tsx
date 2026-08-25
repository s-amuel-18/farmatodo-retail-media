import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewCampaignPage from "./page";
import { useCampaignForm } from "../../../../view-models/campaigns/useCampaignForm";
import { useReferenceData } from "../../../../view-models/campaigns/useReferenceData";
import type { CampaignFormValues } from "../../../../view-models/campaigns/useCampaignForm";

jest.mock("../../../../view-models/campaigns/useCampaignForm", () => ({
  useCampaignForm: jest.fn(),
}));

jest.mock("../../../../view-models/campaigns/useReferenceData", () => ({
  useReferenceData: jest.fn(),
}));

const FORM_VALUES: CampaignFormValues = {
  name: "",
  brandIds: [],
  productSkus: [],
  supplierId: "",
  startDate: "",
  endDate: "",
  campaignDate: "",
  channel: "PETALO",
  stores: "",
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

describe("NewCampaignPage", () => {
  it("wires reference data and the form hook into CampaignFormView in create mode", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e?.preventDefault?.());
    const onBrandsChange = jest.fn();

    (useReferenceData as jest.Mock).mockReturnValue({
      brands: [{ id: "brand-1", name: "Marca Uno" }],
      products: [],
      suppliers: [{ id: "sup-1", name: "Proveedor Uno" }],
      mediaCosts: [],
      isLoading: false,
    });

    (useCampaignForm as jest.Mock).mockReturnValue({
      register: jest.fn((name: string) => ({ name })),
      errors: {},
      onSubmit,
      values: FORM_VALUES,
      filteredProducts: [],
      onBrandsChange,
      onProductsChange: jest.fn(),
      estimatedCost: null,
      isEstimatingCost: false,
      availableChannels: ["PETALO", "PARRILLERA", "SMS", "TIKTOK"],
      isSubmitting: false,
      fieldErrors: {},
      error: null,
    });

    render(<NewCampaignPage />);

    expect(screen.getByRole("heading", { name: "Nueva campaña" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Proveedor Uno" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
