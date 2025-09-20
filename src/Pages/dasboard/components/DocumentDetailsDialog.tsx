/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */


import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DateText from "./DateText";

export type Document = {
  id: string | number;
  date: string; // ISO string یا هر مقدار قابل عبور به new Date(...)
  type: string;
  vehicle: string;
  status: "approved" | "rejected" | "pending" | string;
};

interface DocumentDetailsDialogProps {
  document: Document | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dir?: "rtl" | "ltr"; // پیش‌فرض rtl
}

export function DocumentDetailsDialog({
  document,
  isOpen,
  onOpenChange,
  dir = "rtl",
}: DocumentDetailsDialogProps) {
  const { t } = useTranslation();

  if (!document) return null;

  const statusBadgeClass =
    document.status === "approved"
      ? "bg-green-500"
      : document.status === "rejected"
      ? "bg-red-500"
      : "bg-orange-400";

  const isRTL = dir === "rtl";

  // متن وضعیت به‌صورت چندزبانه
  const localizedStatus = useMemo(() => {
    const key = String(document.status).toLowerCase();
    if (key === "approved" || key === "rejected" || key === "pending") {
      return t(`docDetails.statusValues.${key}`);
    }
    // اگر وضعیت سفارشی آمد، همان را نشان بده
    return String(document.status);
  }, [document.status, t]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[83%] md:!max-w-[70%] rounded-xl p-0 overflow-hidden"
        dir={dir}
      >
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <div
            className={`w-full flex flex-col ${
              isRTL ? "items-end" : "items-start"
            } gap-6`}
          >
            {/* عنوان */}
            <div className="w-full flex items-center justify-center md:justify-start md:items-start">
              <p className="text-purple-500 font-bold md:text-2xl md:pr-20">
                {t("docDetails.title")}
              </p>
            </div>

            <div
              className={`flex w-full flex-col lg:flex-row items-center justify-center ${
                isRTL ? "items-end" : "items-start"
              } gap-6`}
            >
              {/* تصویر */}
              <div className="lg:w-1/3 w-full">
                <img
                  src="https://airporttoyota.b-cdn.net/wp-content/uploads/new-toyotav2.webp"
                  alt={
                    document.vehicle
                      ? String(document.vehicle)
                      : t("docDetails.fallbacks.vehicleAlt")
                  }
                  className="shadow-md shadow-gray-400 rounded-xl object-cover w-full h-auto"
                />
              </div>

              {/* جزئیات */}
              <div className="lg:w-2/3 w-full">
                <div className="grid grid-cols-2 gap-2">
                  {/* وضعیت */}
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <Label className="text-sm font-bold text-gray-700">
                      {t("docDetails.fields.status")}
                    </Label>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 rounded-sm text-xs font-medium text-white ${statusBadgeClass}`}
                      >
                        {localizedStatus}
                      </span>
                    </div>
                  </div>

                  {/* شناسه سند */}
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <Label className="text-sm font-bold text-gray-700">
                      {t("docDetails.fields.id")}
                    </Label>
                    <div className="bg-gray-50 p-2 rounded-sm mt-1 text-sm">
                      {document.id}
                    </div>
                  </div>

                  {/* تاریخ (با فرمت پویا بر اساس زبان/تقویم) */}
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <Label className="text-sm font-bold text-gray-700">
                      {t("docDetails.fields.date")}
                    </Label>
                    <div className="bg-gray-50 p-2 rounded-sm mt-1 text-sm">
                      <DateText value={document.date} />
                    </div>
                  </div>

                  {/* نوع سند */}
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <Label className="text-sm font-bold text-gray-700">
                      {t("docDetails.fields.type")}
                    </Label>
                    <div className="bg-gray-50 p-1 rounded-sm mt-1 text-sm">
                      {document.type}
                    </div>
                  </div>

                  {/* وسیله نقلیه */}
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <Label className="text-sm font-bold text-gray-700">
                      {t("docDetails.fields.vehicle")}
                    </Label>
                    <div className="bg-gray-50 p-1 rounded-sm mt-1 text-sm">
                      {document.vehicle}
                    </div>
                  </div>
                </div>

                <div className="w-full border-t border-gray-200 my-4" />

                <p
                  className={`text-stone-500 text-sm font-medium ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("docDetails.more")}
                </p>

                {/* اکشن‌ها */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center py-2 text-xs md:text-sm font-medium"
                    type="button"
                  >
                    <Eye
                      className={isRTL ? "mr-2 mt-1" : "ml-2 mt-1"}
                      height={16}
                      width={16}
                    />
                    <span>{t("docDetails.actions.viewVehicleDetails")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center py-2 text-xs md:text-sm font-medium"
                    type="button"
                  >
                    <Download
                      className={isRTL ? "mr-2" : "ml-2"}
                      height={16}
                      width={16}
                    />
                    <span>
                      {t("docDetails.actions.downloadInvoiceChecklist")}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
