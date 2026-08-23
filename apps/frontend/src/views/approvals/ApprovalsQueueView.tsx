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
  onApprove: (campaignId: string) => void;
  onReject: (campaignId: string, comment: string) => void;
  pendingCampaignId: string | null;
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
  pendingCampaignId,
}: ApprovalsQueueViewProps) {
  const [rejecting, setRejecting] = useState<{ id: string; comment: string } | null>(null);
  const [approving, setApproving] = useState<{ id: string; name: string } | null>(null);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-navy-900">Bandeja de aprobación</h1>

      <FiltersBar value={filters} onChange={onFiltersChange} />

      {error ? <ErrorText>{error}</ErrorText> : null}
      {isLoading ? <LoadingState /> : null}
      {!isLoading && campaigns.length === 0 ? (
        <EmptyState message="No hay campañas con estos filtros." />
      ) : null}

      {campaigns.length > 0 ? (
        <div className="overflow-x-auto rounded-control border border-border bg-surface">
        <Table>
          <TableHead>
            <tr>
              <Th>Nombre</Th>
              <Th>Canal</Th>
              <Th>Costo total</Th>
              <Th>Estado</Th>
              <Th />
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
                        disabled={pendingCampaignId === campaign.id}
                        onClick={() => setApproving({ id: campaign.id, name: campaign.name })}
                      >
                        {pendingCampaignId === campaign.id ? "Aprobando..." : "Aprobar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pendingCampaignId === campaign.id}
                        onClick={() => setRejecting({ id: campaign.id, comment: "" })}
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
          <Textarea
            value={rejecting.comment}
            onChange={(e) => setRejecting({ ...rejecting, comment: e.target.value })}
            rows={4}
            className="mb-3"
            placeholder="Este comentario es obligatorio y lo verá el analista"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={!rejecting.comment.trim()}
              onClick={() => {
                onReject(rejecting.id, rejecting.comment.trim());
                setRejecting(null);
              }}
            >
              Confirmar rechazo
            </Button>
          </div>
        </Modal>
      ) : null}

      {approving ? (
        <Modal title="Confirmar aprobación" onClose={() => setApproving(null)}>
          <p className="mb-4 text-sm text-ink">
            Vas a aprobar <strong>{approving.name}</strong>. Esta decisión es definitiva y no se puede deshacer
            desde la plataforma.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setApproving(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onApprove(approving.id);
                setApproving(null);
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
