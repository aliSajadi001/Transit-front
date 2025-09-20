"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// تاریخ
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import arabic from "react-date-object/calendars/arabic";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import arabic_ar from "react-date-object/locales/arabic_ar";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  COUNTRIES,
  ManifestoSchema,
  type ManifestoForm,
} from "./validation/manifesto.schema";

// ✅ toast + icon
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

// ✅ اسکیما و تایپ‌ها از فایل جدا

function useCalendarByLang(lang: string) {
  const code = (lang || "").toLowerCase();

  if (code.startsWith("fa")) {
    return { calendar: persian, locale: persian_fa };
  }
  if (code.startsWith("ar")) {
    return { calendar: arabic, locale: arabic_ar };
  }
  // پیش‌فرض: انگلیسی/سایر → میلادی
  return { calendar: gregorian, locale: gregorian_en };
}

export default function Manifesto() {
  const { t, i18n } = useTranslation();
  const { calendar, locale } = useCalendarByLang(i18n.language || "fa");
  const dir = i18n.dir();

  // ✅ react-hook-form با zodResolver
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ManifestoForm>({
    resolver: zodResolver(ManifestoSchema),
    defaultValues: {
      serial: "",
      manifestoNo: "",
      country: "" as any, // با Select ست می‌شود
      manifestDate: undefined as any,
      carrierCompany: "",
      customsClearanceDate: undefined as any,
      agentFullName: "",
      vesselName: "",
      notes: "",
    },
    mode: "onSubmit",
  });

  const countryOptions = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        value: c,
        label: t(`manifesto.countries.${c}`),
      })),
    [t]
  );

  const onSubmit = (form: ManifestoForm) => {
    // فقط وقتی اینجا می‌آد که هیچ خطایی نباشه
    const payload = {
      ...form,
      manifestDateISO: form.manifestDate
        ? form.manifestDate.toDate()?.toISOString()
        : null,
      customsClearanceDateISO: form.customsClearanceDate
        ? form.customsClearanceDate.toDate()?.toISOString()
        : null,
    };
    console.log("Manifesto payload:", payload);

    toast(t("manifesto.toast.saved"), {
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  };

  // کلاس‌های پایه برای مرئی بودن بردرها + رینگ واضح + رنگ متن ورودی‌ها
  const borderBase = "border border-stone-400/70 dark:border-stone-600";
  const focusRing =
    "focus-visible:ring-2 focus-visible:ring-stone-500 dark:focus-visible:ring-stone-300 focus-visible:outline-none";
  const baseInputClass = `h-10 ${borderBase} ${focusRing} text-stone-700`;
  const baseSelectTriggerClass = `h-10 ${borderBase} ${focusRing} text-stone-700`;
  const baseDateInputClass = `w-full ${borderBase} ${focusRing} text-stone-700 rounded-md bg-background px-3 py-2 text-sm shadow-sm`;
  const baseTextareaClass = `min-h-28 ${borderBase} ${focusRing} text-stone-700`;

  return (
    // رپر بیرونی با گرادیان
    <div className="md:p-4 p-0 rounded-lg bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200 min-h-screen flex items-center justify-center">
      {/* ⬇️ رنگ متن همهٔ بخش‌های داخلی */}
      <div className="md:w-[90%] w-full md:rounded-xl md:p-9 p-2 bg-white/30 backdrop-blur-lg text-stone-400">
        {/* ✅ هدر بالای صفحه: وسط و کمی بزرگ‌تر روی دسکتاپ */}
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
          <h1 className="font-bold text-3xl md:text-4xl text-stone-500 text-center">
            {t("manifesto.header")}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          dir={dir}
          className="w-full max-w-5xl mx-auto p-4 md:p-6"
        >
          <h2 className="text-xl font-semibold mb-4">{t("manifesto.title")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Serial */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="serial" className="mb-1 block">
                {t("manifesto.fields.serial")}
              </Label>
              <Input
                id="serial"
                {...register("serial")}
                aria-invalid={!!errors.serial}
                placeholder={t("manifesto.placeholders.serial") || ""}
                className={`${baseInputClass} ${
                  errors.serial
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {errors.serial && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.serial.message as string)}
                </p>
              )}
            </div>

            {/* Manifesto Number */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="manifestoNo" className="mb-1 block">
                {t("manifesto.fields.manifestoNo")}
              </Label>
              <Input
                id="manifestoNo"
                {...register("manifestoNo")}
                aria-invalid={!!errors.manifestoNo}
                placeholder={t("manifesto.placeholders.manifestoNo") || ""}
                className={`${baseInputClass} ${
                  errors.manifestoNo
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {errors.manifestoNo && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.manifestoNo.message as string)}
                </p>
              )}
            </div>

            {/* Country (Select) */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="country" className="mb-1 block">
                {t("manifesto.fields.country")}
              </Label>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger
                      id="country"
                      aria-invalid={!!errors.country}
                      className={`${baseSelectTriggerClass} ${
                        errors.country
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={t("manifesto.placeholders.country") || ""}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.country.message as string)}
                </p>
              )}
            </div>

            {/* Manifest Date (react-multi-date-picker) */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="manifestDate" className="mb-1 block">
                {t("manifesto.fields.manifestDate")}
              </Label>
              <Controller
                control={control}
                name="manifestDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value ?? undefined}
                    onChange={(v: DateObject | DateObject[] | null) =>
                      field.onChange((v as DateObject) || null)
                    }
                    calendar={calendar}
                    locale={locale}
                    inputClass={`${baseDateInputClass} ${
                      errors.manifestDate
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    containerStyle={{ width: "100%" }}
                    editable
                    calendarPosition={
                      dir === "rtl" ? "bottom-right" : "bottom-left"
                    }
                  />
                )}
              />
              {errors.manifestDate && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.manifestDate.message as string)}
                </p>
              )}
            </div>

            {/* Carrier Company */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="carrierCompany" className="mb-1 block">
                {t("manifesto.fields.carrierCompany")}
              </Label>
              <Input
                id="carrierCompany"
                {...register("carrierCompany")}
                aria-invalid={!!errors.carrierCompany}
                placeholder={t("manifesto.placeholders.carrierCompany") || ""}
                className={`${baseInputClass} ${
                  errors.carrierCompany
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {errors.carrierCompany && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.carrierCompany.message as string)}
                </p>
              )}
            </div>

            {/* Customs Clearance Date */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="customsClearanceDate" className="mb-1 block">
                {t("manifesto.fields.customsClearanceDate")}
              </Label>
              <Controller
                control={control}
                name="customsClearanceDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value ?? undefined}
                    onChange={(v: DateObject | DateObject[] | null) =>
                      field.onChange((v as DateObject) || null)
                    }
                    calendar={calendar}
                    locale={locale}
                    inputClass={`${baseDateInputClass} ${
                      errors.customsClearanceDate
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    containerStyle={{ width: "100%" }}
                    editable
                    calendarPosition={
                      dir === "rtl" ? "bottom-right" : "bottom-left"
                    }
                  />
                )}
              />
              {errors.customsClearanceDate && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.customsClearanceDate.message as string)}
                </p>
              )}
            </div>

            {/* Agent Full Name */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="agentFullName" className="mb-1 block">
                {t("manifesto.fields.agentFullName")}
              </Label>
              <Input
                id="agentFullName"
                {...register("agentFullName")}
                aria-invalid={!!errors.agentFullName}
                placeholder={t("manifesto.placeholders.agentFullName") || ""}
                className={`${baseInputClass} ${
                  errors.agentFullName
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {errors.agentFullName && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.agentFullName.message as string)}
                </p>
              )}
            </div>

            {/* Vessel Name */}
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
              <Label htmlFor="vesselName" className="mb-1 block">
                {t("manifesto.fields.vesselName")}
              </Label>
              <Input
                id="vesselName"
                {...register("vesselName")}
                aria-invalid={!!errors.vesselName}
                placeholder={t("manifesto.placeholders.vesselName") || ""}
                className={`${baseInputClass} ${
                  errors.vesselName
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {errors.vesselName && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {t(errors.vesselName.message as string)}
                </p>
              )}
            </div>

            {/* Notes (Textarea) — اختیاری */}
            <div
              className={`md:col-span-2 ${
                dir === "rtl" ? "text-right" : "text-left"
              }`}
            >
              <Label htmlFor="notes" className="mb-1 block">
                {t("manifesto.fields.notes")}
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder={t("manifesto.placeholders.notes") || ""}
                className={baseTextareaClass}
              />
              {/* notes اختیاری است، لذا ارور ندارد */}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="submit">{t("manifesto.actions.save")}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                reset({
                  serial: "",
                  manifestoNo: "",
                  country: "" as any,
                  manifestDate: undefined as any,
                  carrierCompany: "",
                  customsClearanceDate: undefined as any,
                  agentFullName: "",
                  vesselName: "",
                  notes: "",
                })
              }
            >
              {t("manifesto.actions.reset")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
