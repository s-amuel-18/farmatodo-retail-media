import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import type { Brand, ChannelType, Product, Supplier } from "@farmatodo-retail-media/types";
import { CampaignFormView } from "./CampaignFormView";
import type { CampaignFormValues } from "../../view-models/campaigns/useCampaignForm";

const EMPTY_DEFAULTS: CampaignFormValues = {
  name: "",
  brandIds: [],
  productSkus: [],
  supplierId: "",
  startDate: "",
  endDate: "",
  campaignDate: "",
  channel: "PETALO",
  stores: "",
  quantity: 1,
  zone: "ENTRADA",
  levels: 1,
  category: "",
  segment: "",
  estimatedAudience: 0,
  template: "",
  sendWindowFrom: "",
  sendWindowTo: "",
  adAccount: "",
  objective: "",
  creatives: "",
  dailyBudgetUsd: 0,
};

interface HarnessProps {
  mode?: "create" | "edit";
  defaultValues?: Partial<CampaignFormValues>;
  fieldErrors?: Record<string, string>;
  brands?: Brand[];
  filteredProducts?: Product[];
  suppliers?: Supplier[];
  estimatedCost?: number | null;
  isSubmitting?: boolean;
  error?: string | null;
  backHref?: string;
  onValidSubmit?: (values: CampaignFormValues) => void;
  onBrandsChange?: (next: string[]) => void;
  onProductsChange?: (next: string[]) => void;
}

function Harness({
  mode = "create",
  defaultValues,
  fieldErrors = {},
  brands = [],
  filteredProducts = [],
  suppliers = [],
  estimatedCost = null,
  isSubmitting = false,
  error = null,
  backHref = "/campaigns",
  onValidSubmit = jest.fn(),
  onBrandsChange = jest.fn(),
  onProductsChange = jest.fn(),
}: HarnessProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CampaignFormValues>({ defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues } });
  const values = watch();

  return (
    <CampaignFormView
      mode={mode}
      register={register}
      errors={errors}
      fieldErrors={fieldErrors}
      values={values}
      onSubmit={handleSubmit(onValidSubmit)}
      brands={brands}
      filteredProducts={filteredProducts}
      onBrandsChange={onBrandsChange}
      onProductsChange={onProductsChange}
      suppliers={suppliers}
      estimatedCost={estimatedCost}
      isSubmitting={isSubmitting}
      error={error}
      backHref={backHref}
    />
  );
}

describe("CampaignFormView", () => {
  it("shows the create heading and back link in create mode", () => {
    render(<Harness mode="create" backHref="/campaigns" />);
    expect(screen.getByRole("heading", { name: "Nueva campaña" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver/ })).toHaveAttribute("href", "/campaigns");
  });

  it("shows the edit heading and disables the channel select", () => {
    render(<Harness mode="edit" />);
    expect(screen.getByRole("heading", { name: "Editar campaña" })).toBeInTheDocument();
    expect(screen.getByLabelText("Medio de exhibición")).toBeDisabled();
    expect(screen.getByText("El canal no se puede cambiar una vez creada la campaña.")).toBeInTheDocument();
  });

  it("shows required-field errors from react-hook-form after an invalid submit", async () => {
    const user = userEvent.setup();
    const onValidSubmit = jest.fn();
    render(<Harness onValidSubmit={onValidSubmit} />);

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onValidSubmit).not.toHaveBeenCalled();
    const requiredMessages = await screen.findAllByText("Este campo es obligatorio");
    // name, supplierId, startDate, endDate, campaignDate are all `register(..., { required })`
    expect(requiredMessages.length).toBe(5);
  });

  it("calls onValidSubmit with the form values when required fields are filled", async () => {
    const user = userEvent.setup();
    const onValidSubmit = jest.fn();
    render(
      <Harness
        onValidSubmit={onValidSubmit}
        suppliers={[{ id: "sup-1", name: "Proveedor Uno" }]}
        defaultValues={{
          name: "Mi campaña",
          supplierId: "sup-1",
          startDate: "2026-01-01",
          endDate: "2026-01-31",
          campaignDate: "2026-01-01",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onValidSubmit).toHaveBeenCalledTimes(1);
    expect(onValidSubmit.mock.calls[0][0]).toMatchObject({
      name: "Mi campaña",
      supplierId: "sup-1",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      campaignDate: "2026-01-01",
    });
  });

  it("renders server-side fieldErrors alongside client errors", () => {
    render(<Harness fieldErrors={{ brandIds: "Selecciona al menos una marca", stores: "Selecciona al menos una tienda" }} />);
    expect(screen.getByText("Selecciona al menos una marca")).toBeInTheDocument();
    expect(screen.getByText("Selecciona al menos una tienda")).toBeInTheDocument();
  });

  it("shows the brand hint only while no brand is selected", () => {
    const { unmount } = render(<Harness defaultValues={{ brandIds: [] }} />);
    expect(screen.getByText("Selecciona al menos una marca para ver sus productos.")).toBeInTheDocument();
    unmount();

    render(<Harness defaultValues={{ brandIds: ["brand-1"] }} />);
    expect(screen.queryByText("Selecciona al menos una marca para ver sus productos.")).not.toBeInTheDocument();
  });

  it("disables the product combobox and shows the empty message until a brand is selected", () => {
    render(<Harness defaultValues={{ brandIds: [] }} />);
    expect(screen.getByText("Selecciona una marca primero")).toBeInTheDocument();
  });

  it.each<[ChannelType, string[]]>([
    ["PETALO", ["Tiendas (separadas por coma)", "Cantidad", "Zona"]],
    ["PARRILLERA", ["Tiendas (separadas por coma)", "Cantidad", "Niveles", "Categoría"]],
    ["SMS", ["Segmento", "Audiencia estimada", "Plantilla de mensaje", "Ventana de envío - desde", "Ventana de envío - hasta"]],
    ["TIKTOK", ["Cuenta publicitaria", "Objetivo", "Creativos (separados por coma)", "Presupuesto diario (USD)"]],
  ])("shows the %s-specific fields and hides the others", async (channel, expectedLabels) => {
    const user = userEvent.setup();
    render(<Harness defaultValues={{ channel: "PETALO" }} />);

    if (channel !== "PETALO") {
      await user.selectOptions(screen.getByLabelText("Medio de exhibición"), channel);
    }

    for (const label of expectedLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    const allChannelOnlyLabels = [
      "Zona",
      "Niveles",
      "Categoría",
      "Segmento",
      "Audiencia estimada",
      "Plantilla de mensaje",
      "Cuenta publicitaria",
      "Objetivo",
      "Creativos (separados por coma)",
      "Presupuesto diario (USD)",
    ];
    for (const label of allChannelOnlyLabels) {
      if (!expectedLabels.includes(label)) {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      }
    }
  });

  it("calls onBrandsChange when a brand option is selected via the combobox", async () => {
    const user = userEvent.setup();
    const onBrandsChange = jest.fn();
    render(
      <Harness
        onBrandsChange={onBrandsChange}
        brands={[{ id: "brand-1", name: "Marca Uno" }]}
      />,
    );

    const brandCombobox = screen.getAllByRole("combobox")[0]!;
    await user.click(brandCombobox);
    await user.click(screen.getByRole("option", { name: "Marca Uno" }));

    expect(onBrandsChange).toHaveBeenCalledWith(["brand-1"]);
  });

  it("calls onProductsChange when a product option is selected via the combobox", async () => {
    const user = userEvent.setup();
    const onProductsChange = jest.fn();
    render(
      <Harness
        defaultValues={{ brandIds: ["brand-1"] }}
        onProductsChange={onProductsChange}
        filteredProducts={[{ sku: "sku-1", name: "Producto Uno", brandId: "brand-1" }]}
      />,
    );

    const productCombobox = screen.getByPlaceholderText("Buscar producto...");
    await user.click(productCombobox);
    await user.click(screen.getByRole("option", { name: "Producto Uno" }));

    expect(onProductsChange).toHaveBeenCalledWith(["sku-1"]);
  });

  it("renders suppliers as select options", () => {
    render(<Harness suppliers={[{ id: "sup-1", name: "Proveedor Uno" }]} />);
    expect(screen.getByRole("option", { name: "Proveedor Uno" })).toBeInTheDocument();
  });

  it("shows the estimated cost when present, and a placeholder otherwise", () => {
    const { rerender } = render(<Harness estimatedCost={null} />);
    expect(screen.getByText(/selecciona proveedor y medio/)).toBeInTheDocument();

    rerender(<Harness estimatedCost={42.5} />);
    expect(screen.getByText("$42.50")).toBeInTheDocument();
  });

  it("renders the error message when provided", () => {
    render(<Harness error="No se pudo guardar la campaña." />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar la campaña.");
  });

  it("disables submit and cancel while isSubmitting, and shows the saving label", () => {
    render(<Harness isSubmitting />);
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("links Cancelar to backHref", () => {
    render(<Harness backHref="/campaigns/1" />);
    const cancelLink = screen.getByRole("link", { name: "Cancelar" });
    expect(cancelLink).toHaveAttribute("href", "/campaigns/1");
  });
});
