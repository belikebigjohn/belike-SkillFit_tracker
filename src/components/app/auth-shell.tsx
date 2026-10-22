import Link from "next/link";

import { Activity } from "lucide-react";

export default function AuthShell({
  title,
  sub,
  children,
  footer,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="auth-split">
      <aside className="auth-hero">
        <Link href="/" className="brand" aria-label="Форма роста — на главную">
          <span className="brand-mark">
            <Activity size={19} strokeWidth={2.4} />
          </span>
          <span className="brand-text">
            Форма
            <br />
            роста
          </span>
        </Link>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="rise">
            <span className="chip chip--accent">Профессионалы 2026 · Веб-технологии</span>
          </div>
          <h2 className="rise rise-1">Каждая тренировка — шаг вверх.</h2>
          <p className="rise rise-2">
            Журнал нагрузок, прогресс по неделям, очки, достижения и честный рейтинг.
            Веди форму так, чтобы рост было видно в цифрах.
          </p>
          <div className="rise rise-3" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="chip">34 тренировки</span>
            <span className="chip">12 дней серии</span>
            <span className="chip">2 480 очков</span>
          </div>
        </div>

        <div
          className="rise rise-4"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingTop: 8,
            borderTop: "1px solid var(--line)",
          }}
        >
          <span className="avatar">МО</span>
          <div className="user-meta">
            <strong>Максим Орлов</strong>
            <span>4 место в рейтинге · цель «Набор массы»</span>
          </div>
        </div>
      </aside>

      <main className="auth-panel">
        <section className="auth-card rise rise-1">
          <div>
            <h1>{title}</h1>
            <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 6 }}>{sub}</p>
          </div>
          {children}
          <p className="auth-foot">{footer}</p>
        </section>
      </main>
    </div>
  );
}
