// src/validation/manifesto.schema.ts
import { z } from "zod";
import DateObject from "react-date-object";

export const COUNTRIES = [
  "iran",
  "germany",
  "turkey",
  "italy",
  "china",
  "uae",
] as const;

const isDateObject = (v: unknown): v is DateObject =>
  v instanceof DateObject && !!v.toDate?.();

// ✅ خطای Country را همیشه به کلید i18n برمی‌گردانیم
export const CountryEnum = z.enum(COUNTRIES, {
  error: "manifesto.errors.countryRequired",
});

export const ManifestoSchema = z.object({
  serial: z.string().min(1, { message: "manifesto.errors.serialRequired" }),
  manifestoNo: z
    .string()
    .min(1, { message: "manifesto.errors.manifestoNoRequired" }),
  // ⬇️ این خط کافیست تا ترجمه خطا درست شود
  country: CountryEnum,
  manifestDate: z
    .any()
    .refine(isDateObject, { message: "manifesto.errors.manifestDateRequired" }),
  carrierCompany: z
    .string()
    .min(1, { message: "manifesto.errors.carrierCompanyRequired" }),
  customsClearanceDate: z.any().refine(isDateObject, {
    message: "manifesto.errors.customsClearanceDateRequired",
  }),
  agentFullName: z
    .string()
    .min(1, { message: "manifesto.errors.agentFullNameRequired" }),
  vesselName: z
    .string()
    .min(1, { message: "manifesto.errors.vesselNameRequired" }),
  notes: z.string().optional(),
});

export type ManifestoForm = z.infer<typeof ManifestoSchema>;
