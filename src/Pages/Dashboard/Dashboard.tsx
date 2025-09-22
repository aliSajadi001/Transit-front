import Cards from "./Cards";
import { ChartBarMultiple } from "./components/BarChart";
import { ChartLineDotsColors } from "./components/Line Chart - Dots Colors";
import { ChartLineDefault } from "./components/Line-Chart";
import { ChartLineLabelCustom } from "./components/LineChart-CustomLabel";
import { ChartLineMultiple } from "./components/LineChart-Multiple";
import { ChartPieInteractive } from "./components/Pie-Chart";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();

  return (
    <main
      className="dark:bg-gradient-to-r dark:from-neutral-800 dark:via-black dark:to-neutral-800 pt-16 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 min-h-screen flex items-center justify-center text-stone-600 dark:text-stone-200"
      role="main"
    >
      <article className="md:w-[90%] w-full md:p-9 p-2 bg-white/30 dark:bg-black/10 lg border border-stone-200 dark:border-neutral-900 rounded-lg space-y-5">
        {/* تیتر داشبورد */}
        <header className="w-full flex items-center justify-center">
          <h2 className="text-2xl font-bold text-stone-500">
            {t("Dashboard.title")}
          </h2>
        </header>

        {/* بخش بالایی - ۴ تا چارت */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
              <ChartLineDotsColors />
            </div>
            <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
              <ChartLineDefault />
            </div>
            <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
              <ChartLineLabelCustom />
            </div>
            <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
              <ChartLineMultiple />
            </div>
          </div>
        </section>

        {/* بخش پایینی - ۲ تا چارت */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
              <ChartBarMultiple />
            </div>
            <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
              <ChartPieInteractive />
            </div>
          </div>
        </section>

        {/* کارت‌ها */}
        <section>
          <Cards />
        </section>
      </article>
    </main>
  );
}

export default Dashboard;
