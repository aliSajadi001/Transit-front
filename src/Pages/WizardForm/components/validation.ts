import { z } from "zod";

export const singleFieldSchema = z
  .string()
  .trim()
  .min(1, { message: "required" });

export const stepSchema = z.object({
  v0: singleFieldSchema,
  v1: singleFieldSchema,
  v2: singleFieldSchema,
  v3: singleFieldSchema,
});

export type StepSchema = z.infer<typeof stepSchema>;

/** کمک برای اسم‌گذاری فیلدها در RHF */
export const stepFieldNames = ["v0", "v1", "v2", "v3"] as const;
