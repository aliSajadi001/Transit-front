/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * exportPDF.ts — خروجی PDF با pdfmake@0.2.20 + VFS
 * - فونت فارسی از public/fonts فچ و به Base64 تبدیل می‌شود (VFS) → نمایش درست فارسی/عربی.
 * - RTL/LTR خودکار براساس lang (یا override با rtl).
 * - جدول تمام‌عرض برگه (pageMargins=0 و widths="*").
 * - Zebra rows: سفید / stone-200 (#e7e5e4).
 * - اگر دانلود مستقیم کار نکند، با Blob لینک موقت ساخته و دانلود می‌شود.
 *
 * پیش‌نیاز فایل‌ها (در وب با / قابل دسترسی‌اند):
 *   public/fonts/Vazirmatn-Regular.ttf  →  /fonts/Vazirmatn-Regular.ttf
 *   public/fonts/Vazirmatn-Bold.ttf     →  /fonts/Vazirmatn-Bold.ttf (اختیاری)
 */

export type ExportPDFOptions = {
  headers: string[];
  rows: (string | number)[][];
  fileName?: string;
  title?: string;
  /** اگر ست شود، از این استفاده می‌کنیم؛ وگرنه از lang (fa/ar ⇒ RTL) و در نهایت navigator.language تشخیص می‌دهیم */
  rtl?: boolean;
  /** مثل "fa", "ar", "en" ... برای تشخیص خودکار RTL */
  lang?: string;
  /** اگر تعداد ستون‌ها >= این مقدار باشد، صفحه Landscape می‌شود (پیش‌فرض: 7) */
  landscapeThreshold?: number;
  /** در صورت نیاز قابل override است؛ پیش‌فرض: [0,0,0,0] برای فول‌بلید واقعی */
  pageMargins?: number | [number, number, number, number];
};

let fontsLoaded = false;
let fontsLoadingPromise: Promise<void> | null = null;

export async function exportPDF(options: ExportPDFOptions): Promise<void> {
  const {
    headers,
    rows,
    fileName = "table.pdf",
    title,
    lang,
    rtl,
    landscapeThreshold = 7,
    pageMargins = [0, 0, 0, 0],
  } = options;

  if (!headers?.length) {
    alert("هیچ ستونی برای خروجی وجود ندارد.");
    throw new Error("No headers provided");
  }

  // فقط مرورگر
  if (typeof window === "undefined" || typeof document === "undefined") {
    alert("ساخت PDF فقط در مرورگر قابل انجام است.");
    throw new Error("Not a browser environment");
  }
  if (location.protocol === "file:") {
    alert("اپ را با dev server اجرا کنید؛ اجرای مستقیم file:// جلوی فچ فونت را می‌گیرد.");
    throw new Error("Running on file://");
  }

  // تشخیص RTL
  const isRtl =
    typeof rtl === "boolean"
      ? rtl
      : typeof lang === "string"
      ? /^(fa|ar)(-|$)/i.test(lang)
      : typeof navigator !== "undefined" && navigator.language
      ? /^(fa|ar)(-|$)/i.test(navigator.language)
      : false;

  // 1) لود pdfmake
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = (pdfMakeModule as any).default || (pdfMakeModule as any);
  if (!pdfMake?.createPdf) {
    alert("pdfmake به‌درستی بارگذاری نشد.");
    throw new Error("pdfmake not loaded");
  }

  // 2) فونت‌ها در VFS
  await ensureFontsInVFS(pdfMake);

  // 3) بدنه جدول با درنظرگرفتن جهت
  const normalize = (v: unknown) => (v == null ? "" : String(v));

  const normalizedHeaders = headers.map(normalize);
  const normalizedRows = rows.map((r) => r.map(normalize));

  // برای RTL ستون‌ها را معکوس کن تا ترتیب از راست به چپ شود
  const headRow = isRtl ? [...normalizedHeaders].reverse() : normalizedHeaders;
  const bodyRows = isRtl
    ? normalizedRows.map((r) => [...r].reverse())
    : normalizedRows;

  const body: any[][] = [
    headRow.map((h) => ({ text: h, style: "tableHeader" })),
    ...bodyRows.map((r) => r.map((c) => ({ text: c }))),
  ];

  // 4) اورینتیشن بر اساس تعداد ستون‌ها
  const pageOrientation: "portrait" | "landscape" =
    headers.length >= landscapeThreshold ? "landscape" : "portrait";

  // 5) تعریف سند: تمام‌عرض برگه (margins=0) + ستون‌ها '*' برای پرکردن کل عرض
  const docDef: any = {
    pageSize: "A4",
    pageOrientation,
    pageMargins, // پیش‌فرض: صفر برای فول‌بلید واقعی
    defaultStyle: {
      font: "Vazirmatn",
      fontSize: 9,
      alignment: isRtl ? "right" : "left",
    },
    styles: {
      tableHeader: {
        bold: true,
        margin: [0, 4, 0, 4],
        alignment: isRtl ? "right" : "left",
      },
    },
    content: [
      title
        ? {
            text: String(title),
            bold: true,
            fontSize: 13,
            margin: [isRtl ? 8 : 8, 0, isRtl ? 8 : 8, 10],
            alignment: isRtl ? "right" : "left",
          }
        : undefined,
      {
        table: {
          headerRows: 1,
          // تمام‌عرض: هر ستون '*'
          widths: headRow.map(() => "*"),
          body,
        },
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return "#f5f5f5"; // هدر
            return rowIndex % 2 === 0 ? "#e7e5e4" : "#ffffff"; // zebra
          },
          hLineColor: () => "#ddd",
          vLineColor: () => "#eee",
          hLineWidth: (i: number, node: any) =>
            i === 0 || i === node.table.body.length ? 1 : 0.5,
          vLineWidth: () => 0.5,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
    ].filter(Boolean),
  };

  // 6) ساخت و دانلود PDF
  try {
    const pdf = (pdfMake as any).createPdf(docDef);
    pdf.download(fileName); // تلاش ۱
  } catch {
    await fallbackDownload(pdfMake, docDef, fileName); // تلاش ۲
  }
}

/* --------------------- Utilities --------------------- */

async function ensureFontsInVFS(pdfMake: any): Promise<void> {
  if (fontsLoaded) return;
  if (fontsLoadingPromise) return fontsLoadingPromise;

  fontsLoadingPromise = (async () => {
    const regularUrl = "/fonts/Vazirmatn-Regular.ttf";
    const boldUrl = "/fonts/Vazirmatn-Bold.ttf";

    const regularBase64 = await fetchAsBase64(regularUrl);
    if (!regularBase64) {
      alert(
        `فونت فارسی یافت نشد:\n${regularUrl}\n` +
          `لطفاً فایل Vazirmatn-Regular.ttf را در public/fonts قرار دهید.`
      );
      throw new Error("Regular font not reachable");
    }

    const boldBase64 = await fetchAsBase64(boldUrl); // اختیاری

    (pdfMake as any).vfs = {
      ...(pdfMake as any).vfs,
      "Vazirmatn-Regular.ttf": regularBase64,
      ...(boldBase64 ? { "Vazirmatn-Bold.ttf": boldBase64 } : {}),
    };

    (pdfMake as any).fonts = {
      ...(pdfMake as any).fonts,
      Vazirmatn: {
        normal: "Vazirmatn-Regular.ttf",
        bold: boldBase64 ? "Vazirmatn-Bold.ttf" : "Vazirmatn-Regular.ttf",
        italics: "Vazirmatn-Regular.ttf",
        bolditalics: boldBase64
          ? "Vazirmatn-Bold.ttf"
          : "Vazirmatn-Regular.ttf",
      },
    };

    fontsLoaded = true;
  })();

  return fontsLoadingPromise;
}

async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await blobToDataUrl(blob);
    const base64 = String(dataUrl).split(",")[1] || "";
    return base64 || null;
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function fallbackDownload(pdfMake: any, docDef: any, fileName: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const pdf = pdfMake.createPdf(docDef);
      pdf.getBlob((blob: Blob) => {
        if (!blob) {
          alert("ساخت PDF ناموفق بود.");
          reject(new Error("No blob from pdfmake"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      });
    } catch (err) {
      alert("ساخت PDF با خطا مواجه شد.");
      reject(err as Error);
    }
  });
}
