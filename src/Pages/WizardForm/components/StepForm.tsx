/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Check as CheckIcon } from "lucide-react";
import { stepSchema, stepFieldNames, type StepSchema } from "./validation";
import type { StepValues } from "./types";

type Props = {
  stepIndex: number; // 0-based
  values: StepValues; // مقادیر مرحله فعلی
  onSave: (vals: StepValues) => void; // ذخیره در استیت والد
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  isFinalStep: boolean;
};

const StepForm: React.FC<Props> = ({
  stepIndex,
  values,
  onSave,
  onPrev,
  onNext,
  onFinish,
  isFinalStep,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StepSchema>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      v0: values[0],
      v1: values[1],
      v2: values[2],
      v3: values[3],
    },
  });

  useEffect(() => {
    // سنک با استیت (وقتی مرحله عوض می‌شود)
    reset({ v0: values[0], v1: values[1], v2: values[2], v3: values[3] });
  }, [values, reset]);

  const submitAnd = (go: "next" | "finish") =>
    handleSubmit((data) => {
      onSave([data.v0, data.v1, data.v2, data.v3]);
      go === "next" ? onNext() : onFinish();
    })();

  return (
    <>
      {/* تیتر مرحله */}
      <div className="mb-8">
        <h2 className="block text-gray-700 dark:text-gray-200 text-lg font-bold mb-4">
          {t("wizard.step")} {stepIndex + 1}
        </h2>

        {/* چهار فیلد با استایل بدون تغییر */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stepFieldNames.map((name, idx) => {
            const hasError = Boolean(errors[name]);
            const errId = `err-${idx}`;
            return (
              <div key={name} className="mb-4">
                <label
                  className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2"
                  htmlFor={`step-input-${idx}`}
                >
                  {t("wizard.field")} {idx + 1}
                </label>

                <input
                  id={`step-input-${idx}`}
                  type="text"
                  {...register(name)}
                  className={
                    "border rounded w-full py-3 px-4 text-gray-600 dark:text-gray-200 " +
                    (hasError
                      ? "border-red-500 focus:ring-2 focus:ring-red-400"
                      : "ring-1 ring-stone-300")
                  }
                  placeholder={`${t("wizard.inputPlaceholder")} ${idx + 1}`}
                  aria-invalid={hasError ? "true" : "false"}
                  aria-describedby={hasError ? errId : undefined}
                />

                {hasError && (
                  <p id={errId} className="mt-1 text-xs text-red-600">
                    {t("wizard.errors.required")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ناوبری با همان استایل قبلی + آیکن‌های lucide-react */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0 || isSubmitting}
          className={`px-4 py-2 rounded font-medium ${
            stepIndex === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
          aria-disabled={stepIndex === 0}
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft size={16} aria-hidden />
            {t("wizard.previous")}
          </span>
        </button>

        {!isFinalStep ? (
          <button
            type="button"
            onClick={() => submitAnd("next")}
            className="px-4 py-2 rounded font-medium  dark:bg-white/20 dark:text-stone-200 bg-black text-stone-100"
            disabled={isSubmitting}
          >
            <span className="inline-flex items-center gap-2">
              {t("wizard.next")}
              <ArrowRight size={16} aria-hidden />
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => submitAnd("finish")}
            className="px-4 py-2 rounded font-medium bg-green-500 hover:bg-green-600 text-white"
            disabled={isSubmitting}
          >
            <span className="inline-flex items-center gap-2">
              {t("wizard.finish")}
              <CheckIcon size={16} aria-hidden />
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default React.memo(StepForm);
