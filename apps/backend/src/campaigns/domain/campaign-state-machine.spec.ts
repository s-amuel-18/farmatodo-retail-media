import type { AuthenticatedUser, PetaloCampaign } from "@farmatodo-retail-media/types";
import { transition } from "./campaign-state-machine";
import {
  ForbiddenActionError,
  InvalidTransitionError,
  ValidationError,
} from "./errors";

const OWNER_UID = "analyst-1";

const analyst: AuthenticatedUser = {
  uid: OWNER_UID,
  email: "analyst@farmatodo.com",
  role: "COMMERCIAL_ANALYST",
};
const otherAnalyst: AuthenticatedUser = {
  uid: "analyst-2",
  email: "other@farmatodo.com",
  role: "COMMERCIAL_ANALYST",
};
const manager: AuthenticatedUser = {
  uid: "manager-1",
  email: "manager@farmatodo.com",
  role: "APPROVER_MANAGER",
};

function makeCampaign(
  overrides: Partial<PetaloCampaign> = {},
): PetaloCampaign {
  return {
    id: "campaign-1",
    name: "Campaña de prueba",
    brandIds: ["brand-1"],
    productSkus: ["sku-1"],
    supplierId: "supplier-1",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    createdAt: "2026-08-23T00:00:00.000Z",
    createdBy: OWNER_UID,
    status: "DRAFT",
    totalCostUsd: 100,
    channel: "PETALO",
    stores: ["store-1"],
    quantity: 2,
    zone: "ENTRADA",
    ...overrides,
  };
}

describe("campaign-state-machine: SUBMIT", () => {
  it("allows the owner analyst to submit a DRAFT campaign", () => {
    const result = transition(makeCampaign({ status: "DRAFT" }), { type: "SUBMIT" }, analyst);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.campaign.status).toBe("PENDING_APPROVAL");
      expect(result.historyAction).toBe("SUBMITTED");
    }
  });

  it("allows the owner analyst to resubmit a REJECTED campaign and clears the comment", () => {
    const rejected = makeCampaign({
      status: "REJECTED",
      currentApprovalComment: "faltan datos",
    });
    const result = transition(rejected, { type: "SUBMIT" }, analyst);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.campaign.status).toBe("PENDING_APPROVAL");
      expect(result.campaign.currentApprovalComment).toBeUndefined();
    }
  });

  it("forbids submitting a campaign owned by someone else", () => {
    const result = transition(makeCampaign({ status: "DRAFT" }), { type: "SUBMIT" }, otherAnalyst);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ForbiddenActionError);
  });

  it("forbids a manager from submitting a campaign", () => {
    const result = transition(makeCampaign({ status: "DRAFT" }), { type: "SUBMIT" }, manager);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ForbiddenActionError);
  });

  it.each(["PENDING_APPROVAL", "APPROVED"] as const)(
    "rejects SUBMIT from status %s even for the owner analyst",
    (status) => {
      const result = transition(makeCampaign({ status }), { type: "SUBMIT" }, analyst);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeInstanceOf(InvalidTransitionError);
    },
  );
});

describe("campaign-state-machine: APPROVE", () => {
  it("allows a manager to approve a PENDING_APPROVAL campaign", () => {
    const result = transition(
      makeCampaign({ status: "PENDING_APPROVAL" }),
      { type: "APPROVE" },
      manager,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.campaign.status).toBe("APPROVED");
  });

  it("forbids an analyst from approving", () => {
    const result = transition(
      makeCampaign({ status: "PENDING_APPROVAL" }),
      { type: "APPROVE" },
      analyst,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ForbiddenActionError);
  });

  it.each(["DRAFT", "APPROVED", "REJECTED"] as const)(
    "rejects APPROVE from status %s even for a manager",
    (status) => {
      const result = transition(makeCampaign({ status }), { type: "APPROVE" }, manager);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeInstanceOf(InvalidTransitionError);
    },
  );
});

describe("campaign-state-machine: REJECT", () => {
  it("allows a manager to reject with a comment", () => {
    const result = transition(
      makeCampaign({ status: "PENDING_APPROVAL" }),
      { type: "REJECT", comment: "Presupuesto excede el límite" },
      manager,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.campaign.status).toBe("REJECTED");
      expect(result.campaign.currentApprovalComment).toBe("Presupuesto excede el límite");
    }
  });

  it("requires a non-empty comment", () => {
    const result = transition(
      makeCampaign({ status: "PENDING_APPROVAL" }),
      { type: "REJECT", comment: "   " },
      manager,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ValidationError);
  });

  it("forbids an analyst from rejecting", () => {
    const result = transition(
      makeCampaign({ status: "PENDING_APPROVAL" }),
      { type: "REJECT", comment: "no" },
      analyst,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ForbiddenActionError);
  });

  it.each(["DRAFT", "APPROVED", "REJECTED"] as const)(
    "rejects REJECT from status %s even for a manager",
    (status) => {
      const result = transition(
        makeCampaign({ status }),
        { type: "REJECT", comment: "no" },
        manager,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeInstanceOf(InvalidTransitionError);
    },
  );
});

describe("campaign-state-machine: APPROVED is terminal", () => {
  it.each([
    { type: "SUBMIT" as const },
    { type: "APPROVE" as const },
    { type: "REJECT" as const, comment: "no" },
  ])("rejects %o from an APPROVED campaign regardless of actor", (action) => {
    const campaign = makeCampaign({ status: "APPROVED" });
    expect(transition(campaign, action, analyst).ok).toBe(false);
    expect(transition(campaign, action, manager).ok).toBe(false);
  });
});
