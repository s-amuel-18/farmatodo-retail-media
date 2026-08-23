import type { CampaignStatus } from "@farmatodo-retail-media/types";

const LABELS: Record<CampaignStatus, string> = {
  DRAFT: "Borrador",
  PENDING_APPROVAL: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

const COLORS: Record<CampaignStatus, { bg: string; fg: string }> = {
  DRAFT: { bg: "#e5e7eb", fg: "#374151" },
  PENDING_APPROVAL: { bg: "#fef3c7", fg: "#92400e" },
  APPROVED: { bg: "#d1fae5", fg: "#065f46" },
  REJECTED: { bg: "#fee2e2", fg: "#991b1b" },
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const { bg, fg } = COLORS[status];
  return (
    <span
      style={{
        background: bg,
        color: fg,
        borderRadius: 999,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {LABELS[status]}
    </span>
  );
}
