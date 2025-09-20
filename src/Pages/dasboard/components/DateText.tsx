/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useTranslation } from "react-i18next";
import DateObject from "react-date-object";

// Calendars & locales
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import arabic from "react-date-object/calendars/arabic";
import arabic_ar from "react-date-object/locales/arabic_ar";

export type CalendarBundle = {
  calendar?: any; // undefined => Gregorian default
  locale?: any; // undefined => EN default
  format: string;
};

export function getCalendarBundle(langRaw: string | undefined): CalendarBundle {
  const lang = (langRaw || "fa").toLowerCase();

  if (lang.startsWith("fa")) {
    return { calendar: persian, locale: persian_fa, format: "YYYY/MM/DD" };
  }
  if (lang.startsWith("ar")) {
    return { calendar: arabic, locale: arabic_ar, format: "YYYY/MM/DD" };
  }
  // default: English / Gregorian
  return { calendar: undefined, locale: undefined, format: "YYYY-MM-DD" };
}

/** Format date for the current language/calendar */
export function formatDateByI18n(
  value: string | number,
  lang: string | undefined
): string {
  const bundle = getCalendarBundle(lang);
  const jsDate = new Date(value);
  const obj = new DateObject({
    calendar: bundle.calendar,
    locale: bundle.locale,
    date: jsDate,
  });
  return obj.format(bundle.format);
}

/** UI component to render a date with current i18n language/calendar */
export default function DateText({ value }: { value: string | number }) {
  const { i18n } = useTranslation();
  const text = formatDateByI18n(value, i18n.language);
  return <span>{text}</span>;
}
