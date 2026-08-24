import { render, screen } from "@testing-library/react";
import type { CampaignStatus } from "@farmatodo-retail-media/types";
import { StatusBadge, STATUS_TONES } from "./StatusBadge";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-vocabulary";

const TONE_CLASSES: Record<string, string> = {
  draft: "bg-status-draft-bg",
  pending: "bg-status-pending-bg",
  approved: "bg-status-approved-bg",
  rejected: "bg-status-rejected-bg",
};

describe("STATUS_TONES", () => {
  it("maps each campaign status to the exact expected badge tone", () => {
    expect(STATUS_TONES).toEqual({
      DRAFT: "draft",
      PENDING_APPROVAL: "pending",
      APPROVED: "approved",
      REJECTED: "rejected",
    });
  });
});

describe("StatusBadge", () => {
  const statuses: CampaignStatus[] = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"];

  it.each(statuses)("renders the correct label and tone class for %s", (status) => {
    render(<StatusBadge status={status} />);

    const label = CAMPAIGN_STATUS_LABELS[status];
    const badge = screen.getByText(label);
    expect(badge).toBeInTheDocument();

    const tone = STATUS_TONES[status];
    expect(badge).toHaveClass(TONE_CLASSES[tone]!);
  });
});
