import { useTranslation } from "react-i18next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";

function Register() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  return (
    <div dir={dir} className="min-h-screen">
      {/* دو ستونه: تب‌ها + تصویر (در RTL معکوس) */}
      <div
        className={`flex flex-col ${
          dir === "rtl" ? "md:flex-row-reverse" : "md:flex-row"
        } min-h-screen  w-full bg-gradient-to-r  from-stone-200 via-stone-400 to-stone-200 px-3 md:px-0  rounded-lg`}
      >
        {/* تب‌ها: 50% و وسط‌چین کامل */}
        <div className="w-full md:w-1/2 flex items-center justify-center flex-1 md:flex-none">
          <div className="w-full max-w-md flex items-center justify-center rounded-lg md:p-5 bg-white/20 backdrop:blur-md">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 border border-stone-300">
                <TabsTrigger value="login" className="text-stone-600">
                  {t("auth.tabs.login")}
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-stone-600">
                  {t("auth.tabs.signup")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4 px-3">
                <Login />
              </TabsContent>

              <TabsContent value="signup" className="mt-4 px-3">
                <Signup />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* تصویر: 50%، پُر کردن کامل فضا + هدر ابسولوت بالا-راست */}
        <div className="hidden  md:block w-full md:w-1/2 relative min-h-[60vh]">
          {/* تصویر تمام‌عرض/ارتفاع در نیمهٔ خودش */}
          <img
            src="/images/its_001112-1024x683.jpg"
            alt={t("auth.imageAlt")}
            className="absolute inset-0 w-full h-full object-cover rounded-r-lg"
            loading="lazy"
          />

          {/* هدر روی تصویر - بالا راست، واکنش‌گرا، بدون تغییر کلیدهای ترجمه */}
          <div className="absolute top-4 right-4 max-w-[80%] text-right">
            <h1 className="font-bold text-stone-500 text-base sm:text-lg md:text-2xl lg:text-3xl">
              {t("auth.title")}
            </h1>
            <p className="mt-1 text-stone-500 text-xs sm:text-sm md:text-base">
              {t("auth.desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
