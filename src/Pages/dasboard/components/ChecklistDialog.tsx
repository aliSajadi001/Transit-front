/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Car, Check, X, FilePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PartNoteDialog } from "./PartNoteDialog";
import { useTranslation } from "react-i18next";

/** نوع سندی که این دیالوگ نیاز دارد (بدون next-intl) */
export type ChecklistDocument = {
  id: string | number;
  date: string;
  type: string;
  vehicle: string;
  status: "approved" | "rejected" | "pending" | string;
};

export type SparePart = {
  id: number;
  name: string;
  reserved: boolean;
  note?: string;
};

export type ChecklistSavePayload = {
  documentId: string | number;
  reservedParts: SparePart[];
  stockParts: SparePart[];
  note: string;
  representative: string;
};

interface ChecklistDialogProps {
  document: ChecklistDocument | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (payload: ChecklistSavePayload) => void; // برای ارسال به والد
  dir?: "rtl" | "ltr"; // پیش‌فرض rtl
}

export function ChecklistDialog({
  document,
  isOpen,
  onOpenChange,
  onSave,
  dir = "rtl",
}: ChecklistDialogProps) {
  const { t, i18n } = useTranslation();
  if (!document) return null;
  const isRTL = dir === "rtl";

  // کلیدهای قطعات؛ نام‌ها از ترجمه‌ها خوانده می‌شوند
  const partKeys = useMemo(
    () => [
      "engineOil",
      "airFilter",
      "brakePads",
      "sparkPlugs",
      "battery",
      "wiperBlades",
      "tire",
      "headlight",
      "radiator",
      "alternator",
      "clutchKit",
      "fuelPump",
      "ignitionCoil",
      "oxygenSensor",
      "shockAbsorber",
      "starter",
      "thermostat",
      "timingBelt",
      "waterPump",
      "wheelBearing",
      "cabinFilter",
      "cvAxle",
      "exhaustManifold",
      "injector",
      "glowPlug",
      "horn",
      "muffler",
      "pcvValve",
      "serpentineBelt",
      "turbocharger",
    ],
    []
  );

  // لیست قطعات اولیه (ترجمه‌شده)
  const initialParts = useMemo<SparePart[]>(
    () =>
      partKeys.map((key: any, index: number) => ({
        id: index + 1,
        name: t(`checklist.parts.${key}`),
        reserved: index < 10, // ده مورد اول رزرو
      })),
    // تغییر زبان باعث بازتولید نام‌ها می‌شود
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  );

  const [parts, setParts] = useState<SparePart[]>(initialParts);

  // از تایپ‌های دقیق استفاده می‌کنیم تا inference خراب نشود
  const reservedParts: SparePart[] = parts.filter((p) => p.reserved);
  const stockParts: SparePart[] = parts.filter((p) => !p.reserved);

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);

  const [globalNote, setGlobalNote] = useState("");
  const [representative, setRepresentative] = useState("");

  // وقتی سند یا زبان عوض شد، فرم و قطعات را با ترجمه‌ی جدید ریست کن
  useEffect(() => {
    setParts(initialParts);
    setGlobalNote("");
    setRepresentative("");
    setSelectedPart(null);
    setNoteDialogOpen(false);
  }, [document, initialParts]);

  const togglePart = (id: number, fromReserved: boolean) => {
    setParts((prev: SparePart[]) =>
      prev.map((part: SparePart) =>
        part.id === id ? { ...part, reserved: !fromReserved } : part
      )
    );
  };

  const saveNoteForPart = (partId: number, note: string) => {
    setParts((prev: SparePart[]) =>
      prev.map((part: SparePart) =>
        part.id === partId ? { ...part, note } : part
      )
    );
  };

  const handleSave = () => {
    const payload: ChecklistSavePayload = {
      documentId: document.id,
      reservedParts,
      stockParts,
      note: globalNote,
      representative,
    };
    onSave?.(payload); // ارسال به والد برای لاگ/API
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="!max-w-[90%] md:!max-w-[70%] rounded-xl p-4 max-h-[90vh] overflow-hidden flex flex-col"
          dir={dir}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center pr-10 md:py-5 py-3 gap-2 text-lg font-bold">
              <Car className="text-stone-600" size={24} />
              <span className="md:text-base text-sm text-stone-600">
                {t("checklist.title")}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto flex-1">
            {/* اطلاعات خودرو */}
            <div className="bg-stone-200/60 shadow-md shadow-stone-300 rounded-lg p-4   mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div
                  className={`mb-3 md:mb-0 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <p className="font-semibold text-sm md:text-base text-stone-600">
                    {t("checklist.registrationInfo")}
                  </p>
                </div>
                <div className="bg-stone-300/90 border border-stone-300 rounded-full px-4 py-2">
                  <p className="font-mono md:text-base text-sm text-stone-700">
                    {t("checklist.vehicleAndModel", {
                      vehicle: document.vehicle,
                      year: 2023,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* قطعات رزرو شده */}
            <div className="border border-stone-200 shadow-md shadow-gray-300 md:p-5 p-2 rounded-lg">
              <div className="mb-6 bg-green-100 rounded-xl p-4 shadow-md shadow-green-300">
                <p className="font-semibold mb-3 text-stone-600 flex items-center md:text-base text-sm gap-2">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center">
                    <Check size={16} />
                  </span>
                  {t("checklist.sections.availableReservedTitle")}
                </p>

                {reservedParts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reservedParts.map((part) => (
                      <div
                        key={part.id}
                        className="bg-white border border-green-300 hover:scale-x-110 duration-300 transition-all rounded-lg p-3 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="md:text-sm text-stone-600 text-xs font-medium flex-1">
                            {part.name}
                          </span>
                          <div
                            className="relative w-14 h-6 bg-green-500 rounded-full cursor-pointer flex items-center justify-end px-1"
                            onClick={() => togglePart(part.id, true)}
                            aria-label={t("common.yes")}
                            title={t("common.yes")}
                          >
                            <span className="text-xs  font-bold text-white pr-6">
                              {t("common.yes")}
                            </span>
                            <div className="absolute right-1 w-4 h-4 bg-white rounded-full border border-green-500" />
                          </div>
                        </div>

                        <div className="mt-3">
                          <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-1 text-blue-600 text-xs h-8"
                            onClick={() => {
                              setSelectedPart(part);
                              setNoteDialogOpen(true);
                            }}
                          >
                            <FilePlus size={12} />
                            {t("checklist.buttons.addNote")}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-stone-600">
                    {t("checklist.messages.noAvailableFound")}
                  </div>
                )}
              </div>

              {/* قطعات ناموجود */}
              <div className="mb-6 bg-red-100 rounded-xl p-4 shadow-md shadow-red-300">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-stone-600">
                  <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                    <X size={16} />
                  </span>
                  {t("checklist.sections.unavailableTitle")}
                </h3>

                {stockParts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {stockParts.map((part) => (
                      <div
                        key={part.id}
                        className="bg-white border hover:scale-x-110 duration-300 transition-all border-gray-300 rounded-lg p-3 flex flex-col"
                      >
                        <div className="flex justify-between items-center h-full">
                          <span className="text-sm font-medium flex-1 text-stone-600">
                            {part.name}
                          </span>
                          <div
                            className="relative w-14 h-6 bg-gray-300 rounded-full cursor-pointer flex items-center justify-start px-1"
                            onClick={() => togglePart(part.id, false)}
                            aria-label={t("common.no")}
                            title={t("common.no")}
                          >
                            <div className="absolute left-1 w-4 h-4 bg-white rounded-full" />
                            <span className="text-xs font-bold pr-2 text-red-600 ml-5">
                              {t("common.no")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-red-600">
                    {t("checklist.messages.allAvailable")}
                  </div>
                )}
              </div>
            </div>

            {/* یادداشت کلی */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2 md:text-base text-sm text-stone-600">
                {t("checklist.headings.note")}
              </h4>
              <div className="border border-stone-200 rounded-xl p-4">
                <Textarea
                  className="w-full rounded-xl p-4"
                  rows={8}
                  placeholder={t("checklist.placeholders.note")}
                  value={globalNote}
                  onChange={(e: { target: { value: any } }) =>
                    setGlobalNote(e.target.value)
                  }
                />
              </div>
            </div>

            {/* نماینده مرزی */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2 md:text-base text-sm text-stone-600">
                {t("checklist.headings.borderRepresentative")}
              </h4>
              <div className="border border-stone-200 rounded-xl p-4">
                <Input
                  type="text"
                  className="w-full rounded-md p-4"
                  placeholder={t("checklist.placeholders.agentName")}
                  value={representative}
                  onChange={(e: { target: { value: any } }) =>
                    setRepresentative(e.target.value)
                  }
                />
              </div>
            </div>

            {/* تصویر/نمودار بازدید */}
            <div className="mt-6 relative">
              <h4 className="font-semibold mb-2 text-stone-600">
                {t("checklist.headings.visitChart")}
              </h4>
              <div className="border border-stone-200 rounded-xl p-4">
                <div className="text-center">
                  <div className="relative w-full h-48">
                    <img
                      alt={t("checklist.alts.visitChart")}
                      className="object-cover w-full rounded-xl shadow-md shadow-stone-900"
                      src="https://img.freepik.com/premium-vector/stock-market-graph-forex-trading-chart-business-financial-concepts-reports-investment-dark-background-vector-illustration_87788-496.jpg"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm pb-6 text-stone-200">
                {t("checklist.chart.caption")}
              </div>
            </div>
          </div>

          {/* دکمه‌ها */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              {t("checklist.buttons.cancel")}
            </Button>
            <Button
              className="px-6 bg-green-600 hover:bg-green-700"
              onClick={handleSave}
            >
              {t("checklist.buttons.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* دیالوگ یادداشت قطعه */}
      {selectedPart && (
        <PartNoteDialog
          part={selectedPart}
          isOpen={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          onSaveNote={(pid, n) => {
            saveNoteForPart(pid, n);
            setNoteDialogOpen(false);
          }}
          dir={dir}
        />
      )}
    </>
  );
}
