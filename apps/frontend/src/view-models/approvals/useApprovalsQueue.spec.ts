jest.mock("../../services/approvals.service", () => ({
  approvalsService: {
    approve: jest.fn(),
    reject: jest.fn(),
  },
}));

jest.mock("../../services/campaigns.service", () => ({
  campaignsService: {
    list: jest.fn(),
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
import { approvalsService } from "../../services/approvals.service";
import { campaignsService } from "../../services/campaigns.service";
import { useApprovalsQueue } from "./useApprovalsQueue";

const mockList = campaignsService.list as jest.Mock;
const mockApprove = approvalsService.approve as jest.Mock;
const mockReject = approvalsService.reject as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return wrapper;
}

const campaignA = { id: "a" } as Campaign;
const campaignB = { id: "b" } as Campaign;

function paginated(items: Campaign[], nextCursor: string | null = null): Paginated<Campaign> {
  return { items, nextCursor };
}

describe("useApprovalsQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses DEFAULT_FILTERS of status PENDING_APPROVAL and empty dates", async () => {
    mockList.mockResolvedValue(paginated([]));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    expect(result.current.filters).toEqual({ status: ["PENDING_APPROVAL"], dateFrom: "", dateTo: "" });
    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ status: ["PENDING_APPROVAL"] }));
  });

  it("reflects query.data.items as campaigns", async () => {
    mockList.mockResolvedValue(paginated([campaignA, campaignB]));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.campaigns).toEqual([campaignA, campaignB]));
    expect(result.current.isLoading).toBe(false);
  });

  it("surfaces the error message when list() rejects", async () => {
    mockList.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBe("boom"));
    expect(result.current.campaigns).toEqual([]);
  });

  it("setFilters resets the cursor stack (hasPrevPage back to false)", async () => {
    mockList.mockResolvedValue(paginated([campaignA], "cursor-1"));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.pagination.hasNextPage).toBe(true));

    act(() => {
      result.current.pagination.onNext();
    });
    await waitFor(() => expect(result.current.pagination.hasPrevPage).toBe(true));

    act(() => {
      result.current.setFilters({ status: ["APPROVED"], dateFrom: "", dateTo: "" });
    });

    expect(result.current.pagination.hasPrevPage).toBe(false);
    expect(result.current.filters).toEqual({ status: ["APPROVED"], dateFrom: "", dateTo: "" });
  });

  it("onNext pushes the nextCursor and passes it to campaignsService.list", async () => {
    mockList.mockResolvedValue(paginated([campaignA], "cursor-xyz"));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.pagination.hasNextPage).toBe(true));

    act(() => {
      result.current.pagination.onNext();
    });

    await waitFor(() =>
      expect(mockList).toHaveBeenCalledWith({ status: ["PENDING_APPROVAL"], cursor: "cursor-xyz" }),
    );
    expect(result.current.pagination.hasPrevPage).toBe(true);
  });

  it("onPrev pops the cursor stack", async () => {
    mockList.mockResolvedValue(paginated([campaignA], "cursor-xyz"));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.pagination.hasNextPage).toBe(true));

    act(() => {
      result.current.pagination.onNext();
    });
    await waitFor(() => expect(result.current.pagination.hasPrevPage).toBe(true));

    act(() => {
      result.current.pagination.onPrev();
    });

    expect(result.current.pagination.hasPrevPage).toBe(false);
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({ status: ["PENDING_APPROVAL"] }),
    );
  });

  it("includes dateFrom and dateTo in the query filters when set", async () => {
    mockList.mockResolvedValue(paginated([]));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.setFilters({ status: ["PENDING_APPROVAL"], dateFrom: "2026-01-01", dateTo: "2026-01-31" });
    });

    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({
        status: ["PENDING_APPROVAL"],
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
      }),
    );
  });

  it("actions.approve delegates to approvalsService.approve with the campaign id", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockApprove.mockResolvedValue(campaignA);
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.actions.approve("a");
    });

    expect(mockApprove).toHaveBeenCalledWith("a");
  });

  it("actions.reject delegates to approvalsService.reject with campaignId and comment", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockReject.mockResolvedValue(campaignA);
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.actions.reject("a", "needs work");
    });

    expect(mockReject).toHaveBeenCalledWith("a", "needs work");
  });

  it("actions.pendingCampaignId reflects the approve mutation's in-flight variable", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    let resolveApprove: (value: Campaign) => void;
    mockApprove.mockReturnValue(
      new Promise<Campaign>((resolve) => {
        resolveApprove = resolve;
      }),
    );
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    expect(result.current.actions.pendingCampaignId).toBeNull();

    let approvePromise: Promise<unknown>;
    act(() => {
      approvePromise = result.current.actions.approve("a");
    });

    await waitFor(() => expect(result.current.actions.pendingCampaignId).toBe("a"));

    await act(async () => {
      resolveApprove!(campaignA);
      await approvePromise!;
    });

    await waitFor(() => expect(result.current.actions.pendingCampaignId).toBeNull());
  });

  it("actions.pendingCampaignId reflects the reject mutation's in-flight campaignId", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    let resolveReject: (value: Campaign) => void;
    mockReject.mockReturnValue(
      new Promise<Campaign>((resolve) => {
        resolveReject = resolve;
      }),
    );
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    let rejectPromise: Promise<unknown>;
    act(() => {
      rejectPromise = result.current.actions.reject("b", "bad");
    });

    await waitFor(() => expect(result.current.actions.pendingCampaignId).toBe("b"));

    await act(async () => {
      resolveReject!(campaignB);
      await rejectPromise!;
    });

    await waitFor(() => expect(result.current.actions.pendingCampaignId).toBeNull());
  });

  it("decision success shows an approved toast and sets statusMessage", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockApprove.mockResolvedValue(campaignA);
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.actions.approve("a");
    });

    await waitFor(() => expect(result.current.statusMessage).toBe("Campaña aprobada."));
    expect(mockShowToast).toHaveBeenCalledWith("Campaña aprobada.", "approved");
  });

  it("decision.error surfaces the reject mutation's error message when approve has no error", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockReject.mockRejectedValue(new Error("no se pudo rechazar"));
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    expect(result.current.decision.error).toBeNull();

    await act(async () => {
      await result.current.actions.reject("a", "malo").catch(() => {});
    });

    await waitFor(() => expect(result.current.decision.error).toBe("no se pudo rechazar"));
  });

  it("decision success shows a rejected toast and sets statusMessage", async () => {
    mockList.mockResolvedValue(paginated([campaignA]));
    mockReject.mockResolvedValue(campaignA);
    const { result } = renderHook(() => useApprovalsQueue(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.actions.reject("a", "no");
    });

    await waitFor(() => expect(result.current.statusMessage).toBe("Campaña rechazada."));
    expect(mockShowToast).toHaveBeenCalledWith("Campaña rechazada.", "rejected");
  });
});
