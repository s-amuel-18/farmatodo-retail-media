jest.mock("../../services/reference-data.service", () => ({
  referenceDataService: {
    listBrands: jest.fn(),
    listProducts: jest.fn(),
    listSuppliers: jest.fn(),
    listMediaCosts: jest.fn(),
  },
}));

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import type { Brand, MediaCost, Product, Supplier } from "@farmatodo-retail-media/types";
import { referenceDataService } from "../../services/reference-data.service";
import { useReferenceData } from "./useReferenceData";

const mockListBrands = referenceDataService.listBrands as jest.Mock;
const mockListProducts = referenceDataService.listProducts as jest.Mock;
const mockListSuppliers = referenceDataService.listSuppliers as jest.Mock;
const mockListMediaCosts = referenceDataService.listMediaCosts as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return wrapper;
}

const brands: Brand[] = [{ id: "b1", name: "Brand 1" }];
const products: Product[] = [{ sku: "sku-1", name: "Product 1", brandId: "b1" }];
const suppliers: Supplier[] = [{ id: "s1", name: "Supplier 1" }];
const mediaCosts: MediaCost[] = [
  { id: "m1", supplierId: "s1", channel: "PETALO", unitCostUsd: 10, pricingModel: "PER_UNIT" },
];

describe("useReferenceData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("defaults all four collections to [] before resolving", () => {
    mockListBrands.mockReturnValue(new Promise(() => {}));
    mockListProducts.mockReturnValue(new Promise(() => {}));
    mockListSuppliers.mockReturnValue(new Promise(() => {}));
    mockListMediaCosts.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useReferenceData(), { wrapper: createWrapper() });

    expect(result.current.brands).toEqual([]);
    expect(result.current.products).toEqual([]);
    expect(result.current.suppliers).toEqual([]);
    expect(result.current.mediaCosts).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("populates all four collections once every query resolves", async () => {
    mockListBrands.mockResolvedValue(brands);
    mockListProducts.mockResolvedValue(products);
    mockListSuppliers.mockResolvedValue(suppliers);
    mockListMediaCosts.mockResolvedValue(mediaCosts);

    const { result } = renderHook(() => useReferenceData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.brands).toEqual(brands);
    expect(result.current.products).toEqual(products);
    expect(result.current.suppliers).toEqual(suppliers);
    expect(result.current.mediaCosts).toEqual(mediaCosts);
  });

  it("isLoading is true if any of the four queries is still loading", async () => {
    mockListBrands.mockResolvedValue(brands);
    mockListProducts.mockResolvedValue(products);
    mockListSuppliers.mockResolvedValue(suppliers);
    let resolveMediaCosts: (value: MediaCost[]) => void;
    mockListMediaCosts.mockReturnValue(
      new Promise<MediaCost[]>((resolve) => {
        resolveMediaCosts = resolve;
      }),
    );

    const { result } = renderHook(() => useReferenceData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.brands).toEqual(brands));
    expect(result.current.isLoading).toBe(true);

    resolveMediaCosts!(mediaCosts);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mediaCosts).toEqual(mediaCosts);
  });
});
