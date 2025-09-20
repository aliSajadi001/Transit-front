/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  Fragment,
  type JSX,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingFn,
  type Table,
  type FilterFn,
  type Column,
} from "@tanstack/react-table";
import { rankItem, compareItems } from "@tanstack/match-sorter-utils";

// shadcn/ui
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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

// toast
import { toast } from "sonner";

// Icons
import { Plus } from "lucide-react";
import NavbarInfo from "./components/Navbar";

// Row actions
import RowActions, { type Company } from "./components/RowActions";

// i18n
import { useTranslation } from "react-i18next";

/* ===================== Seed Data (Gmail) ===================== */
const seedCompanies: Company[] = [
  { id: 1, name: "Tech Innovations Inc.", email: "techinnovations@gmail.com" },
  {
    id: 2,
    name: "Global Manufacturing Ltd.",
    email: "global.manufacturing@gmail.com",
  },
  {
    id: 3,
    name: "International Trading Co.",
    email: "intl.trading.co@gmail.com",
  },
  {
    id: 4,
    name: "Financial Services Group",
    email: "financial.services.group@gmail.com",
  },
  {
    id: 5,
    name: "Construction Engineering Corp.",
    email: "construction.eng.corp@gmail.com",
  },
];

/* ===================== Fuzzy ===================== */
const fuzzyFilter: FilterFn<Company> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(
    String(row.getValue(columnId) ?? ""),
    String(value ?? "")
  );
  addMeta?.({ itemRank });
  return itemRank.passed;
};

const fuzzySort: SortingFn<Company> = (rowA, rowB, columnId) => {
  let dir = 0;
  const aMeta = (rowA as any).columnFiltersMeta?.[columnId]?.itemRank;
  const bMeta = (rowB as any).columnFiltersMeta?.[columnId]?.itemRank;
  if (aMeta && bMeta) dir = compareItems(aMeta, bMeta);
  return dir === 0
    ? (String(rowA.getValue(columnId)) || "").localeCompare(
        String(rowB.getValue(columnId)) || ""
      )
    : dir;
};

/* ===================== Debounced Input ===================== */
const DebouncedInput = React.memo(function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  className,
  ...props
}: {
  value: string | number;
  onChange: (value: string) => void;
  debounce?: number;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const [value, setValue] = useState<string | number>(initialValue);
  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => {
    const t = window.setTimeout(() => onChange(String(value ?? "")), debounce);
    return () => window.clearTimeout(t);
  }, [value, debounce, onChange]);
  return (
    <Input
      {...props}
      value={value ?? ""}
      onChange={(e) => setValue(e.target.value)}
      className={
        "text-xs md:text-sm text-stone-700 placeholder:text-stone-500 focus-visible:ring-stone-400 " +
        (className ?? "")
      }
    />
  );
});

/* ===================== Indeterminate Checkbox ===================== */
function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  ...rest
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked">) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className="cursor-pointer"
      checked={checked}
      onChange={onChange}
      {...rest}
    />
  );
}

/* ===================== Columns Dropdown ===================== */
function ColumnsDropdown({ table }: { table: Table<Company> }) {
  const columns = table.getAllLeafColumns();
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="px-3 py-2 bg-white/90 backdrop-blur border rounded text-xs md:text-sm text-stone-700 hover:bg-stone-50"
          aria-haspopup="menu"
          aria-label={t("companiesTable.toolbar.manageColumns")}
        >
          {t("companiesTable.toolbar.manageColumns")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-stone-700">
          {t("companiesTable.columnsDropdown.title")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={columns.every((c) => c.getIsVisible())}
          onCheckedChange={() => {
            const allVisible = columns.every((c) => c.getIsVisible());
            columns.forEach((c) => c.toggleVisibility(!allVisible));
          }}
        >
          {t("companiesTable.columnsDropdown.showAll")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={col.getIsVisible()}
            onCheckedChange={() => col.toggleVisibility()}
          >
            {
              // 🔧 اینجا فقط آرگومان context رو به‌صورت امن cast کردیم تا TS ایراد نگیره
              flexRender(
                col.columnDef.header as any,
                { column: col, table } as any
              )
            }
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===================== Parent Component ===================== */
export default function CompaniesDataTable(): JSX.Element {
  const { t } = useTranslation();

  // Data & UI State
  const [data, setData] = useState<Company[]>(seedCompanies);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const [, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true } as any);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Add Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Pick<Company, "name" | "email">>({
    name: "",
    email: "",
  });

  const resetAddForm = () => setAddForm({ name: "", email: "" });
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleAdd = () => {
    if (!addForm.name.trim())
      return toast.error(t("companiesTable.toast.errors.nameRequired"));
    if (!validateEmail(addForm.email))
      return toast.error(t("companiesTable.toast.errors.emailInvalid"));

    const nextId = (data.length ? Math.max(...data.map((d) => d.id)) : 0) + 1;
    const newItem: Company = {
      id: nextId,
      name: addForm.name.trim(),
      email: addForm.email.trim(),
    };

    setData((prev) => [newItem, ...prev]);
    setIsAddOpen(false);
    resetAddForm();
    toast.success(t("companiesTable.toast.success.added"));
  };

  const handleEditCompany = (updated: Company) => {
    setData((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...updated } : c))
    );
    toast.info(t("companiesTable.toast.info.edited", { name: updated.name }));
  };

  const handleDeleteCompany = (payload: { id: number; name: string }) => {
    setData((prev) => prev.filter((c) => c.id !== payload.id));
    toast.error(t("companiesTable.toast.delete", { name: payload.name }));
  };

  // Columns
  const columns = useMemo<ColumnDef<Company, unknown>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => {
          const allPageSelected = table.getIsAllPageRowsSelected();
          const somePageSelected =
            table.getIsSomePageRowsSelected() && !allPageSelected;
          return (
            <IndeterminateCheckbox
              aria-label={t("companiesTable.select.allRows")}
              checked={allPageSelected}
              indeterminate={somePageSelected}
              onChange={(e) =>
                table.toggleAllPageRowsSelected(e.target.checked)
              }
            />
          );
        },
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={t("companiesTable.select.row")}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
        size: 32,
      },
      {
        accessorKey: "id",
        header: t("companiesTable.columns.id"),
        cell: (info) => info.getValue<number>(),
        filterFn: "equalsString",
        enableHiding: true,
        size: 60,
      },
      {
        accessorKey: "name",
        header: t("companiesTable.columns.name"),
        cell: (info) => (
          <div
            className="truncate max-w-[260px]"
            title={String(info.getValue())}
          >
            {String(info.getValue())}
          </div>
        ),
        filterFn: "includesString",
        sortingFn: fuzzySort,
        enableHiding: true,
      },
      {
        accessorKey: "email",
        header: t("companiesTable.columns.email"),
        cell: (info) => {
          const v = String(info.getValue());
          return (
            <a
              href={`mailto:${v}`}
              dir="ltr"
              className="text-stone-700 underline-offset-4 hover:underline break-words"
            >
              {v}
            </a>
          );
        },
        filterFn: "includesString",
        sortingFn: fuzzySort,
        enableHiding: true,
      },
      {
        id: "actions",
        header: t("companiesTable.columns.actions"),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <RowActions
              company={row.original}
              onEdit={handleEditCompany}
              onDelete={(id) =>
                handleDeleteCompany({ id, name: row.original.name })
              }
            />
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: true,
        size: 80,
      },
    ];
  }, [t]);

  // Table
  const table = useReactTable<Company>({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    autoResetPageIndex: false,
    // 🔧 به‌جای رشته، خود تابع رو می‌دهیم تا با تایپ‌ها سازگار شود
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /* ---------- Header label for Mobile (HeaderContext واقعی) --------- */
  const renderHeaderLabel = React.useCallback(
    (column: Column<Company, unknown>) => {
      const header = table
        .getHeaderGroups()
        .flatMap((g) => g.headers)
        .find((h) => h.column.id === column.id);
      if (!header) {
        const raw = column.columnDef.header;
        return typeof raw === "string" ? raw : column.id;
      }
      return flexRender(header.column.columnDef.header, header.getContext());
    },
    [table]
  );

  /* ---------- Sort icon (type-safe) --------- */
  const SORT_ICON: Readonly<Record<"asc" | "desc", string>> = {
    asc: " 🔼",
    desc: " 🔽",
  };
  const isSortDir = (v: unknown): v is "asc" | "desc" =>
    v === "asc" || v === "desc";

  // Pagination helpers
  const pageButtons = useMemo<(number | "...")[]>(() => {
    const total = table.getPageCount();
    const current = table.getState().pagination.pageIndex;
    const windowSize = 2;
    const pages: (number | "...")[] = [];
    if (total <= 1) return pages;
    const start = Math.max(0, current - windowSize);
    const end = Math.min(total - 1, current + windowSize);
    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push("...");
    }
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) {
      if (end < total - 2) pages.push("...");
      pages.push(total - 1);
    }
    return pages;
  }, [table]);

  const pageSize = table.getState().pagination.pageSize;
  const changePageSize = (n: number) => table.setPageSize(n);

  return (
    <div className="md:p-4 p-0 rounded-lg bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200 min-h-screen flex items-center justify-center">
      <div className="md:w-[90%] w-full md:rounded-xl md:p-9 p-2 bg-white/30 backdrop-blur-lg border border-stone-200">
        <div className="w-full mb-4">
          <NavbarInfo />
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
          <div className="flex-1">
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              placeholder={t("companiesTable.toolbar.searchPlaceholder")}
              className="border border-stone-300 focus-visible:ring-1 placeholder:pb-3 placeholder:font-medium  "
            />
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <ColumnsDropdown table={table} />

            {/* Add Button */}
            <Button
              type="button"
              className="flex items-center justify-center gap-1 px-3 py-2 bg-stone-600 text-white text-xs md:text-sm rounded hover:bg-stone-800 transition-colors"
              title={t("companiesTable.toolbar.addNew")}
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={16} className="text-white mt-1" />
              {t("companiesTable.toolbar.addNew")}
            </Button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto rounded-lg shadow hidden md:block">
          <table className="w-full text-right bg-white rounded-lg">
            <thead className="bg-stone-100 text-stone-700 font-medium">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-4 py-3 text-sm font-semibold align-top"
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {(() => {
                              const dir = header.column.getIsSorted();
                              return isSortDir(dir) ? SORT_ICON[dir] : null;
                            })()}
                          </div>

                          {header.column.getCanFilter() ? (
                            <div className="mt-1">
                              {header.column.id === "select" ? null : (
                                <DebouncedInput
                                  value={
                                    (header.column.getFilterValue() as string) ??
                                    ""
                                  }
                                  onChange={(v) =>
                                    header.column.setFilterValue(v)
                                  }
                                  placeholder={t(
                                    "companiesTable.filters.placeholder"
                                  )}
                                />
                              )}
                            </div>
                          ) : null}
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={
                    (index % 2 === 0 ? "bg-white" : "bg-stone-50") +
                    (row.getIsSelected() ? " ring-2 ring-stone-300" : "")
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-stone-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 md:hidden">
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className={
                "bg-white p-4 rounded-lg shadow border " +
                (row.getIsSelected()
                  ? "border-stone-400"
                  : "border-transparent")
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-stone-600">
                  {t("companiesTable.mobile.card.select")}
                </div>
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                  aria-label={t("companiesTable.select.row")}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {row
                  .getVisibleCells()
                  .filter((cell) => cell.column.id !== "select")
                  .map((cell) => (
                    <Fragment key={cell.id}>
                      <div className="text-[11px] font-medium text-stone-600">
                        {renderHeaderLabel(cell.column)}:
                      </div>
                      <div className="text-xs text-stone-700 break-words">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </Fragment>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              className="border rounded p-1 px-2 disabled:opacity-50 text-xs md:text-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("companiesTable.pagination.first")}
            >
              {"<<"}
            </button>
            <button
              className="border rounded p-1 px-2 disabled:opacity-50 text-xs md:text-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("companiesTable.pagination.prev")}
            >
              {"<"}
            </button>

            <div className="flex items-center gap-1">
              {pageButtons.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="px-2 text-stone-500 select-none text-xs md:text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => table.setPageIndex(p)}
                    className={
                      "border rounded px-2 py-1 text-xs md:text-sm " +
                      (p === table.getState().pagination.pageIndex
                        ? "bg-stone-700 text-white"
                        : "bg-white")
                    }
                    aria-label={`Go to page ${p + 1}`}
                  >
                    {p + 1}
                  </button>
                )
              )}
            </div>

            <button
              className="border rounded p-1 px-2 disabled:opacity-50 text-xs md:text-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label={t("companiesTable.pagination.next")}
            >
              {">"}
            </button>
            <button
              className="border rounded p-1 px-2 disabled:opacity-50 text-xs md:text-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label={t("companiesTable.pagination.last")}
            >
              {">>"}
            </button>
          </div>

          <span className="flex items-center gap-1 text-xs md:text-sm text-stone-700">
            <div>{t("companiesTable.pagination.page")}</div>
            <strong className="px-1">
              {table.getState().pagination.pageIndex + 1}{" "}
              {t("companiesTable.pagination.of")} {table.getPageCount()}
            </strong>
          </span>

          <span className="flex items-center gap-1 text-xs md:text-sm">
            <span className="text-stone-700">
              {t("companiesTable.pagination.goto")}
            </span>
            <Input
              type="number"
              min={1}
              max={table.getPageCount()}
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const v = Number(e.target.value);
                const page = Number.isNaN(v)
                  ? 1
                  : Math.min(Math.max(v, 1), table.getPageCount());
                table.setPageIndex(page - 1);
              }}
              className="w-20 text-center text-stone-700 placeholder:text-stone-500"
            />
          </span>

          {/* Page size */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-xs md:text-sm">
                {t("companiesTable.pagination.perPage", { count: pageSize })}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>
                {t("companiesTable.pagination.pageSize")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={String(pageSize)}
                onValueChange={(v) => changePageSize(Number(v))}
              >
                {[10, 20, 30, 40, 50].map((opt) => (
                  <DropdownMenuRadioItem key={opt} value={String(opt)}>
                    {opt}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 text-sm text-stone-700">
          {t("companiesTable.rowsCount", {
            count: table.getPrePaginationRowModel().rows.length,
          })}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("companiesTable.dialog.add.title")}</DialogTitle>
            <DialogDescription>
              {t("companiesTable.dialog.add.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <label className="text-sm text-stone-700">
                {t("companiesTable.dialog.add.labels.name")}
              </label>
              <Input
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t("companiesTable.dialog.add.labels.name") || ""}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-stone-700">
                {t("companiesTable.dialog.add.labels.email")}
              </label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={resetAddForm}>
                {t("companiesTable.dialog.add.cancel")}
              </Button>
            </DialogClose>
            <Button
              onClick={handleAdd}
              className="bg-stone-700 hover:bg-stone-800"
            >
              {t("companiesTable.dialog.add.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
