import { useTranslation } from "react-i18next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";

function Register() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  // RTL (fa, ar, ...) => راست، LTR (en, ...) => چپ
  const headerSideClass =
    dir === "rtl" ? "right-4 text-right" : "left-4 text-left";

  return (
    <div dir={dir} className="relative min-h-screen w-full rounded-lg ">
      {/* تصویر پس‌زمینه تمام‌صفحه */}
      <img
        src="/images/pexels-kelly-6572428.jpg"
        alt={t("auth.imageAlt")}
        className="absolute rounded-t-lg inset-0 h-full w-full object-cover z-0"
        loading="lazy"
      />

      {/* هدر روی تصویر */}
      <div className={`absolute top-4 ${headerSideClass} max-w-[80%] z-10`}>
        <h1 className="font-bold text-stone-100 drop-shadow text-base sm:text-lg md:text-2xl lg:text-3xl">
          {t("auth.title")}
        </h1>
        <p className="mt-1 text-stone-100/90 drop-shadow text-xs sm:text-sm md:text-base">
          {t("auth.desc")}
        </p>
      </div>

      {/* محتوای مرکزی: تب‌ها و فرم‌ها دقیقا وسط صفحه */}
      <div className="min-h-screen w-full flex items-center justify-center px-3 relative z-10 ">
        <div className="w-full max-w-md rounded-lg md:p-5 p-2 bg-white/70">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 border border-stone-300">
              <TabsTrigger value="login" className="text-stone-700">
                {t("auth.tabs.login")}
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-stone-700">
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
    </div>
  );
}

export default Register;
