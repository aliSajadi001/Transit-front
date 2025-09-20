/* eslint-disable @typescript-eslint/no-explicit-any */
import type { jsPDF as JsPDFType } from "jspdf";
import type { UserOptions } from "jspdf-autotable";

export type PDFExportParams = {
  headers: (string | number)[];
  rows: Array<string | number | null | undefined>[];
  fileName?: string;
  title?: string;
  rtl?: boolean;
};

import { VazirmatnBase64 } from "./pdfFontVazirmatn";

/** ArrayBuffer -> Base64 */
function ab2b64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const size = 0x8000;
  for (let i = 0; i < bytes.length; i += size) {
    binary += String.fromCharCode(...bytes.subarray(i, i + size));
  }
  return btoa(binary);
}

/** ایمپورت سازگار برای jsPDF و autotable (داینامیک) */
async function importJsPDFCtor() {
  const mod: any = await import("jspdf");
  const JsPDFCtor = mod?.jsPDF ?? mod?.default?.jsPDF ?? mod?.default;
  if (typeof JsPDFCtor !== "function") {
    throw new Error("jsPDF constructor not found");
  }
  // تایپ امن برای سازنده‌ی jsPDF
  return JsPDFCtor as unknown as new (...args: any[]) => InstanceType<
    typeof JsPDFType
  >;
}

async function importAutoTable() {
  const mod: any = await import("jspdf-autotable");
  // امضای تایپی صحیح برای گزینه‌ها
  return (mod?.default ?? mod) as (doc: any, opts: UserOptions) => void;
}

/** فونت یونیکد: اگر Base64 نبود، از CDN می‌گیرد */
async function ensureFont(doc: any, name = "Vazirmatn") {
  try {
    let b64 = VazirmatnBase64;
    if (!b64 || b64.length < 1000) {
      const url =
        "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn/Vazirmatn-Regular.ttf";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Font CDN fetch failed");
      b64 = ab2b64(await res.arrayBuffer());
    }
    doc.addFileToVFS(`${name}.ttf`, b64);
    doc.addFont(`${name}.ttf`, name, "normal");
    doc.setFont(name, "normal");
  } catch {
    // ادامه با فونت پیش‌فرض (انگلیسی)
  }
}

/** --- Shaping + BiDi برای فارسی/عربی --- */
const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

async function shapeArabicTextIfNeeded(input: string): Promise<string> {
  if (!ARABIC_RANGE.test(input)) return input;

  let shaped = input;

  // reshape
  try {
    const reshaperMod: any = await import("arabic-persian-reshaper");
    if (typeof reshaperMod?.reshape === "function") {
      shaped = reshaperMod.reshape(shaped);
    } else if (typeof reshaperMod?.default === "function") {
      shaped = reshaperMod.default(shaped);
    } else if (reshaperMod?.PersianArabicReshaper?.convert) {
      shaped = reshaperMod.PersianArabicReshaper.convert(shaped);
    }
  } catch {
    // نبود تایپ/ماژول مانع ادامه‌ی کار نمی‌شود
  }

  // bidi reorder
  try {
    const bidiMod: any = await import("bidi-js");
    if (bidiMod?.bidi?.from_string) {
      shaped = bidiMod.bidi.from_string(shaped).write_reordered();
    } else if (typeof bidiMod?.default === "function") {
      shaped = bidiMod.default(shaped);
    }
  } catch {
    // نبود تایپ/ماژول مانع ادامه‌ی کار نمی‌شود
  }

  return shaped;
}

async function shapeAOA(aoa: (string | number)[][]) {
  const out: (string | number)[][] = [];
  for (const row of aoa) {
    const nrow: (string | number)[] = [];
    for (const cell of row) {
      if (typeof cell === "string" && ARABIC_RANGE.test(cell)) {
        nrow.push(await shapeArabicTextIfNeeded(cell));
      } else {
        nrow.push(cell ?? "");
      }
    }
    out.push(nrow);
  }
  return out;
}

export async function exportPDF({
  headers,
  rows,
  fileName = "export.pdf",
  title,
  rtl = true,
}: PDFExportParams) {
  const jsPDF = await importJsPDFCtor();
  const autoTable = await importAutoTable();

  const doc = new jsPDF({ orientation: "landscape" });
  await ensureFont(doc, "Vazirmatn");

  // عنوان
  if (title) {
    const shapedTitle = await shapeArabicTextIfNeeded(String(title));
    doc.setFontSize(12);
    if (rtl) {
      const w = doc.internal.pageSize.getWidth();
      doc.text(shapedTitle, w - 14, 12, { align: "right" });
    } else {
      doc.text(shapedTitle, 14, 12);
    }
  }

  const headRaw = [headers.map((h) => String(h))];
  const bodyRaw = rows.map((r) => r.map((v) => (v == null ? "" : String(v))));

  const head = await shapeAOA(headRaw);
  const body = await shapeAOA(bodyRaw);

  const styles: UserOptions["styles"] = {
    font: "Vazirmatn",
    fontSize: 9,
    halign: rtl ? "right" : "left",
    valign: "middle",
  };

  const headStyles: UserOptions["headStyles"] = {
    fillColor: [76, 81, 191],
    textColor: 255,
    halign: rtl ? "right" : "left",
  };

  const columnStyles: NonNullable<UserOptions["columnStyles"]> = {};
  for (let i = 0; i < headers.length; i++) {
    columnStyles[i] = { halign: rtl ? "right" : "left" };
  }

  autoTable(doc as any, {
    head: head as string[][],
    body: body as string[][],
    styles,
    headStyles,
    columnStyles,
    margin: { top: title ? 16 : 10, right: 10, left: 10, bottom: 10 },
    tableLineWidth: 0.1,
    tableLineColor: 200,
  });

  doc.save(fileName);
}
