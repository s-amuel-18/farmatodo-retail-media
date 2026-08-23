"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type {
  Brand,
  Campaign,
  ChannelType,
  MediaCost,
  NewCampaignInput,
  PetaloZone,
  Product,
  Supplier,
} from "@farmatodo-retail-media/types";
import { Button, ErrorText, Field, Input, Select, Textarea } from "@/components/ui";
import { CHANNEL_LABELS, CHANNEL_TYPES, PETALO_ZONES, PETALO_ZONE_LABELS } from "@/lib/campaign-vocabulary";

interface CampaignFormValues {
  name: string;
  brandIds: string[];
  productSkus: string[];
  supplierId: string;
  startDate: string;
  endDate: string;
  channel: ChannelType;
  stores: string;
  quantity: number;
  zone: PetaloZone;
  levels: number;
  category: string;
  segment: string;
  estimatedAudience: number;
  template: string;
  sendWindowFrom: string;
  sendWindowTo: string;
  adAccount: string;
  objective: string;
  creatives: string;
  dailyBudgetUsd: number;
}

const EMPTY_VALUES: CampaignFormValues = {
  name: "",
  brandIds: [],
  productSkus: [],
  supplierId: "",
  startDate: "",
  endDate: "",
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

function toDefaultValues(campaign: Campaign | null): CampaignFormValues {
  if (!campaign) return EMPTY_VALUES;

  const base = {
    ...EMPTY_VALUES,
    name: campaign.name,
    brandIds: campaign.brandIds,
    productSkus: campaign.productSkus,
    supplierId: campaign.supplierId,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    channel: campaign.channel,
  };

  switch (campaign.channel) {
    case "PETALO":
      return { ...base, stores: campaign.stores.join(", "), quantity: campaign.quantity, zone: campaign.zone };
    case "PARRILLERA":
      return {
        ...base,
        stores: campaign.stores.join(", "),
        quantity: campaign.quantity,
        levels: campaign.levels,
        category: campaign.category,
      };
    case "SMS":
      return {
        ...base,
        segment: campaign.segment,
        estimatedAudience: campaign.estimatedAudience,
        template: campaign.template,
        sendWindowFrom: campaign.sendWindow.from,
        sendWindowTo: campaign.sendWindow.to,
      };
    case "TIKTOK":
      return {
        ...base,
        adAccount: campaign.adAccount,
        objective: campaign.objective,
        creatives: campaign.creatives.join(", "),
        dailyBudgetUsd: campaign.dailyBudgetUsd,
      };
  }
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toPayload(values: CampaignFormValues): NewCampaignInput {
  const common = {
    name: values.name,
    brandIds: values.brandIds,
    productSkus: values.productSkus,
    supplierId: values.supplierId,
    startDate: values.startDate,
    endDate: values.endDate,
  };

  switch (values.channel) {
    case "PETALO":
      return {
        ...common,
        channel: "PETALO",
        stores: splitList(values.stores),
        quantity: Number(values.quantity),
        zone: values.zone,
      };
    case "PARRILLERA":
      return {
        ...common,
        channel: "PARRILLERA",
        stores: splitList(values.stores),
        quantity: Number(values.quantity),
        levels: Number(values.levels),
        category: values.category,
      };
    case "SMS":
      return {
        ...common,
        channel: "SMS",
        segment: values.segment,
        estimatedAudience: Number(values.estimatedAudience),
        template: values.template,
        sendWindow: { from: values.sendWindowFrom, to: values.sendWindowTo },
      };
    case "TIKTOK":
      return {
        ...common,
        channel: "TIKTOK",
        adAccount: values.adAccount,
        objective: values.objective,
        creatives: splitList(values.creatives),
        dailyBudgetUsd: Number(values.dailyBudgetUsd),
      };
  }
}

function estimateCost(values: CampaignFormValues, mediaCosts: MediaCost[]): number | null {
  const found = mediaCosts.find(
    (m) => m.supplierId === values.supplierId && m.channel === values.channel,
  );
  if (!found) return null;
  const quantity =
    values.channel === "PETALO" || values.channel === "PARRILLERA" ? Number(values.quantity) || 0 : 1;
  return Math.round(found.unitCostUsd * quantity * 100) / 100;
}

interface CampaignFormViewProps {
  mode: "create" | "edit";
  initialCampaign: Campaign | null;
  brands: Brand[];
  products: Product[];
  suppliers: Supplier[];
  mediaCosts: MediaCost[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: NewCampaignInput) => void;
}

export function CampaignFormView({
  mode,
  initialCampaign,
  brands,
  products,
  suppliers,
  mediaCosts,
  isSubmitting,
  error,
  onSubmit,
}: CampaignFormViewProps) {
  const { register, watch, handleSubmit, reset } = useForm<CampaignFormValues>({
    defaultValues: toDefaultValues(initialCampaign),
  });

  useEffect(() => {
    reset(toDefaultValues(initialCampaign));
  }, [initialCampaign, reset]);

  const values = watch();
  const filteredProducts = products.filter((p) => values.brandIds?.includes(p.brandId));
  const estimatedCost = estimateCost(values, mediaCosts);

  function submit(formValues: CampaignFormValues) {
    onSubmit(toPayload(formValues));
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-navy-900">
        {mode === "create" ? "Nueva campaña" : "Editar campaña"}
      </h1>

      <Field label="Nombre">
        <Input {...register("name", { required: true })} />
      </Field>

      <Field label="Marca(s)">
        <Select multiple {...register("brandIds")} className="h-20">
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Producto(s) (SKU)">
        <Select multiple {...register("productSkus")} className="h-20">
          {filteredProducts.map((p) => (
            <option key={p.sku} value={p.sku}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Proveedor">
        <Select {...register("supplierId", { required: true })}>
          <option value="">Selecciona...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex gap-3">
        <Field label="Fecha inicio">
          <Input type="date" {...register("startDate", { required: true })} />
        </Field>
        <Field label="Fecha fin">
          <Input type="date" {...register("endDate", { required: true })} />
        </Field>
      </div>

      <Field label="Medio de exhibición">
        <Select {...register("channel")} disabled={mode === "edit"}>
          {CHANNEL_TYPES.map((channel) => (
            <option key={channel} value={channel}>
              {CHANNEL_LABELS[channel]}
            </option>
          ))}
        </Select>
      </Field>

      {values.channel === "PETALO" || values.channel === "PARRILLERA" ? (
        <>
          <Field label="Tiendas (separadas por coma)">
            <Input {...register("stores")} />
          </Field>
          <Field label="Cantidad">
            <Input type="number" min={1} {...register("quantity", { valueAsNumber: true })} />
          </Field>
        </>
      ) : null}

      {values.channel === "PETALO" ? (
        <Field label="Zona">
          <Select {...register("zone")}>
            {PETALO_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {PETALO_ZONE_LABELS[zone]}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {values.channel === "PARRILLERA" ? (
        <>
          <Field label="Niveles">
            <Input type="number" min={1} {...register("levels", { valueAsNumber: true })} />
          </Field>
          <Field label="Categoría">
            <Input {...register("category")} />
          </Field>
        </>
      ) : null}

      {values.channel === "SMS" ? (
        <>
          <Field label="Segmento">
            <Input {...register("segment")} />
          </Field>
          <Field label="Audiencia estimada">
            <Input type="number" min={0} {...register("estimatedAudience", { valueAsNumber: true })} />
          </Field>
          <Field label="Plantilla de mensaje">
            <Textarea {...register("template")} rows={3} />
          </Field>
          <div className="flex gap-3">
            <Field label="Ventana de envío - desde">
              <Input type="time" {...register("sendWindowFrom")} />
            </Field>
            <Field label="Ventana de envío - hasta">
              <Input type="time" {...register("sendWindowTo")} />
            </Field>
          </div>
        </>
      ) : null}

      {values.channel === "TIKTOK" ? (
        <>
          <Field label="Cuenta publicitaria">
            <Input {...register("adAccount")} />
          </Field>
          <Field label="Objetivo">
            <Input {...register("objective")} />
          </Field>
          <Field label="Creativos (separados por coma)">
            <Input {...register("creatives")} />
          </Field>
          <Field label="Presupuesto diario (USD)">
            <Input type="number" min={0} step="0.01" {...register("dailyBudgetUsd", { valueAsNumber: true })} />
          </Field>
        </>
      ) : null}

      <div className="my-4 rounded-control bg-gold-100 p-3 text-sm text-ink">
        Costo total estimado:{" "}
        <strong className="text-navy-900">
          {estimatedCost !== null ? `$${estimatedCost.toFixed(2)}` : "— selecciona proveedor y medio"}
        </strong>
        <p className="mt-1 text-xs text-text-muted">
          Este valor es solo referencial; el backend recalcula y valida el costo real al guardar.
        </p>
      </div>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
