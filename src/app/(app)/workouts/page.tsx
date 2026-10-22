"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Flame, Plus, RefreshCw } from "lucide-react";

import NewWorkoutDialog from "@/components/app/new-workout-dialog";
import { api, errorMessage } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";
import type { Session, User } from "@/lib/types";

export default function WorkoutsPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(() => {
    setError(null);
    setSessions(null);
    Promise.all([api.getWorkouts(), api.getMe()])
      .then(([list, user]) => {
        setSessions(list);
        setMe(user);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(load, [load]);

  const body = () => {
    if (error) {
      return (
        <div className="card empty rise">
          <h3>Журнал не загрузился</h3>
          <p>{error}</p>
          <button type="button" className="btn btn--ghost" onClick={load}>
            <RefreshCw size={15} />
            Повторить
          </button>
        </div>
      );
    }
    if (sessions === null) {
      return (
        <div className="session-list">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="skeleton" style={{ height: 110, borderRadius: 20 }} />
          ))}
        </div>
      );
    }
    if (sessions.length === 0) {
      return (
        <div className="card empty rise">
          <h3>Пока ни одной тренировки</h3>
          <p>Запишите первую — очки, серия и место в рейтинге начислятся сразу.</p>
          <button type="button" className="btn btn--accent" onClick={() => setDialogOpen(true)}>
            <Plus size={17} strokeWidth={2.4} />
            Создать тренировку
          </button>
        </div>
      );
    }
    return (
      <div className="session-list">
        {sessions.map((s, i) => (
          <Link
            key={s.id}
            href={`/workouts/${s.id}`}
            className="session-row rise"
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
          >
            <span className="session-date">
              <span className="eyebrow" style={{ fontSize: 10 }}>{s.weekday}</span>
              <b>{s.day}</b>
              <span style={{ fontSize: 10.5, color: "var(--muted-2)" }}>{s.month}</span>
            </span>
            <div className="session-main">
              <div className="session-title">{s.title}</div>
              <div className="session-sub">{s.top}</div>
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
                    кардио
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
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Журнал</span>
          <h1 className="page-title">Тренировки</h1>
        </div>
        <div className="page-head__actions">
          {me !== null && me.streak > 0 && (
            <span className="chip">
              <Flame size={13} style={{ color: "var(--accent)" }} /> серия {me.streak} дней
            </span>
          )}
          <button
            type="button"
            className="btn btn--accent"
            style={{ height: 34, padding: "0 12px" }}
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={16} strokeWidth={2.4} />
            Новая
          </button>
        </div>
      </div>

      {body()}

      <NewWorkoutDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
