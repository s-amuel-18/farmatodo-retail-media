import type { CampaignStatus } from "@farmatodo-retail-media/types";
import type { FiltersBarValue } from "../../view-models/shared/filters";
import { Input } from "@/components/ui";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-vocabulary";

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
    <div className="mb-4 flex flex-wrap items-end gap-4 rounded-control border border-border bg-surface p-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {CAMPAIGN_STATUSES.map((status) => (
          <label key={status} className="flex items-center gap-1.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={value.status.includes(status)}
              onChange={() => toggleStatus(status)}
              className="h-4 w-4 accent-brand-blue-600"
            />
            {CAMPAIGN_STATUS_LABELS[status]}
          </label>
        ))}
      </div>
      <label className="text-sm text-text-muted">
        <span className="mb-1 block">Desde</span>
        <Input
          type="date"
          value={value.dateFrom}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          className="w-auto"
        />
      </label>
      <label className="text-sm text-text-muted">
        <span className="mb-1 block">Hasta</span>
        <Input
          type="date"
          value={value.dateTo}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          className="w-auto"
        />
      </label>
    </div>
  );
}
