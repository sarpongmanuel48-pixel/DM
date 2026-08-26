"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  visits: { label: "Visits", color: "var(--action-primary)" },
} satisfies ChartConfig;

export function VisitsChart({ counts }: { counts: number[] }) {
  const today = new Date();
  const data = counts.map((count, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (counts.length - 1 - i));
    return { day: String(d.getDate()), visits: count, recent: i >= counts.length - 2 };
  });

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-white p-5">
      <div className="flex items-baseline justify-between">
        <div className="text-[13.5px] font-semibold text-ink-900">Visits per day</div>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[140px] w-full">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--hairline)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fill: "var(--ink-300)" }}
          />
          <ChartTooltip cursor={{ fill: "var(--canvas-soft)" }} content={<ChartTooltipContent />} />
          <Bar dataKey="visits" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.recent ? "var(--action-primary)" : "var(--blue-100)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
