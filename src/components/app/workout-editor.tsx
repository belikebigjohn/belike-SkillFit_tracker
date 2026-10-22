"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Flame,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { announceUnlocks } from "@/components/app/announce-unlocks";
import { ApiError, api, errorMessage, type WorkoutMutation } from "@/lib/api-client";
import { formatNum } from "@/lib/charts";
import {
  MUSCLE_GROUPS,
  type Exercise,
  type WorkoutDetail,
  type WorkoutSet,
} from "@/lib/types";

/* ---------- local editing state ---------- */

/** One item's editable fields, kept as strings so typing "8." doesn't break. */
interface Draft {
  reps: string[];
  weight: string[];
  durationMin: string;
  distanceKm: string;
  dirty: boolean;
}

function draftFromItem(it: WorkoutItemLite): Draft {
  return {
    reps: it.sets.map((s) => String(s.reps)),
    weight: it.sets.map((s) => (s.weightKg === 0 ? "0" : String(s.weightKg))),
    durationMin: it.durationSec ? String(Math.round(it.durationSec / 60)) : "",
    distanceKm: it.distanceM ? String(+(it.distanceM / 1000).toFixed(2)) : "",
    dirty: false,
  };
}

type WorkoutItemLite = WorkoutDetail["items"][number];

function parseDraft(d: Draft): { sets: WorkoutSet[]; durationSec: number | null; distanceM: number | null } | string {
  const sets: WorkoutSet[] = [];
  for (let i = 0; i < d.reps.length; i++) {
    const reps = d.reps[i].trim() === "" ? 0 : Number(d.reps[i]);
    const weightKg = d.weight[i].trim() === "" ? 0 : Number(d.weight[i]);
    if (!Number.isFinite(reps) || reps < 0 || reps > 200 || Math.floor(reps) !== reps) {
      return `Подход ${i + 1}: повторы — целое от 0 до 200`;
    }
    if (!Number.isFinite(weightKg) || weightKg < 0 || weightKg > 5000) {
      return `Подход ${i + 1}: вес — число от 0 до 5000`;
    }
    sets.push({ reps, weightKg });
  }
  const min = d.durationMin.trim();
  const km = d.distanceKm.trim();
  if (min !== "" && (!Number.isFinite(Number(min)) || Number(min) < 0 || Number(min) > 1440)) {
    return "Длительность — минуты от 0 до 1440";
  }
  if (km !== "" && (!Number.isFinite(Number(km)) || Number(km) < 0 || Number(km) > 200)) {
    return "Дистанция — километры от 0 до 200";
  }
  return {
    sets,
    durationSec: min === "" ? null : Math.round(Number(min) * 60),
    distanceM: km === "" ? null : Math.round(Number(km) * 1000),
  };
}

/* ---------- dialogs ---------- */

function ExercisePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (ex: Exercise) => void;
}) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("Все");
  const [items, setItems] = useState<Exercise[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setItems(null);
    api
      .getExercises(q, muscle)
      .then((list) => {
        if (alive) setItems(list);
      })
      .catch((e) => {
        if (alive) toast.error(errorMessage(e));
      });
    return () => {
      alive = false;
    };
  }, [open, q, muscle]);

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Добавить упражнение">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2>Добавить упражнение</h2>
          <button type="button" className="icon-btn" aria-label="Закрыть" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ position: "relative", marginTop: 14 }}>
          <Search
            size={15}
            style={{ position: "absolute", left: 11, top: "50%", translate: "0 -50%", color: "var(--muted-2)" }}
          />
          <input
            className="input"
            style={{ paddingLeft: 34 }}
            placeholder="Поиск по названию"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            aria-label="Поиск упражнения"
          />
        </div>

        <div className="filter-row" role="group" aria-label="Фильтр по группе мышц" style={{ marginTop: 12 }}>
          {["Все", ...MUSCLE_GROUPS].map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-chip ${muscle === f ? "is-active" : ""}`}
              aria-pressed={muscle === f}
              onClick={() => setMuscle(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14, maxHeight: "46vh", overflowY: "auto" }}>
          {items === null ? (
            [0, 1, 2].map((i) => <span key={i} className="skeleton" style={{ height: 64 }} />)
          ) : items.length === 0 ? (
            <p style={{ color: "var(--muted-2)", fontSize: 13 }}>Ничего не найдено — измените поиск.</p>
          ) : (
            items.map((e) => (
              <button
                key={e.id}
                type="button"
                className="lb-row"
                style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: "1px solid var(--line)", borderRadius: 12 }}
                onClick={() => onPick(e)}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="lb-name">{e.name}</div>
                  <div className="lb-sub">
                    {e.muscleGroup} · {e.equipment}
                  </div>
                </div>
                <span className="chip chip--accent" style={{ marginLeft: "auto" }}>
                  <Plus size={13} /> Добавить
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function WorkoutMetaDialog({
  workout,
  onClose,
  onSaved,
}: {
  workout: WorkoutDetail;
  onClose: () => void;
  onSaved: (res: WorkoutMutation) => void;
}) {
  const [form, setForm] = useState({
    title: workout.title,
    group: workout.group || MUSCLE_GROUPS[0],
    performedAt: workout.performedAt,
    minutes: String(workout.minutes),
    notes: workout.notes,
  });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const minutes = Number(form.minutes);
    try {
      const res = await api.updateWorkout(workout.id, {
        title: form.title.trim(),
        group: form.group,
        performedAt: form.performedAt,
        minutes: Number.isFinite(minutes) ? Math.round(minutes) : 0,
        notes: form.notes,
      });
      onSaved(res);
      toast.success("Тренировка обновлена");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError && err.fields?.performedAt ? err.fields.performedAt : errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Параметры тренировки">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2>Параметры</h2>
          <button type="button" className="icon-btn" aria-label="Закрыть" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form className="dialog-form" onSubmit={save}>
          <div className="field">
            <label htmlFor="m-title">Название</label>
            <input
              id="m-title"
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="m-group">Группа мышц</label>
            <select
              id="m-group"
              className="input"
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value })}
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="m-date">Дата</label>
            <input
              id="m-date"
              className="input"
              type="date"
              value={form.performedAt}
              onChange={(e) => setForm({ ...form, performedAt: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="m-min">Длительность, мин</label>
            <input
              id="m-min"
              className="input"
              type="number"
              min={0}
              max={600}
              value={form.minutes}
              onChange={(e) => setForm({ ...form, minutes: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="m-notes">Заметки</label>
            <textarea
              id="m-notes"
              className="input"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--accent" disabled={busy || !form.title.trim()}>
              {busy ? "Сохраняем…" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- main editor ---------- */

export default function WorkoutEditor({ id }: { id: string }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    setState("loading");
    api
      .getWorkout(id)
      .then((w) => {
        if (!w) {
          setState("missing");
          return;
        }
        setWorkout(w);
        setDrafts(workoutItemsToDrafts(w.items));
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [id]);

  useEffect(load, [load]);

  // Escape closes whichever editor dialog is open (picker / meta / delete-confirm)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPickerOpen(false);
      setMetaOpen(false);
      setConfirmDelete(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const applyMutation = (res: WorkoutMutation) => {
    setWorkout(res.workout);
    // the server round-trip is the truth — re-seed every draft from it
    setDrafts(workoutItemsToDrafts(res.workout.items));
    announceUnlocks(res.unlocked);
  };

  const totals = useMemo(() => {
    if (!workout) return { volume: 0, sets: 0 };
    let volume = 0;
    let sets = 0;
    for (const it of workout.items) {
      for (const s of it.sets) {
        volume += s.reps * s.weightKg;
        if (s.reps > 0 || s.weightKg > 0) sets += 1;
      }
    }
    return { volume: Math.round(volume), sets };
  }, [workout]);

  if (state === "loading") {
    return (
      <>
        <div className="skeleton" style={{ height: 34, width: 180, marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 96, borderRadius: 20, marginBottom: 14 }} />
        <div className="dash-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="skeleton" style={{ height: 200, borderRadius: 20 }} />
            ))}
          </div>
          <span className="skeleton" style={{ height: 320, borderRadius: 20 }} />
        </div>
      </>
    );
  }

  if (state === "error") {
    return (
      <div className="card empty rise">
        <h3>Тренировка не загрузилась</h3>
        <p>Проверьте соединение и попробуйте ещё раз.</p>
        <button type="button" className="btn btn--ghost" onClick={load}>
          <RefreshCw size={15} />
          Повторить
        </button>
      </div>
    );
  }

  if (state === "missing" || !workout) {
    return (
      <div className="card empty rise">
        <h3>Такой тренировки нет</h3>
        <p>Возможно, она была удалена, или ссылка устарела.</p>
        <Link href="/workouts" className="btn btn--accent">
          Вернуться в журнал
        </Link>
      </div>
    );
  }

  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(workout.performedAt + "T12:00:00"));

  async function addExercise(ex: Exercise) {
    try {
      const res = await api.addExercise(workout!.id, ex.id);
      applyMutation(res);
      toast.success(`«${ex.name}» добавлено`);
      setPickerOpen(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function saveItem(itemId: string, name: string) {
    const d = drafts[itemId];
    if (!d) return;
    const parsed = parseDraft(d);
    if (typeof parsed === "string") {
      toast.error(parsed);
      return;
    }
    setSavingId(itemId);
    try {
      const res = await api.updateItem(workout!.id, itemId, parsed);
      applyMutation(res);
      toast.success(`«${name}» сохранено`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSavingId(null);
    }
  }

  async function removeItem(itemId: string) {
    try {
      const res = await api.removeItem(workout!.id, itemId);
      applyMutation(res);
      toast.info("Упражнение убрано из тренировки");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function deleteWorkout() {
    try {
      await api.deleteWorkout(workout!.id);
      toast.success("Тренировка удалена");
      router.push("/workouts");
    } catch (e) {
      toast.error(errorMessage(e));
      setConfirmDelete(false);
    }
  }

  function patchDraft(itemId: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch, dirty: true } }));
  }

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
            <span className="chip">{totals.sets} подходов</span>
          </div>
        </div>
        <div className="page-head__actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn--accent" onClick={() => setPickerOpen(true)}>
            <Plus size={17} strokeWidth={2.4} />
            Добавить упражнение
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setMetaOpen(true)}>
            Изменить
          </button>
          <button
            type="button"
            className="btn btn--quiet"
            style={{ color: "var(--danger)" }}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={16} />
            Удалить
          </button>
        </div>
      </div>

      <div className="dash-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {workout.items.length === 0 && (
            <div className="card empty rise">
              <h3>В черновике пока пусто</h3>
              <p>Добавьте первое упражнение из каталога — результаты сохраните прямо здесь.</p>
              <button type="button" className="btn btn--accent" onClick={() => setPickerOpen(true)}>
                <Plus size={17} strokeWidth={2.4} />
                Выбрать упражнение
              </button>
            </div>
          )}

          {workout.items.map((item, i) => {
            const d = drafts[item.id];
            if (!d) return null;
            // mirrors the server model: Кардио items carry no sets, only duration/distance
            const cardio = item.sets.length === 0;
            return (
              <section key={item.id} className="card rise" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                <div className="card-head">
                  <div>
                    <h2 className="card-title">
                      {i + 1}. {item.name}
                    </h2>
                    <p className="card-sub">{cardio ? "кардио-запись" : `${item.sets.length} подходов`}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Link
                      href="/exercises"
                      className="btn btn--quiet"
                      style={{ height: 30, padding: "0 8px", fontSize: 12.5 }}
                    >
                      <Video size={13} />
                      Инструкция
                    </Link>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Убрать ${item.name}`}
                      style={{ color: "var(--danger)" }}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: "12px 20px 18px", overflowX: "auto" }}>
                  {!cardio && (
                    <table className="sets-table">
                      <thead>
                        <tr>
                          <th>Подход</th>
                          <th>Повторы</th>
                          <th>Вес, кг</th>
                          <th>Объём, кг</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {d.reps.map((_, si) => {
                          const reps = Number(d.reps[si]) || 0;
                          const weight = Number(d.weight[si]) || 0;
                          return (
                            <tr key={si}>
                              <td>#{si + 1}</td>
                              <td>
                                <input
                                  className="input input--cell"
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  aria-label={`Повторы в подходе ${si + 1}`}
                                  value={d.reps[si]}
                                  onChange={(e) => {
                                    const repsArr = [...d.reps];
                                    repsArr[si] = e.target.value;
                                    patchDraft(item.id, { reps: repsArr });
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  className="input input--cell"
                                  type="number"
                                  inputMode="decimal"
                                  min={0}
                                  step="0.5"
                                  aria-label={`Вес в подходе ${si + 1}`}
                                  value={d.weight[si]}
                                  onChange={(e) => {
                                    const wArr = [...d.weight];
                                    wArr[si] = e.target.value;
                                    patchDraft(item.id, { weight: wArr });
                                  }}
                                />
                              </td>
                              <td>{formatNum(reps * weight)}</td>
                              <td>
                                {d.reps.length > 1 && (
                                  <button
                                    type="button"
                                    className="icon-btn"
                                    aria-label={`Удалить подход ${si + 1}`}
                                    onClick={() =>
                                      patchDraft(item.id, {
                                        reps: d.reps.filter((_, j) => j !== si),
                                        weight: d.weight.filter((_, j) => j !== si),
                                      })
                                    }
                                  >
                                    <X size={15} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {cardio && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: item.sets.length > 0 ? 12 : 0 }}>
                      <div className="field" style={{ flex: 1, minWidth: 140 }}>
                        <label htmlFor={`dur-${item.id}`}>Длительность, мин</label>
                        <input
                          id={`dur-${item.id}`}
                          className="input"
                          type="number"
                          min={0}
                          value={d.durationMin}
                          placeholder="30"
                          onChange={(e) => patchDraft(item.id, { durationMin: e.target.value })}
                        />
                      </div>
                      <div className="field" style={{ flex: 1, minWidth: 140 }}>
                        <label htmlFor={`dist-${item.id}`}>Дистанция, км</label>
                        <input
                          id={`dist-${item.id}`}
                          className="input"
                          type="number"
                          min={0}
                          step="0.1"
                          value={d.distanceKm}
                          placeholder="5"
                          onChange={(e) => patchDraft(item.id, { distanceKm: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
                    {!cardio && (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        style={{ height: 34, fontSize: 13 }}
                        onClick={() =>
                          patchDraft(item.id, {
                            reps: [...d.reps, String(d.reps[d.reps.length - 1] ?? "8")],
                            weight: [...d.weight, d.weight[d.weight.length - 1] ?? "0"],
                          })
                        }
                      >
                        <Plus size={14} />
                        Подход
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--accent"
                      style={{ height: 34, fontSize: 13 }}
                      disabled={!d.dirty || savingId === item.id}
                      onClick={() => saveItem(item.id, item.name)}
                    >
                      {savingId === item.id ? "Сохраняем…" : "Сохранить результат"}
                    </button>
                    {d.dirty && savingId !== item.id && (
                      <span style={{ fontSize: 12, color: "var(--warn)" }}>есть несохранённые правки</span>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
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
            <p style={{ padding: "12px 20px 20px", fontSize: 13.5, color: workout.notes ? "var(--muted)" : "var(--muted-2)" }}>
              {workout.notes || "Заметок нет — добавьте их в окне «Изменить»."}
            </p>
          </section>
        </aside>
      </div>

      <ExercisePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={addExercise} />
      {metaOpen && (
        <WorkoutMetaDialog
          workout={workout}
          onClose={() => setMetaOpen(false)}
          onSaved={applyMutation}
        />
      )}

      {confirmDelete && (
        <div className="dialog-backdrop" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}>
          <div className="dialog" role="dialog" aria-modal="true" aria-label="Удалить тренировку">
            <h2>Удалить «{workout.title}»?</h2>
            <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 8 }}>
              Тренировка и её результаты исчезнут безвозвратно. Очки и рекорды пересчитаются.
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(false)}>
                Отмена
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: "var(--danger)", color: "#0A0C0B" }}
                onClick={deleteWorkout}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function workoutItemsToDrafts(items: WorkoutDetail["items"]): Record<string, Draft> {
  const map: Record<string, Draft> = {};
  for (const it of items) map[it.id] = draftFromItem(it);
  return map;
}
