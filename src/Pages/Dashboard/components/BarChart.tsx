import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const description = "A multiple bar chart (vehicles)";

const rawData = [
  { monthKey: "january", passenger: 186, commercial: 80 },
  { monthKey: "february", passenger: 305, commercial: 200 },
  { monthKey: "march", passenger: 237, commercial: 120 },
  { monthKey: "april", passenger: 73, commercial: 190 },
  { monthKey: "may", passenger: 209, commercial: 130 },
  { monthKey: "june", passenger: 214, commercial: 140 },
];

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

export function ChartBarMultiple() {
  const { t } = useTranslation();

  const chartConfig: ChartConfig = useMemo(
    () => ({
      ...baseConfig,
      passenger: {
        ...baseConfig.passenger,
        label: t("ChartBarMultiple.labels.passenger"),
      },
      commercial: {
        ...baseConfig.commercial,
        label: t("ChartBarMultiple.labels.commercial"),
      },
    }),
    [t]
  );

  const chartData = useMemo(
    () =>
      rawData.map((d) => ({
        month: t(`ChartBarMultiple.months.${d.monthKey}`),
        passenger: d.passenger,
        commercial: d.commercial,
      })),
    [t]
  );

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex flex-col gap-1 pb-4 mb-4 border-b">
        <h3 className="text-lg font-semibold dark:text-stone-500">{t("ChartBarMultiple.title")}</h3>
        <p className="text-sm text-muted-foreground dark:text-stone-500">
          {t("ChartBarMultiple.subtitleMonths")}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            {/* <CartesianGrid vertical={false} /> ← حذف شد */}
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="passenger"
              fill="var(--color-passenger, var(--chart-1))"
              radius={4}
            />
            <Bar
              dataKey="commercial"
              fill="var(--color-commercial, var(--chart-2))"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col items-start gap-2 text-sm pt-4 border-t">
        <div className="flex gap-2 leading-none font-medium dark:text-stone-600">
          {t("ChartBarMultiple.trend")} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none dark:text-stone-600">
          {t("ChartBarMultiple.captionMonths")}
        </div>
      </div>
    </div>
  );
}
