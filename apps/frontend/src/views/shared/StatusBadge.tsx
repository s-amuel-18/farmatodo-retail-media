import type { CampaignStatus } from "@farmatodo-retail-media/types";
import { Badge, type BadgeTone } from "@/components/ui";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-vocabulary";

const STATUS_TONES: Record<CampaignStatus, BadgeTone> = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{CAMPAIGN_STATUS_LABELS[status]}</Badge>;
}
