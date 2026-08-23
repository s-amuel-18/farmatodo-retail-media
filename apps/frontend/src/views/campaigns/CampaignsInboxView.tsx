import Link from "next/link";
import type { Campaign } from "@farmatodo-retail-media/types";
import { StatusBadge } from "../shared/StatusBadge";
import { FiltersBar } from "../shared/FiltersBar";
import type { FiltersBarValue } from "../../view-models/shared/filters";
import { Pagination } from "../shared/Pagination";
import { Button, EmptyState, ErrorText, LoadingState, Table, TableBody, TableHead, TableRow, Td, Th } from "@/components/ui";
import { CHANNEL_LABELS, EDITABLE_CAMPAIGN_STATUSES } from "@/lib/campaign-vocabulary";

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
  pendingCampaignId: string | null;
}

export function CampaignsInboxView({
  campaigns,
  isLoading,
  error,
  filters,
  onFiltersChange,
  pagination,
  onSubmit,
  pendingCampaignId,
}: CampaignsInboxViewProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-navy-900">Mis campañas</h1>
        <Link href="/campaigns/new">
          <Button variant="primary">+ Nueva campaña</Button>
        </Link>
      </div>

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
                  <Link href={`/campaigns/${campaign.id}`} className="font-medium text-brand-blue-700 hover:underline">
                    {campaign.name}
                  </Link>
                  {campaign.status === "REJECTED" && campaign.currentApprovalComment ? (
                    <p className="mt-1 text-xs font-medium text-status-rejected-fg">
                      Rechazada: {campaign.currentApprovalComment}
                    </p>
                  ) : null}
                </Td>
                <Td>{CHANNEL_LABELS[campaign.channel]}</Td>
                <Td>${campaign.totalCostUsd.toFixed(2)}</Td>
                <Td>
                  <StatusBadge status={campaign.status} />
                </Td>
                <Td>
                  {EDITABLE_CAMPAIGN_STATUSES.has(campaign.status) ? (
                    <div className="flex gap-3">
                      <Link href={`/campaigns/${campaign.id}/edit`} className="text-sm text-brand-blue-700 hover:underline">
                        Editar
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pendingCampaignId === campaign.id}
                        onClick={() => onSubmit(campaign.id)}
                        className="h-auto p-0 font-medium text-brand-blue-700 hover:bg-transparent hover:underline disabled:bg-transparent"
                      >
                        {pendingCampaignId === campaign.id ? "Enviando..." : "Enviar a aprobación"}
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
    </div>
  );
}
