jest.mock("../../services/campaigns.service", () => ({
  campaignsService: {
    list: jest.fn(),
    submit: jest.fn(),
  },
}));

const mockShowToast = jest.fn();
jest.mock("../shared/toast-context", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import type { Campaign, Paginated } from "@farmatodo-retail-media/types";
import { campaignsService } from "../../services/campaigns.service";
import { useCampaignsInbox } from "./useCampaignsInbox";

const mockList = campaignsService.list as jest.Mock;
const mockSubmit = campaignsService.submit as jest.Mock;

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

const campaignA = { id: "a" } as Campaign;

function paginated(items: Campaign[], nextCursor: string | null = null): Paginated<Campaign> {
  return { items, nextCursor };
}

describe("useCampaignsInbox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses EMPTY_FILTERS (no status filter) by default", async () => {
    mockList.mockResolvedValue(paginated([]));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    expect(result.current.filters).toEqual({ status: [], dateFrom: "", dateTo: "" });
    await waitFor(() => expect(mockList).toHaveBeenCalledWith({}));
  });

  it("reflects query.data.items as campaigns and loading/error state", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.campaigns).toEqual([campaignA]));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("surfaces the error message when list() rejects", async () => {
    mockList.mockRejectedValue(new Error("server error"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe("server error"));
  });

  it("setFilters resets the cursor stack", async () => {
    mockList.mockResolvedValue(paginated([campaignA], "cursor-1"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    await waitFor(() => expect(result.current.pagination.hasNextPage).toBe(true));

    act(() => result.current.pagination.onNext());
    await waitFor(() => expect(result.current.pagination.hasPrevPage).toBe(true));

    act(() => result.current.setFilters({ status: ["DRAFT"], dateFrom: "", dateTo: "" }));

    expect(result.current.pagination.hasPrevPage).toBe(false);
    expect(result.current.filters).toEqual({ status: ["DRAFT"], dateFrom: "", dateTo: "" });
  });

  it("onNext/onPrev push and pop the cursor, changing the query filters", async () => {
    mockList.mockResolvedValue(paginated([campaignA], "cursor-xyz"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    await waitFor(() => expect(result.current.pagination.hasNextPage).toBe(true));

    act(() => result.current.pagination.onNext());
    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ cursor: "cursor-xyz" }));
    expect(result.current.pagination.hasPrevPage).toBe(true);

    act(() => result.current.pagination.onPrev());
    expect(result.current.pagination.hasPrevPage).toBe(false);
    await waitFor(() => expect(mockList).toHaveBeenLastCalledWith({}));
  });

  it("includes dateFrom and dateTo in the query filters when set", async () => {
    mockList.mockResolvedValue(paginated([]));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    act(() => result.current.setFilters({ status: [], dateFrom: "2026-01-01", dateTo: "2026-01-31" }));

    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({ dateFrom: "2026-01-01", dateTo: "2026-01-31" }),
    );
  });

  it("actions.submit delegates to campaignsService.submit with the campaign id", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockSubmit.mockResolvedValue(campaignA);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    await act(async () => {
      await result.current.actions.submit("a");
    });

    expect(mockSubmit).toHaveBeenCalledWith("a");
  });

  it("submit success invalidates the inbox query, sets statusMessage and shows a pending toast", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockSubmit.mockResolvedValue(campaignA);
    const { wrapper, invalidateSpy } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    await act(async () => {
      await result.current.actions.submit("a");
    });

    await waitFor(() => expect(result.current.statusMessage).toBe("Campaña enviada a aprobación."));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["campaigns", "inbox"] });
    expect(mockShowToast).toHaveBeenCalledWith("Campaña enviada a aprobación.", "pending");
  });

  it("actions.isSubmitting and actions.pendingCampaignId reflect the mutation's pending state", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    let resolveSubmit: (value: Campaign) => void;
    mockSubmit.mockReturnValue(
      new Promise<Campaign>((resolve) => {
        resolveSubmit = resolve;
      }),
    );
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    expect(result.current.actions.isSubmitting).toBe(false);
    expect(result.current.actions.pendingCampaignId).toBeNull();

    let submitPromise: Promise<unknown>;
    act(() => {
      submitPromise = result.current.actions.submit("a");
    });

    await waitFor(() => expect(result.current.actions.isSubmitting).toBe(true));
    expect(result.current.actions.pendingCampaignId).toBe("a");

    await act(async () => {
      resolveSubmit!(campaignA);
      await submitPromise!;
    });

    await waitFor(() => expect(result.current.actions.isSubmitting).toBe(false));
    expect(result.current.actions.pendingCampaignId).toBeNull();
  });

  it("submitError surfaces the mutation's error message", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockSubmit.mockRejectedValue(new Error("cannot submit"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCampaignsInbox(), { wrapper });

    await act(async () => {
      await result.current.actions.submit("a").catch(() => {});
    });

    await waitFor(() => expect(result.current.submitError).toBe("cannot submit"));
  });
});
