// src/components/LocaleDigits.tsx
import  { useMemo } from "react";
import { useTranslation } from "react-i18next";

type LocaleDigitsProps = {
  value: number | string;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

const DIGITS = {
  latn: "0123456789",
  arab: "٠١٢٣٤٥٦٧٨٩", // Arabic-Indic
  arabext: "۰۱۲۳۴۵۶۷۸۹", // Persian (Extended Arabic-Indic)
};

function pickNumberingSystem(langRaw: string | undefined) {
  const lang = (langRaw || "en").toLowerCase();
  if (lang.startsWith("fa"))
    return { locale: "fa-IR", nu: "arabext" as const, rtl: true };
  if (lang.startsWith("ar"))
    return { locale: "ar-EG", nu: "arab" as const, rtl: true };
  return { locale: "en-US", nu: "latn" as const, rtl: false };
}

function mapLatinToTarget(input: string, target: keyof typeof DIGITS) {
  const src = DIGITS.latn;
  const dst = DIGITS[target];
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const idx = src.indexOf(ch);
    out += idx >= 0 ? dst[idx] : ch;
  }
  return out;
}

export function LocaleDigits({
  value,
  className,
  minimumFractionDigits,
  maximumFractionDigits,
}: LocaleDigitsProps) {
  const { i18n } = useTranslation();
  const { locale, nu, rtl } = pickNumberingSystem(i18n.language);

  const formatted = useMemo(() => {
    const s = typeof value === "number" ? value : Number(value);
    const localeWithNu = `${locale}-u-nu-${nu}`;
    const fmtOpts: Intl.NumberFormatOptions = {
      minimumFractionDigits,
      maximumFractionDigits,
    };

    // اگر عدد معتبر باشد:
    if (Number.isFinite(s)) {
      try {
        return new Intl.NumberFormat(localeWithNu, fmtOpts).format(s as number);
      } catch {
        const base = new Intl.NumberFormat("en-US", fmtOpts).format(
          s as number
        );
        return nu === "latn" ? base : mapLatinToTarget(base, nu);
      }
    }

    // اگر رشتهٔ آزاد بود (مثلاً "12km")
    const raw = String(value);
    return nu === "latn" ? raw : mapLatinToTarget(raw, nu);
  }, [value, locale, nu, minimumFractionDigits, maximumFractionDigits]);

  return (
    <span className={className} dir={rtl ? "rtl" : "ltr"}>
      {formatted}
    </span>
  );
}
