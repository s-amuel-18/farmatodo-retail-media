import type { CampaignStatus } from "@farmatodo-retail-media/types";
import type { FiltersBarValue } from "../../view-models/shared/filters";
import { Input, ToggleChip } from "@/components/ui";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-vocabulary";
import { STATUS_TONES } from "./StatusBadge";

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
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">Estado</legend>
        <div className="flex flex-wrap gap-2">
          {CAMPAIGN_STATUSES.map((status) => (
            <ToggleChip
              key={status}
              tone={STATUS_TONES[status]}
              pressed={value.status.includes(status)}
              onClick={() => toggleStatus(status)}
            >
              {CAMPAIGN_STATUS_LABELS[status]}
            </ToggleChip>
          ))}
        </div>
      </fieldset>
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
