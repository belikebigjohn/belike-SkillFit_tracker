"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Flame, Layers, Lock, Medal, RefreshCw, Target, Trophy, Zap } from "lucide-react";

import Sparkline from "@/components/charts/sparkline";
import GoalRing from "@/components/charts/goal-ring";
import MuscleDonut from "@/components/charts/muscle-donut";
import VolumeChart from "@/components/app/volume-chart";
import { api, errorMessage, type DashboardData } from "@/lib/api-client";
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
      <span>{a.unlocked ? a.date : `осталось ${(a.total ?? 0) - (a.progress ?? 0)}`}</span>
    </div>
  );
}

function Delta({ value, suffix = "" }: { value: number | undefined; suffix?: string }) {
  if (value === undefined || value === 0) {
    return <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>без изменений</span>;
  }
  const sign = value > 0 ? "+" : "";
  return <span className="delta">{`${sign}${formatNum(value)}${suffix}`}</span>;
}

function DashboardSkeleton() {
  return (
    <>
      <div className="skeleton" style={{ height: 56, marginBottom: 18 }} />
      <div className="kpi-row">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="skeleton" style={{ height: 132, borderRadius: 16 }} />
        ))}
      </div>
      <div className="dash-grid" style={{ marginTop: 14 }}>
        <span className="skeleton" style={{ height: 300, borderRadius: 20 }} />
        <span className="skeleton" style={{ height: 300, borderRadius: 20 }} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getDashboard()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(errorMessage(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <div className="card empty rise">
        <h3>Не удалось загрузить сводку</h3>
        <p>{error}</p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setError(null);
            setData(null);
            api
              .getDashboard()
              .then(setData)
              .catch((e) => setError(errorMessage(e)));
          }}
        >
          <RefreshCw size={15} />
          Повторить
        </button>
      </div>
    );
  }

  if (!data) return <DashboardSkeleton />;

  const { user, week, charts, muscles, achievements, leaderboard, sparklines } = data;
  const goalPct = Math.min(999, Math.round((week.volumeKg / week.targetKg) * 100));
  const pointsPct = Math.round((week.points / week.pointsTarget) * 100);
  const unlocked = achievements.filter((a) => a.unlocked).length;

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

      {user.workouts === 0 && (
        <div className="card empty rise" style={{ marginBottom: 14 }}>
          <h3>Журнал пока пуст</h3>
          <p>Запишите первую тренировку — очки и достижения появятся сразу после сохранения.</p>
          <Link href="/workouts" className="btn btn--accent">
            Перейти в журнал
          </Link>
        </div>
      )}

      <div className="kpi-row">
        <div className="kpi rise rise-1">
          <div className="kpi-top">
            <span className="kpi-label">Очки</span>
            <span className="kpi-icon">
              <Zap size={14} />
            </span>
          </div>
          <div className="kpi-main">
            <span className="num kpi-value">{formatNum(user.points)}</span>
            <Sparkline values={sparklines.points} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <Delta value={week.pointsDelta} />
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
            <Delta value={week.streakDelta} suffix="" />
            <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>к прошлой неделе</span>
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
            <span className="num kpi-value">{user.workouts}</span>
            <Sparkline values={sparklines.workouts} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <Delta value={week.workoutsDelta} />
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
            <Delta value={week.deltaPct} suffix="%" />
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
              Осталось <strong>{formatNum(Math.max(0, week.targetKg - week.volumeKg))} кг</strong>
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
              <span style={{ width: `${Math.min(100, (week.workouts / week.workoutsTarget) * 100)}%` }} />
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
            {muscles.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted-2)" }}>
                За неделю не было тренировок. График появится, как только запишете первую.
              </p>
            ) : (
              <>
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
              </>
            )}
          </div>
        </section>

        <section className="card rise rise-5">
          <div className="card-head">
            <div>
              <h2 className="card-title">Достижения</h2>
              <p className="card-sub">
                {unlocked} из {achievements.length} открыто
              </p>
            </div>
            <Link href="/profile" className="btn btn--quiet" style={{ height: 30, padding: "0 8px", fontSize: 12.5 }}>
              Все
            </Link>
          </div>
          <div className="ach-grid">
            {achievements.slice(0, 8).map((a) => (
              <AchTile key={a.code} a={a} />
            ))}
          </div>
        </section>

        <section className="card rise rise-5">
          <div className="card-head">
            <div>
              <h2 className="card-title">Рейтинг</h2>
              <p className="card-sub">по очкам · вы #{user.rank}</p>
            </div>
            <Link href="/leaderboard" className="btn btn--quiet" style={{ height: 30, padding: "0 8px", fontSize: 12.5 }}>
              Весь
            </Link>
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
