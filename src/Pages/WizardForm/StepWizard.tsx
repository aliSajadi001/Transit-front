import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  PersistedState,
  StepsState,
  StepValues,
} from "./components/types";
import WizardProgress from "./components/WizardProgress";
import StepForm from "./components/StepForm";

const LS_KEY = "wizardStepsState";

const makeEmptyStep = (id: number) => ({
  id,
  values: ["", "", "", ""] as StepValues,
  completed: false,
});

const initialSteps: StepsState = [0, 1, 2, 3].map(makeEmptyStep);

const StepWizard: React.FC = () => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState<StepsState>(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // آخرین ایندکس مرحله (صفر-بیس)
  const prevLastIndex = 3;

  // بازیابی از localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (
          Array.isArray(parsed.steps) &&
          typeof parsed.currentStep === "number"
        ) {
          setSteps(
            parsed.steps.map((s, idx) => ({
              id: typeof s.id === "number" ? s.id : idx,
              values: Array.isArray(s.values)
                ? (s.values as StepValues)
                : ["", "", "", ""],
              completed: !!s.completed,
            }))
          );
          setCurrentStep(
            Math.max(0, Math.min(prevLastIndex, parsed.currentStep))
          );
          setIsComplete(!!parsed.isComplete);
        }
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ذخیره در localStorage
  useEffect(() => {
    if (isLoading) return;
    const payload: PersistedState = { steps, currentStep, isComplete };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [steps, currentStep, isComplete, isLoading]);

  // هندلرها
  const saveStepValues = (vals: StepValues) => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === currentStep ? { ...s, values: vals } : s))
    );
  };

  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const goNext = () => {
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === currentStep ? { ...s, completed: true } : s
      )
    );
    setCurrentStep((s) => Math.min(prevLastIndex, s + 1));
  };

  const finish = () => {
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === currentStep ? { ...s, completed: true } : s
      )
    );
    setIsComplete(true);
  };

  const resetWizard = () => {
    setSteps(initialSteps);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const isFinalStep = currentStep === prevLastIndex;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">{t("wizard.loading")}</div>
      </div>
    );
  }

  return (
    <div className="dark:bg-gradient-to-r dark:from-neutral-800 dark:via-black dark:to-neutral-800 pt-16 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 min-h-screen flex flex-col items-center justify-center text-stone-600 dark:text-stone-200 ">
      {/* هدر */}
      <div className="md:text-3xl text-xl font-bold text-center mb-6 w-full flex items-center justify-center text-stone-500 ">
        {t("wizard.title")}
      </div>

      {/* بدنه فرم */}
      <div className="md:w-[90%] w-full md:p-9 p-2 bg-white/30 dark:bg-black/10 lg border border-stone-200 dark:border-neutral-900 rounded-lg">
        <WizardProgress steps={steps} currentStep={currentStep} />

        {!isComplete ? (
          <StepForm
            stepIndex={currentStep}
            values={steps[currentStep].values}
            onSave={saveStepValues}
            onPrev={goPrev}
            onNext={goNext}
            onFinish={finish}
            isFinalStep={isFinalStep}
          />
        ) : (
          <>
            <div className="mt-8 p-4 bg-green-100 border border-green-200 rounded-lg text-green-800">
              <p className="font-bold text-center">
                {t("wizard.allStepsCompleted")}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-6">
                {steps.map((step, stepIndex) => (
                  <div key={step.id} className="bg-white p-4 rounded border">
                    <p className="font-medium text-lg mb-2">
                      {t("wizard.step")} {stepIndex + 1}:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.values.map((value, fieldIndex) => (
                        <div key={fieldIndex}>
                          <p className="font-medium">
                            {t("wizard.field")} {fieldIndex + 1}:
                          </p>
                          <p className="mt-1 bg-gray-50 p-2 rounded">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={resetWizard}
                  className="px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
                >
                  {t("wizard.restart")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(StepWizard);
