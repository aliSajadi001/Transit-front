"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

export type Company = { id: number; name: string; email: string };

type RowActionsProps = {
  company: Company;
  onEdit?: (updated: Company) => void;
  onDelete?: (id: number) => void;
};

export default function RowActions({
  company,
  onEdit,
  onDelete,
}: RowActionsProps) {
  const { t } = useTranslation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [form, setForm] = useState<Company>(company);
  useEffect(() => setForm(company), [company]);

  const handleSave = () => {
    onEdit?.(form);
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete?.(company.id);
    setIsDeleteOpen(false);
  };

  return (
    <>
      {/* Icon Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-stone-300 text-stone-700 hover:bg-stone-100"
            title={t("rowActions.aria.actionsMenu")}
            aria-label={t("rowActions.aria.actionsMenu")}
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>{t("rowActions.menu.title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsEditOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="w-4 h-4 ml-2" aria-hidden="true" />
            {t("rowActions.menu.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="cursor-pointer text-red-600 focus:text-red-700"
          >
            <Trash2 className="w-4 h-4 ml-2" aria-hidden="true" />
            {t("rowActions.menu.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rowActions.editDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("rowActions.editDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <label className="text-sm text-stone-700">
                {t("rowActions.editDialog.fields.id")}
              </label>
              <Input value={form.id} disabled aria-readonly aria-disabled />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-stone-700">
                {t("rowActions.editDialog.fields.name")}
              </label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t("rowActions.editDialog.placeholders.name") || ""}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-stone-700">
                {t("rowActions.editDialog.fields.email")}
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder={
                  t("rowActions.editDialog.placeholders.email") || ""
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                {t("rowActions.common.cancel")}
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              className="bg-stone-700 hover:bg-stone-800"
              type="button"
            >
              {t("rowActions.common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rowActions.deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("rowActions.deleteDialog.description", {
                name: company.name,
              })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                {t("rowActions.common.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              type="button"
            >
              {t("rowActions.common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
