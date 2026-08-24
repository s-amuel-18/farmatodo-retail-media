jest.mock("../../services/approvals.service", () => ({
  approvalsService: {
    approve: jest.fn(),
    reject: jest.fn(),
  },
}));

const mockShowToast = jest.fn();
jest.mock("../shared/toast-context", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import type { Campaign } from "@farmatodo-retail-media/types";
import { approvalsService } from "../../services/approvals.service";
import { useApprovalDecision } from "./useApprovalDecision";

const mockApprove = approvalsService.approve as jest.Mock;
const mockReject = approvalsService.reject as jest.Mock;

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

const fakeCampaign = { id: "camp-1" } as Campaign;

describe("useApprovalDecision", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("onApprove calls approvalsService.approve with the campaign id", async () => {
    mockApprove.mockResolvedValue(fakeCampaign);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-1"), { wrapper });

    await act(async () => {
      await result.current.onApprove();
    });

    expect(mockApprove).toHaveBeenCalledWith("camp-1");
  });

  it("onApprove success invalidates campaigns query, sets statusMessage, and shows approved toast", async () => {
    mockApprove.mockResolvedValue(fakeCampaign);
    const { wrapper, invalidateSpy } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-1"), { wrapper });

    await act(async () => {
      await result.current.onApprove();
    });

    await waitFor(() => expect(result.current.statusMessage).toBe("Campaña aprobada."));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["campaigns"] });
    expect(mockShowToast).toHaveBeenCalledWith("Campaña aprobada.", "approved");
  });

  it("onReject calls approvalsService.reject with campaignId and comment", async () => {
    mockReject.mockResolvedValue(fakeCampaign);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-2"), { wrapper });

    await act(async () => {
      await result.current.onReject("not good enough");
    });

    expect(mockReject).toHaveBeenCalledWith("camp-2", "not good enough");
  });

  it("onReject success sets statusMessage and shows rejected toast", async () => {
    mockReject.mockResolvedValue(fakeCampaign);
    const { wrapper, invalidateSpy } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-2"), { wrapper });

    await act(async () => {
      await result.current.onReject("comment");
    });

    await waitFor(() => expect(result.current.statusMessage).toBe("Campaña rechazada."));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["campaigns"] });
    expect(mockShowToast).toHaveBeenCalledWith("Campaña rechazada.", "rejected");
  });

  it("isDeciding is true while approve is in flight and false after it resolves", async () => {
    let resolvePromise: (value: Campaign) => void;
    mockApprove.mockReturnValue(
      new Promise<Campaign>((resolve) => {
        resolvePromise = resolve;
      }),
    );
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-1"), { wrapper });

    expect(result.current.isDeciding).toBe(false);

    let onApprovePromise: Promise<Campaign>;
    act(() => {
      onApprovePromise = result.current.onApprove();
    });

    await waitFor(() => expect(result.current.isDeciding).toBe(true));

    await act(async () => {
      resolvePromise!(fakeCampaign);
      await onApprovePromise!;
    });

    await waitFor(() => expect(result.current.isDeciding).toBe(false));
  });

  it("isDeciding is true while reject is in flight", async () => {
    let resolvePromise: (value: Campaign) => void;
    mockReject.mockReturnValue(
      new Promise<Campaign>((resolve) => {
        resolvePromise = resolve;
      }),
    );
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-1"), { wrapper });

    let onRejectPromise: Promise<Campaign>;
    act(() => {
      onRejectPromise = result.current.onReject("bad");
    });

    await waitFor(() => expect(result.current.isDeciding).toBe(true));

    await act(async () => {
      resolvePromise!(fakeCampaign);
      await onRejectPromise!;
    });

    await waitFor(() => expect(result.current.isDeciding).toBe(false));
  });

  it("decisionError is null by default", () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-1"), { wrapper });
    expect(result.current.decisionError).toBeNull();
  });

  it("decisionError surfaces approve mutation error message", async () => {
    mockApprove.mockRejectedValue(new Error("network down"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-1"), { wrapper });

    await act(async () => {
      await result.current.onApprove().catch(() => {});
    });

    await waitFor(() => expect(result.current.decisionError).toBe("network down"));
  });

  it("decisionError surfaces reject mutation error message", async () => {
    mockReject.mockRejectedValue(new Error("forbidden"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApprovalDecision("camp-1"), { wrapper });

    await act(async () => {
      await result.current.onReject("x").catch(() => {});
    });

    await waitFor(() => expect(result.current.decisionError).toBe("forbidden"));
  });
});
