"use client";

import { RotateCcw } from "lucide-react";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card empty">
      <h3>Что-то пошло не так</h3>
      <p>Экран не отрисовался. Попробуйте перезагрузить — данные в безопасности.</p>
      <button type="button" className="btn btn--accent" onClick={reset}>
        <RotateCcw size={16} />
        Перезагрузить
      </button>
    </div>
  );
}
