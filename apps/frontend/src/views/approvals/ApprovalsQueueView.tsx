"use client";

import { useState } from "react";
import Link from "next/link";
import type { Campaign } from "@farmatodo-retail-media/types";
import { StatusBadge } from "../shared/StatusBadge";
import { FiltersBar } from "../shared/FiltersBar";
import type { FiltersBarValue } from "../../view-models/shared/filters";
import { Pagination } from "../shared/Pagination";
import {
  Button,
  EmptyState,
  ErrorText,
  Field,
  LoadingState,
  Modal,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import { CHANNEL_LABELS } from "@/lib/campaign-vocabulary";

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
  onApprove: (campaignId: string) => Promise<unknown>;
  onReject: (campaignId: string, comment: string) => Promise<unknown>;
  decisionError: string | null;
  statusMessage: string | null;
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
  decisionError,
  statusMessage,
}: ApprovalsQueueViewProps) {
  const [rejecting, setRejecting] = useState<{ id: string; comment: string } | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-navy-900">Bandeja de aprobación</h1>

      <p role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </p>

      <FiltersBar value={filters} onChange={onFiltersChange} />

      {error ? <ErrorText>{error}</ErrorText> : null}
      {decisionError ? <ErrorText>{decisionError}</ErrorText> : null}
      {isLoading ? <LoadingState /> : null}
      {!isLoading && campaigns.length === 0 ? (
        <EmptyState message="No hay campañas con estos filtros." />
      ) : null}

      {campaigns.length > 0 ? (
        <div className="overflow-x-auto rounded-control border border-border bg-surface">
        <Table caption="Campañas pendientes de aprobación">
          <TableHead>
            <tr>
              <Th>Nombre</Th>
              <Th>Canal</Th>
              <Th>Costo total</Th>
              <Th>Estado</Th>
              <Th>
                <span className="sr-only">Acciones</span>
              </Th>
            </tr>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <Td>
                  <Link href={`/approvals/${campaign.id}`} className="font-medium text-brand-blue-700 hover:underline">
                    {campaign.name}
                  </Link>
                </Td>
                <Td>{CHANNEL_LABELS[campaign.channel]}</Td>
                <Td>${campaign.totalCostUsd.toFixed(2)}</Td>
                <Td>
                  <StatusBadge status={campaign.status} />
                </Td>
                <Td>
                  {campaign.status === "PENDING_APPROVAL" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          onApprove(campaign.id).catch(() => {});
                        }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setRejectError(null);
                          setRejecting({ id: campaign.id, comment: "" });
                        }}
                      >
                        Rechazar
                      </Button>
                    </div>
                  ) : null}
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      ) : null}

      <Pagination {...pagination} />

      {rejecting ? (
        <Modal title="Motivo del rechazo" onClose={() => setRejecting(null)}>
          <Field label="Comentario de rechazo" required>
            <Textarea
              value={rejecting.comment}
              onChange={(e) => setRejecting({ ...rejecting, comment: e.target.value })}
              rows={4}
              className="mb-3"
              placeholder="Este comentario es obligatorio y lo verá el analista"
            />
          </Field>
          {rejectError ? <ErrorText>{rejectError}</ErrorText> : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={!rejecting.comment.trim()}
              onClick={() => {
                onReject(rejecting.id, rejecting.comment.trim())
                  .then(() => setRejecting(null))
                  .catch((err) => setRejectError(err instanceof Error ? err.message : "No se pudo rechazar la campaña."));
              }}
            >
              Confirmar rechazo
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
