jest.mock("./auth.service", () => ({
  authService: {
    getIdToken: jest.fn(),
  },
}));

import { authService } from "./auth.service";
import { apiClient, ApiError } from "./api-client";

const mockGetIdToken = authService.getIdToken as jest.Mock;

function mockFetchResponse(overrides: Partial<Response> & { jsonValue?: unknown } = {}) {
  const { jsonValue, ...rest } = overrides;
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: jest.fn().mockResolvedValue(jsonValue),
    ...rest,
  } as unknown as Response;
}

describe("apiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockGetIdToken.mockResolvedValue(null);
  });

  describe("get", () => {
    it("builds the URL from API_URL + path and issues a GET with no body", async () => {
      const responseBody = { id: "1" };
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: responseBody }));

      const result = await apiClient.get("/campaigns");

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe("http://localhost:3001/campaigns");
      expect(init.method).toBeUndefined();
      expect(init.body).toBeUndefined();
      expect(result).toEqual(responseBody);
    });

    it("does not set an Authorization header when there is no token", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: {} }));

      await apiClient.get("/campaigns");

      const [, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(init.headers.Authorization).toBeUndefined();
      expect(init.headers["Content-Type"]).toBe("application/json");
    });

    it("sends the token as a Bearer Authorization header when present", async () => {
      mockGetIdToken.mockResolvedValue("token-abc");
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: {} }));

      await apiClient.get("/campaigns");

      const [, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(init.headers.Authorization).toBe("Bearer token-abc");
    });
  });

  describe("post", () => {
    it("sends a POST with a JSON-stringified body", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: { ok: true } }));

      await apiClient.post("/campaigns/1/reject", { comment: "no" });

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe("http://localhost:3001/campaigns/1/reject");
      expect(init.method).toBe("POST");
      expect(init.body).toBe(JSON.stringify({ comment: "no" }));
    });

    it("omits the body key entirely when called with no body argument", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: {} }));

      await apiClient.post("/campaigns/1/approve");

      const [, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(init.method).toBe("POST");
      expect("body" in init).toBe(false);
    });
  });

  describe("patch", () => {
    it("sends a PATCH with a JSON-stringified body", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: {} }));

      await apiClient.patch("/campaigns/1", { name: "New name" });

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe("http://localhost:3001/campaigns/1");
      expect(init.method).toBe("PATCH");
      expect(init.body).toBe(JSON.stringify({ name: "New name" }));
    });

    it("omits the body key when called with no body argument", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: {} }));

      await apiClient.patch("/campaigns/1");

      const [, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect("body" in init).toBe(false);
    });
  });

  describe("error handling", () => {
    it("throws an ApiError with status and message from the JSON error body", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ ok: false, status: 400, jsonValue: { message: "Bad input" } }),
      );

      await expect(apiClient.get("/campaigns")).rejects.toMatchObject({
        name: "ApiError",
        status: 400,
        message: "Bad input",
      });
      await expect(apiClient.get("/campaigns")).rejects.toBeInstanceOf(ApiError);
    });

    it("falls back to statusText when the error body isn't valid JSON", async () => {
      const response = mockFetchResponse({ ok: false, status: 500, statusText: "Server Error" });
      (response.json as jest.Mock).mockRejectedValue(new Error("invalid json"));
      (global.fetch as jest.Mock).mockResolvedValue(response);

      await expect(apiClient.get("/campaigns")).rejects.toMatchObject({
        status: 500,
        message: "Server Error",
      });
    });

    it("falls back to a default Spanish message when the body has no message field", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ ok: false, status: 422, jsonValue: {} }),
      );

      await expect(apiClient.get("/campaigns")).rejects.toMatchObject({
        status: 422,
        message: "No se pudo completar la solicitud.",
      });
    });
  });

  describe("response body handling", () => {
    it("resolves to undefined for a 204 No Content response without calling .json()", async () => {
      const response = mockFetchResponse({ status: 204 });
      (global.fetch as jest.Mock).mockResolvedValue(response);

      const result = await apiClient.get("/campaigns/1/approve");

      expect(result).toBeUndefined();
      expect(response.json).not.toHaveBeenCalled();
    });

    it("resolves the parsed JSON body for a normal successful response", async () => {
      const payload = { id: "42", name: "Campaign" };
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ jsonValue: payload }));

      const result = await apiClient.get("/campaigns/42");

      expect(result).toEqual(payload);
    });
  });
});
