"use client";

import { useState } from "react";
import Link from "next/link";
import type { Campaign } from "@farmatodo-retail-media/types";
import { StatusBadge } from "../shared/StatusBadge";
import { FiltersBar, type FiltersBarValue } from "../shared/FiltersBar";
import { Pagination } from "../shared/Pagination";

interface ApprovalsQueueViewProps {
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
  onApprove: (campaignId: string) => void;
  onReject: (campaignId: string, comment: string) => void;
}

export function ApprovalsQueueView({
  campaigns,
  isLoading,
  error,
  filters,
  onFiltersChange,
  pagination,
  onApprove,
  onReject,
}: ApprovalsQueueViewProps) {
  const [rejecting, setRejecting] = useState<{ id: string; comment: string } | null>(null);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Bandeja de aprobación</h1>

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
                  <Link href={`/approvals/${campaign.id}`}>{campaign.name}</Link>
                </td>
                <td style={{ padding: 8 }}>{campaign.channel}</td>
                <td style={{ padding: 8 }}>${campaign.totalCostUsd.toFixed(2)}</td>
                <td style={{ padding: 8 }}>
                  <StatusBadge status={campaign.status} />
                </td>
                <td style={{ padding: 8, display: "flex", gap: 8 }}>
                  {campaign.status === "PENDING_APPROVAL" ? (
                    <>
                      <button onClick={() => onApprove(campaign.id)}>Aprobar</button>
                      <button onClick={() => setRejecting({ id: campaign.id, comment: "" })}>
                        Rechazar
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <Pagination {...pagination} />

      {rejecting ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 360 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Motivo del rechazo</h2>
            <textarea
              value={rejecting.comment}
              onChange={(e) => setRejecting({ ...rejecting, comment: e.target.value })}
              rows={4}
              style={{ width: "100%", marginBottom: 12 }}
              placeholder="Este comentario es obligatorio y lo verá el analista"
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setRejecting(null)}>Cancelar</button>
              <button
                disabled={!rejecting.comment.trim()}
                onClick={() => {
                  onReject(rejecting.id, rejecting.comment.trim());
                  setRejecting(null);
                }}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
