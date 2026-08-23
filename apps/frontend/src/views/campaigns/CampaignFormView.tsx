"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
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
    <form onSubmit={handleSubmit(submit)} style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>
        {mode === "create" ? "Nueva campaña" : "Editar campaña"}
      </h1>

      <Field label="Nombre">
        <input {...register("name", { required: true })} style={{ width: "100%" }} />
      </Field>

      <Field label="Marca(s)">
        <select multiple {...register("brandIds")} style={{ width: "100%", height: 80 }}>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Producto(s) (SKU)">
        <select multiple {...register("productSkus")} style={{ width: "100%", height: 80 }}>
          {filteredProducts.map((p) => (
            <option key={p.sku} value={p.sku}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Proveedor">
        <select {...register("supplierId", { required: true })} style={{ width: "100%" }}>
          <option value="">Selecciona...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <Field label="Fecha inicio">
          <input type="date" {...register("startDate", { required: true })} />
        </Field>
        <Field label="Fecha fin">
          <input type="date" {...register("endDate", { required: true })} />
        </Field>
      </div>

      <Field label="Medio de exhibición">
        <select {...register("channel")} disabled={mode === "edit"} style={{ width: "100%" }}>
          <option value="PETALO">Pétalo</option>
          <option value="PARRILLERA">Parrillera</option>
          <option value="SMS">SMS</option>
          <option value="TIKTOK">TikTok</option>
        </select>
      </Field>

      {values.channel === "PETALO" || values.channel === "PARRILLERA" ? (
        <>
          <Field label="Tiendas (separadas por coma)">
            <input {...register("stores")} style={{ width: "100%" }} />
          </Field>
          <Field label="Cantidad">
            <input type="number" min={1} {...register("quantity", { valueAsNumber: true })} />
          </Field>
        </>
      ) : null}

      {values.channel === "PETALO" ? (
        <Field label="Zona">
          <select {...register("zone")}>
            <option value="ENTRADA">Entrada</option>
            <option value="PASILLO_CENTRAL">Pasillo central</option>
            <option value="CAJAS">Cajas</option>
          </select>
        </Field>
      ) : null}

      {values.channel === "PARRILLERA" ? (
        <>
          <Field label="Niveles">
            <input type="number" min={1} {...register("levels", { valueAsNumber: true })} />
          </Field>
          <Field label="Categoría">
            <input {...register("category")} style={{ width: "100%" }} />
          </Field>
        </>
      ) : null}

      {values.channel === "SMS" ? (
        <>
          <Field label="Segmento">
            <input {...register("segment")} style={{ width: "100%" }} />
          </Field>
          <Field label="Audiencia estimada">
            <input type="number" min={0} {...register("estimatedAudience", { valueAsNumber: true })} />
          </Field>
          <Field label="Plantilla de mensaje">
            <textarea {...register("template")} style={{ width: "100%" }} rows={3} />
          </Field>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Ventana de envío - desde">
              <input type="time" {...register("sendWindowFrom")} />
            </Field>
            <Field label="Ventana de envío - hasta">
              <input type="time" {...register("sendWindowTo")} />
            </Field>
          </div>
        </>
      ) : null}

      {values.channel === "TIKTOK" ? (
        <>
          <Field label="Cuenta publicitaria">
            <input {...register("adAccount")} style={{ width: "100%" }} />
          </Field>
          <Field label="Objetivo">
            <input {...register("objective")} style={{ width: "100%" }} />
          </Field>
          <Field label="Creativos (separados por coma)">
            <input {...register("creatives")} style={{ width: "100%" }} />
          </Field>
          <Field label="Presupuesto diario (USD)">
            <input type="number" min={0} step="0.01" {...register("dailyBudgetUsd", { valueAsNumber: true })} />
          </Field>
        </>
      ) : null}

      <div style={{ margin: "16px 0", padding: 12, background: "#f0f4ff", borderRadius: 6 }}>
        Costo total estimado:{" "}
        <strong>{estimatedCost !== null ? `$${estimatedCost.toFixed(2)}` : "— selecciona proveedor y medio"}</strong>
        <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0" }}>
          Este valor es solo referencial; el backend recalcula y valida el costo real al guardar.
        </p>
      </div>

      {error ? <p style={{ color: "#c0392b" }}>{error}</p> : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
      <div style={{ marginBottom: 4, color: "#444" }}>{label}</div>
      {children}
    </label>
  );
}
