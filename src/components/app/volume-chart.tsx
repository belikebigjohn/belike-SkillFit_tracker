"use client";

import { useMemo, useState } from "react";

import AreaChart from "@/components/charts/area-chart";
import Segmented from "@/components/app/segmented";
import { formatNum } from "@/lib/charts";
import type { ChartSeries } from "@/lib/types";

type Period = "weeks" | "months" | "year";

const PERIODS: { value: Period; label: string }[] = [
  { value: "weeks", label: "8 недель" },
  { value: "months", label: "6 месяцев" },
  { value: "year", label: "Год" },
];

export default function VolumeChart({
  charts,
}: {
  charts: Record<Period, ChartSeries>;
}) {
  const [period, setPeriod] = useState<Period>("weeks");
  const series = charts[period];

  // last point gets a floating label; recompute only when the series changes
  const label = useMemo(() => {
    const values = series.values;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const y = 14 + (1 - (values[values.length - 1] - min) / span) * (220 - 28);
    return Math.max(16, y - 12);
  }, [series]);

  return (
    <section className="card rise rise-3">
      <div className="card-head">
        <div>
          <h2 className="card-title">Объём тренировок</h2>
          <p className="card-sub">Сумма поднятого веса, кг · {series.label}</p>
        </div>
        <Segmented options={PERIODS} value={period} onChange={setPeriod} ariaLabel="Период графика" />
      </div>

      <div className="chart-body" style={{ position: "relative" }}>
        {/* positioned with transform, not `top` — keeps the move on the compositor */}
        <span
          className="chip chip--accent"
          style={{
            position: "absolute",
            right: 8,
            top: 0,
            zIndex: 1,
            transform: `translateY(${label}px)`,
            transition: "transform 300ms var(--ease-out)",
          }}
        >
          {formatNum(series.values[series.values.length - 1])}
        </span>
        <AreaChart labels={series.labels} values={series.values} />
      </div>

      <div className="chart-foot">
        <div>
          <span>Среднее за период</span>
          <strong>{formatNum(series.avg)} кг</strong>
        </div>
        <div>
          <span>Лучший период</span>
          <strong>{formatNum(series.best)} кг</strong>
        </div>
        <div>
          <span>Рост за период</span>
          <strong style={{ color: "var(--accent-2)" }}>
            +{Math.round(((series.values[series.values.length - 1] - series.values[0]) / series.values[0]) * 100)}%
          </strong>
        </div>
      </div>
    </section>
  );
}
