"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Flame } from "lucide-react";

import { isActive, NAV_ITEMS } from "@/components/app/nav-items";
import { DAYS_FORMS, pluralRu } from "@/lib/plural";
import type { User } from "@/lib/types";

const WEEK_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface RailProps {
  me: User;
  avatar: { from: string; to: string };
  /** Mon–Sun of the current week: training days for the streak dots. */
  week: boolean[];
}

export default function Rail({ me, avatar, week }: RailProps) {
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
              {item.href === "/workouts" && me.workouts > 0 && (
                <span className="count">{me.workouts}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="rail-foot">
        {me.streak > 0 && (
          <div className="streak-card">
            <div className="streak-top">
              <Flame size={16} strokeWidth={2.2} style={{ color: "var(--accent)" }} />
              <span>
                {me.streak} {pluralRu(me.streak, DAYS_FORMS)}
              </span>
              <span>серия</span>
            </div>
            <div className="streak-days" aria-hidden>
              {WEEK_LABELS.map((label, i) => (
                <i key={label} className={week[i] ? "is-on" : ""} />
              ))}
            </div>
          </div>
        )}

        <Link href="/profile" className="user-chip" aria-label="Открыть профиль">
          <span
            className="avatar"
            style={{ background: `linear-gradient(140deg, ${avatar.from}, ${avatar.to})` }}
          >
            {me.initials}
          </span>
          <span className="user-meta">
            <strong>{me.name}</strong>
            <span>{me.goal}</span>
          </span>
          <ChevronDown size={15} style={{ marginLeft: "auto", color: "var(--muted-2)", flexShrink: 0 }} />
        </Link>
      </div>
    </aside>
  );
}
