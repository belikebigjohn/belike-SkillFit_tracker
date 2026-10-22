import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Flame } from "lucide-react";

import WorkoutActions from "@/components/app/workout-actions";
import { api } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await api.getWorkout(id);
  if (!workout) notFound();

  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(workout.performedAt + "T12:00:00"));

  return (
    <>
      <Link
        href="/workouts"
        className="btn btn--quiet rise"
        style={{ height: 34, padding: 0, marginBottom: 14 }}
      >
        <ArrowLeft size={16} />
        Назад к журналу
      </Link>

      <div className="page-head">
        <div>
          <span className="eyebrow">{dateLabel}</span>
          <h1 className="page-title">{workout.title}</h1>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <span className="chip chip--accent">{workout.group}</span>
            <span className="chip">
              <Clock size={13} /> {workout.minutes} мин
            </span>
            <span className="chip">
              <Flame size={13} style={{ color: "var(--accent)" }} /> +{workout.points} очков
            </span>
          </div>
        </div>
        <div className="page-head__actions">
          <WorkoutActions title={workout.title} />
        </div>
      </div>

      <div className="dash-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {workout.items.map((item, i) => (
            <section key={item.id} className="card rise" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="card-head">
                <div>
                  <h2 className="card-title">
                    {item.order}. {item.name}
                  </h2>
                  <p className="card-sub">{item.sets.length} подходов</p>
                </div>
                <Link
                  href="/exercises"
                  className="btn btn--quiet"
                  style={{ height: 30, padding: "0 8px", fontSize: 12.5 }}
                >
                  Инструкция
                </Link>
              </div>
              <div style={{ padding: "12px 20px 18px", overflowX: "auto" }}>
                <table className="sets-table">
                  <thead>
                    <tr>
                      <th>Подход</th>
                      <th>Повторы</th>
                      <th>Вес, кг</th>
                      <th>Объём, кг</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.sets.map((s, si) => (
                      <tr key={si}>
                        <td>#{si + 1}</td>
                        <td>{s.reps}</td>
                        <td>{s.weightKg > 0 ? formatNum(s.weightKg) : "свой вес"}</td>
                        <td>{formatNum(s.reps * s.weightKg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <section className="card rise rise-2">
            <div className="card-head">
              <h2 className="card-title">Итог тренировки</h2>
            </div>
            <div className="chart-foot" style={{ gridTemplateColumns: "1fr 1fr", borderTop: 0 }}>
              <div>
                <span>Объём</span>
                <strong>{formatNum(workout.volumeKg)} кг</strong>
              </div>
              <div>
                <span>Очки</span>
                <strong style={{ color: "var(--accent)" }}>+{workout.points}</strong>
              </div>
            </div>
          </section>

          <section className="card rise rise-3">
            <div className="card-head">
              <h2 className="card-title">Заметки</h2>
            </div>
            <p style={{ padding: "12px 20px 20px", fontSize: 13.5, color: "var(--muted)" }}>
              {workout.notes}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
