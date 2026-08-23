"use client";

import type { BaseSyntheticEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import type { Brand, Product, Supplier } from "@farmatodo-retail-media/types";
import type { CampaignFormValues } from "../../view-models/campaigns/useCampaignForm";
import { Button, ErrorText, Field, Input, Select, Textarea } from "@/components/ui";
import { CHANNEL_LABELS, CHANNEL_TYPES, PETALO_ZONES, PETALO_ZONE_LABELS } from "@/lib/campaign-vocabulary";

interface CampaignFormViewProps {
  mode: "create" | "edit";
  register: UseFormRegister<CampaignFormValues>;
  errors: FieldErrors<CampaignFormValues>;
  fieldErrors: Record<string, string>;
  values: CampaignFormValues;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  brands: Brand[];
  filteredProducts: Product[];
  suppliers: Supplier[];
  estimatedCost: number | null;
  isSubmitting: boolean;
  error: string | null;
  backHref: string;
}

const REQUIRED_MESSAGE = "Este campo es obligatorio";

export function CampaignFormView({
  mode,
  register,
  errors,
  fieldErrors,
  values,
  onSubmit,
  brands,
  filteredProducts,
  suppliers,
  estimatedCost,
  isSubmitting,
  error,
  backHref,
}: CampaignFormViewProps) {
  const channel = values.channel;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl" noValidate>
      <Link href={backHref} className="mb-3 inline-block text-sm text-brand-blue-700 hover:underline">
        ← Volver
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-navy-900">
        {mode === "create" ? "Nueva campaña" : "Editar campaña"}
      </h1>

      <Field label="Nombre" required error={errors.name?.message ?? fieldErrors.name}>
        <Input {...register("name", { required: REQUIRED_MESSAGE })} />
      </Field>

      <Field
        label="Marca(s)"
        hint={values.brandIds?.length ? undefined : "Selecciona al menos una marca para ver sus productos."}
        error={fieldErrors.brandIds}
      >
        <Select multiple {...register("brandIds")} className="h-20">
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Producto(s) (SKU)"
        hint={
          values.brandIds?.length && filteredProducts.length === 0
            ? "La(s) marca(s) seleccionada(s) no tienen productos registrados."
            : undefined
        }
        error={fieldErrors.productSkus}
      >
        <Select multiple {...register("productSkus")} className="h-20">
          {filteredProducts.map((p) => (
            <option key={p.sku} value={p.sku}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Proveedor" required error={errors.supplierId?.message ?? fieldErrors.supplierId}>
        <Select {...register("supplierId", { required: REQUIRED_MESSAGE })}>
          <option value="">Selecciona...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex gap-3">
        <Field label="Fecha inicio" required error={errors.startDate?.message ?? fieldErrors.startDate}>
          <Input type="date" {...register("startDate", { required: REQUIRED_MESSAGE })} />
        </Field>
        <Field label="Fecha fin" required error={errors.endDate?.message ?? fieldErrors.endDate}>
          <Input type="date" {...register("endDate", { required: REQUIRED_MESSAGE })} />
        </Field>
      </div>

      <Field
        label="Medio de exhibición"
        hint={mode === "edit" ? "El canal no se puede cambiar una vez creada la campaña." : undefined}
      >
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
          <Field label="Tiendas (separadas por coma)" error={fieldErrors.stores}>
            <Input {...register("stores")} />
          </Field>
          <Field label="Cantidad" error={fieldErrors.quantity}>
            <Input type="number" min={1} {...register("quantity", { valueAsNumber: true })} />
          </Field>
        </>
      ) : null}

      {channel === "PETALO" ? (
        <Field label="Zona" error={fieldErrors.zone}>
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
          <Field label="Niveles" error={fieldErrors.levels}>
            <Input type="number" min={1} {...register("levels", { valueAsNumber: true })} />
          </Field>
          <Field label="Categoría" error={fieldErrors.category}>
            <Input {...register("category")} />
          </Field>
        </>
      ) : null}

      {channel === "SMS" ? (
        <>
          <Field label="Segmento" error={fieldErrors.segment}>
            <Input {...register("segment")} />
          </Field>
          <Field label="Audiencia estimada" error={fieldErrors.estimatedAudience}>
            <Input type="number" min={0} {...register("estimatedAudience", { valueAsNumber: true })} />
          </Field>
          <Field label="Plantilla de mensaje" error={fieldErrors.template}>
            <Textarea {...register("template")} rows={3} />
          </Field>
          <div className="flex gap-3">
            <Field label="Ventana de envío - desde" error={fieldErrors.sendWindowFrom}>
              <Input type="time" {...register("sendWindowFrom")} />
            </Field>
            <Field label="Ventana de envío - hasta" error={fieldErrors.sendWindowTo}>
              <Input type="time" {...register("sendWindowTo")} />
            </Field>
          </div>
        </>
      ) : null}

      {channel === "TIKTOK" ? (
        <>
          <Field label="Cuenta publicitaria" error={fieldErrors.adAccount}>
            <Input {...register("adAccount")} />
          </Field>
          <Field label="Objetivo" error={fieldErrors.objective}>
            <Input {...register("objective")} />
          </Field>
          <Field label="Creativos (separados por coma)" error={fieldErrors.creatives}>
            <Input {...register("creatives")} />
          </Field>
          <Field label="Presupuesto diario (USD)" error={fieldErrors.dailyBudgetUsd}>
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

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Link href={backHref}>
          <Button type="button" variant="ghost" disabled={isSubmitting}>
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
