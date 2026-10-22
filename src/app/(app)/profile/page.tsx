import Link from "next/link";

import ProfileActions from "@/components/app/profile-actions";
import { api } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";

export default async function ProfilePage() {
  const [user, sessions, records, achievements] = await Promise.all([
    api.getMe(),
    api.getWorkouts(),
    api.getRecords(),
    api.getAchievements(),
  ]);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Аккаунт</span>
          <h1 className="page-title">Профиль</h1>
        </div>
        <ProfileActions />
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
              Цель: {user.goal} · 4 место в рейтинге
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
                  {s.volumeKg > 0 ? `${formatNum(s.volumeKg)} кг` : "5 км"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
