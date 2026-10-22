"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";

import Segmented from "@/components/app/segmented";
import { api } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";
import type { LeaderMetric, LeaderRow } from "@/lib/types";

const METRICS: { value: LeaderMetric; label: string }[] = [
  { value: "points", label: "Очки" },
  { value: "workouts", label: "Тренировки" },
  { value: "volume", label: "Объём" },
  { value: "streak", label: "Серия" },
];

function metricValue(row: LeaderRow, metric: LeaderMetric): string {
  switch (metric) {
    case "points":
      return formatNum(row.points);
    case "workouts":
      return `${row.workouts}`;
    case "volume":
      return `${formatNum(row.volumeKg)} кг`;
    case "streak":
      return `${row.streak} дн.`;
  }
}

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<LeaderMetric>("points");
  const [rows, setRows] = useState<LeaderRow[] | null>(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    api.getLeaderboard(metric).then((list) => {
      if (alive) setRows(list);
    });
    return () => {
      alive = false;
    };
  }, [metric]);

  const rest = rows?.slice(3) ?? [];

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Сообщество · 8 участников</span>
          <h1 className="page-title">Рейтинг</h1>
        </div>
        <div className="page-head__actions">
          <Segmented options={METRICS} value={metric} onChange={setMetric} ariaLabel="Метрика рейтинга" />
        </div>
      </div>

      {rows === null ? (
        <>
          <div className="podium" style={{ paddingInline: 0 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="skeleton" style={{ height: 150, borderRadius: 16 }} />
            ))}
          </div>
          <div className="card" style={{ marginTop: 14, padding: 20 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="skeleton" style={{ height: 44, marginBottom: 10 }} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="podium rise" style={{ paddingInline: 0 }}>
            {[rows[1], rows[0], rows[2]].map((p) =>
              p ? (
                <div
                  key={p.rank}
                  className={`podium-item ${p.rank === 1 ? "podium-item--first" : ""}`}
                >
                  <span className="eyebrow">
                    {p.rank === 1 ? (
                      <Crown size={13} style={{ color: "var(--accent)", display: "inline" }} />
                    ) : (
                      `${p.rank} место`
                    )}
                  </span>
                  <span
                    className="avatar avatar--lg"
                    style={{ background: `linear-gradient(140deg, ${p.from}, ${p.to})` }}
                  >
                    {p.initials}
                  </span>
                  <b style={{ fontSize: 13.5 }}>{p.name}</b>
                  <span className="num" style={{ fontSize: 20 }}>
                    {metricValue(p, metric)}
                  </span>
                </div>
              ) : null,
            )}
          </div>

          <section className="card rise rise-2" style={{ marginTop: 14 }}>
            <div className="lb-rows">
              {rest.map((r) => (
                <div key={r.rank} className={`lb-row ${r.me ? "is-me" : ""}`}>
                  <span className="lb-rank">{r.rank}</span>
                  <span
                    className="avatar"
                    style={{ background: `linear-gradient(140deg, ${r.from}, ${r.to})` }}
                  >
                    {r.initials}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="lb-name">{r.name}</div>
                    <div className="lb-sub">
                      {r.workouts} тренировок · серия {r.streak} дн.
                    </div>
                  </div>
                  <span className="lb-value">{metricValue(r, metric)}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
