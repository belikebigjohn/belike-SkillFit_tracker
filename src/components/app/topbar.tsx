"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import NewWorkoutDialog from "@/components/app/new-workout-dialog";
import { api } from "@/lib/api-client";
import type { Achievement } from "@/lib/types";

function todayLabel(): string {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default function Topbar() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recent, setRecent] = useState<Achievement[]>([]);

  useEffect(() => {
    let alive = true;
    api
      .getAchievements()
      .then((items) => {
        if (alive) setRecent(items.filter((a) => a.unlocked && daysAgo(a.unlockedAt ?? "") <= 7));
      })
      .catch(() => {
        /* topbar badge is decoration; silent */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <header className="topbar">
      <span className="topbar-date">{todayLabel()}</span>

      <div className="topbar-actions">
        <Link href="/exercises" className="search-pill" aria-label="Найти упражнение">
          <Search size={16} />
          <span>Найти упражнение</span>
          <kbd>⌘K</kbd>
        </Link>

        <button
          type="button"
          className="icon-btn"
          aria-label="Уведомления"
          onClick={() => {
            if (recent.length === 0) {
              toast.info("Новых достижений нет");
            } else if (recent.length === 1) {
              toast.success(`Новое достижение: «${recent[0].title}»`);
            } else {
              toast.success(
                `Новых достижений: ${recent.length} — ${recent.map((a) => `«${a.title}»`).join(", ")}`,
              );
            }
          }}
        >
          <Bell size={18} />
          {recent.length > 0 && <span className="dot" />}
        </button>

        <button
          type="button"
          className="btn btn--accent"
          onClick={() => setDialogOpen(true)}
        >
          <Plus size={17} strokeWidth={2.4} />
          <span>Новая тренировка</span>
        </button>
      </div>

      <NewWorkoutDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </header>
  );
}
