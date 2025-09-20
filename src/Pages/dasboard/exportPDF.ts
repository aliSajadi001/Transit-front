/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * exportPDF.ts — خروجی PDF با pdfmake@0.2.20 + VFS
 * - فونت فارسی از public/fonts فچ و به Base64 تبدیل می‌شود (VFS) → نمایش درست فارسی/عربی.
 * - محتوا (تیتر و جدول) وسط صفحه (افقی) قرار می‌گیرد.
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
  rtl?: boolean; // ← همچنان در تایپ پشتیبانی می‌شود (برای سازگاری با caller)، اما اینجا استفاده نمی‌کنیم
  landscapeThreshold?: number; // اگر تعداد ستون‌ها >= این مقدار باشد، صفحه Landscape می‌شود
};

let fontsLoaded = false;
let fontsLoadingPromise: Promise<void> | null = null;

export async function exportPDF(options: ExportPDFOptions): Promise<void> {
  // فقط مقادیر لازم را بردار؛ rtl را عمداً برنداشتیم تا TS6133 ایجاد نشود
  const {
    headers,
    rows,
    fileName = "table.pdf",
    title,
    landscapeThreshold = 7,
  } = options;

  if (!headers?.length) {
    alert("هیچ ستونی برای خروجی وجود ندارد.");
    throw new Error("No headers provided");
  }

  // اجرای فقط در مرورگر (نه SSR/Node)
  if (typeof window === "undefined" || typeof document === "undefined") {
    alert("ساخت PDF فقط در مرورگر قابل انجام است.");
    throw new Error("Not a browser environment");
  }
  // اجرای مستقیم file:// باعث خطای fetch فونت می‌شود
  if (location.protocol === "file:") {
    alert(
      "اپ را با dev server اجرا کنید؛ اجرای مستقیم file:// جلوی فچ فونت را می‌گیرد."
    );
    throw new Error("Running on file://");
  }

  // 1) لود pdfmake
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = (pdfMakeModule as any).default || (pdfMakeModule as any);
  if (!pdfMake?.createPdf) {
    alert("pdfmake به‌درستی بارگذاری نشد.");
    throw new Error("pdfmake not loaded");
  }

  // 2) یک‌بار فونت‌ها را به VFS لود کن (کش در حافظه برای کلیک‌های بعدی)
  await ensureFontsInVFS(pdfMake);

  // 3) بدنه جدول: ردیف اول هدر
  const body: any[][] = [
    headers.map((h) => ({
      text: h == null ? "" : String(h),
      style: "tableHeader",
    })),
    ...rows.map((r) =>
      r.map((v) => ({
        text: v == null ? "" : String(v),
      }))
    ),
  ];

  // 4) اورینتیشن بر اساس تعداد ستون‌ها
  const pageOrientation: "portrait" | "landscape" =
    headers.length >= landscapeThreshold ? "landscape" : "portrait";

  // 5) تعریف سند
  const docDef: any = {
    pageSize: "A4",
    pageOrientation,
    pageMargins: [36, 36, 36, 36],
    defaultStyle: {
      font: "Vazirmatn",
      fontSize: 9,
      alignment: "center", // ⬅️ کل محتوا افقی وسط‌چین
    },
    styles: {
      tableHeader: {
        bold: true,
        margin: [0, 4, 0, 4],
      },
    },
    content: [
      // تیتر (در صورت وجود)
      title
        ? {
            text: String(title),
            bold: true,
            fontSize: 13,
            margin: [0, 0, 0, 10],
            alignment: "center", // ⬅️ تیتر هم وسط
          }
        : undefined,

      // جدول به‌عنوان بلاک وسط صفحه
      {
        alignment: "center", // ⬅️ خود بلاک جدول وسط قرار می‌گیرد
        table: {
          headerRows: 1,
          widths: headers.map(() => "auto"), // برای فیت‌شدن نزدیک به محتوا؛ در صورت نیاز "*" بگذار
          body,
        },
        // Zebra + خطوط ملایم
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return "#f5f5f5"; // هدر
            // داده‌ها: یک‌خط‌درمیان سفید / stone-200
            return rowIndex % 2 === 0 ? "#e7e5e4" : "#ffffff";
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
    pdf.download(fileName); // تلاش ۱: دانلود مستقیم
  } catch {
    // تلاش ۲: Fallback Blob + <a>
    await fallbackDownload(pdfMake, docDef, fileName);
  }
}

/* --------------------- Utilities --------------------- */

/** یک‌بار فونت‌ها را از /fonts/... فچ و در VFS ثبت می‌کند */
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

    // ثبت فایل‌های فونت در VFS
    (pdfMake as any).vfs = {
      ...(pdfMake as any).vfs,
      "Vazirmatn-Regular.ttf": regularBase64,
      ...(boldBase64 ? { "Vazirmatn-Bold.ttf": boldBase64 } : {}),
    };

    // معرفی خانواده فونت
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

/** فچ فایل و تبدیل به Base64 خام (بدون data:...) */
async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await blobToDataUrl(blob); // "data:font/ttf;base64,AAEAAA..."
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

/** Fallback: ساخت Blob و دانلود دستی */
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
