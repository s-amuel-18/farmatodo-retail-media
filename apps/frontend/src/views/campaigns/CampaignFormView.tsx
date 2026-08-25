'use client';

import type { BaseSyntheticEvent } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import Link from 'next/link';
import type { Brand, Product, Supplier } from '@farmatodo-retail-media/types';
import type { CampaignFormValues } from '../../view-models/campaigns/useCampaignForm';
import {
  Button,
  ErrorText,
  Field,
  Input,
  MultiCombobox,
  Section,
  Select,
  Textarea,
} from '@/components/ui';
import type { ChannelType } from '@farmatodo-retail-media/types';
import {
  CHANNEL_LABELS,
  PETALO_ZONES,
  PETALO_ZONE_LABELS,
} from '@/lib/campaign-vocabulary';

interface CampaignFormViewProps {
  mode: 'create' | 'edit';
  register: UseFormRegister<CampaignFormValues>;
  errors: FieldErrors<CampaignFormValues>;
  fieldErrors: Record<string, string>;
  values: CampaignFormValues;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  brands: Brand[];
  filteredProducts: Product[];
  onBrandsChange: (next: string[]) => void;
  onProductsChange: (next: string[]) => void;
  suppliers: Supplier[];
  availableChannels: ChannelType[];
  estimatedCost: number | null;
  isEstimatingCost?: boolean;
  isSubmitting: boolean;
  error: string | null;
  backHref: string;
}

const REQUIRED_MESSAGE = 'Este campo es obligatorio';

export function CampaignFormView({
  mode,
  register,
  errors,
  fieldErrors,
  values,
  onSubmit,
  brands,
  filteredProducts,
  onBrandsChange,
  onProductsChange,
  suppliers,
  availableChannels,
  estimatedCost,
  isEstimatingCost = false,
  isSubmitting,
  error,
  backHref,
}: CampaignFormViewProps) {
  const channel = values.channel;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl" noValidate>
      <Link
        href={backHref}
        className="mb-3 inline-block text-sm text-brand-blue-700 hover:underline"
      >
        ← Volver
      </Link>
      <h1 className="mb-5 text-xl font-semibold text-ink">
        {mode === 'create' ? 'Nueva campaña' : 'Editar campaña'}
      </h1>

      <Section title="Datos generales">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field
            label="Nombre"
            required
            error={errors.name?.message ?? fieldErrors.name}
            className="sm:col-span-2"
          >
            <Input {...register('name', { required: REQUIRED_MESSAGE })} />
          </Field>

          <Field
            label="Marca(s)"
            hint={
              values.brandIds?.length
                ? undefined
                : 'Selecciona al menos una marca para ver sus productos.'
            }
            error={fieldErrors.brandIds}
          >
            <MultiCombobox
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
              value={values.brandIds ?? []}
              onChange={onBrandsChange}
              placeholder="Buscar marca..."
            />
          </Field>

          <Field
            label="Producto(s) (SKU)"
            error={fieldErrors.productSkus}
          >
            <MultiCombobox
              options={filteredProducts.map((p) => ({
                value: p.sku,
                label: p.name,
              }))}
              value={values.productSkus ?? []}
              onChange={onProductsChange}
              placeholder="Buscar producto..."
              disabled={(values.brandIds?.length ?? 0) === 0}
              emptyMessage="Selecciona una marca primero"
            />
          </Field>

          <Field
            label="Proveedor"
            required
            error={errors.supplierId?.message ?? fieldErrors.supplierId}
          >
            <Select {...register('supplierId', { required: REQUIRED_MESSAGE })}>
              <option value="">Selecciona...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Medio de exhibición"
            hint={
              mode === 'edit'
                ? 'El canal no se puede cambiar una vez creada la campaña.'
                : !values.supplierId
                  ? 'Selecciona un proveedor para ver los medios que ofrece.'
                  : undefined
            }
          >
            <Select {...register('channel')} disabled={mode === 'edit'}>
              {availableChannels.map((channel) => (
                <option key={channel} value={channel}>
                  {CHANNEL_LABELS[channel]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Fecha de la campaña"
            required
            error={errors.campaignDate?.message ?? fieldErrors.campaignDate}
            className="sm:col-span-2"
          >
            <Input
              type="date"
              {...register('campaignDate', { required: REQUIRED_MESSAGE })}
            />
          </Field>

          <Field
            label="Fecha inicio"
            required
            error={errors.startDate?.message ?? fieldErrors.startDate}
          >
            <Input
              type="date"
              {...register('startDate', { required: REQUIRED_MESSAGE })}
            />
          </Field>
          <Field
            label="Fecha fin"
            required
            error={errors.endDate?.message ?? fieldErrors.endDate}
          >
            <Input
              type="date"
              {...register('endDate', { required: REQUIRED_MESSAGE })}
            />
          </Field>
        </div>
      </Section>

      <Section title="Detalles del canal">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {channel === 'PETALO' || channel === 'PARRILLERA' ? (
            <>
              <Field
                label="Tiendas (separadas por coma)"
                error={fieldErrors.stores}
                className="sm:col-span-2"
              >
                <Input {...register('stores')} />
              </Field>
              <Field label="Cantidad" error={fieldErrors.quantity}>
                <Input
                  type="number"
                  min={1}
                  {...register('quantity', { valueAsNumber: true })}
                />
              </Field>
            </>
          ) : null}

          {channel === 'PETALO' ? (
            <Field label="Zona" error={fieldErrors.zone}>
              <Select {...register('zone')}>
                {PETALO_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {PETALO_ZONE_LABELS[zone]}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          {channel === 'PARRILLERA' ? (
            <>
              <Field label="Niveles" error={fieldErrors.levels}>
                <Input
                  type="number"
                  min={1}
                  {...register('levels', { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Categoría"
                error={fieldErrors.category}
                className="sm:col-span-2"
              >
                <Input {...register('category')} />
              </Field>
            </>
          ) : null}

          {channel === 'SMS' ? (
            <>
              <Field label="Segmento" error={fieldErrors.segment}>
                <Input {...register('segment')} />
              </Field>
              <Field
                label="Audiencia estimada"
                error={fieldErrors.estimatedAudience}
              >
                <Input
                  type="number"
                  min={0}
                  {...register('estimatedAudience', { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Plantilla de mensaje"
                error={fieldErrors.template}
                className="sm:col-span-2"
              >
                <Textarea {...register('template')} rows={3} />
              </Field>
              <Field
                label="Ventana de envío - desde"
                error={fieldErrors.sendWindowFrom}
              >
                <Input type="time" {...register('sendWindowFrom')} />
              </Field>
              <Field
                label="Ventana de envío - hasta"
                error={fieldErrors.sendWindowTo}
              >
                <Input type="time" {...register('sendWindowTo')} />
              </Field>
            </>
          ) : null}

          {channel === 'TIKTOK' ? (
            <>
              <Field
                label="Cuenta publicitaria"
                error={fieldErrors.adAccount}
                className="sm:col-span-2"
              >
                <Input {...register('adAccount')} />
              </Field>
              <Field label="Objetivo" error={fieldErrors.objective}>
                <Input {...register('objective')} />
              </Field>
              <Field
                label="Presupuesto diario (USD)"
                error={fieldErrors.dailyBudgetUsd}
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...register('dailyBudgetUsd', { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Creativos (separados por coma)"
                error={fieldErrors.creatives}
                className="sm:col-span-2"
              >
                <Input {...register('creatives')} />
              </Field>
            </>
          ) : null}
        </div>
      </Section>

      <div className="mt-6 rounded-control bg-gold-100 p-4 text-sm text-ink">
        Costo total estimado:{' '}
        <strong className="text-ink">
          {isEstimatingCost
            ? 'Calculando...'
            : estimatedCost !== null
              ? `$${estimatedCost.toFixed(2)}`
              : '— selecciona proveedor y medio'}
        </strong>
      </div>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <div className="mt-6 flex gap-3 border-t border-border pt-4">
        <Button type="submit" variant="primary" disabled={isSubmitting || isEstimatingCost}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
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
