import React from "react";
import { Link, useLocation } from "react-router";
import {
  Settings,
  FileText,
  Table,
  SquareMenu,
  X,
  Truck,
  LayoutDashboard, // ✅ added for dashboard
  Database, // ✅ added for basic-data
  UserPlus,
  FormInputIcon, // ✅ added for register
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

type MenuItem = { path: string; icon: React.ElementType; key: string };

const menuItems: MenuItem[] = [
  { path: "/dashboard", icon: LayoutDashboard, key: "dashboard" }, // or BarChart3 if you prefer
  { path: "/basic-data", icon: Database, key: "basic-data" },
  { path: "/", icon: Table, key: "table" },
  { path: "/manifesto", icon: FileText, key: "manifesto" },
  { path: "/register", icon: UserPlus, key: "register" },
  { path: "/settings", icon: Settings, key: "settings" },
  { path: "/wizard", icon: FormInputIcon, key: "wizard" },
];

function isRouteActive(currentPath: string, itemPath: string) {
  if (itemPath === "/") return currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
}

interface SidebarProps {
  isDesktopOpen: boolean; // دسکتاپ: w-16 (بسته) / w-64 (باز)
  isMobileOpen: boolean; // موبایل: overlay باز/بسته
  setIsMobileOpen: (v: boolean) => void;
}

const AppSidebar: React.FC<SidebarProps> = ({
  isDesktopOpen,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <>
      {/* Backdrop موبایل */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden
      />

      <aside
        className={[
          "z-50 flex flex-col bg-gray-800 text-white transition-all duration-300",
          // موبایل: overlay از چپ
          "fixed top-0 bottom-0 left-0 w-64 -translate-x-full md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "",
          // دسکتاپ: ثابت کنار صفحه
          "md:static",
          // عرض در دسکتاپ
          isDesktopOpen ? "md:w-64" : "md:w-16",
          "shadow-lg md:shadow-none",
        ].join(" ")}
        role="complementary"
        aria-label={t("sidebar.aria.navigation")}
      >
        {/* هدر */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {/* دسکتاپ: همیشه آیکون ماشین */}
          <div className="hidden md:flex items-center gap-2">
            <Truck size={20} aria-hidden="true" />
            {isDesktopOpen && (
              <span className="text-xl font-semibold">
                {t("sidebar.menuTitle")}
              </span>
            )}
          </div>

          {/* موبایل: دکمه باز/بستن */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 md:hidden"
            aria-label={
              isMobileOpen
                ? t("sidebar.aria.closeMenu")
                : t("sidebar.aria.openMenu")
            }
            type="button"
          >
            {isMobileOpen ? <X size={22} /> : <SquareMenu size={22} />}
          </button>
        </div>

        {/* ناوبری */}
        <nav className="flex-1 p-2 overflow-y-auto" role="navigation">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(location.pathname, item.path);
              const base =
                "flex items-center gap-3 rounded-lg transition-colors";
              const state = active
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700 text-gray-300";
              const label = t(`sidebar.${item.key}`);

              return (
                <li key={item.path}>
                  {isDesktopOpen ? (
                    // دسکتاپِ باز: آیکن + متن
                    <Link
                      to={item.path}
                      className={`p-2 ${base} ${state}`}
                      aria-label={label}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Icon size={20} />
                      <span className="inline">{label}</span>
                    </Link>
                  ) : (
                    <>
                      {/* موبایل: همیشه آیکن + متن (مثل دسکتاپ باز) */}
                      <div className="md:hidden">
                        <Link
                          to={item.path}
                          className={`p-2 ${base} ${state}`}
                          aria-label={label}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <Icon size={20} />
                          <span className="inline">{label}</span>
                        </Link>
                      </div>

                      {/* دسکتاپِ بسته: فقط آیکن + Tooltip */}
                      <div className="hidden md:block">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.path}
                              className={`p-2 ${base} ${state} justify-center`}
                              aria-label={label}
                              aria-current={active ? "page" : undefined}
                            >
                              <Icon size={20} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">{label}</TooltipContent>
                        </Tooltip>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* فوتر */}
        <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
          <span className={`${isDesktopOpen ? "inline" : "hidden md:inline"}`}>
            {t("sidebar.versionFull")}
          </span>
          <span
            className={`${
              isDesktopOpen ? "hidden" : "inline md:hidden"
            } text-xs`}
          >
            {t("sidebar.versionShort")}
          </span>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
