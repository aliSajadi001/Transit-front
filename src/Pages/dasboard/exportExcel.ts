/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColInfo } from "xlsx";

export type ExcelExportParams = {
  headers: (string | number)[];
  rows: Array<string | number | null | undefined>[];
  sheetName?: string;
  fileName?: string;
};

/** import interop امن برای pnpm/ESM */
async function importXLSX() {
  const mod: any = await import("xlsx");
  return (mod?.default ?? mod) as typeof import("xlsx");
}

export async function exportExcel({
  headers,
  rows,
  sheetName = "Sheet1",
  fileName = "export.xlsx",
}: ExcelExportParams) {
  const XLSX = await importXLSX();

  // سطر اول: هدر
  const aoa: (string | number)[][] = [
    headers.map(String),
    ...rows.map((r) => r.map((v) => (v == null ? "" : (v as string | number)))),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // عرض ستون‌ها حدودی
  (ws["!cols"] as ColInfo[]) = headers.map((h) => ({
    wch: Math.max(String(h).length + 2, 10),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const write = (XLSX as any).writeFile ?? (XLSX as any).writeFileXLSX;
  if (!write) throw new Error("XLSX.writeFile unavailable");
  write(wb, fileName);
}
