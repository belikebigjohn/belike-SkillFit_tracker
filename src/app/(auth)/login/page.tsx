"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import AuthShell from "@/components/app/auth-shell";
import { ApiError, api, errorMessage } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.email("Введите корректный e-mail"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "demo@forma.ru", password: "demo1234" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const parsed = loginSchema.safeParse(values);
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
      const user = await api.login(parsed.data);
      toast.success(`С возвращением, ${user.name.split(" ")[0]}`);
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
      title="С возвращением"
      sub="Войдите, чтобы продолжить серию и не потерять прогресс."
      footer={
        <>
          Нет аккаунта?{" "}
          <Link href="/register">Зарегистрируйтесь</Link>
        </>
      }
    >
      <form className="dialog-form" onSubmit={submit} noValidate>
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
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <button type="submit" className="btn btn--accent" disabled={busy}>
          {busy ? "Входим…" : "Войти в журнал"}
        </button>
        <p style={{ fontSize: 12, color: "var(--muted-2)", textAlign: "center" }}>
          Демо-аккаунт уже заполнен: 4 недели тренировок и рейтинг
        </p>
      </form>
    </AuthShell>
  );
}
