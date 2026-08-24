import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  Campaign,
  HistoryEntry,
  ParrilleraCampaign,
  PetaloCampaign,
  SmsCampaign,
  TiktokCampaign,
} from "@farmatodo-retail-media/types";
import { CampaignDetailView } from "./CampaignDetailView";

function makePetalo(overrides: Partial<PetaloCampaign> = {}): PetaloCampaign {
  return {
    id: "camp-1",
    name: "Campaña Pétalo",
    brandIds: ["brand-1"],
    productSkus: ["sku-1", "sku-2"],
    supplierId: "supplier-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "user-1",
    status: "PENDING_APPROVAL",
    totalCostUsd: 250,
    channel: "PETALO",
    stores: ["Store 1", "Store 2"],
    quantity: 3,
    zone: "ENTRADA",
    ...overrides,
  };
}

function makeSms(overrides: Partial<SmsCampaign> = {}): SmsCampaign {
  return {
    id: "camp-sms",
    name: "Campaña SMS",
    brandIds: ["brand-1"],
    productSkus: ["sku-1"],
    supplierId: "supplier-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "user-1",
    status: "DRAFT",
    totalCostUsd: 10,
    channel: "SMS",
    segment: "VIP",
    estimatedAudience: 1000,
    template: "Hola {{name}}",
    sendWindow: { from: "08:00", to: "10:00" },
    ...overrides,
  };
}

function makeParrillera(overrides: Partial<ParrilleraCampaign> = {}): ParrilleraCampaign {
  return {
    id: "camp-parrillera",
    name: "Campaña Parrillera",
    brandIds: ["brand-1"],
    productSkus: ["sku-1"],
    supplierId: "supplier-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "user-1",
    status: "DRAFT",
    totalCostUsd: 80,
    channel: "PARRILLERA",
    stores: ["Store 1"],
    quantity: 2,
    levels: 3,
    category: "Lácteos",
    ...overrides,
  };
}

function makeTiktok(overrides: Partial<TiktokCampaign> = {}): TiktokCampaign {
  return {
    id: "camp-tiktok",
    name: "Campaña TikTok",
    brandIds: ["brand-1"],
    productSkus: ["sku-1"],
    supplierId: "supplier-1",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "user-1",
    status: "DRAFT",
    totalCostUsd: 500,
    channel: "TIKTOK",
    adAccount: "ads-account-1",
    objective: "Awareness",
    creatives: ["video-1.mp4", "video-2.mp4"],
    dailyBudgetUsd: 35.5,
    ...overrides,
  };
}

const baseProps = {
  campaign: makePetalo(),
  history: [] as HistoryEntry[],
  isLoading: false,
  error: null as string | null,
  backHref: "/campaigns",
  supplierLabel: "Proveedor Uno",
  brandLabels: "Marca Uno",
};

describe("CampaignDetailView", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading state instead of content", () => {
    render(<CampaignDetailView {...baseProps} isLoading />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.queryByText(baseProps.campaign.name)).not.toBeInTheDocument();
  });

  it("renders the error instead of content", () => {
    render(<CampaignDetailView {...baseProps} error="No se pudo cargar" />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar");
    expect(screen.queryByText(baseProps.campaign.name)).not.toBeInTheDocument();
  });

  it("renders general campaign data and a back link", () => {
    render(<CampaignDetailView {...baseProps} />);
    expect(screen.getByRole("heading", { name: baseProps.campaign.name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver/ })).toHaveAttribute("href", "/campaigns");
    expect(screen.getByText("Pétalo")).toBeInTheDocument();
    expect(screen.getByText("Proveedor Uno")).toBeInTheDocument();
    expect(screen.getByText("Marca Uno")).toBeInTheDocument();
    expect(screen.getByText("sku-1, sku-2")).toBeInTheDocument();
    expect(screen.getByText("$250.00")).toBeInTheDocument();
  });

  it("renders PETALO-specific channel details", () => {
    render(<CampaignDetailView {...baseProps} campaign={makePetalo()} />);
    expect(screen.getByText("Store 1, Store 2")).toBeInTheDocument();
    expect(screen.getByText("Entrada")).toBeInTheDocument();
  });

  it("renders SMS-specific channel details", () => {
    render(<CampaignDetailView {...baseProps} campaign={makeSms()} />);
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("Hola {{name}}")).toBeInTheDocument();
    expect(screen.getByText("08:00 - 10:00")).toBeInTheDocument();
  });

  it("renders PARRILLERA-specific channel details", () => {
    render(<CampaignDetailView {...baseProps} campaign={makeParrillera()} />);
    expect(screen.getByText("Store 1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Lácteos")).toBeInTheDocument();
  });

  it("renders TIKTOK-specific channel details", () => {
    render(<CampaignDetailView {...baseProps} campaign={makeTiktok()} />);
    expect(screen.getByText("ads-account-1")).toBeInTheDocument();
    expect(screen.getByText("Awareness")).toBeInTheDocument();
    expect(screen.getByText("video-1.mp4, video-2.mp4")).toBeInTheDocument();
    expect(screen.getByText("$35.50")).toBeInTheDocument();
  });

  it("shows the rejection reason banner only when REJECTED with a comment", () => {
    const { rerender } = render(
      <CampaignDetailView
        {...baseProps}
        campaign={makePetalo({ status: "REJECTED", currentApprovalComment: "Faltan datos" })}
      />,
    );
    expect(screen.getByText("Motivo del rechazo")).toBeInTheDocument();
    expect(screen.getByText("Faltan datos")).toBeInTheDocument();
    expect(screen.getByText(/Edita la campaña y vuelve a enviarla/)).toBeInTheDocument();

    rerender(<CampaignDetailView {...baseProps} campaign={makePetalo({ status: "DRAFT" })} />);
    expect(screen.queryByText("Motivo del rechazo")).not.toBeInTheDocument();
  });

  it("hides the resubmit hint for REJECTED campaigns when approverActions is present", () => {
    render(
      <CampaignDetailView
        {...baseProps}
        campaign={makePetalo({ status: "REJECTED", currentApprovalComment: "Faltan datos" })}
        approverActions={{ onApprove: jest.fn(), onReject: jest.fn(), isDeciding: false }}
      />,
    );
    expect(screen.getByText("Motivo del rechazo")).toBeInTheDocument();
    expect(screen.queryByText(/Edita la campaña y vuelve a enviarla/)).not.toBeInTheDocument();
  });

  it("renders decisionError via ErrorText", () => {
    render(<CampaignDetailView {...baseProps} decisionError="No se pudo decidir" />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo decidir");
  });

  it("shows 'sin transiciones' when history is empty", () => {
    render(<CampaignDetailView {...baseProps} history={[]} />);
    expect(screen.getByText("Sin transiciones registradas todavía.")).toBeInTheDocument();
  });

  it("renders history entries with action label, date and comment", () => {
    const history: HistoryEntry[] = [
      {
        id: "h1",
        campaignId: "camp-1",
        action: "SUBMITTED",
        actorUid: "u1",
        actorRole: "COMMERCIAL_ANALYST",
        occurredAt: "2026-01-02T10:00:00.000Z",
      },
      {
        id: "h2",
        campaignId: "camp-1",
        action: "REJECTED",
        actorUid: "u2",
        actorRole: "APPROVER_MANAGER",
        comment: "Corrige el presupuesto",
        occurredAt: "2026-01-03T10:00:00.000Z",
      },
    ];
    render(<CampaignDetailView {...baseProps} history={history} />);
    expect(screen.getByText("Enviada a aprobación")).toBeInTheDocument();
    expect(screen.getByText("Rechazada")).toBeInTheDocument();
    expect(screen.getByText("Comentario: Corrige el presupuesto")).toBeInTheDocument();
  });

  it("renders the sr-only status message", () => {
    render(<CampaignDetailView {...baseProps} statusMessage="Campaña aprobada." />);
    expect(screen.getByText("Campaña aprobada.")).toBeInTheDocument();
  });

  describe("approver actions", () => {
    it("only shows the decision section for PENDING_APPROVAL campaigns", () => {
      const approverActions = { onApprove: jest.fn(), onReject: jest.fn(), isDeciding: false };
      const { rerender } = render(
        <CampaignDetailView
          {...baseProps}
          campaign={makePetalo({ status: "PENDING_APPROVAL" })}
          approverActions={approverActions}
        />,
      );
      expect(screen.getByRole("button", { name: "Aprobar" })).toBeInTheDocument();

      rerender(
        <CampaignDetailView
          {...baseProps}
          campaign={makePetalo({ status: "DRAFT" })}
          approverActions={approverActions}
        />,
      );
      expect(screen.queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument();
    });

    it("opens a confirmation modal and calls onApprove when confirmed", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn().mockResolvedValue(undefined);
      render(
        <CampaignDetailView
          {...baseProps}
          campaign={makePetalo({ status: "PENDING_APPROVAL", name: "Campaña X" })}
          approverActions={{ onApprove, onReject: jest.fn(), isDeciding: false }}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Aprobar" }));
      const dialog = screen.getByRole("dialog", { name: "Confirmar aprobación" });
      expect(within(dialog).getByText("Campaña X")).toBeInTheDocument();

      await user.click(within(dialog).getByRole("button", { name: "Confirmar aprobación" }));
      expect(onApprove).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("cancels the approval confirmation without calling onApprove", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn();
      render(
        <CampaignDetailView
          {...baseProps}
          campaign={makePetalo({ status: "PENDING_APPROVAL" })}
          approverActions={{ onApprove, onReject: jest.fn(), isDeciding: false }}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Aprobar" }));
      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      expect(onApprove).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("requires a non-empty comment before enabling reject confirmation, and submits it trimmed", async () => {
      const user = userEvent.setup();
      const onReject = jest.fn().mockResolvedValue(undefined);
      render(
        <CampaignDetailView
          {...baseProps}
          campaign={makePetalo({ status: "PENDING_APPROVAL" })}
          approverActions={{ onApprove: jest.fn(), onReject, isDeciding: false }}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Rechazar" }));
      const confirmButton = screen.getByRole("button", { name: "Confirmar rechazo" });
      expect(confirmButton).toBeDisabled();

      const textarea = screen.getByLabelText(/Comentario de rechazo/);
      await user.type(textarea, "  Motivo del rechazo  ");
      expect(confirmButton).toBeEnabled();

      await user.click(confirmButton);
      expect(onReject).toHaveBeenCalledWith("Motivo del rechazo");
    });

    it("shows an error message and keeps the reject panel open when onReject fails", async () => {
      const user = userEvent.setup();
      const onReject = jest.fn().mockRejectedValue(new Error("No se pudo rechazar"));
      render(
        <CampaignDetailView
          {...baseProps}
          campaign={makePetalo({ status: "PENDING_APPROVAL" })}
          approverActions={{ onApprove: jest.fn(), onReject, isDeciding: false }}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Rechazar" }));
      await user.type(screen.getByLabelText(/Comentario de rechazo/), "algo");
      await user.click(screen.getByRole("button", { name: "Confirmar rechazo" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo rechazar");
      expect(screen.getByLabelText(/Comentario de rechazo/)).toBeInTheDocument();
    });

    it("disables decision buttons while isDeciding", () => {
      render(
        <CampaignDetailView
          {...baseProps}
          campaign={makePetalo({ status: "PENDING_APPROVAL" })}
          approverActions={{ onApprove: jest.fn(), onReject: jest.fn(), isDeciding: true }}
        />,
      );
      expect(screen.getByRole("button", { name: "Procesando..." })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Rechazar" })).toBeDisabled();
    });
  });
});
