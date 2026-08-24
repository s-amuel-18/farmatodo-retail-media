jest.mock("./api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

import type { Campaign } from "@farmatodo-retail-media/types";
import { apiClient } from "./api-client";
import { approvalsService } from "./approvals.service";

const mockPost = apiClient.post as jest.Mock;

describe("approvalsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("approve", () => {
    it("posts to /campaigns/:id/approve with no body", async () => {
      const campaign = { id: "camp-1" } as Campaign;
      mockPost.mockResolvedValue(campaign);

      const result = await approvalsService.approve("camp-1");

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/campaigns/camp-1/approve");
      expect(result).toBe(campaign);
    });

    it("interpolates the campaign id into the URL", async () => {
      mockPost.mockResolvedValue({} as Campaign);

      await approvalsService.approve("abc-123-xyz");

      expect(mockPost).toHaveBeenCalledWith("/campaigns/abc-123-xyz/approve");
    });
  });

  describe("reject", () => {
    it("posts to /campaigns/:id/reject with the comment as the body", async () => {
      const campaign = { id: "camp-2" } as Campaign;
      mockPost.mockResolvedValue(campaign);

      const result = await approvalsService.reject("camp-2", "Missing budget details");

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/campaigns/camp-2/reject", {
        comment: "Missing budget details",
      });
      expect(result).toBe(campaign);
    });

    it("sends an empty-string comment as-is", async () => {
      mockPost.mockResolvedValue({} as Campaign);

      await approvalsService.reject("camp-3", "");

      expect(mockPost).toHaveBeenCalledWith("/campaigns/camp-3/reject", { comment: "" });
    });
  });
});
