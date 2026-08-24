jest.mock("../../services/campaigns.service", () => ({
  campaignsService: {
    get: jest.fn(),
  },
}));

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import type { Campaign, HistoryEntry } from "@farmatodo-retail-media/types";
import { campaignsService } from "../../services/campaigns.service";
import { useCampaign } from "./useCampaign";

const mockGet = campaignsService.get as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return wrapper;
}

const fakeCampaign = { id: "camp-1", name: "Back to school" } as Campaign;
const fakeHistory: HistoryEntry[] = [{ id: "h1" } as HistoryEntry];

describe("useCampaign", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls campaignsService.get with the campaign id", async () => {
    mockGet.mockResolvedValue({ campaign: fakeCampaign, history: fakeHistory });
    renderHook(() => useCampaign("camp-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("camp-1"));
  });

  it("defaults campaign to null and history to [] while loading", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCampaign("camp-1"), { wrapper: createWrapper() });

    expect(result.current.campaign).toBeNull();
    expect(result.current.history).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("populates campaign and history once the query resolves", async () => {
    mockGet.mockResolvedValue({ campaign: fakeCampaign, history: fakeHistory });
    const { result } = renderHook(() => useCampaign("camp-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.campaign).toEqual(fakeCampaign);
    expect(result.current.history).toEqual(fakeHistory);
  });

  it("surfaces the error message when the query rejects", async () => {
    mockGet.mockRejectedValue(new Error("not found"));
    const { result } = renderHook(() => useCampaign("camp-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBe("not found"));
    expect(result.current.campaign).toBeNull();
    expect(result.current.history).toEqual([]);
  });

  it("error is null when there is no failure", async () => {
    mockGet.mockResolvedValue({ campaign: fakeCampaign, history: fakeHistory });
    const { result } = renderHook(() => useCampaign("camp-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
