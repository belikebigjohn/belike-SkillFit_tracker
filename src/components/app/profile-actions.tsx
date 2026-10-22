"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { api, errorMessage } from "@/lib/api-client";
import { GOALS } from "@/lib/validators";

/** Profile header actions: real logout + edit dialog (name, goal). */
export default function ProfileActions({
  name,
  goal,
  onSaved,
}: {
  name: string;
  goal: string;
  onSaved: (name: string, goal: string) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name, goal });

  async function logout() {
    try {
      await api.logout();
    } catch (e) {
      toast.error(errorMessage(e));
      return;
    }
    router.push("/login");
    router.refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const user = await api.updateMe({ name: form.name.trim(), goal: form.goal });
      onSaved(user.name, user.goal);
      toast.success("Профиль обновлён");
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setForm({ name, goal });
            setOpen(true);
          }}
        >
          <Pencil size={16} />
          Редактировать
        </button>
        <button type="button" className="btn btn--quiet" onClick={logout}>
          <LogOut size={16} />
          Выйти
        </button>
      </div>

      {open && (
        <div
          className="dialog-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="dialog" role="dialog" aria-modal="true" aria-label="Редактирование профиля">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2>Профиль</h2>
              <button type="button" className="icon-btn" aria-label="Закрыть" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="dialog-form" onSubmit={save}>
              <div className="field">
                <label htmlFor="p-name">Имя</label>
                <input
                  id="p-name"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="field">
                <label htmlFor="p-goal">Цель</label>
                <select
                  id="p-goal"
                  className="input"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                >
                  {GOALS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn--accent" disabled={busy || form.name.trim().length < 2}>
                  {busy ? "Сохраняем…" : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
