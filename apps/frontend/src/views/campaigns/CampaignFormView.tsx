"use client";

import type { ReactNode, BaseSyntheticEvent } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { Brand, Product, Supplier } from "@farmatodo-retail-media/types";
import type { CampaignFormValues } from "../../view-models/campaigns/useCampaignForm";

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
    <form onSubmit={onSubmit} style={{ maxWidth: 640 }}>
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

      {channel === "PETALO" || channel === "PARRILLERA" ? (
        <>
          <Field label="Tiendas (separadas por coma)">
            <input {...register("stores")} style={{ width: "100%" }} />
          </Field>
          <Field label="Cantidad">
            <input type="number" min={1} {...register("quantity", { valueAsNumber: true })} />
          </Field>
        </>
      ) : null}

      {channel === "PETALO" ? (
        <Field label="Zona">
          <select {...register("zone")}>
            <option value="ENTRADA">Entrada</option>
            <option value="PASILLO_CENTRAL">Pasillo central</option>
            <option value="CAJAS">Cajas</option>
          </select>
        </Field>
      ) : null}

      {channel === "PARRILLERA" ? (
        <>
          <Field label="Niveles">
            <input type="number" min={1} {...register("levels", { valueAsNumber: true })} />
          </Field>
          <Field label="Categoría">
            <input {...register("category")} style={{ width: "100%" }} />
          </Field>
        </>
      ) : null}

      {channel === "SMS" ? (
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

      {channel === "TIKTOK" ? (
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
