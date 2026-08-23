import type { CampaignStatus } from "@farmatodo-retail-media/types";

const ALL_STATUSES: CampaignStatus[] = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"];

const LABELS: Record<CampaignStatus, string> = {
  DRAFT: "Borrador",
  PENDING_APPROVAL: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export interface FiltersBarValue {
  status: CampaignStatus[];
  dateFrom: string;
  dateTo: string;
}

interface FiltersBarProps {
  value: FiltersBarValue;
  onChange: (value: FiltersBarValue) => void;
}

export function FiltersBar({ value, onChange }: FiltersBarProps) {
  function toggleStatus(status: CampaignStatus) {
    const next = value.status.includes(status)
      ? value.status.filter((s) => s !== status)
      : [...value.status, status];
    onChange({ ...value, status: next });
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ALL_STATUSES.map((status) => (
          <label key={status} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={value.status.includes(status)}
              onChange={() => toggleStatus(status)}
            />
            {LABELS[status]}
          </label>
        ))}
      </div>
      <label style={{ fontSize: 13 }}>
        Desde{" "}
        <input
          type="date"
          value={value.dateFrom}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
        />
      </label>
      <label style={{ fontSize: 13 }}>
        Hasta{" "}
        <input
          type="date"
          value={value.dateTo}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
        />
      </label>
    </div>
  );
}
