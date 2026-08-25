"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { newCampaignInputSchema } from "@farmatodo-retail-media/types";
import type {
  Campaign,
  ChannelType,
  MediaCost,
  NewCampaignInput,
  PetaloZone,
  Product,
} from "@farmatodo-retail-media/types";
import { CHANNEL_TYPES } from "@/lib/campaign-vocabulary";
import { campaignsService } from "../../services/campaigns.service";

export interface CampaignFormValues {
  name: string;
  brandIds: string[];
  productSkus: string[];
  supplierId: string;
  startDate: string;
  endDate: string;
  campaignDate: string;
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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_VALUES: CampaignFormValues = {
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

function toDefaultValues(campaign: Campaign | null): CampaignFormValues {
  if (!campaign) return { ...EMPTY_VALUES, campaignDate: today() };

  const base = {
    ...EMPTY_VALUES,
    name: campaign.name,
    brandIds: campaign.brandIds,
    productSkus: campaign.productSkus,
    supplierId: campaign.supplierId,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    campaignDate: campaign.campaignDate,
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
    campaignDate: values.campaignDate,
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

/** Channels a supplier actually has a rate for, derived from its MediaCost rows. */
function channelsForSupplier(supplierId: string, mediaCosts: MediaCost[]): ChannelType[] {
  if (!supplierId) return CHANNEL_TYPES.slice();
  const channels = [...new Set(mediaCosts.filter((m) => m.supplierId === supplierId).map((m) => m.channel))];
  return channels.length > 0 ? channels : CHANNEL_TYPES.slice();
}

/** Debounces a fast-changing value (e.g. a quantity field) so dependent fetches don't fire on every keystroke. */
function useDebouncedValue<T>(value: T, delayMs: number): { value: T; isPending: boolean } {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return { value: debounced, isPending: debounced !== value };
}

/** Channels whose cost can depend on `quantity` (PER_UNIT pricing multiplies by it). */
const CHANNELS_WITH_QUANTITY: ReadonlySet<ChannelType> = new Set(["PETALO", "PARRILLERA"]);

/** Maps a zod issue path on the API payload back to the form field it came from. */
const PAYLOAD_PATH_TO_FIELD: Record<string, keyof CampaignFormValues> = {
  "sendWindow.from": "sendWindowFrom",
  "sendWindow.to": "sendWindowTo",
};

function toFieldErrors(issues: { path: (string | number)[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    const field = PAYLOAD_PATH_TO_FIELD[path] ?? path;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

type SaveTarget = { mode: "create" } | { mode: "edit"; campaignId: string };

export interface UseCampaignFormParams {
  target: SaveTarget;
  initialCampaign: Campaign | null;
  products: Product[];
  mediaCosts: MediaCost[];
}

export function useCampaignForm({ target, initialCampaign, products, mediaCosts }: UseCampaignFormParams) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    defaultValues: toDefaultValues(initialCampaign),
  });

  useEffect(() => {
    reset(toDefaultValues(initialCampaign));
  }, [initialCampaign, reset]);

  const values = watch();
  const filteredProducts = products.filter((p) => values.brandIds?.includes(p.brandId));
  const availableChannels =
    target.mode === "edit" ? CHANNEL_TYPES.slice() : channelsForSupplier(values.supplierId, mediaCosts);

  const usesQuantity = CHANNELS_WITH_QUANTITY.has(values.channel);
  const { value: debouncedQuantity, isPending: isQuantityPending } = useDebouncedValue(values.quantity, 350);
  const costEstimateQuery = useQuery({
    queryKey: ["cost-estimate", values.supplierId, values.channel, usesQuantity ? debouncedQuantity : null],
    queryFn: () =>
      campaignsService.estimateCost({
        supplierId: values.supplierId,
        channel: values.channel,
        ...(usesQuantity ? { quantity: debouncedQuantity } : {}),
      }),
    enabled: Boolean(values.supplierId) && Boolean(values.channel),
    retry: false,
  });
  const estimatedCost = costEstimateQuery.data?.totalCostUsd ?? null;
  const isEstimatingCost = costEstimateQuery.isFetching || (usesQuantity && isQuantityPending);

  useEffect(() => {
    if (target.mode === "edit") return;
    const allowed = channelsForSupplier(values.supplierId, mediaCosts);
    const fallback = allowed[0];
    if (fallback && !allowed.includes(values.channel)) {
      setValue("channel", fallback, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.supplierId, mediaCosts, target.mode]);

  function onBrandsChange(nextBrandIds: string[]) {
    setValue("brandIds", nextBrandIds, { shouldDirty: true });
    const allowedSkus = new Set(products.filter((p) => nextBrandIds.includes(p.brandId)).map((p) => p.sku));
    setValue(
      "productSkus",
      values.productSkus.filter((sku) => allowedSkus.has(sku)),
      { shouldDirty: true },
    );
  }

  function onProductsChange(nextProductSkus: string[]) {
    setValue("productSkus", nextProductSkus, { shouldDirty: true });
  }

  const mutation = useMutation({
    mutationFn: (data: NewCampaignInput) =>
      target.mode === "create"
        ? campaignsService.create(data)
        : campaignsService.update(target.campaignId, data),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      router.push(`/campaigns/${campaign.id}`);
    },
  });

  function onValid(formValues: CampaignFormValues): void {
    setValidationError(null);
    setFieldErrors({});
    const result = newCampaignInputSchema.safeParse(toPayload(formValues));
    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error.issues));
      setValidationError(
        result.error.issues.length > 1
          ? "Hay varios campos con errores. Revisa los mensajes marcados en rojo."
          : (result.error.issues[0]?.message ?? "Datos inválidos"),
      );
      return;
    }
    mutation.mutate(result.data);
  }

  function onInvalid(): void {
    setValidationError("Revisa los campos marcados con * antes de guardar.");
  }

  return {
    register,
    errors,
    onSubmit: handleSubmit(onValid, onInvalid),
    values,
    filteredProducts,
    onBrandsChange,
    onProductsChange,
    estimatedCost,
    isEstimatingCost,
    availableChannels,
    isSubmitting: mutation.isPending,
    fieldErrors,
    error: validationError ?? (mutation.error instanceof Error ? mutation.error.message : null),
  };
}
