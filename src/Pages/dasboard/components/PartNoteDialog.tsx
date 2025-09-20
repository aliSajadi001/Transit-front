

import  { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export interface PartNoteDialogProps {
  part: { id: number; name: string; note?: string } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveNote: (partId: number, note: string) => void;
  dir?: "rtl" | "ltr";
}

export function PartNoteDialog({
  part,
  isOpen,
  onOpenChange,
  onSaveNote,
  dir = "rtl",
}: PartNoteDialogProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(part?.note ?? "");
  }, [part]);

  if (!part) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="sm:max-w-md w-[80%] rounded-xl p-5 max-h-[85vh] flex flex-col overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t("partNote.title", { part: part.name })}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t("partNote.description")}
          </DialogDescription>
        </DialogHeader>

        {/* بدنه‌ی اسکرول‌پذیر */}
        <div className="mt-4 flex-1 overflow-auto">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("partNote.placeholder")}
            className="w-full min-h-[160px] max-h-[50vh] resize-y overflow-auto text-base"
            aria-label={t("partNote.placeholder")}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-5"
          >
            {t("partNote.buttons.cancel")}
          </Button>
          <Button
            onClick={() => onSaveNote(part.id, note)}
            className="px-5 bg-blue-600 hover:bg-blue-700"
          >
            {t("partNote.buttons.saveNote")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
