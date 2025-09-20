// import { TrendingUp } from "lucide-react";
import { LabelList, Line, LineChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const description = "A line chart with a custom label (vehicles)";

// نوع داده هر نقطه
type VehiclePoint = {
  segment: "sedan" | "suv" | "truck" | "motorcycle" | "van" | "other";
  units: number;
  fill: string;
};

// داده‌های نمونه خودرویی (به‌جای مرورگرها)
const chartData: VehiclePoint[] = [
  { segment: "sedan", units: 310, fill: "var(--color-sedan)" },
  { segment: "suv", units: 265, fill: "var(--color-suv)" },
  { segment: "truck", units: 190, fill: "var(--color-truck)" },
  { segment: "motorcycle", units: 175, fill: "var(--color-motorcycle)" },
  { segment: "van", units: 120, fill: "var(--color-van)" },
  { segment: "other", units: 85, fill: "var(--color-other)" },
];

// پیکربندی پایه (لیبل‌ها بعداً با i18n تزریق می‌شوند)
const baseConfig = {
  units: { label: "Units", color: "var(--chart-2)" },
  sedan: { label: "Sedan", color: "var(--chart-1)" },
  suv: { label: "SUV", color: "var(--chart-2)" },
  truck: { label: "Truck", color: "var(--chart-3)" },
  motorcycle: { label: "Motorcycle", color: "var(--chart-4)" },
  van: { label: "Van", color: "var(--chart-5)" },
  other: { label: "Other", color: "var(--chart-6, var(--chart-1))" },
} satisfies ChartConfig;

export function ChartLineLabelCustom() {
  const { t } = useTranslation();

  // پیکربندی با لیبل‌های ترجمه‌شده (namespace = ChartLineLabelCustom)
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      ...baseConfig,
      units: {
        ...baseConfig.units,
        label: t("ChartLineLabelCustom.labels.units"),
      },
      sedan: {
        ...baseConfig.sedan,
        label: t("ChartLineLabelCustom.labels.sedan"),
      },
      suv: { ...baseConfig.suv, label: t("ChartLineLabelCustom.labels.suv") },
      truck: {
        ...baseConfig.truck,
        label: t("ChartLineLabelCustom.labels.truck"),
      },
      motorcycle: {
        ...baseConfig.motorcycle,
        label: t("ChartLineLabelCustom.labels.motorcycle"),
      },
      van: { ...baseConfig.van, label: t("ChartLineLabelCustom.labels.van") },
      other: {
        ...baseConfig.other,
        label: t("ChartLineLabelCustom.labels.other"),
      },
    }),
    [t]
  );

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">
          {t("ChartLineLabelCustom.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("ChartLineLabelCustom.subtitle")}
        </p>
      </div> */}

      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="w-full h-[270px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 24, left: 24, right: 24 }}
          >
            {/* <CartesianGrid vertical={false} /> ← این خط حذف شد */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="units"
                  hideLabel
                />
              }
            />
            <Line
              dataKey="units"
              type="natural"
              stroke="var(--color-units, var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: "var(--color-units, var(--chart-2))" }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                dataKey="segment"
                formatter={(value: string) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </div>

      {/* <div className="flex flex-col gap-1 text-sm text-center mt-4">
        <div className="flex items-center justify-center gap-2 leading-none font-medium">
          {t("ChartLineLabelCustom.trend")} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 leading-none">
          {t("ChartLineLabelCustom.caption")}
        </div>
      </div> */}
    </div>
  );
}
