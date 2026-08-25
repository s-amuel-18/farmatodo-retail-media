import { z } from "zod";

export const costEstimateQuerySchema = z.object({
  channel: z.enum(["PETALO", "PARRILLERA", "SMS", "TIKTOK"]),
  supplierId: z.string().min(1),
  quantity: z.coerce.number().int().nonnegative().optional(),
});

export type CostEstimateQueryDto = z.infer<typeof costEstimateQuerySchema>;
