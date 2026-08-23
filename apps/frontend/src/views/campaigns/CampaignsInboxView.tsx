import Link from "next/link";
import type { Campaign } from "@farmatodo-retail-media/types";
import { StatusBadge } from "../shared/StatusBadge";
import { FiltersBar } from "../shared/FiltersBar";
import type { FiltersBarValue } from "../../view-models/shared/filters";
import { Pagination } from "../shared/Pagination";

interface CampaignsInboxViewProps {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  filters: FiltersBarValue;
  onFiltersChange: (value: FiltersBarValue) => void;
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onNext: () => void;
    onPrev: () => void;
  };
  onSubmit: (campaignId: string) => void;
}

const EDITABLE_STATUSES = new Set(["DRAFT", "REJECTED"]);

export function CampaignsInboxView({
  campaigns,
  isLoading,
  error,
  filters,
  onFiltersChange,
  pagination,
  onSubmit,
}: CampaignsInboxViewProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>Mis campañas</h1>
        <Link href="/campaigns/new">
          <button>+ Nueva campaña</button>
        </Link>
      </div>

      <FiltersBar value={filters} onChange={onFiltersChange} />

      {error ? <p style={{ color: "#c0392b" }}>{error}</p> : null}
      {isLoading ? <p>Cargando...</p> : null}

      {!isLoading && campaigns.length === 0 ? <p>No hay campañas con estos filtros.</p> : null}

      {campaigns.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: 8 }}>Nombre</th>
              <th style={{ padding: 8 }}>Canal</th>
              <th style={{ padding: 8 }}>Costo total</th>
              <th style={{ padding: 8 }}>Estado</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>
                  <Link href={`/campaigns/${campaign.id}`}>{campaign.name}</Link>
                  {campaign.status === "REJECTED" && campaign.currentApprovalComment ? (
                    <p style={{ color: "#c0392b", fontSize: 12, margin: "4px 0 0" }}>
                      Rechazada: {campaign.currentApprovalComment}
                    </p>
                  ) : null}
                </td>
                <td style={{ padding: 8 }}>{campaign.channel}</td>
                <td style={{ padding: 8 }}>${campaign.totalCostUsd.toFixed(2)}</td>
                <td style={{ padding: 8 }}>
                  <StatusBadge status={campaign.status} />
                </td>
                <td style={{ padding: 8, display: "flex", gap: 8 }}>
                  {EDITABLE_STATUSES.has(campaign.status) ? (
                    <>
                      <Link href={`/campaigns/${campaign.id}/edit`}>Editar</Link>
                      <button onClick={() => onSubmit(campaign.id)}>Enviar a aprobación</button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <Pagination {...pagination} />
    </div>
  );
}
