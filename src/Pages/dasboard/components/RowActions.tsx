/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import  { memo, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MoreVertical, Eye, Pencil } from "lucide-react";
import type { DataRow } from "../mockData";
import { DocumentDetailsDialog } from "./DocumentDetailsDialog";
import {
  ChecklistDialog,
  type ChecklistDocument,
  type ChecklistSavePayload,
} from "./ChecklistDialog";
import { useTranslation } from "react-i18next";

/* ===================== Types & helpers ===================== */
type DialogStatus = "approved" | "rejected" | "pending" | string;

type DocumentForDialog = {
  id: string | number;
  date: string;
  type: string;
  vehicle: string;
  status: DialogStatus;
};

type RowActionsProps = {
  data: DataRow;
  onView?: (data: DataRow) => void;
  onEdit?: (data: DataRow) => void;
  onEditSubmit?: (payload: ChecklistSavePayload, row: DataRow) => void;
};

function normalizeStatus(status: string): DialogStatus {
  switch (status) {
    case "فعال":
      return "approved";
    case "غیرفعال":
      return "rejected";
    case "در انتظار":
      return "pending";
    default:
      return status;
  }
}

function toDocument(row: DataRow): DocumentForDialog {
  return {
    id: (row as any).id ?? (row as any).documentId ?? "",
    date: (row as any).date ?? (row as any).createdAt ?? "",
    type: (row as any).type ?? (row as any).documentType ?? "",
    vehicle:
      (row as any).vehicle ?? (row as any).name ?? (row as any).title ?? "",
    status: normalizeStatus((row as any).status ?? ""),
  };
}

/* ===================== Component ===================== */
function RowActionsImpl({
  data,
  onView,
  onEdit,
  onEditSubmit,
}: RowActionsProps) {
  const { t } = useTranslation();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ساخت مدل دیالوگ فقط وقتی data عوض شد
  const documentForDialog = useMemo(() => toDocument(data), [data]);
  const checklistDoc = documentForDialog as ChecklistDocument;

  // باز کردن دیالوگ‌ها بعد از بسته‌شدن منو (frame بعدی)
  const handleView = useCallback(() => {
    onView?.(data);
    requestAnimationFrame(() => setIsViewOpen(true));
  }, [data, onView]);

  const handleEdit = useCallback(() => {
    onEdit?.(data);
    requestAnimationFrame(() => setIsEditOpen(true));
  }, [data, onEdit]);

  return (
    <TooltipProvider delayDuration={180}>
      <DropdownMenu>
        {/* دکمهٔ منو با تولتیپ چندزبانه */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("dataTable.actions.menu.aria")}
                className="h-8 w-8 p-0 grid place-items-center"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t("dataTable.actions.tooltip.openMenu")}
          </TooltipContent>
        </Tooltip>

        {/* Dropdown با هدر «عملیات» و خط جداکننده، سپس آیتم‌ها با آیکن + متن و تولتیپ */}
        <DropdownMenuContent align="end" sideOffset={4} className="w-44">
          <DropdownMenuLabel className="text-stone-600">
            {t("dataTable.actions.menu.title")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleView}
                aria-label={t("dataTable.actions.view")}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>{t("dataTable.actions.view")}</span>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              {t("dataTable.actions.tooltip.view")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleEdit}
                aria-label={t("dataTable.actions.edit")}
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span>{t("dataTable.actions.edit")}</span>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              {t("dataTable.actions.tooltip.edit")}
            </TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <DocumentDetailsDialog
        document={documentForDialog}
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      {/* Edit/Checklist Dialog */}
      <ChecklistDialog
        document={checklistDoc}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        dir="rtl"
        onSave={(payload) => {
          console.log("[RowActions] checklist save payload", {
            rowId: (data as any).id,
            ...payload,
          });
          onEditSubmit?.(payload, data);
        }}
      />
    </TooltipProvider>
  );
}

/* جلوگیری از رندرهای غیرضروری */
export default memo(
  RowActionsImpl,
  (prev, next) =>
    (prev.data as any)?.id === (next.data as any)?.id &&
    prev.onView === next.onView &&
    prev.onEdit === next.onEdit &&
    prev.onEditSubmit === next.onEditSubmit
);
