import React, { useEffect } from "react";
import {
  PanelLeftOpen,
  PanelRightOpen,
  Languages,
  Moon,
  Sun,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // ⬅️ اضافه شد
import { useTranslation } from "react-i18next";
import { useTheme } from "./theme-provider";

interface TopNavProps {
  onToggleDesktop: () => void;
  onOpenMobile: () => void;
  isDesktopOpen: boolean;
}

const LANGS = [
  { code: "fa", label: "فارسی", dir: "rtl" as const },
  { code: "en", label: "English", dir: "ltr" as const },
  { code: "ar", label: "العربية", dir: "rtl" as const },
];

// ⬇️ مودتاگل با Tooltip
const ModeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50"
              aria-label={t("navbar.theme.toggle")}
              title={t("navbar.theme.toggle")}
            >
              <Sun className="h-[1rem] w-[1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1rem] w-[1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">{t("navbar.theme.toggle")}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("navbar.theme.tooltip")}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("navbar.theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t("navbar.theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t("navbar.theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TopNav: React.FC<TopNavProps> = ({
  onToggleDesktop,
  onOpenMobile,
  isDesktopOpen,
}) => {
  const { t, i18n } = useTranslation();

  // همگام‌سازی lang/dir با زبان فعال
  useEffect(() => {
    const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];
    document.documentElement.lang = current.code;
    document.documentElement.dir = current.dir;
  }, [i18n.language]);

  const handleChangeLang = async (code: string) => {
    const target = LANGS.find((l) => l.code === code) ?? LANGS[0];
    await i18n.changeLanguage(target.code);
    document.documentElement.lang = target.code;
    document.documentElement.dir = target.dir;
  };

  const currentLang = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];

  // ⬅️ تنها افزودنی برای کنترل جهت موبایل
  const isRTL = i18n.dir() === "rtl";

  return (
    // blur + شفافیت برای دیده شدن محتوا زیر نوبار
    <div className="sticky top-0 z-40 w-full bg-white/20 dark:bg-black/20 backdrop-blur-sm border-b">
      <div className="h-14 px-3 md:px-4 flex items-center justify-between">
        {/* تریگرها */}
        <div className="flex items-center gap-2">
          {/* موبایل: باز کردن overlay + Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="md:hidden inline-flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50 "
                onClick={() => {
                  // اطمینان از ست بودن dir برای سایدبار
                  document.documentElement.dir = isRTL ? "rtl" : "ltr";
                  onOpenMobile();
                }}
                aria-label={t("navbar.mobileOpenAria")}
              >
                {isRTL ? (
                  <PanelRightOpen size={18} />
                ) : (
                  <PanelLeftOpen size={18} />
                )}
                <span className="text-sm">{t("navbar.menu")}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("navbar.mobileOpenTooltip")}
            </TooltipContent>
          </Tooltip>

          {/* دسکتاپ: کوچک/بزرگ کردن سایدبار + Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="hidden md:inline-flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700"
                onClick={onToggleDesktop}
                aria-label={
                  isDesktopOpen
                    ? t("navbar.closeSidebar")
                    : t("navbar.openSidebar")
                }
              >
                {isDesktopOpen ? (
                  <PanelRightOpen size={18} />
                ) : (
                  <PanelLeftOpen size={18} />
                )}
                <span className="text-sm mb-1 font-medium">
                  {isDesktopOpen ? t("navbar.close") : t("navbar.open")}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isDesktopOpen
                ? t("navbar.closeSidebar")
                : t("navbar.openSidebar")}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* سمت راست نوبار: انتخاب زبان + مودتاگل + آواتار */}
        <div className="flex items-center gap-3">
          {/* دراپ‌داون زبان‌ها با Tooltip */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center text-xs gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700"
                    aria-label={t("navbar.languageSelector")}
                    title={t("navbar.languageSelector")}
                  >
                    <Languages size={16} className="mt-2" />
                    <span className="text-sm font-medium content-center">
                      {currentLang.label}
                    </span>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("navbar.language.tooltip")}
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent
              align="center"
              className="min-w-40 bg-white/20 backdrop-blur-sm rounded-lg flex flex-col items-center text-center"
            >
              <DropdownMenuLabel className="w-full text-center text-xs md:text-sm font-medium">
                {t("navbar.chooseLanguage")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="w-full" />
              {LANGS.map((l) => {
                const active = l.code === currentLang.code;
                return (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => handleChangeLang(l.code)}
                    className={`flex items-center justify-center text-xs md:text-md font-medium gap-2 w-full ${
                      active && "bg-stone-50"
                    }`}
                  >
                    <span>{l.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ⬅️ مودتاگل کنار انتخاب زبان (با Tooltip بالاتر) */}
          <ModeToggle />

          {/* آواتار */}
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://i.pravatar.cc/100?img=12" alt="user" />
            <AvatarFallback>AZ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
