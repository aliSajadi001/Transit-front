/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Fragment,
  type JSX,
} from "react";
import {
  sortingFns,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingFn,
  type Table,
  type FilterFn,
  type Row,
  type Column,
} from "@tanstack/react-table";
import { rankItem, compareItems } from "@tanstack/match-sorter-utils";

import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";

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

// Icons
import {
  FileDown,
  FileText,
  ChevronRight,
  ChevronDown,
  Circle,
  Calendar,
} from "lucide-react";

// Mock data/types
import {
  type DataRow,
  type Status,
  type TypeName,
  type Vehicle,
  makeData,
} from "./mockData";
import { exportExcel } from "./exportExcel";

// کامپوننت عملیات
import RowActions from "./components/RowActions";

// i18n
import { useTranslation } from "react-i18next";

// تاریخ چندزبانه
import DateText, {
  getCalendarBundle,
  formatDateByI18n,
  type CalendarBundle,
} from "./components/DateText";
import { exportPDF } from "./exportPDF";

/* ===================== Types ===================== */
export type DateRangeFilter = { start?: number; end?: number };
export type DatePickerRef = {
  openCalendar: () => void;
  closeCalendar: () => void;
} | null;

/* ===================== Fuzzy ===================== */
const fuzzyFilter: FilterFn<DataRow> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(
    String(row.getValue(columnId) ?? ""),
    String(value ?? "")
  );
  addMeta?.({ itemRank });
  return itemRank.passed;
};

const fuzzySort: SortingFn<DataRow> = (rowA, rowB, columnId) => {
  let dir = 0;
  const aMeta = (rowA as any).columnFiltersMeta?.[columnId]?.itemRank;
  const bMeta = (rowB as any).columnFiltersMeta?.[columnId]?.itemRank;
  if (aMeta && bMeta) dir = compareItems(aMeta, bMeta);
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
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
        "text-xs md:text-sm text-stone-600 dark:text-stone-200 placeholder:text-stone-600 " +
        (className ?? "")
      }
    />
  );
});

/* ===================== TextFilter ===================== */
const TextFilter = React.memo(function TextFilter({
  column,
  placeholder,
}: {
  column: Column<DataRow, unknown>;
  placeholder: string;
}) {
  const columnFilterValue = column.getFilterValue() as string | undefined;
  const handleChange = useCallback(
    (value: string) => column.setFilterValue(value),
    [column]
  );
  return (
    <DebouncedInput
      type="text"
      value={columnFilterValue ?? ""}
      onChange={handleChange}
      placeholder={placeholder}
      className="mt-1"
    />
  );
});

/* ===================== Date helpers ===================== */
const dayRangeFromJSDate = (d: Date): { start: number; end: number } => {
  const start = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    0,
    0,
    0,
    0
  ).getTime();
  const end = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    999
  ).getTime();
  return { start, end };
};

/* ===================== Indeterminate Checkbox ===================== */
const IndeterminateCheckbox = React.memo(function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: {
  indeterminate?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (typeof indeterminate === "boolean" && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [indeterminate, rest.checked]);
  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
});

/* ===================== Date Range Filter ===================== */
function DateRangeFilterControl({
  column,
  filterValue,
  t,
  bundle,
  lang,
}: {
  column: Column<DataRow, unknown>;
  filterValue?: DateRangeFilter;
  t: (k: string, o?: any) => string;
  bundle: CalendarBundle;
  lang: string | undefined;
}) {
  const ref = useRef<DatePickerRef>(null);

  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true } as any);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // تشخیص تم دارک برای فعال‌سازی تم دارک تقویم (در صورت پشتیبانی پکیج)
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() =>
      setIsDark(el.classList.contains("dark"))
    );
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const startDO = filterValue?.start
    ? new DateObject({
        calendar: bundle.calendar,
        locale: bundle.locale,
        date: new Date(filterValue.start),
      })
    : null;
  const endDO = filterValue?.end
    ? new DateObject({
        calendar: bundle.calendar,
        locale: bundle.locale,
        date: new Date(filterValue.end),
      })
    : null;

  const label =
    filterValue?.start || filterValue?.end
      ? `${
          filterValue?.start
            ? `${t("dataTable.dateRange.from")} ${formatDateByI18n(
                filterValue.start!,
                lang
              )}`
            : ""
        }${filterValue?.start && filterValue?.end ? " " : ""}${
          filterValue?.end
            ? `${t("dataTable.dateRange.to")} ${formatDateByI18n(
                filterValue.end!,
                lang
              )}`
            : ""
        }`
      : t("dataTable.dateRange.all");

  const setRange = useCallback(
    (next: DateRangeFilter) => {
      const cur = filterValue || {};
      const merged: DateRangeFilter = { ...cur, ...next };
      if (!merged.start && !merged.end) column.setFilterValue(undefined);
      else column.setFilterValue(merged);
    },
    [column, filterValue]
  );

  return (
    <div className="mt-1 flex items-center gap-2 ">
      <button
        type="button"
        className="px-2 py-1 border rounded bg-stone-100 text-stone-600 dark:text-stone-600 text-[11px]"
        onClick={() => ref.current?.openCalendar()}
        title={t("dataTable.dateRange.select")}
        aria-label={t("dataTable.dateRange.select")}
      >
        <Calendar size={15} /> {t("dataTable.dateRange.short")}
      </button>

      <button
        type="button"
        className="px-2 py-1 border rounded bg-white text-stone-600 dark:text-stone-600 text-[11px]"
        onClick={() => {
          column.setFilterValue(undefined);
          ref.current?.closeCalendar?.();
        }}
        title={t("dataTable.dateRange.clear")}
      >
        {t("dataTable.dateRange.clear")}
      </button>

      <span className="text-[11px] md:text-xs text-stone-600 dark:text-stone-200">
        {label}
      </span>

      <DatePicker
        ref={ref as unknown as React.MutableRefObject<any>}
        value={
          startDO && endDO ? [startDO, endDO] : startDO ? [startDO] : undefined
        }
        onChange={(val: unknown) => {
          const arr = Array.isArray(val) ? (val as any[]) : [];
          if (arr.length === 0) {
            setRange({ start: undefined, end: undefined });
            return;
          }
          if (arr.length === 1 && arr[0]?.toDate) {
            const { start } = dayRangeFromJSDate(arr[0].toDate());
            setRange({ start, end: undefined });
            return;
          }
          if (arr.length >= 2 && arr[0]?.toDate && arr[1]?.toDate) {
            const { start } = dayRangeFromJSDate(arr[0].toDate());
            const { end } = dayRangeFromJSDate(arr[1].toDate());
            setRange({ start, end });
            ref.current?.closeCalendar?.();
          }
        }}
        range
        rangeHover
        numberOfMonths={isMobile ? 1 : 2}
        calendar={bundle.calendar}
        locale={bundle.locale}
        calendarPosition={isMobile ? "bottom" : "bottom-center"}
        portal
        shadow={false}
        inputClass="hidden"
        className={isDark ? "rmdp-dark" : undefined}
      />
    </div>
  );
}

/* ===================== dateBetween Filter ===================== */
const dateBetweenFilter: FilterFn<DataRow> = (row, columnId, val) => {
  const range = (val as DateRangeFilter | undefined) ?? undefined;
  if (!range || (!range.start && !range.end)) return true;
  const t = new Date(row.getValue<string>(columnId)).getTime();
  const start = typeof range.start === "number" ? range.start : -Infinity;
  const end = typeof range.end === "number" ? range.end : Infinity;
  return t >= start && t <= end;
};

/* ===================== Page Buttons ===================== */
function usePageButtons(table: Table<DataRow>) {
  return useMemo<(number | "...")[]>(() => {
    const total = table.getPageCount();
    const current = table.getState().pagination.pageIndex;
    const windowSize = 2;
    const pages: (number | "...")[] = [];
    const push = (p: number | "...") => pages.push(p);
    if (total <= 1) return pages;
    const start = Math.max(0, current - windowSize);
    const end = Math.min(total - 1, current + windowSize);
    if (start > 0) {
      push(0);
      if (start > 1) push("...");
    }
    for (let p = start; p <= end; p++) push(p);
    if (end < total - 1) {
      if (end < total - 2) push("...");
      push(total - 1);
    }
    return pages;
  }, [table]);
}

/* ===================== Columns Dropdown ===================== */
function ColumnsDropdown({ table }: { table: Table<DataRow> }) {
  const columns = table.getAllLeafColumns().filter((c) => c.id !== "select");
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="px-3 py-2 bg-white/80 dark:bg-white/10 backdrop-blur border rounded text-xs md:text-sm text-stone-600 dark:text-stone-200"
          aria-haspopup="menu"
          aria-label={t("dataTable.columnsDropdown.manage")}
        >
          {t("dataTable.columnsDropdown.manage")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-stone-600 dark:text-stone-200">
          {t("dataTable.columnsDropdown.title")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={table.getIsAllColumnsVisible()}
          onCheckedChange={() => table.toggleAllColumnsVisible()}
        >
          {t("dataTable.columnsDropdown.showAll")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={col.getIsVisible()}
            onCheckedChange={() => col.toggleVisibility()}
          >
            {flexRender(
              col.columnDef.header as any,
              { column: col, table } as any
            )}
          </DropdownMenuCheckboxItem>
        ))}
        <div className="px-2 pt-2 mt-2 text-[11px] text-stone-600 dark:text-stone-200">
          {t("dataTable.columnsDropdown.selectSticky")}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===================== Main Component ===================== */
function Data(): JSX.Element {
  const { t, i18n } = useTranslation();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true } as any);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [exporting, setExporting] = useState<{ pdf: boolean; xls: boolean }>({
    pdf: false,
    xls: false,
  });

  const runSafe = useCallback(
    async (fn: () => Promise<void>, kind: "pdf" | "xls") => {
      try {
        setExporting((s) => ({ ...s, [kind]: true }));
        await fn();
      } catch (err) {
        console.error(`[export ${kind}]`, err);
        alert(
          kind === "pdf"
            ? t("dataTable.export.pdfError")
            : t("dataTable.export.xlsError")
        );
      } finally {
        setExporting((s) => ({ ...s, [kind]: false }));
      }
    },
    [t]
  );

  const bundle: CalendarBundle = useMemo(
    () => getCalendarBundle(i18n.language),
    [i18n.language]
  );

  const columns = useMemo<ColumnDef<DataRow, unknown>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              type="button"
              onClick={row.getToggleExpandedHandler()}
              className="p-1 text-stone-600 dark:text-stone-200 hover:text-stone-800 dark:hover:text-stone-200"
              aria-label={
                row.getIsExpanded()
                  ? t("dataTable.collapse")
                  : t("dataTable.expand")
              }
              aria-expanded={row.getIsExpanded()}
            >
              {row.getIsExpanded() ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          ) : (
            <Circle size={12} className="text-stone-600 dark:text-stone-200" />
          ),
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: false,
        size: 28,
      },
      {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label={t("dataTable.select.allRows")}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={t("dataTable.select.row")}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: false,
        size: 32,
      },
      {
        accessorKey: "id",
        header: t("dataTable.columns.id"),
        filterFn: "equalsString",
        cell: (info) => info.getValue<number>(),
        enableHiding: true,
      },
      {
        accessorKey: "type",
        header: t("dataTable.columns.type"),
        cell: (info) => info.getValue<TypeName>(),
        filterFn: "includesString",
        sortingFn: fuzzySort,
        enableHiding: true,
      },
      {
        accessorKey: "vehicle",
        header: t("dataTable.columns.vehicle"),
        cell: (info) => info.getValue<Vehicle>(),
        filterFn: "includesString",
        sortingFn: fuzzySort,
        enableHiding: true,
      },
      {
        accessorKey: "date",
        header: t("dataTable.columns.date"),
        cell: (info) => <DateText value={info.getValue<string>()} />,
        filterFn: dateBetweenFilter,
        sortingFn: (a, b, id) =>
          new Date(a.getValue<string>(id)).getTime() -
          new Date(b.getValue<string>(id)).getTime(),
        enableHiding: true,
      },
      {
        accessorKey: "status",
        header: t("dataTable.columns.status"),
        cell: (info) => {
          const v = info.getValue<Status>();
          return (
            <span
              className={`px-1 py-[2px]  rounded text-xs ${
                v === "فعال"
                  ? "bg-green-400 text-green-900 dark:text-green-700"
                  : v === "غیرفعال"
                  ? "bg-gray-400 text-gray-900 dark:text-gray-700"
                  : "bg-yellow-400 text-yellow-900 dark:text-yellow-700"
              }`}
            >
              {v}
            </span>
          );
        },
        filterFn: "includesString",
        sortingFn: fuzzySort,
        enableHiding: true,
      },
      {
        id: "actions",
        header: t("dataTable.columns.actions"),
        cell: ({ row }) => (
          <RowActions
            data={row.original}
            onView={(d) => console.log("VIEW:", d)}
            onEdit={(d) => console.log("EDIT:", d)}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: true,
      },
    ],
    [t]
  );

  const [data] = useState<DataRow[]>(() => makeData(50));

  const table = useReactTable<DataRow>({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter, dateBetween: dateBetweenFilter },
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
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  const dateFilterValue: DateRangeFilter | undefined = useMemo(() => {
    const f = columnFilters.find((cf) => cf.id === "date");
    return (f?.value as DateRangeFilter) || undefined;
  }, [columnFilters]);

  const pageButtons = usePageButtons(table);

  const goToPageInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      const page = Number.isNaN(v)
        ? 1
        : Math.min(Math.max(v, 1), table.getPageCount());
      table.setPageIndex(page - 1);
    },
    [table]
  );

  const renderHeaderLabel = useCallback(
    (column: Column<DataRow, unknown>) => {
      const header = table
        .getHeaderGroups()
        .flatMap((g) => g.headers)
        .find((h) => h.column.id === column.id);
      if (!header) {
        const h = column.columnDef.header;
        return typeof h === "string" ? h : column.id;
      }
      return flexRender(header.column.columnDef.header, header.getContext());
    },
    [table]
  );

  const getVisibleDataForExport = () => {
    const visibleCols = table
      .getAllLeafColumns()
      .filter(
        (c) =>
          c.getIsVisible() &&
          c.id !== "select" &&
          c.id !== "actions" &&
          c.id !== "expander"
      );

    const headers = visibleCols.map((c) => {
      const h = c.columnDef.header;
      return typeof h === "string" ? h : c.id;
    });

    const sourceRows =
      table.getFilteredRowModel().rows.length > 0
        ? table.getFilteredRowModel().rows
        : table.getRowModel().rows;

    const rows = sourceRows.map((r) =>
      visibleCols.map((c) => {
        const v = r.getValue<any>(c.id);
        if (c.id === "date")
          return formatDateByI18n(v as string, i18n.language);
        return v ?? "";
      })
    );

    return { headers, rows };
  };

  const handleExportExcel = async () => {
    const { headers, rows } = getVisibleDataForExport();
    if (!headers.length) {
      alert(t("dataTable.export.noColumns"));
      return;
    }
    await runSafe(
      () =>
        exportExcel({
          headers,
          rows,
          sheetName: "Data",
          fileName: "table.xlsx",
        }),
      "xls"
    );
  };

  const handleExportPDF = async () => {
    const { headers, rows } = getVisibleDataForExport();
    if (!headers.length) {
      alert(t("dataTable.export.noColumns"));
      return;
    }
    await runSafe(
      () =>
        exportPDF({
          headers,
          rows,
          fileName: "table.pdf",
          title: t("dataTable.export.pdfTitle"),
          rtl: true,
          lang: i18n.language,
        }),
      "pdf"
    );
  };

  const pageSize = table.getState().pagination.pageSize;
  const changePageSize = (n: number) => table.setPageSize(n);

  const renderSubComponent = ({ row }: { row: Row<DataRow> }) => {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
        <pre className="text-[11px] md:text-xs overflow-auto">
          <code>{JSON.stringify(row.original, null, 2)}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="dark:bg-gradient-to-r dark:from-neutral-800 dark:via-black dark:to-neutral-800 pt-16 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 min-h-screen flex items-center justify-center text-stone-600 dark:text-stone-200">
      <div className="md:w-[90%] w-full md:p-9 p-2 bg-white/30 dark:bg-black/10 lg border border-stone-200 dark:border-neutral-900 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-stone-600 dark:text-stone-200 drop-shadow">
          {t("dataTable.title")}
        </h1>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
          <div className="flex-1">
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              placeholder={t("dataTable.searchPlaceholder")}
              className="border border-stone-300 focus-visible:ring-1 placeholder:pb-3"
            />
          </div>

          {/* DateRange فقط در موبایل */}
          {isMobile && (
            <DateRangeFilterControl
              column={table.getColumn("date")!}
              filterValue={dateFilterValue}
              t={t}
              bundle={bundle}
              lang={i18n.language}
            />
          )}

          <div className="relative z-10 flex items-center gap-2">
            <ColumnsDropdown table={table} />

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1 px-3 py-2 bg-white/80 dark:bg-white/10 backdrop-blur border rounded text-xs md:text-sm hover:bg-white disabled:opacity-60 text-stone-600 dark:text-stone-200"
              title={t("dataTable.export.excel")}
              disabled={exporting.xls}
            >
              <FileDown size={16} />
              Excel
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="flex items-center gap-1 px-3 py-2 bg-white/80 dark:bg-white/10 backdrop-blur border rounded text-xs md:text-sm hover:bg-white disabled:opacity-60 text-stone-600 dark:text-stone-200"
              title={t("dataTable.export.pdf")}
              disabled={exporting.pdf}
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Desktop table */}
        {!isMobile && (
          <div className="overflow-x-auto rounded-lg shadow hidden md:block">
            <table className="w-full text-right bg-white rounded-lg">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-200">
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
                              {header.column.getIsSorted() === "asc"
                                ? " 🔼"
                                : header.column.getIsSorted() === "desc"
                                ? " 🔽"
                                : null}
                            </div>

                            {header.column.getCanFilter() ? (
                              <div className="mt-1">
                                {header.column.id === "date" ? (
                                  <DateRangeFilterControl
                                    column={header.column}
                                    filterValue={dateFilterValue}
                                    t={t}
                                    bundle={bundle}
                                    lang={i18n.language}
                                  />
                                ) : header.column.id === "select" ||
                                  header.column.id === "expander" ? null : (
                                  <TextFilter
                                    column={header.column}
                                    placeholder={t(
                                      "dataTable.filters.placeholder"
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
                  <Fragment key={row.id}>
                    <tr
                      className={
                        (index % 2 === 0
                          ? "bg-white dark:bg-stone-700 "
                          : "bg-stone-50 dark:bg-stone-600 ") +
                        (row.getIsSelected() ? " ring-2 ring-blue-300" : "")
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-stone-600 dark:text-stone-200"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {row.getIsExpanded() && (
                      <tr
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td
                          className="px-4 py-3"
                          colSpan={row.getVisibleCells().length}
                        >
                          {renderSubComponent({ row })}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {isMobile && (
          <div className="space-y-4 md:hidden">
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className={
                  "bg-white dark:bg-black/10 dark:shadow-md dark:shadow-stone-700 dark:border p-4 rounded-lg shadow  " +
                  (row.getIsSelected()
                    ? "border-blue-400"
                    : "border-transparent")
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-stone-600 dark:text-stone-200">
                    {t("dataTable.mobile.select")}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={row.getToggleExpandedHandler()}
                      className="p-1 text-stone-600 dark:text-stone-200"
                      aria-expanded={row.getIsExpanded()}
                      aria-label={
                        row.getIsExpanded()
                          ? t("dataTable.collapse")
                          : t("dataTable.expand")
                      }
                    >
                      {row.getIsExpanded() ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>
                    <IndeterminateCheckbox
                      checked={row.getIsSelected()}
                      disabled={!row.getCanSelect()}
                      indeterminate={row.getIsSomeSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      aria-label={t("dataTable.select.row")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {row
                    .getVisibleCells()
                    .filter(
                      (cell) =>
                        cell.column.id !== "select" &&
                        cell.column.id !== "expander"
                    )
                    .map((cell) => (
                      <Fragment key={cell.id}>
                        <div className="text-[11px] font-medium text-stone-600 dark:text-stone-200">
                          {renderHeaderLabel(cell.column)}:
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-200">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </Fragment>
                    ))}
                </div>

                {row.getIsExpanded() && (
                  <div className="mt-3">{renderSubComponent({ row })}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              className="border rounded p-1 px-2 disabled:opacity-50 text-xs md:text-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("dataTable.pagination.first")}
            >
              {"<<"}
            </button>
            <button
              className="border rounded p-1 px-2 disabled:opacity-50 text-xs md:text-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("dataTable.pagination.prev")}
            >
              {"<"}
            </button>

            <div className="flex items-center gap-1">
              {pageButtons.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="px-2 text-stone-600 dark:text-stone-200  select-none text-xs md:text-sm"
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
                        ? "bg-blue-500 text-white/10"
                        : "bg-white/10 ")
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
              aria-label={t("dataTable.pagination.next")}
            >
              {">"}
            </button>
            <button
              className="border rounded p-1 px-2 disabled:opacity-50 text-xs md:text-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label={t("dataTable.pagination.last")}
            >
              {">>"}
            </button>
          </div>

          <span className="flex items-center gap-1 text-xs md:text-sm text-stone-600 dark:text-stone-200">
            <div>{t("dataTable.pagination.page")}</div>
            <strong className="px-1">
              {table.getState().pagination.pageIndex + 1}{" "}
              {t("dataTable.pagination.of")} {table.getPageCount()}
            </strong>
          </span>

          <span className="flex items-center gap-1 text-xs md:text-sm">
            <span className="text-stone-600 dark:text-stone-200">
              {t("dataTable.pagination.goto")}
            </span>
            <Input
              type="number"
              min={1}
              max={table.getPageCount()}
              value={table.getState().pagination.pageIndex + 1}
              onChange={goToPageInputOnChange}
              className="w-20 text-center text-stone-600 dark:text-stone-200 placeholder:text-stone-600"
            />
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-xs md:text-sm">
                {t("dataTable.pagination.perPage", { count: pageSize })}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>
                {t("dataTable.pagination.pageSize")}
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

          {/* شمارش ردیف‌ها */}
        </div>

        <div className="mt-4 text-sm text-stone-600 dark:text-stone-200">
          {t("dataTable.pagination.rowsCount", {
            count: table.getPrePaginationRowModel().rows.length,
          })}
        </div>
      </div>
    </div>
  );
}

export default Data;
