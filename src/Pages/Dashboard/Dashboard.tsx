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
    <div className="md:p-4 p-0 rounded-lg bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200 min-h-screen flex items-center justify-center">
      <div className="md:w-[90%] w-full md:rounded-xl md:p-9 p-2 bg-white/20 backdrop-blur-lg border border-stone-200 space-y-6">
        {/* تیتر داشبورد */}
        <div className="w-full flex items-center justify-center">
          <h2 className="text-2xl font-bold text-stone-500">
            {t("Dashboard.title")}
          </h2>
        </div>

        {/* بخش بالایی - ۴ تا چارت */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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

        {/* بخش پایینی - ۲ تا چارت */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
            <ChartBarMultiple />
          </div>
          <div className="border border-stone-300 bg-stone-50/30 rounded-lg p-2">
            <ChartPieInteractive />
          </div>
        </div>
        <div>
          <Cards/>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
