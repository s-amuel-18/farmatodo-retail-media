const mockCollection = jest.fn();
const mockGetDocs = jest.fn();

jest.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
}));

jest.mock("../lib/firebase-client", () => ({
  firestoreClient: { firestore: true },
}));

import { FIRESTORE_COLLECTIONS } from "@farmatodo-retail-media/types";
import { firestoreClient } from "../lib/firebase-client";
import { referenceDataService } from "./reference-data.service";

function makeSnap(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    docs: docs.map(({ id, data }) => ({ id, data: () => data })),
  };
}

describe("referenceDataService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockImplementation((_client, name) => ({ __collection: name }));
  });

  describe("listBrands", () => {
    it("reads from the brands collection and maps docs to { id, ...data }", async () => {
      mockGetDocs.mockResolvedValue(makeSnap([{ id: "brand-1", data: { name: "Acme" } }]));

      const result = await referenceDataService.listBrands();

      expect(mockCollection).toHaveBeenCalledWith(firestoreClient, FIRESTORE_COLLECTIONS.brands);
      expect(mockGetDocs).toHaveBeenCalledWith({ __collection: FIRESTORE_COLLECTIONS.brands });
      expect(result).toEqual([{ id: "brand-1", name: "Acme" }]);
    });

    it("returns an empty array when there are no docs", async () => {
      mockGetDocs.mockResolvedValue(makeSnap([]));

      const result = await referenceDataService.listBrands();

      expect(result).toEqual([]);
    });

    it("maps multiple docs", async () => {
      mockGetDocs.mockResolvedValue(
        makeSnap([
          { id: "b1", data: { name: "Brand One" } },
          { id: "b2", data: { name: "Brand Two" } },
        ]),
      );

      const result = await referenceDataService.listBrands();

      expect(result).toEqual([
        { id: "b1", name: "Brand One" },
        { id: "b2", name: "Brand Two" },
      ]);
    });
  });

  describe("listProducts", () => {
    it("reads from the products collection and maps docs to { sku, ...data } (not id)", async () => {
      mockGetDocs.mockResolvedValue(
        makeSnap([{ id: "sku-123", data: { name: "Widget", brandId: "brand-1" } }]),
      );

      const result = await referenceDataService.listProducts();

      expect(mockCollection).toHaveBeenCalledWith(firestoreClient, FIRESTORE_COLLECTIONS.products);
      expect(result).toEqual([{ sku: "sku-123", name: "Widget", brandId: "brand-1" }]);
      expect(result[0]).not.toHaveProperty("id");
    });
  });

  describe("listSuppliers", () => {
    it("reads from the suppliers collection and maps docs to { id, ...data }", async () => {
      mockGetDocs.mockResolvedValue(makeSnap([{ id: "sup-1", data: { name: "Supplier Co" } }]));

      const result = await referenceDataService.listSuppliers();

      expect(mockCollection).toHaveBeenCalledWith(
        firestoreClient,
        FIRESTORE_COLLECTIONS.suppliers,
      );
      expect(result).toEqual([{ id: "sup-1", name: "Supplier Co" }]);
    });
  });

  describe("listMediaCosts", () => {
    it("reads from the mediaCosts collection and maps docs to { id, ...data }", async () => {
      mockGetDocs.mockResolvedValue(
        makeSnap([
          {
            id: "cost-1",
            data: { supplierId: "sup-1", channel: "SMS", unitCostUsd: 5, pricingModel: "FLAT" },
          },
        ]),
      );

      const result = await referenceDataService.listMediaCosts();

      expect(mockCollection).toHaveBeenCalledWith(
        firestoreClient,
        FIRESTORE_COLLECTIONS.mediaCosts,
      );
      expect(result).toEqual([
        { id: "cost-1", supplierId: "sup-1", channel: "SMS", unitCostUsd: 5, pricingModel: "FLAT" },
      ]);
    });
  });
});
