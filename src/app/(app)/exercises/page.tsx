"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Video } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api-client";
import { MUSCLE_GROUPS, type Exercise } from "@/lib/types";

const FILTERS = ["Все", ...MUSCLE_GROUPS] as const;

export default function ExercisesPage() {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<string>("Все");
  const [items, setItems] = useState<Exercise[] | null>(null);

  useEffect(() => {
    let alive = true;
    setItems(null);
    api.getExercises(query, muscle).then((list) => {
      if (alive) setItems(list);
    });
    return () => {
      alive = false;
    };
  }, [query, muscle]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Каталог · 19 упражнений</span>
          <h1 className="page-title">Упражнения</h1>
        </div>
      </div>

      <div className="field rise" style={{ maxWidth: 420, marginBottom: 14 }}>
        <label htmlFor="ex-q" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Поиск упражнения
        </label>
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", translate: "0 -50%", color: "var(--muted-2)" }}
          />
          <input
            id="ex-q"
            className="input"
            style={{ width: "100%", paddingLeft: 36 }}
            placeholder="Например: жим"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-row rise rise-1" role="group" aria-label="Фильтр по группе мышц">
        {FILTERS.map((f) => (
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

      {items === null ? (
        <div className="ex-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="skeleton" style={{ height: 210, borderRadius: 20 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card empty rise">
          <h3>Ничего не нашлось</h3>
          <p>Попробуйте другое слово или снимите фильтр по группе мышц.</p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setQuery("");
              setMuscle("Все");
            }}
          >
            Сбросить поиск
          </button>
        </div>
      ) : (
        <div className="ex-grid">
          {items.map((e, i) => (
            <article
              key={e.id}
              className="card card--link ex-card rise"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <div className="ex-meta">
                <span className="chip chip--accent">{e.muscleGroup}</span>
                <span className="chip">{e.equipment}</span>
              </div>
              <h3>{e.name}</h3>
              <p>{e.description}</p>
              <div className="ex-foot">
                <a
                  href={e.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--quiet"
                  style={{ height: 32, padding: "0 8px", fontSize: 12.5 }}
                >
                  <Video size={14} />
                  {e.mediaType === "video" ? "Видео" : "Анимация"}
                </a>
                <button
                  type="button"
                  className="btn btn--accent"
                  style={{ height: 32, padding: "0 12px", fontSize: 12.5 }}
                  onClick={() => toast.success(`«${e.name}» — добавление в тренировку после модуля B`)}
                >
                  <Plus size={14} strokeWidth={2.6} />
                  Добавить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
