import  { useMemo } from "react";
// import { TrendingUp } from "lucide-react";
import { Dot, Line, LineChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";

type VehiclePoint = {
  segment: string;
  i18nKey: string;
  count: number;
  fill: string;
};

// ————— داده‌های خودرویی (نمونه)
const chartData: VehiclePoint[] = [
  {
    segment: "Sedan",
    i18nKey: "sedan",
    count: 420,
    fill: "var(--color-sedan)",
  },
  { segment: "SUV", i18nKey: "suv", count: 365, fill: "var(--color-suv)" },
  {
    segment: "Truck",
    i18nKey: "truck",
    count: 255,
    fill: "var(--color-truck)",
  },
  {
    segment: "Motorcycle",
    i18nKey: "motorcycle",
    count: 180,
    fill: "var(--color-motorcycle)",
  },
  { segment: "Van", i18nKey: "van", count: 140, fill: "var(--color-van)" },
  { segment: "Bus", i18nKey: "bus", count: 60, fill: "var(--color-bus)" },
];

// پیکربندی پایه ( رنگ‌ها ثابت، لیبل‌ها را با i18n تزریق می‌کنیم )
const baseConfig: ChartConfig = {
  count: { label: "Count", color: "var(--chart-2)" },
  sedan: { label: "Sedan", color: "var(--chart-1)" },
  suv: { label: "SUV", color: "var(--chart-2)" },
  truck: { label: "Truck", color: "var(--chart-3)" },
  motorcycle: { label: "Motorcycle", color: "var(--chart-4)" },
  van: { label: "Van", color: "var(--chart-5)" },
  bus: { label: "Bus", color: "var(--chart-6, var(--chart-1))" },
};

export function ChartLineDotsColors() {
  const { t } = useTranslation();

  // پیکربندی با لیبل‌های ترجمه‌شده
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      ...baseConfig,
      count: { ...baseConfig.count, label: t("chart.vehicles.count") },
      sedan: { ...baseConfig.sedan, label: t("chart.vehicles.sedan") },
      suv: { ...baseConfig.suv, label: t("chart.vehicles.suv") },
      truck: { ...baseConfig.truck, label: t("chart.vehicles.truck") },
      motorcycle: {
        ...baseConfig.motorcycle,
        label: t("chart.vehicles.motorcycle"),
      },
      van: { ...baseConfig.van, label: t("chart.vehicles.van") },
      bus: { ...baseConfig.bus, label: t("chart.vehicles.bus") },
    }),
    [t]
  );

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">{t("chart.vehicles.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("chart.vehicles.subtitle")}
        </p>
      </div> */}

      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 24, left: 24, right: 24 }}
          >
            {/* <CartesianGrid vertical={false} />  ← این خط رو بردار */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="count"
                  hideLabel
                />
              }
            />
            <Line
              dataKey="count"
              type="natural"
              stroke="var(--color-count, var(--chart-2))"
              strokeWidth={2}
              dot={({ payload, ...props }) => (
                <Dot
                  key={payload.segment}
                  r={5}
                  cx={props.cx}
                  cy={props.cy}
                  fill={payload.fill}
                  stroke={payload.fill}
                />
              )}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {/* <div className="flex flex-col gap-1 text-sm text-center mt-4">
        <div className="flex items-center justify-center gap-2 leading-none font-medium">
          {t("chart.vehicles.trend")} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 leading-none">
          {t("chart.vehicles.caption")}
        </div>
      </div> */}
    </div>
  );
}
