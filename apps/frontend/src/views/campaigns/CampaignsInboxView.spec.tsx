import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Campaign, PetaloCampaign } from "@farmatodo-retail-media/types";
import { CampaignsInboxView } from "./CampaignsInboxView";

function makeCampaign(overrides: Partial<PetaloCampaign> = {}): PetaloCampaign {
  return {
    id: "camp-1",
    name: "Campaña Pétalo",
    brandIds: ["brand-1"],
    productSkus: ["sku-1"],
    supplierId: "supplier-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "user-1",
    status: "DRAFT",
    totalCostUsd: 123.456,
    channel: "PETALO",
    stores: ["Store 1"],
    quantity: 2,
    zone: "ENTRADA",
    ...overrides,
  };
}

const noopPagination = {
  hasNextPage: false,
  hasPrevPage: false,
  onNext: jest.fn(),
  onPrev: jest.fn(),
};

const baseProps = {
  campaigns: [] as Campaign[],
  isLoading: false,
  error: null as string | null,
  filters: { status: [], dateFrom: "", dateTo: "" },
  onFiltersChange: jest.fn(),
  pagination: noopPagination,
  onSubmit: jest.fn().mockResolvedValue(undefined),
  submitError: null as string | null,
  statusMessage: null as string | null,
  pendingCampaignId: null as string | null,
};

describe("CampaignsInboxView", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders a link to create a new campaign", () => {
    render(<CampaignsInboxView {...baseProps} />);
    const link = screen.getByRole("link", { name: /Nueva campaña/i });
    expect(link).toHaveAttribute("href", "/campaigns/new");
  });

  it("shows the loading state", () => {
    render(<CampaignsInboxView {...baseProps} isLoading />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("shows the empty state when there are no campaigns and it's not loading", () => {
    render(<CampaignsInboxView {...baseProps} />);
    expect(screen.getByText("No hay campañas con estos filtros.")).toBeInTheDocument();
  });

  it("renders the error and submitError messages independently", () => {
    render(<CampaignsInboxView {...baseProps} error="Error de carga" submitError="Error de envío" />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts.map((a) => a.textContent)).toEqual(
      expect.arrayContaining(["Error de carga", "Error de envío"]),
    );
  });

  it("renders campaign rows with name link, channel, formatted cost and status", () => {
    const campaign = makeCampaign({ id: "camp-42", name: "Mi campaña", totalCostUsd: 99.5, status: "DRAFT" });
    render(<CampaignsInboxView {...baseProps} campaigns={[campaign]} />);

    const nameLink = screen.getByRole("link", { name: "Mi campaña" });
    expect(nameLink).toHaveAttribute("href", "/campaigns/camp-42");
    const table = within(screen.getByRole("table"));
    expect(table.getByText("Pétalo")).toBeInTheDocument();
    expect(table.getByText("$99.50")).toBeInTheDocument();
    expect(table.getByText("Borrador")).toBeInTheDocument();
  });

  it("shows the rejection comment for REJECTED campaigns that have one", () => {
    const campaign = makeCampaign({ status: "REJECTED", currentApprovalComment: "Falta información" });
    render(<CampaignsInboxView {...baseProps} campaigns={[campaign]} />);
    expect(screen.getByText("Rechazada: Falta información")).toBeInTheDocument();
  });

  it("does not show a rejection note for REJECTED campaigns without a comment", () => {
    const campaign = makeCampaign({ status: "REJECTED" });
    render(<CampaignsInboxView {...baseProps} campaigns={[campaign]} />);
    expect(screen.queryByText(/^Rechazada:/)).not.toBeInTheDocument();
  });

  it.each(["DRAFT", "REJECTED"] as const)(
    "shows Editar and Enviar a aprobación actions for editable status %s",
    (status) => {
      const campaign = makeCampaign({ status });
      render(<CampaignsInboxView {...baseProps} campaigns={[campaign]} />);
      expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute(
        "href",
        `/campaigns/${campaign.id}/edit`,
      );
      expect(screen.getByRole("button", { name: "Enviar a aprobación" })).toBeInTheDocument();
    },
  );

  it.each(["PENDING_APPROVAL", "APPROVED"] as const)(
    "hides actions for non-editable status %s",
    (status) => {
      const campaign = makeCampaign({ status });
      render(<CampaignsInboxView {...baseProps} campaigns={[campaign]} />);
      expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Enviar a aprobación/ })).not.toBeInTheDocument();
    },
  );

  it("calls onSubmit with the campaign id when clicking Enviar a aprobación", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const campaign = makeCampaign({ id: "camp-77", status: "DRAFT" });
    render(<CampaignsInboxView {...baseProps} campaigns={[campaign]} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Enviar a aprobación" }));
    expect(onSubmit).toHaveBeenCalledWith("camp-77");
  });

  it("disables the submit action and shows a pending label for the pending campaign only", () => {
    const campaigns = [
      makeCampaign({ id: "camp-1", name: "Uno", status: "DRAFT" }),
      makeCampaign({ id: "camp-2", name: "Dos", status: "DRAFT" }),
    ];
    render(<CampaignsInboxView {...baseProps} campaigns={campaigns} pendingCampaignId="camp-1" />);

    const buttons = screen.getAllByRole("button", { name: /Enviando\.\.\.|Enviar a aprobación/ });
    expect(buttons[0]).toHaveTextContent("Enviando...");
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toHaveTextContent("Enviar a aprobación");
    expect(buttons[1]).not.toBeDisabled();
  });

  it("renders the sr-only status message live region", () => {
    render(<CampaignsInboxView {...baseProps} statusMessage="Campaña enviada a aprobación." />);
    expect(screen.getByText("Campaña enviada a aprobación.")).toBeInTheDocument();
  });

  it("wires pagination button state from the pagination prop", () => {
    render(
      <CampaignsInboxView
        {...baseProps}
        pagination={{ hasNextPage: true, hasPrevPage: false, onNext: jest.fn(), onPrev: jest.fn() }}
      />,
    );
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Siguiente/ })).not.toBeDisabled();
  });
});
