"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import ProfileActions from "@/components/app/profile-actions";
import { api, errorMessage } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";
import type { Achievement, PersonalRecord, Session, User } from "@/lib/types";

interface ProfileData {
  user: User;
  sessions: Session[];
  records: PersonalRecord[];
  achievements: Achievement[];
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setData(null);
    Promise.all([api.getMe(), api.getWorkouts(), api.getRecords(), api.getAchievements()])
      .then(([user, sessions, records, achievements]) => setData({ user, sessions, records, achievements }))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(load, [load]);

  if (error) {
    return (
      <div className="card empty rise">
        <h3>Профиль не загрузился</h3>
        <p>{error}</p>
        <button type="button" className="btn btn--ghost" onClick={load}>
          <RefreshCw size={15} />
          Повторить
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <div className="skeleton" style={{ height: 56, marginBottom: 18 }} />
        <span className="skeleton" style={{ height: 96, borderRadius: 20, display: "block", marginBottom: 14 }} />
        <div className="kpi-row">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="skeleton" style={{ height: 108, borderRadius: 16 }} />
          ))}
        </div>
      </>
    );
  }

  const { user, sessions, records, achievements } = data;
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Аккаунт</span>
          <h1 className="page-title">Профиль</h1>
        </div>
        <ProfileActions
          name={user.name}
          goal={user.goal}
          onSaved={(name, goal) =>
            setData((d) => (d ? { ...d, user: { ...d.user, name, goal } } : d))
          }
        />
      </div>

      <section className="card rise" style={{ padding: 22, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span className="avatar avatar--lg" style={{ width: 56, height: 56, fontSize: 16 }}>
            {user.initials}
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, letterSpacing: "-0.02em" }}>
              {user.name}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Цель: {user.goal} · {user.rank} место в рейтинге
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className="chip chip--accent">
              {unlocked} из {achievements.length} достижений
            </span>
          </div>
        </div>
      </section>

      <div className="kpi-row">
        {[
          { label: "Очки", value: formatNum(user.points) },
          { label: "Тренировок", value: String(user.workouts) },
          { label: "Серия", value: `${user.streak} дн.` },
          { label: "Место", value: `#${user.rank}` },
        ].map((s, i) => (
          <div key={s.label} className={`kpi rise rise-${i + 1}`}>
            <div className="kpi-top">
              <span className="kpi-label">{s.label}</span>
            </div>
            <div className="kpi-main">
              <span className="num kpi-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card rise rise-3">
          <div className="card-head">
            <div>
              <h2 className="card-title">Личные рекорды</h2>
              <p className="card-sub">Лучшие веса в базовых движениях</p>
            </div>
          </div>
          {records.length === 0 ? (
            <p style={{ padding: "12px 20px 20px", fontSize: 13.5, color: "var(--muted-2)" }}>
              Рекордов пока нет — запишите тренировку с рабочим весом.
            </p>
          ) : (
            <div className="lb-rows">
              {records.map((r) => (
                <div key={r.name} className="lb-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="lb-name">{r.name}</div>
                    <div className="lb-sub">{r.date}</div>
                  </div>
                  <span className="lb-value">
                    {r.value} <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card rise rise-4">
          <div className="card-head">
            <div>
              <h2 className="card-title">История</h2>
              <p className="card-sub">Последние тренировки</p>
            </div>
            <Link href="/workouts" className="btn btn--quiet" style={{ height: 30, padding: "0 8px", fontSize: 12.5 }}>
              Все
            </Link>
          </div>
          {sessions.length === 0 ? (
            <p style={{ padding: "12px 20px 20px", fontSize: 13.5, color: "var(--muted-2)" }}>
              История пуста — начните с первой тренировки в журнале.
            </p>
          ) : (
            <div className="lb-rows">
              {sessions.slice(0, 5).map((s) => (
                <Link key={s.id} href={`/workouts/${s.id}`} className="lb-row">
                  <span className="lb-rank">{s.day}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="lb-name">{s.title}</div>
                    <div className="lb-sub">
                      {s.exercises} упр. · {s.minutes} мин
                    </div>
                  </div>
                  <span className="lb-value">
                    {s.volumeKg > 0 ? `${formatNum(s.volumeKg)} кг` : "кардио"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
