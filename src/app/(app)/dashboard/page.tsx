import { BadgeCheck, Flame, Layers, Lock, Medal, Target, Trophy, Zap } from "lucide-react";

import Sparkline from "@/components/charts/sparkline";
import GoalRing from "@/components/charts/goal-ring";
import MuscleDonut from "@/components/charts/muscle-donut";
import VolumeChart from "@/components/app/volume-chart";
import { api } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";
import type { Achievement } from "@/lib/types";

const ACH_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  zap: Zap,
  check: BadgeCheck,
  layers: Layers,
  flame: Flame,
  medal: Medal,
  target: Target,
  trophy: Trophy,
  lock: Lock,
};

function AchTile({ a }: { a: Achievement }) {
  const Icon = ACH_ICONS[a.icon] ?? Trophy;
  return (
    <div className={`ach ${a.unlocked ? "" : "ach--locked"}`} title={a.desc}>
      <span className="ach-tile">
        <Icon size={18} />
      </span>
      <b>{a.title}</b>
      <span>{a.unlocked ? a.date : `+${(a.total ?? 0) - (a.progress ?? 0)} дней`}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const { user, week, charts, muscles, achievements, leaderboard, sparklines } =
    await api.getDashboard();

  const goalPct = Math.round((week.volumeKg / week.targetKg) * 100);
  const pointsPct = Math.round((week.points / week.pointsTarget) * 100);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Неделя · {week.label}</span>
          <h1 className="page-title">Сводка недели</h1>
        </div>
        <div className="page-head__actions">
          <span className="chip chip--accent">
            <Flame size={13} /> {user.streak} дней серии
          </span>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi rise rise-1">
          <div className="kpi-top">
            <span className="kpi-label">Очки</span>
            <span className="kpi-icon">
              <Zap size={14} />
            </span>
          </div>
          <div className="kpi-main">
            <span className="num kpi-value">
              {formatNum(user.points)}
            </span>
            <Sparkline values={sparklines.points} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta">+142</span>
            <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>за неделю</span>
          </div>
        </div>

        <div className="kpi rise rise-2">
          <div className="kpi-top">
            <span className="kpi-label">Серия</span>
            <span className="kpi-icon">
              <Flame size={14} />
            </span>
          </div>
          <div className="kpi-main">
            <span className="num kpi-value">
              {user.streak}
              <span className="unit">дней</span>
            </span>
            <Sparkline values={sparklines.streak} color="var(--accent-2)" />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta">+5</span>
            <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>личный рекорд</span>
          </div>
        </div>

        <div className="kpi rise rise-3">
          <div className="kpi-top">
            <span className="kpi-label">Тренировки</span>
            <span className="kpi-icon">
              <Layers size={14} />
            </span>
          </div>
          <div className="kpi-main">
            <span className="num kpi-value">
              {user.workouts}
            </span>
            <Sparkline values={sparklines.workouts} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta">+3</span>
            <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>за неделю</span>
          </div>
        </div>

        <div className="kpi rise rise-4">
          <div className="kpi-top">
            <span className="kpi-label">Объём</span>
            <span className="kpi-icon">
              <Medal size={14} />
            </span>
          </div>
          <div className="kpi-main">
            <span className="num kpi-value">
              {formatNum(week.volumeKg)}
              <span className="unit">кг</span>
            </span>
            <Sparkline values={sparklines.volume} color="var(--accent-2)" />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta">+{week.deltaPct}%</span>
            <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>к прошлой неделе</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <VolumeChart charts={charts} />

        <section className="card rise rise-4">
          <div className="card-head">
            <div>
              <h2 className="card-title">Цель недели</h2>
              <p className="card-sub">{formatNum(week.targetKg)} кг объёма</p>
            </div>
            <span className="chip chip--accent">{goalPct}%</span>
          </div>
          <div className="ring-wrap">
            <GoalRing
              pct={goalPct}
              center={
                <span className="num" style={{ fontSize: 30 }}>
                  {goalPct}
                  <span className="unit" style={{ marginLeft: 2 }}>%</span>
                </span>
              }
            />
            <p className="ring-caption">
              Осталось <strong>{formatNum(week.targetKg - week.volumeKg)} кг</strong>
              <br />
              до цели недели
            </p>
          </div>
          <div className="ring-facts">
            <div className="ring-fact">
              <span>Тренировки</span>
              <b>
                {week.workouts} / {week.workoutsTarget}
              </b>
            </div>
            <div className="bar">
              <span style={{ width: `${(week.workouts / week.workoutsTarget) * 100}%` }} />
            </div>
            <div className="ring-fact">
              <span>Очки</span>
              <b>
                {week.points} / {week.pointsTarget}
              </b>
            </div>
            <div className="bar bar--mint">
              <span style={{ width: `${pointsPct}%` }} />
            </div>
          </div>
        </section>
      </div>

      <div className="dash-grid dash-grid--3">
        <section className="card rise rise-5">
          <div className="card-head">
            <div>
              <h2 className="card-title">Группы мышц</h2>
              <p className="card-sub">{week.exercises} упражнений за неделю</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px 20px" }}>
            <MuscleDonut
              slices={muscles}
              center={
                <div>
                  <div className="num" style={{ fontSize: 24 }}>
                    {week.exercises}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted-2)" }}>упражнений</div>
                </div>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
              {muscles.map((m) => (
                <div key={m.name} className="ring-fact">
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 3,
                        background: m.color,
                        display: "inline-block",
                      }}
                    />
                    {m.name}
                  </span>
                  <b>{m.pct}%</b>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card rise rise-5">
          <div className="card-head">
            <div>
              <h2 className="card-title">Достижения</h2>
              <p className="card-sub">7 из 8 открыто</p>
            </div>
          </div>
          <div className="ach-grid">
            {achievements.map((a) => (
              <AchTile key={a.code} a={a} />
            ))}
          </div>
        </section>

        <section className="card rise rise-5">
          <div className="card-head">
            <div>
              <h2 className="card-title">Рейтинг</h2>
              <p className="card-sub">по очкам · 8 участников</p>
            </div>
          </div>
          <div className="lb-rows">
            {leaderboard.map((r) => (
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
                  <div className="lb-sub">{r.workouts} тренировок</div>
                </div>
                <span className="lb-value">{formatNum(r.points)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
