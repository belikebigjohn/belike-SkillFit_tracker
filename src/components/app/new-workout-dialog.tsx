"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { MUSCLE_GROUPS } from "@/lib/types";

export default function NewWorkoutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState<string>(MUSCLE_GROUPS[0]);

  // close on Escape — keyboard users need it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = title.trim() || "Тренировка без названия";
    toast.success(`Черновик «${name}» создан (демо)`);
    setTitle("");
    onClose();
  }

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Новая тренировка">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2>Новая тренировка</h2>
            <p style={{ color: "var(--muted-2)", fontSize: 12.5 }}>
              Заполните название и группу — упражнения добавите дальше.
            </p>
          </div>
          <button type="button" className="icon-btn" aria-label="Закрыть" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="dialog-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="w-title">Название</label>
            <input
              id="w-title"
              className="input"
              placeholder="Например: Спина и бицепс"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="w-group">Группа мышц</label>
            <select
              id="w-group"
              className="input"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--accent">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
