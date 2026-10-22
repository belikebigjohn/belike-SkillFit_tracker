"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

/** Demo action buttons for the workout screen — real CRUD arrives with module B. */
export default function WorkoutActions({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn--accent"
        onClick={() => toast.info(`«${title}»: выбор упражнения — после подключения API`)}
      >
        <Plus size={17} strokeWidth={2.4} />
        Добавить упражнение
      </button>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => toast.info("Редактирование появится в модуле B")}
      >
        <Pencil size={16} />
        Редактировать
      </button>
      <button
        type="button"
        className="btn btn--quiet"
        style={{ color: "var(--danger)" }}
        onClick={() => toast.error("Удаление тренировки появится в модуле B")}
      >
        <Trash2 size={16} />
        Удалить
      </button>
    </div>
  );
}
