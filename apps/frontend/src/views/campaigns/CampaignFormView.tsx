"use client";

import type { BaseSyntheticEvent } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { Brand, Product, Supplier } from "@farmatodo-retail-media/types";
import type { CampaignFormValues } from "../../view-models/campaigns/useCampaignForm";
import { Button, ErrorText, Field, Input, Select, Textarea } from "@/components/ui";
import { CHANNEL_LABELS, CHANNEL_TYPES, PETALO_ZONES, PETALO_ZONE_LABELS } from "@/lib/campaign-vocabulary";

interface CampaignFormViewProps {
  mode: "create" | "edit";
  register: UseFormRegister<CampaignFormValues>;
  values: CampaignFormValues;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  brands: Brand[];
  filteredProducts: Product[];
  suppliers: Supplier[];
  estimatedCost: number | null;
  isSubmitting: boolean;
  error: string | null;
}

export function CampaignFormView({
  mode,
  register,
  values,
  onSubmit,
  brands,
  filteredProducts,
  suppliers,
  estimatedCost,
  isSubmitting,
  error,
}: CampaignFormViewProps) {
  const channel = values.channel;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
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

      {channel === "PETALO" || channel === "PARRILLERA" ? (
        <>
          <Field label="Tiendas (separadas por coma)">
            <Input {...register("stores")} />
          </Field>
          <Field label="Cantidad">
            <Input type="number" min={1} {...register("quantity", { valueAsNumber: true })} />
          </Field>
        </>
      ) : null}

      {channel === "PETALO" ? (
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

      {channel === "PARRILLERA" ? (
        <>
          <Field label="Niveles">
            <Input type="number" min={1} {...register("levels", { valueAsNumber: true })} />
          </Field>
          <Field label="Categoría">
            <Input {...register("category")} />
          </Field>
        </>
      ) : null}

      {channel === "SMS" ? (
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

      {channel === "TIKTOK" ? (
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
