// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// نکته‌ها:
// - لیارا برای اپ‌های React انتظار دارد خروجی در "build/" باشد.
// - اگر روی روت دامنه میزبانی می‌کنی، base باید "/" باشد.
// - manualChunks برای تقسیم وابستگی‌های سنگین و کاهش سایز چانک اولیه.

export default defineConfig({
  base: "/", // برای SPA روی روت دامنه
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "build",
    assetsDir: "assets",
    sourcemap: false,
    chunkSizeWarningLimit: 1500, // فقط جهت حذف هشدارهای غیرضروری
    rollupOptions: {
      output: {
        // تقسیم چانک‌های بزرگ برای بهبود لود اولیه
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router"],
          i18n: [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
            "i18next-http-backend",
          ],
          charts: ["recharts"],
          xlsx: ["xlsx"], // اگر با import() داینامیک استفاده می‌کنی باز هم خوب است که جدا باشد
          "radix-ui": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
  // در صورت نیاز به بهینه‌سازی‌های Dev:
  // optimizeDeps: {
  //   include: ["react", "react-dom", "react-router"],
  // },
});
