"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Campaign, HistoryEntry } from "@farmatodo-retail-media/types";
import { StatusBadge } from "../shared/StatusBadge";

const HISTORY_LABELS: Record<HistoryEntry["action"], string> = {
  SUBMITTED: "Enviada a aprobación",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

function channelDetails(campaign: Campaign): Array<[string, string]> {
  switch (campaign.channel) {
    case "PETALO":
      return [
        ["Tiendas", campaign.stores.join(", ")],
        ["Cantidad", String(campaign.quantity)],
        ["Zona", campaign.zone],
      ];
    case "PARRILLERA":
      return [
        ["Tiendas", campaign.stores.join(", ")],
        ["Cantidad", String(campaign.quantity)],
        ["Niveles", String(campaign.levels)],
        ["Categoría", campaign.category],
      ];
    case "SMS":
      return [
        ["Segmento", campaign.segment],
        ["Audiencia estimada", String(campaign.estimatedAudience)],
        ["Plantilla", campaign.template],
        ["Ventana de envío", `${campaign.sendWindow.from} - ${campaign.sendWindow.to}`],
      ];
    case "TIKTOK":
      return [
        ["Cuenta publicitaria", campaign.adAccount],
        ["Objetivo", campaign.objective],
        ["Creativos", campaign.creatives.join(", ")],
        ["Presupuesto diario", `$${campaign.dailyBudgetUsd.toFixed(2)}`],
      ];
  }
}

interface CampaignDetailViewProps {
  campaign: Campaign;
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  approverActions?: {
    onApprove: () => void;
    onReject: (comment: string) => void;
  };
}

export function CampaignDetailView({
  campaign,
  history,
  isLoading,
  error,
  approverActions,
}: CampaignDetailViewProps) {
  const [rejectComment, setRejectComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "#c0392b" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>{campaign.name}</h1>
        <StatusBadge status={campaign.status} />
      </div>

      {campaign.status === "REJECTED" && campaign.currentApprovalComment ? (
        <p style={{ color: "#c0392b", marginBottom: 16 }}>
          Motivo del rechazo: {campaign.currentApprovalComment}
        </p>
      ) : null}

      <Section title="Datos generales">
        <Row label="Canal" value={campaign.channel} />
        <Row label="Proveedor" value={campaign.supplierId} />
        <Row label="Marcas" value={campaign.brandIds.join(", ")} />
        <Row label="Productos (SKU)" value={campaign.productSkus.join(", ")} />
        <Row label="Fecha inicio" value={campaign.startDate} />
        <Row label="Fecha fin" value={campaign.endDate} />
        <Row label="Costo total" value={`$${campaign.totalCostUsd.toFixed(2)}`} />
      </Section>

      <Section title="Detalles del canal">
        {channelDetails(campaign).map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </Section>

      <Section title="Historial">
        {history.length === 0 ? (
          <p style={{ fontSize: 13, color: "#666" }}>Sin transiciones registradas todavía.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, fontSize: 13 }}>
            {history.map((entry) => (
              <li key={entry.id} style={{ marginBottom: 8, borderLeft: "2px solid #ddd", paddingLeft: 8 }}>
                <strong>{HISTORY_LABELS[entry.action]}</strong> — {new Date(entry.occurredAt).toLocaleString()}
                {entry.comment ? <div style={{ color: "#c0392b" }}>Comentario: {entry.comment}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {approverActions && campaign.status === "PENDING_APPROVAL" ? (
        <Section title="Decisión">
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={approverActions.onApprove}>Aprobar</button>
            <button onClick={() => setIsRejecting(true)}>Rechazar</button>
          </div>
          {isRejecting ? (
            <div>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={3}
                style={{ width: "100%", marginBottom: 8 }}
                placeholder="Comentario obligatorio para el analista"
              />
              <button
                disabled={!rejectComment.trim()}
                onClick={() => {
                  approverActions.onReject(rejectComment.trim());
                  setIsRejecting(false);
                }}
              >
                Confirmar rechazo
              </button>
            </div>
          ) : null}
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 14, color: "#666", marginBottom: 8, textTransform: "uppercase" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ width: 180, color: "#555", fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}
