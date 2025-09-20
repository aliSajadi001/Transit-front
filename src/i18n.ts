// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend"; // Import backend

i18n
  .use(Backend) // اضافه کردن backend برای بارگیری ترجمه‌ها
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    backend: {
      // مسیر پیش‌فرض برای فایل‌های ترجمه
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
