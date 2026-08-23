"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { campaignsService } from "../../services/campaigns.service";

export interface CampaignFormValues {
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

/**
 * Referential estimate only, shown while the analyst fills the form — the
 * source of truth is `calculateTotalCost` on the backend, which recomputes
 * and validates the real cost at save time regardless of what this returns.
 */
function estimateCost(values: CampaignFormValues, mediaCosts: MediaCost[]): number | null {
  const found = mediaCosts.find(
    (m) => m.supplierId === values.supplierId && m.channel === values.channel,
  );
  if (!found) return null;
  const quantity =
    values.channel === "PETALO" || values.channel === "PARRILLERA" ? Number(values.quantity) || 0 : 1;
  return Math.round(found.unitCostUsd * quantity * 100) / 100;
}

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
    formState: { errors },
  } = useForm<CampaignFormValues>({
    defaultValues: toDefaultValues(initialCampaign),
  });

  useEffect(() => {
    reset(toDefaultValues(initialCampaign));
  }, [initialCampaign, reset]);

  const values = watch();
  const filteredProducts = products.filter((p) => values.brandIds?.includes(p.brandId));
  const estimatedCost = estimateCost(values, mediaCosts);

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
    estimatedCost,
    isSubmitting: mutation.isPending,
    fieldErrors,
    error: validationError ?? (mutation.error instanceof Error ? mutation.error.message : null),
  };
}
