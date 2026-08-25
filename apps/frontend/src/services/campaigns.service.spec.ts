jest.mock("./api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

import type {
  Campaign,
  CampaignListFilters,
  NewCampaignInput,
  Paginated,
} from "@farmatodo-retail-media/types";
import { apiClient } from "./api-client";
import { campaignsService } from "./campaigns.service";

const mockGet = apiClient.get as jest.Mock;
const mockPost = apiClient.post as jest.Mock;
const mockPatch = apiClient.patch as jest.Mock;

describe("campaignsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("posts the campaign data to /campaigns", async () => {
      const input = { name: "Back to school" } as unknown as NewCampaignInput;
      const created = { id: "1" } as Campaign;
      mockPost.mockResolvedValue(created);

      const result = await campaignsService.create(input);

      expect(mockPost).toHaveBeenCalledWith("/campaigns", input);
      expect(result).toBe(created);
    });
  });

  describe("update", () => {
    it("patches /campaigns/:id with the campaign data", async () => {
      const input = { name: "Updated" } as unknown as NewCampaignInput;
      const updated = { id: "1" } as Campaign;
      mockPatch.mockResolvedValue(updated);

      const result = await campaignsService.update("1", input);

      expect(mockPatch).toHaveBeenCalledWith("/campaigns/1", input);
      expect(result).toBe(updated);
    });
  });

  describe("get", () => {
    it("gets /campaigns/:id", async () => {
      const payload = { campaign: { id: "1" } as Campaign, history: [] };
      mockGet.mockResolvedValue(payload);

      const result = await campaignsService.get("1");

      expect(mockGet).toHaveBeenCalledWith("/campaigns/1");
      expect(result).toBe(payload);
    });
  });

  describe("submit", () => {
    it("posts to /campaigns/:id/submit with no body", async () => {
      const campaign = { id: "1" } as Campaign;
      mockPost.mockResolvedValue(campaign);

      const result = await campaignsService.submit("1");

      expect(mockPost).toHaveBeenCalledWith("/campaigns/1/submit");
      expect(result).toBe(campaign);
    });
  });

  describe("estimateCost", () => {
    it("gets /campaigns/cost-estimate with channel, supplierId and quantity in the query string", async () => {
      const estimate = { totalCostUsd: 42.5 };
      mockGet.mockResolvedValue(estimate);

      const result = await campaignsService.estimateCost({
        channel: "PETALO",
        supplierId: "supplier-1",
        quantity: 3,
      });

      expect(mockGet).toHaveBeenCalledWith(
        "/campaigns/cost-estimate?channel=PETALO&supplierId=supplier-1&quantity=3",
      );
      expect(result).toBe(estimate);
    });

    it("omits quantity from the query string when not provided", async () => {
      mockGet.mockResolvedValue({ totalCostUsd: 300 });

      await campaignsService.estimateCost({ channel: "SMS", supplierId: "supplier-1" });

      expect(mockGet).toHaveBeenCalledWith("/campaigns/cost-estimate?channel=SMS&supplierId=supplier-1");
    });
  });

  describe("list / toQueryString", () => {
    const paginated: Paginated<Campaign> = { items: [], nextCursor: null };

    beforeEach(() => {
      mockGet.mockResolvedValue(paginated);
    });

    it("requests /campaigns with no query string when filters are empty", async () => {
      await campaignsService.list({});

      expect(mockGet).toHaveBeenCalledWith("/campaigns");
    });

    it("comma-joins multiple statuses into a single status param", async () => {
      const filters: CampaignListFilters = { status: ["DRAFT", "APPROVED"] };

      await campaignsService.list(filters);

      expect(mockGet).toHaveBeenCalledWith("/campaigns?status=DRAFT%2CAPPROVED");
    });

    it("omits the status param when status is an empty array", async () => {
      await campaignsService.list({ status: [] });

      expect(mockGet).toHaveBeenCalledWith("/campaigns");
    });

    it("includes dateFrom when present", async () => {
      await campaignsService.list({ dateFrom: "2026-01-01" });

      expect(mockGet).toHaveBeenCalledWith("/campaigns?dateFrom=2026-01-01");
    });

    it("includes dateTo when present", async () => {
      await campaignsService.list({ dateTo: "2026-12-31" });

      expect(mockGet).toHaveBeenCalledWith("/campaigns?dateTo=2026-12-31");
    });

    it("includes cursor when present", async () => {
      await campaignsService.list({ cursor: "cursor-abc" });

      expect(mockGet).toHaveBeenCalledWith("/campaigns?cursor=cursor-abc");
    });

    it("includes pageSize when present", async () => {
      await campaignsService.list({ pageSize: 25 });

      expect(mockGet).toHaveBeenCalledWith("/campaigns?pageSize=25");
    });

    it("omits pageSize when it is falsy (0)", async () => {
      await campaignsService.list({ pageSize: 0 });

      expect(mockGet).toHaveBeenCalledWith("/campaigns");
    });

    it("ignores createdBy since it isn't part of the query string builder", async () => {
      await campaignsService.list({ createdBy: "user-1" });

      expect(mockGet).toHaveBeenCalledWith("/campaigns");
    });

    it("combines multiple filters with &, in declaration order", async () => {
      const filters: CampaignListFilters = {
        status: ["PENDING_APPROVAL"],
        dateFrom: "2026-01-01",
        dateTo: "2026-02-01",
        cursor: "cur-1",
        pageSize: 10,
      };

      await campaignsService.list(filters);

      expect(mockGet).toHaveBeenCalledWith(
        "/campaigns?status=PENDING_APPROVAL&dateFrom=2026-01-01&dateTo=2026-02-01&cursor=cur-1&pageSize=10",
      );
    });

    it("resolves the paginated result from apiClient.get", async () => {
      const result = await campaignsService.list({});
      expect(result).toBe(paginated);
    });
  });
});
