"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import NewWorkoutDialog from "@/components/app/new-workout-dialog";

function todayLabel(): string {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function Topbar() {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          onClick={() => toast.info("Новых достижений: 1 — «Серия 7 дней»")}
        >
          <Bell size={18} />
          <span className="dot" />
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
