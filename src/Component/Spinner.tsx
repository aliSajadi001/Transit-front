import { useTranslation } from "react-i18next";

export default function LoadingPuzzle() {
  const { t } = useTranslation();

  // مشخصات 10 کاشی با col-span های متفاوت
  const tiles = [
    { id: 1, lg: "lg:col-span-3" },
    { id: 2, lg: "lg:col-span-2" },
    { id: 3, lg: "lg:col-span-4" },
    { id: 4, lg: "lg:col-span-3" },
    { id: 5, lg: "lg:col-span-3" },
    { id: 6, lg: "lg:col-span-6" },
    { id: 7, lg: "lg:col-span-3" },
    { id: 8, lg: "lg:col-span-4" },
    { id: 9, lg: "lg:col-span-2" },
    { id: 10, lg: "lg:col-span-3" },
    { id: 11, lg: "lg:col-span-3" },
  ];

  return (
    <div className="w-full min-h-screen p-4 flex flex-col gap-6">
      {/* پیام مرکزی */}
      <div className="w-full flex items-center justify-center">
        <span className="text-stone-400 font-medium text-lg">
          {t("LoadingPuzzle.message")}
        </span>
      </div>

      {/* گرید پازلی */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3 flex-1">
        {tiles.map((t) => (
          <div
            key={t.id}
            className={[
              "bg-stone-200 rounded-xl animate-pulse h-40", // ارتفاع ثابت (طول برابر)
              "sm:col-span-1 md:col-span-1", // در نمایشگرهای کوچک همه تک‌ستونه
              t.lg, // در دسکتاپ عرض متفاوت
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
