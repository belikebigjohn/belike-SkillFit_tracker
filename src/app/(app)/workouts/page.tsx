import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";

import { api } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";

export default async function WorkoutsPage() {
  const sessions = await api.getWorkouts();

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Журнал</span>
          <h1 className="page-title">Тренировки</h1>
        </div>
        <div className="page-head__actions">
          <span className="chip">
            <Flame size={13} style={{ color: "var(--accent)" }} /> серия 12 дней
          </span>
        </div>
      </div>

      <div className="session-list">
        {sessions.map((s, i) => (
          <Link
            key={s.id}
            href={`/workouts/${s.id}`}
            className="session-row rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="session-date">
              <span className="eyebrow" style={{ fontSize: 10 }}>{s.weekday}</span>
              <b>{s.day}</b>
              <span style={{ fontSize: 10.5, color: "var(--muted-2)" }}>{s.month}</span>
            </span>
            <div className="session-main">
              <div className="session-title">{s.title}</div>
              <div className="session-sub">
                {s.top}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <span className="chip">{s.exercises} упр.</span>
                <span className="chip">{s.minutes} мин</span>
                {s.group && <span className="chip chip--accent">{s.group}</span>}
                {s.record && <span className="chip chip--accent">рекорд</span>}
              </div>
            </div>
            <div className="session-vol">
              {s.volumeKg > 0 ? (
                <>
                  <span className="num" style={{ fontSize: 22 }}>
                    {formatNum(s.volumeKg)}
                    <span className="unit">кг</span>
                  </span>
                  <div style={{ marginTop: 6 }}>
                    <span className="delta">+{s.points}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="num" style={{ fontSize: 22 }}>
                    5
                    <span className="unit">км</span>
                  </span>
                  <div style={{ marginTop: 6 }}>
                    <span className="delta">+{s.points}</span>
                  </div>
                </>
              )}
            </div>
            <ChevronRight size={18} style={{ color: "var(--muted-2)", flex: "none" }} />
          </Link>
        ))}
      </div>
    </>
  );
}
