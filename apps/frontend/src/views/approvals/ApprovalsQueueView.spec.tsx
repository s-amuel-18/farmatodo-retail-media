import type { ComponentProps } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Campaign, PetaloCampaign, Supplier } from "@farmatodo-retail-media/types";
import { ApprovalsQueueView } from "./ApprovalsQueueView";
import type { FiltersBarValue } from "../../view-models/shared/filters";

function makePetaloCampaign(overrides: Partial<PetaloCampaign> = {}): PetaloCampaign {
  return {
    id: "camp-1",
    name: "Campaña Verano",
    brandIds: ["brand-1"],
    productSkus: ["sku-1"],
    supplierId: "supplier-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    campaignDate: "2026-01-01",
    createdAt: "2025-12-15T00:00:00.000Z",
    updatedAt: "2025-12-15T00:00:00.000Z",
    createdBy: "analyst@example.com",
    status: "PENDING_APPROVAL",
    totalCostUsd: 1234.5,
    channel: "PETALO",
    stores: ["store-1", "store-2"],
    quantity: 10,
    zone: "ENTRADA",
    ...overrides,
  };
}

function baseFilters(): FiltersBarValue {
  return { status: [], dateFrom: "", dateTo: "" };
}

function basePagination(overrides: Partial<ApprovalsQueueViewProps["pagination"]> = {}) {
  return {
    hasNextPage: true,
    hasPrevPage: true,
    onNext: jest.fn(),
    onPrev: jest.fn(),
    ...overrides,
  };
}

type ApprovalsQueueViewProps = ComponentProps<typeof ApprovalsQueueView>;

function baseProps(overrides: Partial<ApprovalsQueueViewProps> = {}): ApprovalsQueueViewProps {
  return {
    campaigns: [],
    suppliers: [] as Supplier[],
    isLoading: false,
    error: null,
    filters: baseFilters(),
    onFiltersChange: jest.fn(),
    pagination: basePagination(),
    onApprove: jest.fn().mockResolvedValue(undefined),
    onReject: jest.fn().mockResolvedValue(undefined),
    decisionError: null,
    statusMessage: null,
    pendingCampaignId: null,
    ...overrides,
  };
}

describe("ApprovalsQueueView", () => {
  it("renders LoadingState and hides the table while loading with no campaigns", () => {
    render(<ApprovalsQueueView {...baseProps({ isLoading: true, campaigns: [] })} />);

    const statuses = screen.getAllByRole("status");
    expect(statuses.some((el) => el.textContent === "Cargando...")).toBe(true);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    // Loading takes priority over the empty state message too.
    expect(screen.queryByText("No hay campañas con estos filtros.")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no campaigns and it is not loading", () => {
    render(<ApprovalsQueueView {...baseProps({ campaigns: [] })} />);

    expect(screen.getByText("No hay campañas con estos filtros.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders the error prop via ErrorText with role alert", () => {
    render(<ApprovalsQueueView {...baseProps({ error: "No se pudieron cargar las campañas." })} />);

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudieron cargar las campañas.");
  });

  it("renders the decisionError prop via ErrorText with role alert", () => {
    render(<ApprovalsQueueView {...baseProps({ decisionError: "No se pudo procesar la decisión." })} />);

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo procesar la decisión.");
  });

  it("renders the sr-only statusMessage live region", () => {
    render(<ApprovalsQueueView {...baseProps({ statusMessage: "Campaña aprobada." })} />);

    const statuses = screen.getAllByRole("status");
    expect(statuses.some((el) => el.textContent === "Campaña aprobada.")).toBe(true);
  });

  it("passes hasNextPage/hasPrevPage through to Pagination", () => {
    render(
      <ApprovalsQueueView
        {...baseProps({ pagination: basePagination({ hasNextPage: false, hasPrevPage: true }) })}
      />,
    );

    expect(screen.getByRole("button", { name: /Anterior/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Siguiente/ })).toBeDisabled();
  });

  describe("populated table", () => {
    const pending = makePetaloCampaign({ id: "camp-pending", name: "Campaña Pendiente", status: "PENDING_APPROVAL", totalCostUsd: 999.999 });
    const approved = makePetaloCampaign({ id: "camp-approved", name: "Campaña Aprobada", status: "APPROVED", totalCostUsd: 500 });
    const campaigns: Campaign[] = [pending, approved];

    it("shows name as a link, channel label, formatted cost, and status badge per row", () => {
      render(<ApprovalsQueueView {...baseProps({ campaigns })} />);

      const pendingLink = screen.getByRole("link", { name: "Campaña Pendiente" });
      expect(pendingLink).toHaveAttribute("href", "/approvals/camp-pending");

      const approvedLink = screen.getByRole("link", { name: "Campaña Aprobada" });
      expect(approvedLink).toHaveAttribute("href", "/approvals/camp-approved");

      const rows = screen.getAllByRole("row");
      // rows[0] is the header row
      const pendingRow = rows[1]!;
      expect(within(pendingRow).getByText("Pétalo")).toBeInTheDocument();
      expect(within(pendingRow).getByText("$1000.00")).toBeInTheDocument();
      expect(within(pendingRow).getByText("Pendiente")).toBeInTheDocument();

      const approvedRow = rows[2]!;
      expect(within(approvedRow).getByText("$500.00")).toBeInTheDocument();
      expect(within(approvedRow).getByText("Aprobada")).toBeInTheDocument();
    });

    it("shows Aprobar/Rechazar only for PENDING_APPROVAL rows", () => {
      render(<ApprovalsQueueView {...baseProps({ campaigns })} />);

      const rows = screen.getAllByRole("row");
      const pendingRow = rows[1]!;
      const approvedRow = rows[2]!;

      expect(within(pendingRow).getByRole("button", { name: "Aprobar" })).toBeInTheDocument();
      expect(within(pendingRow).getByRole("button", { name: "Rechazar" })).toBeInTheDocument();

      expect(within(approvedRow).queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument();
      expect(within(approvedRow).queryByRole("button", { name: "Rechazar" })).not.toBeInTheDocument();
    });

    it("disables both action buttons and relabels Aprobar to Aprobando... when pendingCampaignId matches the row", () => {
      render(<ApprovalsQueueView {...baseProps({ campaigns, pendingCampaignId: pending.id })} />);

      const rows = screen.getAllByRole("row");
      const pendingRow = rows[1]!;

      const approvingButton = within(pendingRow).getByRole("button", { name: "Aprobando..." });
      expect(approvingButton).toBeDisabled();
      expect(within(pendingRow).getByRole("button", { name: "Rechazar" })).toBeDisabled();
    });
  });

  describe("approve flow", () => {
    const pending = makePetaloCampaign({ id: "camp-pending", name: "Campaña Pendiente" });

    it("opens a confirmation modal naming the campaign when Aprobar is clicked", async () => {
      const user = userEvent.setup();
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending] })} />);

      await user.click(screen.getByRole("button", { name: "Aprobar" }));

      const dialog = screen.getByRole("dialog", { name: "Confirmar aprobación" });
      expect(within(dialog).getByText("Campaña Pendiente")).toBeInTheDocument();
    });

    it("calls onApprove with the campaign id and closes the modal when confirmed", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn().mockResolvedValue(undefined);
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending], onApprove })} />);

      await user.click(screen.getByRole("button", { name: "Aprobar" }));
      const dialog = screen.getByRole("dialog", { name: "Confirmar aprobación" });

      await user.click(within(dialog).getByRole("button", { name: "Confirmar aprobación" }));

      expect(onApprove).toHaveBeenCalledWith("camp-pending");
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("closes the modal without calling onApprove when Cancelar is clicked", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn();
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending], onApprove })} />);

      await user.click(screen.getByRole("button", { name: "Aprobar" }));
      const dialog = screen.getByRole("dialog", { name: "Confirmar aprobación" });
      await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

      expect(onApprove).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("reject flow", () => {
    const pending = makePetaloCampaign({ id: "camp-pending", name: "Campaña Pendiente" });

    it("opens a modal with a required textarea and a disabled confirm button until text is entered", async () => {
      const user = userEvent.setup();
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending] })} />);

      await user.click(screen.getByRole("button", { name: "Rechazar" }));

      const dialog = screen.getByRole("dialog", { name: "Motivo del rechazo" });
      const textarea = within(dialog).getByLabelText(/Comentario de rechazo/);
      expect(textarea).toBeRequired();

      const confirmButton = within(dialog).getByRole("button", { name: "Confirmar rechazo" });
      expect(confirmButton).toBeDisabled();

      await user.type(textarea, "No cumple con las políticas");
      expect(confirmButton).toBeEnabled();
    });

    it("keeps the confirm button disabled for whitespace-only text", async () => {
      const user = userEvent.setup();
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending] })} />);

      await user.click(screen.getByRole("button", { name: "Rechazar" }));
      const dialog = screen.getByRole("dialog", { name: "Motivo del rechazo" });
      const textarea = within(dialog).getByLabelText(/Comentario de rechazo/);
      await user.type(textarea, "   ");

      expect(within(dialog).getByRole("button", { name: "Confirmar rechazo" })).toBeDisabled();
    });

    it("calls onReject with the campaign id and trimmed comment, and closes the modal on success", async () => {
      const user = userEvent.setup();
      const onReject = jest.fn().mockResolvedValue(undefined);
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending], onReject })} />);

      await user.click(screen.getByRole("button", { name: "Rechazar" }));
      const dialog = screen.getByRole("dialog", { name: "Motivo del rechazo" });
      const textarea = within(dialog).getByLabelText(/Comentario de rechazo/);
      await user.type(textarea, "  No cumple con las políticas  ");

      await user.click(within(dialog).getByRole("button", { name: "Confirmar rechazo" }));

      expect(onReject).toHaveBeenCalledWith("camp-pending", "No cumple con las políticas");
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("keeps the modal open and shows the error message when onReject rejects", async () => {
      const user = userEvent.setup();
      const onReject = jest.fn().mockRejectedValue(new Error("boom"));
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending], onReject })} />);

      await user.click(screen.getByRole("button", { name: "Rechazar" }));
      const dialog = screen.getByRole("dialog", { name: "Motivo del rechazo" });
      const textarea = within(dialog).getByLabelText(/Comentario de rechazo/);
      await user.type(textarea, "Comentario de prueba");

      await user.click(within(dialog).getByRole("button", { name: "Confirmar rechazo" }));

      const stillOpenDialog = screen.getByRole("dialog", { name: "Motivo del rechazo" });
      expect(await within(stillOpenDialog).findByRole("alert")).toHaveTextContent("boom");
    });

    it("closes the modal without calling onReject when Cancelar is clicked", async () => {
      const user = userEvent.setup();
      const onReject = jest.fn();
      render(<ApprovalsQueueView {...baseProps({ campaigns: [pending], onReject })} />);

      await user.click(screen.getByRole("button", { name: "Rechazar" }));
      const dialog = screen.getByRole("dialog", { name: "Motivo del rechazo" });
      await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

      expect(onReject).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
