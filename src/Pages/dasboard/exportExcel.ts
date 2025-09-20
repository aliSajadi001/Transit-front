/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColInfo } from "xlsx";

/**
 * خروجی اکسل (XLSX) — سازگار با مرورگر + Vite
 * - interop امن برای pnpm/ESM (dynamic import)
 * - هدر در ردیف اول + AutoFilter
 * - فریز ردیف هدر
 * - راست‌به‌چپ برای داده‌های فارسی/عربی
 * - محاسبهٔ عرض ستون‌ها بر اساس بیشترین طول متن هر ستون
 */

export type ExcelExportParams = {
  headers: (string | number)[];
  rows: Array<Array<string | number | null | undefined>>;
  sheetName?: string; // پیش‌فرض: "Data"
  fileName?: string; // پیش‌فرض: "table.xlsx"
  rtl?: boolean; // پیش‌فرض: true
  autoFilter?: boolean; // پیش‌فرض: true
  freezeHeader?: boolean; // پیش‌فرض: true
  maxColWidth?: number; // پیش‌فرض: 60 (کاراکتر)
};

/** import interop امن برای pnpm/ESM */
async function importXLSX() {
  const mod: any = await import("xlsx");
  return (mod?.default ?? mod) as typeof import("xlsx");
}

/** نام شیت را مطابق محدودیت‌های اکسل (<=31 کاراکتر، بدون کاراکترهای غیرمجاز) اصلاح می‌کند */
function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*\[\]]/g, " ").trim();
  return cleaned.slice(0, 31) || "Data";
}

/** تضمین پسوند .xlsx برای نام فایل */
function ensureXlsxExt(name: string): string {
  return /\.xlsx$/i.test(name) ? name : `${name}.xlsx`;
}

/** محاسبهٔ عرض ستون‌ها بر اساس بیشترین طول متن هر ستون (با سقف) */
function computeColumnWidths(
  headers: (string | number)[],
  rows: Array<Array<string | number | null | undefined>>,
  maxColWidth = 60
): ColInfo[] {
  const colCount = headers.length;
  const widths = new Array(colCount).fill(0);

  // هدر
  headers.forEach((h, i) => {
    widths[i] = Math.max(widths[i], String(h ?? "").length);
  });

  // بدنه
  for (const row of rows) {
    for (let i = 0; i < colCount; i++) {
      const cell = row?.[i];
      const len =
        cell == null
          ? 0
          : typeof cell === "number"
          ? String(cell).length
          : String(cell).length;
      widths[i] = Math.max(widths[i], len);
    }
  }

  // padding و سقف
  return widths.map((w) => ({
    wch: Math.max(10, Math.min(w + 2, maxColWidth)),
  }));
}

export async function exportExcel({
  headers,
  rows,
  sheetName = "Data",
  fileName = "table.xlsx",
  rtl = true,
  autoFilter = true,
  freezeHeader = true,
  maxColWidth = 60,
}: ExcelExportParams): Promise<void> {
  if (!headers?.length) throw new Error("No headers provided");

  const XLSX = await importXLSX();

  // 1) AoA: ردیف اول هدر، بعد داده‌ها (null/undefined → "")
  const aoa: (string | number)[][] = [
    headers.map((h) => (h == null ? "" : String(h))),
    ...rows.map((r) =>
      (r ?? []).map((v) => (v == null ? "" : (v as string | number)))
    ),
  ];

  // 2) ساخت شیت از AoA
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 3) راست‌به‌چپ (برای نمایش در اکسل/اوفیس)
  if (rtl) {
    // SheetJS این فلگ را برای RTL در View اضافه می‌کند
    (ws as any)["!rtl"] = true;
  }

  // 4) AutoFilter روی کل محدوده
  if (autoFilter && ws["!ref"]) {
    (ws as any)["!autofilter"] = { ref: ws["!ref"] };
  }

  // 5) فریز هدر (ردیف اول)
  if (freezeHeader) {
    // در نسخه‌های جدید SheetJS پشتیبانی می‌شود
    (ws as any)["!freeze"] = { ySplit: 1, topLeftCell: "A2" };
  }

  // 6) عرض ستون‌ها
  (ws["!cols"] as ColInfo[]) = computeColumnWidths(headers, rows, maxColWidth);

  // 7) ساخت ورک‌بوک و افزودن شیت
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetName));

  // 8) ذخیره فایل (writeFileXLSX در نسخه‌های جدید، در غیر این صورت writeFile)
  const writeFile =
    (XLSX as any).writeFileXLSX ?? (XLSX as any).writeFile ?? null;

  const finalName = ensureXlsxExt(fileName);

  if (writeFile) {
    // روش بومی لایبرری (anchor دانلود را خودش می‌سازد)
    writeFile(wb, finalName);
    return;
  }

  // 9)Fallback (اگر متدهای بالا در نسخهٔ شما نبود)
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
