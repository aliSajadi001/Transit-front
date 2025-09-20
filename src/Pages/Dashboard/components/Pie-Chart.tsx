import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";

export const description = "An interactive pie chart (vehicles)";

const desktopData = [
  { monthKey: "january", desktop: 186, fill: "var(--color-january)" },
  { monthKey: "february", desktop: 305, fill: "var(--color-february)" },
  { monthKey: "march", desktop: 237, fill: "var(--color-march)" },
  { monthKey: "april", desktop: 173, fill: "var(--color-april)" },
  { monthKey: "may", desktop: 209, fill: "var(--color-may)" },
];

const baseConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop" },
  mobile: { label: "Mobile" },
  january: { label: "January", color: "var(--chart-1)" },
  february: { label: "February", color: "var(--chart-2)" },
  march: { label: "March", color: "var(--chart-3)" },
  april: { label: "April", color: "var(--chart-4)" },
  may: { label: "May", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function ChartPieInteractive() {
  const id = "pie-interactive";
  const { t } = useTranslation();

  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].monthKey);
  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.monthKey === activeMonth),
    [activeMonth]
  );

  // پیکربندی با ترجمه‌ها
  const chartConfig: ChartConfig = {
    ...baseConfig,
    visitors: {
      ...baseConfig.visitors,
      label: t("ChartPieInteractive.labels.visitors"),
    },
    desktop: {
      ...baseConfig.desktop,
      label: t("ChartPieInteractive.labels.desktop"),
    },
    mobile: {
      ...baseConfig.mobile,
      label: t("ChartPieInteractive.labels.mobile"),
    },
    january: {
      ...baseConfig.january,
      label: t("ChartPieInteractive.months.january"),
    },
    february: {
      ...baseConfig.february,
      label: t("ChartPieInteractive.months.february"),
    },
    march: {
      ...baseConfig.march,
      label: t("ChartPieInteractive.months.march"),
    },
    april: {
      ...baseConfig.april,
      label: t("ChartPieInteractive.months.april"),
    },
    may: { ...baseConfig.may, label: t("ChartPieInteractive.months.may") },
  };

  return (
    <div data-chart={id} className="flex flex-col space-y-4">
      <ChartStyle id={id} config={chartConfig} />
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h3 className="text-lg font-semibold">
            {t("ChartPieInteractive.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("ChartPieInteractive.subtitleMonths")}
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="monthKey"
              innerRadius={60}
              stroke="none"
              strokeWidth={0}
              onMouseEnter={(data) => setActiveMonth(data.monthKey)}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {desktopData[activeIndex].desktop.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {t("ChartPieInteractive.labels.visitors")}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
