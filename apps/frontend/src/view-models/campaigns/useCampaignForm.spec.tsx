jest.mock("../../services/campaigns.service", () => ({
  campaignsService: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createElement, type ReactNode } from "react";
import type {
  Campaign,
  MediaCost,
  ParrilleraCampaign,
  PetaloCampaign,
  Product,
  SmsCampaign,
  TiktokCampaign,
} from "@farmatodo-retail-media/types";
import { campaignsService } from "../../services/campaigns.service";
import { useCampaignForm, type CampaignFormValues } from "./useCampaignForm";
import { CampaignFormView } from "../../views/campaigns/CampaignFormView";

const mockCreate = campaignsService.create as jest.Mock;
const mockUpdate = campaignsService.update as jest.Mock;
const mockPush = jest.fn();
const mockReplace = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: mockReplace });

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { wrapper, invalidateSpy };
}

/** Sets a registered field's value using react-hook-form's own onChange handler. */
async function setField<K extends keyof CampaignFormValues>(
  result: { current: ReturnType<typeof useCampaignForm> },
  name: K,
  value: CampaignFormValues[K],
) {
  await act(async () => {
    await result.current.register(name).onChange({ target: { name, value } });
  });
}

const petaloCampaign: PetaloCampaign = {
  id: "camp-petalo",
  name: "Petalo Launch",
  brandIds: ["b1"],
  productSkus: ["sku-1"],
  supplierId: "s1",
  startDate: "2026-01-01",
  endDate: "2026-02-01",
  createdAt: "2026-01-01T00:00:00Z",
  createdBy: "u1",
  status: "DRAFT",
  totalCostUsd: 100,
  channel: "PETALO",
  stores: ["Store A", "Store B"],
  quantity: 5,
  zone: "CAJAS",
};

const parrilleraCampaign: ParrilleraCampaign = {
  id: "camp-parrillera",
  name: "Parrillera Launch",
  brandIds: ["b2"],
  productSkus: ["sku-2"],
  supplierId: "s2",
  startDate: "2026-02-01",
  endDate: "2026-03-01",
  createdAt: "2026-02-01T00:00:00Z",
  createdBy: "u1",
  status: "DRAFT",
  totalCostUsd: 150,
  channel: "PARRILLERA",
  stores: ["Store C"],
  quantity: 3,
  levels: 2,
  category: "Snacks",
};

const smsCampaign: SmsCampaign = {
  id: "camp-sms",
  name: "SMS Blast",
  brandIds: ["b3"],
  productSkus: ["sku-3"],
  supplierId: "s3",
  startDate: "2026-03-01",
  endDate: "2026-03-15",
  createdAt: "2026-03-01T00:00:00Z",
  createdBy: "u1",
  status: "DRAFT",
  totalCostUsd: 50,
  channel: "SMS",
  segment: "VIP",
  estimatedAudience: 1000,
  template: "tmpl-1",
  sendWindow: { from: "08:00", to: "20:00" },
};

const tiktokCampaign: TiktokCampaign = {
  id: "camp-tiktok",
  name: "TikTok Push",
  brandIds: ["b4"],
  productSkus: ["sku-4"],
  supplierId: "s4",
  startDate: "2026-04-01",
  endDate: "2026-04-30",
  createdAt: "2026-04-01T00:00:00Z",
  createdBy: "u1",
  status: "DRAFT",
  totalCostUsd: 200,
  channel: "TIKTOK",
  adAccount: "acct-1",
  objective: "Awareness",
  creatives: ["video1.mp4", "video2.mp4"],
  dailyBudgetUsd: 25,
};

const products: Product[] = [
  { sku: "sku-a", name: "Product A", brandId: "brand-1" },
  { sku: "sku-b", name: "Product B", brandId: "brand-2" },
  { sku: "sku-c", name: "Product C", brandId: "brand-3" },
];

describe("useCampaignForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("default values", () => {
    it("uses EMPTY_VALUES defaults in create mode with no initial campaign", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useCampaignForm({ target: { mode: "create" }, initialCampaign: null, products: [], mediaCosts: [] }),
        { wrapper },
      );

      expect(result.current.values).toEqual({
        name: "",
        brandIds: [],
        productSkus: [],
        supplierId: "",
        startDate: "",
        endDate: "",
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
      });
    });

    it("maps a PETALO campaign to default values in edit mode", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: petaloCampaign.id },
            initialCampaign: petaloCampaign,
            products: [],
            mediaCosts: [],
          }),
        { wrapper },
      );

      expect(result.current.values).toMatchObject({
        name: "Petalo Launch",
        brandIds: ["b1"],
        productSkus: ["sku-1"],
        supplierId: "s1",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        channel: "PETALO",
        stores: "Store A, Store B",
        quantity: 5,
        zone: "CAJAS",
      });
    });

    it("maps an SMS campaign to default values in edit mode", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: smsCampaign.id },
            initialCampaign: smsCampaign,
            products: [],
            mediaCosts: [],
          }),
        { wrapper },
      );

      expect(result.current.values).toMatchObject({
        name: "SMS Blast",
        brandIds: ["b3"],
        productSkus: ["sku-3"],
        supplierId: "s3",
        channel: "SMS",
        segment: "VIP",
        estimatedAudience: 1000,
        template: "tmpl-1",
        sendWindowFrom: "08:00",
        sendWindowTo: "20:00",
      });
    });
  });

  describe("filteredProducts / onBrandsChange", () => {
    it("only includes products whose brandId is in the current brandIds, and prunes productSkus", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({ target: { mode: "create" }, initialCampaign: null, products, mediaCosts: [] }),
        { wrapper },
      );

      expect(result.current.filteredProducts).toEqual([]);

      act(() => {
        result.current.onProductsChange(["sku-a", "sku-b", "sku-c"]);
      });
      expect(result.current.values.productSkus).toEqual(["sku-a", "sku-b", "sku-c"]);

      act(() => {
        result.current.onBrandsChange(["brand-1", "brand-2"]);
      });

      expect(result.current.values.brandIds).toEqual(["brand-1", "brand-2"]);
      expect(result.current.filteredProducts).toEqual([products[0], products[1]]);
      expect(result.current.values.productSkus).toEqual(["sku-a", "sku-b"]);
    });
  });

  describe("estimatedCost", () => {
    const mediaCosts: MediaCost[] = [
      { id: "m1", supplierId: "s1", channel: "PETALO", unitCostUsd: 10.256 },
      { id: "m2", supplierId: "s2", channel: "PARRILLERA", unitCostUsd: 7.5 },
      { id: "m3", supplierId: "s3", channel: "SMS", unitCostUsd: 15 },
      { id: "m4", supplierId: "s4", channel: "TIKTOK", unitCostUsd: 3 },
    ];

    it("multiplies unitCostUsd by quantity for PETALO, rounded to 2 decimals", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: petaloCampaign.id },
            initialCampaign: petaloCampaign,
            products: [],
            mediaCosts,
          }),
        { wrapper },
      );

      // supplierId "s1", quantity 5, unitCostUsd 10.256 -> 51.28 rounded
      expect(result.current.estimatedCost).toBe(51.28);
    });

    it("multiplies unitCostUsd by quantity for PARRILLERA", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: parrilleraCampaign.id },
            initialCampaign: parrilleraCampaign,
            products: [],
            mediaCosts,
          }),
        { wrapper },
      );

      // supplierId "s2", quantity 3, unitCostUsd 7.5 -> 22.5
      expect(result.current.estimatedCost).toBe(22.5);
    });

    it("ignores quantity for SMS and just returns unitCostUsd", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: smsCampaign.id },
            initialCampaign: smsCampaign,
            products: [],
            mediaCosts,
          }),
        { wrapper },
      );

      expect(result.current.estimatedCost).toBe(15);
    });

    it("ignores quantity for TIKTOK and just returns unitCostUsd", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: tiktokCampaign.id },
            initialCampaign: tiktokCampaign,
            products: [],
            mediaCosts,
          }),
        { wrapper },
      );

      expect(result.current.estimatedCost).toBe(3);
    });

    it("returns null when no mediaCosts entry matches supplierId+channel", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({ target: { mode: "create" }, initialCampaign: null, products: [], mediaCosts }),
        { wrapper },
      );

      expect(result.current.estimatedCost).toBeNull();
    });
  });

  describe("submission", () => {
    it("does not call the service and sets fieldErrors when required data is missing", async () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useCampaignForm({ target: { mode: "create" }, initialCampaign: null, products: [], mediaCosts: [] }),
        { wrapper },
      );

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.fieldErrors.name).toBeTruthy();
      expect(result.current.fieldErrors.brandIds).toBeTruthy();
      expect(result.current.error).toBe(
        "Hay varios campos con errores. Revisa los mensajes marcados en rojo.",
      );
    });

    it("sets the native-validation hint when the rendered form's required fields are left empty", async () => {
      const user = userEvent.setup();
      const { wrapper } = createWrapper();

      function Harness() {
        const form = useCampaignForm({
          target: { mode: "create" },
          initialCampaign: null,
          products: [],
          mediaCosts: [],
        });
        return (
          <CampaignFormView
            mode="create"
            register={form.register}
            errors={form.errors}
            fieldErrors={form.fieldErrors}
            values={form.values}
            onSubmit={form.onSubmit}
            brands={[]}
            filteredProducts={form.filteredProducts}
            onBrandsChange={form.onBrandsChange}
            onProductsChange={form.onProductsChange}
            suppliers={[]}
            estimatedCost={form.estimatedCost}
            isSubmitting={form.isSubmitting}
            error={form.error}
            backHref="/campaigns"
          />
        );
      }

      render(<Harness />, { wrapper });

      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(mockCreate).not.toHaveBeenCalled();
      expect(
        await screen.findByText("Revisa los campos marcados con * antes de guardar."),
      ).toBeInTheDocument();
    });

    it("remaps the SMS sendWindow.from zod issue path to the sendWindowFrom field", async () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: smsCampaign.id },
            initialCampaign: smsCampaign,
            products: [],
            mediaCosts: [],
          }),
        { wrapper },
      );

      await setField(result, "sendWindowFrom", "");

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result.current.fieldErrors.sendWindowFrom).toBeTruthy();
      expect(result.current.fieldErrors["sendWindow.from"]).toBeUndefined();
      // Only one issue, so the single-issue message path is used (not the "several fields" message).
      expect(result.current.error).toBe(result.current.fieldErrors.sendWindowFrom);
    });

    it("creates a PETALO campaign with the correctly-shaped payload and navigates on success", async () => {
      const { wrapper, invalidateSpy } = createWrapper();
      mockCreate.mockResolvedValue({ id: "new-camp-id" } as Campaign);
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "create" },
            initialCampaign: null,
            products: [{ sku: "sku-1", name: "P1", brandId: "b1" }],
            mediaCosts: [],
          }),
        { wrapper },
      );

      await setField(result, "name", "Back to school");
      act(() => result.current.onBrandsChange(["b1"]));
      act(() => result.current.onProductsChange(["sku-1"]));
      await setField(result, "supplierId", "s1");
      await setField(result, "startDate", "2026-01-01");
      await setField(result, "endDate", "2026-02-01");
      await setField(result, "stores", "Store A, Store B");

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockCreate).toHaveBeenCalledWith({
        name: "Back to school",
        brandIds: ["b1"],
        productSkus: ["sku-1"],
        supplierId: "s1",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        channel: "PETALO",
        stores: ["Store A", "Store B"],
        quantity: 1,
        zone: "ENTRADA",
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/campaigns/new-camp-id"));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["campaigns"] });
      expect(result.current.error).toBeNull();
    });

    it("updates a PARRILLERA campaign in edit mode using the target's campaignId", async () => {
      const { wrapper, invalidateSpy } = createWrapper();
      mockUpdate.mockResolvedValue({ id: parrilleraCampaign.id } as Campaign);
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: parrilleraCampaign.id },
            initialCampaign: parrilleraCampaign,
            products: [],
            mediaCosts: [],
          }),
        { wrapper },
      );

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockUpdate).toHaveBeenCalledWith(parrilleraCampaign.id, {
        name: parrilleraCampaign.name,
        brandIds: parrilleraCampaign.brandIds,
        productSkus: parrilleraCampaign.productSkus,
        supplierId: parrilleraCampaign.supplierId,
        startDate: parrilleraCampaign.startDate,
        endDate: parrilleraCampaign.endDate,
        channel: "PARRILLERA",
        stores: parrilleraCampaign.stores,
        quantity: parrilleraCampaign.quantity,
        levels: parrilleraCampaign.levels,
        category: parrilleraCampaign.category,
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith(`/campaigns/${parrilleraCampaign.id}`));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["campaigns"] });
    });

    it("updates a TIKTOK campaign in edit mode using the target's campaignId", async () => {
      const { wrapper, invalidateSpy } = createWrapper();
      mockUpdate.mockResolvedValue({ id: tiktokCampaign.id } as Campaign);
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "edit", campaignId: tiktokCampaign.id },
            initialCampaign: tiktokCampaign,
            products: [],
            mediaCosts: [],
          }),
        { wrapper },
      );

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockUpdate).toHaveBeenCalledWith(tiktokCampaign.id, {
        name: tiktokCampaign.name,
        brandIds: tiktokCampaign.brandIds,
        productSkus: tiktokCampaign.productSkus,
        supplierId: tiktokCampaign.supplierId,
        startDate: tiktokCampaign.startDate,
        endDate: tiktokCampaign.endDate,
        channel: "TIKTOK",
        adAccount: tiktokCampaign.adAccount,
        objective: tiktokCampaign.objective,
        creatives: tiktokCampaign.creatives,
        dailyBudgetUsd: tiktokCampaign.dailyBudgetUsd,
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith(`/campaigns/${tiktokCampaign.id}`));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["campaigns"] });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("isSubmitting reflects the mutation's pending state", async () => {
      const { wrapper } = createWrapper();
      let resolveCreate: (value: Campaign) => void;
      mockCreate.mockReturnValue(
        new Promise<Campaign>((resolve) => {
          resolveCreate = resolve;
        }),
      );
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "create" },
            initialCampaign: null,
            products: [{ sku: "sku-1", name: "P1", brandId: "b1" }],
            mediaCosts: [],
          }),
        { wrapper },
      );

      await setField(result, "name", "Back to school");
      act(() => result.current.onBrandsChange(["b1"]));
      act(() => result.current.onProductsChange(["sku-1"]));
      await setField(result, "supplierId", "s1");
      await setField(result, "startDate", "2026-01-01");
      await setField(result, "endDate", "2026-02-01");
      await setField(result, "stores", "Store A");

      expect(result.current.isSubmitting).toBe(false);

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.onSubmit();
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        resolveCreate!({ id: "x" } as Campaign);
        await submitPromise!;
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });

    it("surfaces the mutation's error message when the service call rejects", async () => {
      const { wrapper } = createWrapper();
      mockCreate.mockRejectedValue(new Error("server exploded"));
      const { result } = renderHook(
        () =>
          useCampaignForm({
            target: { mode: "create" },
            initialCampaign: null,
            products: [{ sku: "sku-1", name: "P1", brandId: "b1" }],
            mediaCosts: [],
          }),
        { wrapper },
      );

      await setField(result, "name", "Back to school");
      act(() => result.current.onBrandsChange(["b1"]));
      act(() => result.current.onProductsChange(["sku-1"]));
      await setField(result, "supplierId", "s1");
      await setField(result, "startDate", "2026-01-01");
      await setField(result, "endDate", "2026-02-01");
      await setField(result, "stores", "Store A");

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => expect(result.current.error).toBe("server exploded"));
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
