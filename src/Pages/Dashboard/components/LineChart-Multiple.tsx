// import { TrendingUp } from "lucide-react";
import {  Line, LineChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const description = "A multiple line chart (vehicles)";

type MonthKey = "january" | "february" | "march" | "april" | "may" | "june";

type RawPoint = {
  monthKey: MonthKey;
  passenger: number; // خودروهای سواری
  commercial: number; // خودروهای تجاری (کامیون/ون/…)
};

// داده‌های نمونه خودرویی (۶ ماه)
const rawData: RawPoint[] = [
  { monthKey: "january", passenger: 260, commercial: 110 },
  { monthKey: "february", passenger: 340, commercial: 180 },
  { monthKey: "march", passenger: 295, commercial: 145 },
  { monthKey: "april", passenger: 160, commercial: 210 },
  { monthKey: "may", passenger: 320, commercial: 170 },
  { monthKey: "june", passenger: 335, commercial: 185 },
];

// پیکربندی سری‌ها؛ لیبل‌ها با i18n تزریق می‌شود
const baseConfig = {
  passenger: {
    label: "Passenger",
    color: "var(--chart-1)",
  },
  commercial: {
    label: "Commercial",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartLineMultiple() {
  const { t } = useTranslation();

  // پیکربندی نهایی با لیبل‌های ترجمه‌شده (namespace = ChartLineMultiple)
  const chartConfig: ChartConfig = useMemo(
    () => ({
      ...baseConfig,
      passenger: {
        ...baseConfig.passenger,
        label: t("ChartLineMultiple.labels.passenger"),
      },
      commercial: {
        ...baseConfig.commercial,
        label: t("ChartLineMultiple.labels.commercial"),
      },
    }),
    [t]
  );

  // دادهٔ نمایشی با ماه‌های محلی‌سازی‌شده
  const chartData = useMemo(
    () =>
      rawData.map((d) => ({
        month: t(`ChartLineMultiple.months.${d.monthKey}`),
        passenger: d.passenger,
        commercial: d.commercial,
      })),
    [t]
  );

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">
          {t("ChartLineMultiple.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("ChartLineMultiple.subtitleMonths")}
        </p>
      </div> */}

      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            {/* <CartesianGrid vertical={false} /> ← این خط حذف شد */}
            {/* <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            /> */}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Line
              dataKey="passenger"
              type="monotone"
              stroke="var(--color-passenger, var(--chart-1))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="commercial"
              type="monotone"
              stroke="var(--color-commercial, var(--chart-2))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {/* <div className="flex flex-col gap-1 text-sm text-center mt-4">
        <div className="flex items-center justify-center gap-2 leading-none font-medium">
          {t("ChartLineMultiple.trend")} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 leading-none">
          {t("ChartLineMultiple.captionMonths")}
        </div>
      </div> */}
    </div>
  );
}
