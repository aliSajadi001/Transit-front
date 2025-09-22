import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "react-router"; // یا react-router-dom در صورت استفاده
import { useTranslation } from "react-i18next";

// تاریخ چند-تقویمی
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import arabic from "react-date-object/calendars/arabic";
import arabic_ar from "react-date-object/locales/arabic_ar";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { infoItems } from "./mockDta";

// تاریخ امروز بر اساس زبان
const DATE_FMT = "YYYY/MM/DD";
function formatTodayByLang(lang: string) {
  switch ((lang || "en").split("-")[0]) {
    case "fa":
      return new DateObject({ calendar: persian, locale: persian_fa }).format(
        DATE_FMT
      );
    case "ar":
      return new DateObject({ calendar: arabic, locale: arabic_ar }).format(
        DATE_FMT
      );
    default:
      return new DateObject({ locale: gregorian_en }).format(DATE_FMT);
  }
}

export default function NavbarInfo() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const location = useLocation();
  const pathname = location.pathname;
  const todayStr = formatTodayByLang(i18n.language);

  return (
    <div
      className="w-full flex flex-col items-center justify-center rounded-2xl"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* هدر */}
      <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
        <p className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-stone-500 text-center">
          {t("navbarInfo.title")}
        </p>
        <div className="flex items-center mt-1 sm:mt-2">
          <Calendar
            className={`w-4 h-4 text-stone-500 ${
              isRTL ? "ml-1 sm:ml-2" : "mr-1 sm:mr-2"
            }`}
          />
          <span className="text-stone-500 text-xs sm:text-sm md:text-base">
            {todayStr}
          </span>
        </div>
      </div>

      {/* آیتم‌ها */}
      <div className="w-full grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-2 px-1">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          const name = t(`navbarInfo.items.${item.i18nKey}`, {
            defaultValue: item.name,
          });

          const lastSegment = item.link.split("/").filter(Boolean).pop();
          const currentSegment = pathname.split("/").filter(Boolean).pop();
          const isActive = lastSegment === currentSegment;

          return (
            <Link
              key={index}
              to={item.link}
              className={`relative bg-white dark:bg-white/20 w-full md:max-w-[300px] flex items-center p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg transition-all duration-300 overflow-hidden group 
                ${
                  isActive
                    ? "bg-stone-700 border-stone-700 text-white"
                    : "border-stone-200 hover:shadow-xl hover:border-stone-200"
                }`}
            >
              {/* لایه hover */}
              <div className="absolute inset-0 z-0">
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-full bg-stone-400/50 opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-500 ease-out
                  ${isActive ? "opacity-100 w-full" : ""}`}
                />
              </div>

              {/* محتوای کارت */}
              <div
                className={`flex items-center justify-between w-full relative z-0 ${
                  isRTL ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div
                  className={`flex flex-col gap-1 ${
                    isRTL
                      ? "items-start ml-2 sm:ml-3"
                      : "items-end mr-2 sm:mr-3"
                  } w-full`}
                >
                  <p
                    className={`transition-colors text-xs sm:text-sm md:text-base font-medium line-clamp-1 
                    ${isActive ? "text-white" : "group-hover:text-white"}`}
                  >
                    {name}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`mt-0.5 sm:mt-1 ${
                      isActive ? "bg-white text-black" : "group-hover:bg-white dark:group-hover:bg-black"
                    }`}
                  >
                    <p className="transition-colors font-bold text-[10px] xs:text-xs">
                      {item.count}
                    </p>
                  </Badge>
                </div>

                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0 
                    ${
                      isActive
                        ? "text-white"
                        : "text-stone-500 group-hover:text-white"
                    }`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
