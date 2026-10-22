"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Flame } from "lucide-react";

import { isActive, NAV_ITEMS } from "@/components/app/nav-items";

const WEEK_DAYS = [
  { label: "Пн", on: true },
  { label: "Вт", on: true },
  { label: "Ср", on: true },
  { label: "Чт", on: true },
  { label: "Пт", on: false },
  { label: "Сб", on: false },
  { label: "Вс", on: false },
];

export default function Rail() {
  const pathname = usePathname();

  return (
    <aside className="rail">
      <Link href="/dashboard" className="brand" aria-label="Форма роста — на главную">
        <span className="brand-mark">
          <Flame size={19} strokeWidth={2.4} />
        </span>
        <span className="brand-text">
          Форма
          <br />
          роста
        </span>
      </Link>

      <nav className="rail-nav" aria-label="Основная навигация">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {item.count && <span className="count">{item.count}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="rail-foot">
        <div className="streak-card">
          <div className="streak-top">
            <Flame size={16} strokeWidth={2.2} style={{ color: "var(--accent)" }} />
            <span>12 дней</span>
            <span>серия</span>
          </div>
          <div className="streak-days" aria-hidden>
            {WEEK_DAYS.map((d) => (
              <i key={d.label} className={d.on ? "is-on" : ""} />
            ))}
          </div>
        </div>

        <Link href="/profile" className="user-chip" aria-label="Открыть профиль">
          <span className="avatar">МО</span>
          <span className="user-meta">
            <strong>Максим Орлов</strong>
            <span>Набор массы</span>
          </span>
          <ChevronDown size={15} style={{ marginLeft: "auto", color: "var(--muted-2)", flexShrink: 0 }} />
        </Link>
      </div>
    </aside>
  );
}
