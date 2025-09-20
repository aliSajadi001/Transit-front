// import { TrendingUp } from "lucide-react";
import { Line, LineChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const description = "A line chart (vehicles)";

type RawPoint = { monthKey: keyof MonthMap; vehicles: number };
type MonthMap = {
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
};

// دادهٔ خام (۶ ماه)
const rawData: RawPoint[] = [
  { monthKey: "january", vehicles: 320 },
  { monthKey: "february", vehicles: 410 },
  { monthKey: "march", vehicles: 365 },
  { monthKey: "april", vehicles: 210 },
  { monthKey: "may", vehicles: 390 },
  { monthKey: "june", vehicles: 405 },
];

// پیکربندی چارت (label با i18n مقداردهی می‌شود)
const baseConfig: ChartConfig = {
  vehicles: {
    label: "Units",
    color: "var(--chart-1)",
  },
};

export function ChartLineDefault() {
  const { t } = useTranslation();

  // لیبل سری با ترجمه
  const chartConfig: ChartConfig = {
    ...baseConfig,
    vehicles: {
      ...baseConfig.vehicles,
      label: t("chartLineDefault.oneSeriesLabel"),
    },
  };

  // دادهٔ محلی‌سازی‌شده برای محور X
  const chartData = useMemo(
    () =>
      rawData.map((d) => ({
        month: t(`chartLineDefault.months.${d.monthKey}`),
        vehicles: d.vehicles,
      })),
    [t]
  );

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">{t("chartLineDefault.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("chartLineDefault.subtitleMonths")}
        </p>
      </div> */}

      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            {/* <CartesianGrid vertical={false} />  ← این خط حذف شد */}
            {/* <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            /> */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="vehicles"
              type="natural"
              stroke="var(--color-vehicles, var(--chart-1))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {/* <div className="flex flex-col gap-1 text-sm text-center mt-4">
        <div className="flex items-center justify-center gap-2 leading-none font-medium">
          {t("chartLineDefault.trend")} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 leading-none">
          {t("chartLineDefault.captionMonths")}
        </div>
      </div> */}
    </div>
  );
}
