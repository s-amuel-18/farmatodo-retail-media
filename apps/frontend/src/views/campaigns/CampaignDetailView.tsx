"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Campaign, HistoryEntry } from "@farmatodo-retail-media/types";
import { StatusBadge } from "../shared/StatusBadge";
import { Button, ErrorText, LoadingState, Textarea } from "@/components/ui";
import { CHANNEL_LABELS, HISTORY_ACTION_LABELS, PETALO_ZONE_LABELS } from "@/lib/campaign-vocabulary";

function channelDetails(campaign: Campaign): Array<[string, string]> {
  switch (campaign.channel) {
    case "PETALO":
      return [
        ["Tiendas", campaign.stores.join(", ")],
        ["Cantidad", String(campaign.quantity)],
        ["Zona", PETALO_ZONE_LABELS[campaign.zone]],
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

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-navy-900">{campaign.name}</h1>
        <StatusBadge status={campaign.status} />
      </div>

      {campaign.status === "REJECTED" && campaign.currentApprovalComment ? (
        <ErrorText>Motivo del rechazo: {campaign.currentApprovalComment}</ErrorText>
      ) : null}

      <Section title="Datos generales">
        <Row label="Canal" value={CHANNEL_LABELS[campaign.channel]} />
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
          <p className="text-sm text-text-muted">Sin transiciones registradas todavía.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((entry) => (
              <li key={entry.id} className="border-l-2 border-navy-100 pl-3">
                <strong className="text-ink">{HISTORY_ACTION_LABELS[entry.action]}</strong>
                {" — "}
                {new Date(entry.occurredAt).toLocaleString()}
                {entry.comment ? <div className="text-danger-600">Comentario: {entry.comment}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {approverActions && campaign.status === "PENDING_APPROVAL" ? (
        <Section title="Decisión">
          <div className="mb-2 flex gap-2">
            <Button variant="primary" onClick={approverActions.onApprove}>
              Aprobar
            </Button>
            <Button variant="secondary" onClick={() => setIsRejecting(true)}>
              Rechazar
            </Button>
          </div>
          {isRejecting ? (
            <div>
              <Textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={3}
                className="mb-2"
                placeholder="Comentario obligatorio para el analista"
              />
              <Button
                variant="danger"
                disabled={!rejectComment.trim()}
                onClick={() => {
                  approverActions.onReject(rejectComment.trim());
                  setIsRejecting(false);
                }}
              >
                Confirmar rechazo
              </Button>
            </div>
          ) : null}
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-border py-1.5 last:border-0">
      <span className="w-44 shrink-0 text-sm text-text-muted">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}
