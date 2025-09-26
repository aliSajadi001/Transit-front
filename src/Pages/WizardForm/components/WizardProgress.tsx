/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useTranslation } from "react-i18next";
import { Car, Plane, Ship, Truck, Package, MapPin, Check } from "lucide-react";
import type { StepsState } from "./types";

type Props = {
  steps: StepsState;
  currentStep: number; // 0-based
};

const icons = [Car, Plane, Ship, Truck, Package, MapPin];

const WizardProgress: React.FC<Props> = ({ steps, currentStep }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "fa" || i18n.language === "ar";

  return (
    <div className="flex items-center justify-center mb-12 relative">
      {steps.map((step: { id: React.Key | null | undefined; completed: any; }, index: number) => {
        const Icon = icons[index] ?? MapPin;
        return (
          <div key={step.id} className="flex items-center z-10 flex-1 last:flex-none">
            <div className="flex flex-col items-center justify-center relative">
              <div
                className={[
                  "md:w-12 md:h-12 h-6 w-6 rounded-full md:text-base text-xs flex items-center justify-center",
                  "border",
                  step.completed
                    ? "border-green-700 bg-green-400"
                    : currentStep === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-stone-300",
                  "transition-all duration-300 relative z-10"
                ].join(" ")}
              >
                {step.completed ? (
                  <Check className="md:w-6 md:h-6 h-4 w-4 text-white" aria-hidden />
                ) : (
                  <Icon
                    className={[
                      "md:w-6 md:h-6 h-4 w-4",
                      currentStep === index ? "text-blue-500" : "text-stone-500"
                    ].join(" ")}
                    aria-hidden
                  />
                )}
              </div>
              <span
                className={[
                  "text-xs md:mt-2 mt-1",
                  currentStep === index ? "font-bold text-blue-600" : "text-stone-600"
                ].join(" ")}
              >
                {t("wizard.step")} {index + 1}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={[
                  "flex-1 w-full h-[1.6px] md:mx-2 mx-1 md:mb-6 mb-4",
                  step.completed ? "bg-green-600" : "bg-stone-300",
                  "transition-all duration-500"
                ].join(" ")}
                dir={isRtl ? "rtl" : "ltr"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(WizardProgress);
