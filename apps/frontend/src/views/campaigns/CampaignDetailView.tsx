"use client";

import { useState } from "react";
import Link from "next/link";
import type { Campaign, HistoryEntry, MediaCost } from "@farmatodo-retail-media/types";
import { StatusBadge } from "../shared/StatusBadge";
import { Button, ErrorText, Field, LoadingState, Modal, Section, Textarea } from "@/components/ui";
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

/**
 * "Desglose de costos por medio": each campaign has a single channel, so the
 * breakdown is the one media-cost line (unit cost x quantity, or a flat fee
 * for SMS/TIKTOK) that the backend used to derive `totalCostUsd`.
 */
function costBreakdown(campaign: Campaign, mediaCosts: MediaCost[]): Array<[string, string]> {
  const mediaCost = mediaCosts.find(
    (m) => m.supplierId === campaign.supplierId && m.channel === campaign.channel,
  );
  if (!mediaCost) return [["Costo total", `$${campaign.totalCostUsd.toFixed(2)}`]];

  const isUnitBased = campaign.channel === "PETALO" || campaign.channel === "PARRILLERA";
  const rows: Array<[string, string]> = [
    ["Costo unitario (proveedor x medio)", `$${mediaCost.unitCostUsd.toFixed(2)}`],
  ];
  if (isUnitBased) rows.push(["Cantidad contratada", String(campaign.quantity)]);
  rows.push(["Costo total", `$${campaign.totalCostUsd.toFixed(2)}`]);
  return rows;
}

interface CampaignDetailViewProps {
  campaign: Campaign;
  history: HistoryEntry[];
  mediaCosts: MediaCost[];
  isLoading: boolean;
  error: string | null;
  backHref: string;
  supplierLabel: string;
  brandLabels: string;
  approverActions?: {
    onApprove: () => Promise<unknown>;
    onReject: (comment: string) => Promise<unknown>;
    isDeciding: boolean;
  };
  decisionError?: string | null;
  statusMessage?: string | null;
}

export function CampaignDetailView({
  campaign,
  history,
  mediaCosts,
  isLoading,
  error,
  backHref,
  supplierLabel,
  brandLabels,
  approverActions,
  decisionError,
  statusMessage,
}: CampaignDetailViewProps) {
  const [rejectComment, setRejectComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [isConfirmingApprove, setIsConfirmingApprove] = useState(false);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <div className="max-w-2xl">
      <Link href={backHref} className="mb-3 inline-block text-sm text-brand-blue-700 hover:underline">
        ← Volver
      </Link>
      <p role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </p>

      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-navy-900">{campaign.name}</h1>
        <StatusBadge status={campaign.status} />
      </div>

      {campaign.status === "REJECTED" && campaign.currentApprovalComment ? (
        <div className="mb-4 rounded-control border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-sm text-status-rejected-fg">
          <p className="font-semibold">Motivo del rechazo</p>
          <p className="mt-1">{campaign.currentApprovalComment}</p>
          {!approverActions ? (
            <p className="mt-2 text-status-rejected-fg/80">
              Edita la campaña y vuelve a enviarla para aprobación cuando esté lista.
            </p>
          ) : null}
        </div>
      ) : null}
      {decisionError ? <ErrorText>{decisionError}</ErrorText> : null}

      <Section title="Datos generales">
        <Row label="Canal" value={CHANNEL_LABELS[campaign.channel]} />
        <Row label="Proveedor" value={supplierLabel} />
        <Row label="Marcas" value={brandLabels} />
        <Row label="Productos (SKU)" value={campaign.productSkus.join(", ")} />
        <Row label="Fecha de la campaña" value={campaign.campaignDate} />
        <Row label="Fecha inicio" value={campaign.startDate} />
        <Row label="Fecha fin" value={campaign.endDate} />
      </Section>

      <Section title="Detalles del canal">
        {channelDetails(campaign).map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </Section>

      <Section title="Desglose de costos">
        {costBreakdown(campaign, mediaCosts).map(([label, value]) => (
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
                {entry.comment ? (
                  <div className={entry.action === "REJECTED" ? "text-status-rejected-fg" : "text-text-muted"}>
                    Comentario: {entry.comment}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {approverActions && campaign.status === "PENDING_APPROVAL" ? (
        <Section title="Decisión">
          <div className="mb-2 flex gap-2">
            <Button
              variant="primary"
              disabled={approverActions.isDeciding}
              onClick={() => setIsConfirmingApprove(true)}
            >
              {approverActions.isDeciding ? "Procesando..." : "Aprobar"}
            </Button>
            <Button
              variant="secondary"
              aria-expanded={isRejecting}
              aria-controls="reject-comment-panel"
              disabled={approverActions.isDeciding}
              onClick={() => {
                setRejectError(null);
                setIsRejecting(true);
              }}
            >
              Rechazar
            </Button>
          </div>
          {isRejecting ? (
            <div id="reject-comment-panel">
              <Field label="Comentario de rechazo" required>
                <Textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  rows={3}
                  className="mb-2"
                  placeholder="Comentario obligatorio para el analista"
                />
              </Field>
              {rejectError ? <ErrorText>{rejectError}</ErrorText> : null}
              <Button
                variant="danger"
                disabled={!rejectComment.trim()}
                onClick={() => {
                  approverActions
                    .onReject(rejectComment.trim())
                    .then(() => setIsRejecting(false))
                    .catch((err) =>
                      setRejectError(err instanceof Error ? err.message : "No se pudo rechazar la campaña."),
                    );
                }}
              >
                Confirmar rechazo
              </Button>
            </div>
          ) : null}
        </Section>
      ) : null}

      {isConfirmingApprove && approverActions ? (
        <Modal title="Confirmar aprobación" onClose={() => setIsConfirmingApprove(false)}>
          <p className="mb-4 text-sm text-ink">
            Vas a aprobar <strong>{campaign.name}</strong>. Esta decisión es definitiva y no se puede deshacer
            desde la plataforma.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsConfirmingApprove(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                approverActions.onApprove().catch(() => {});
                setIsConfirmingApprove(false);
              }}
            >
              Confirmar aprobación
            </Button>
          </div>
        </Modal>
      ) : null}
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
