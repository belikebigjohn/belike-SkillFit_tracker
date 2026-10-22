"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import AuthShell from "@/components/app/auth-shell";
import { ApiError, api, errorMessage } from "@/lib/api-client";
import { GOALS } from "@/lib/validators";

const registerSchema = z.object({
  name: z.string().min(2, "Как к вам обращаться?"),
  email: z.email("Введите корректный e-mail"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [goal, setGoal] = useState<string>(GOALS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fields[String(issue.path[0])] = issue.message;
      }
      setErrors(fields);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const user = await api.register({ ...parsed.data, goal });
      toast.success(`Аккаунт создан. Добро пожаловать, ${user.name.split(" ")[0]}`);
      router.push("/dashboard");
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.fields) {
        setErrors(err.fields);
      } else {
        toast.error(errorMessage(err));
      }
    }
  }

  return (
    <AuthShell
      title="Создать аккаунт"
      sub="Пара минут — и журнал тренировок будет вести вас к цели."
      footer={
        <>
          Уже с нами?{" "}
          <Link href="/login">Войдите</Link>
        </>
      }
    >
      <form className="dialog-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            className={`input ${errors.name ? "is-invalid" : ""}`}
            placeholder="Максим Орлов"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            className={`input ${errors.email ? "is-invalid" : ""}`}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            className={`input ${errors.password ? "is-invalid" : ""}`}
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <div className="field">
          <label htmlFor="goal">Цель</label>
          <select
            id="goal"
            className="input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            {GOALS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn--accent" disabled={busy}>
          {busy ? "Создаём аккаунт…" : "Начать путь"}
        </button>
      </form>
    </AuthShell>
  );
}
