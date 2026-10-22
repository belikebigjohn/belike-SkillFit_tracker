"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { announceUnlocks } from "@/components/app/announce-unlocks";
import { api, errorMessage } from "@/lib/api-client";
import type { Exercise, Session } from "@/lib/types";

/** Catalog → workout: pick a destination or create a fresh draft for the exercise. */
export default function AddToWorkoutDialog({
  exercise,
  onClose,
}: {
  exercise: Exercise | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Session[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!exercise) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exercise, onClose]);

  const load = () => {
    setError(null);
    setWorkouts(null);
    api
      .getWorkouts()
      .then(setWorkouts)
      .catch((e) => setError(errorMessage(e)));
  };

  useEffect(load, [exercise]);

  if (!exercise) return null;

  async function addTo(workoutId: string, title: string) {
    if (busy) return;
    setBusy(workoutId);
    try {
      const res = await api.addExercise(workoutId, exercise!.id);
      announceUnlocks(res.unlocked);
      toast.success(`«${exercise!.name}» — в тренировке «${title}»`, {
        action: { label: "Открыть", onClick: () => router.push(`/workouts/${workoutId}`) },
      });
      onClose();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function createAndAdd() {
    if (busy) return;
    setBusy("new");
    try {
      const created = await api.createWorkout({
        title: `Тренировка · ${exercise!.muscleGroup}`,
        group: exercise!.muscleGroup,
      });
      const res = await api.addExercise(created.id, exercise!.id);
      announceUnlocks(res.unlocked);
      onClose();
      router.push(`/workouts/${created.id}`);
    } catch (e) {
      toast.error(errorMessage(e));
      setBusy(null);
    }
  }

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Куда добавить упражнение">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2>Добавить «{exercise.name}»</h2>
            <p style={{ color: "var(--muted-2)", fontSize: 12.5 }}>
              Выберите тренировку или создайте новую — результат заполните в ней.
            </p>
          </div>
          <button type="button" className="icon-btn" aria-label="Закрыть" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {error ? (
            <>
              <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>
              <button type="button" className="btn btn--ghost" onClick={load}>
                <RefreshCw size={15} />
                Повторить
              </button>
            </>
          ) : workouts === null ? (
            [0, 1, 2].map((i) => <span key={i} className="skeleton" style={{ height: 56 }} />)
          ) : workouts.length === 0 ? (
            <p style={{ color: "var(--muted-2)", fontSize: 13 }}>
              Тренировок пока нет — создадим новую для этого упражнения.
            </p>
          ) : (
            workouts.slice(0, 6).map((w) => (
              <button
                key={w.id}
                type="button"
                className="lb-row"
                style={{
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  background: "transparent",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                }}
                disabled={busy !== null}
                onClick={() => addTo(w.id, w.title)}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="lb-name">{w.title}</div>
                  <div className="lb-sub">
                    {w.date} · {w.exercises} упр.
                  </div>
                </div>
                <span className="chip chip--accent" style={{ marginLeft: "auto" }}>
                  {busy === w.id ? "Добавляем…" : "Выбрать"}
                </span>
              </button>
            ))
          )}
        </div>

        <button
          type="button"
          className="btn btn--accent"
          style={{ marginTop: 14 }}
          disabled={busy !== null}
          onClick={createAndAdd}
        >
          <Plus size={16} strokeWidth={2.4} />
          {busy === "new" ? "Создаём…" : "Новая тренировка с этим упражнением"}
        </button>
      </div>
    </div>
  );
}
