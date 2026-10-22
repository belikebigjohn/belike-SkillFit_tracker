"use client";

import Link from "next/link";
import { LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";

/** Profile header actions — server layout can't hold handlers, hence this island. */
export default function ProfileActions() {
  return (
    <div className="page-head__actions">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => toast.info("Редактирование профиля появится в модуле B")}
      >
        <Pencil size={16} />
        Редактировать
      </button>
      <Link href="/login" className="btn btn--quiet">
        <LogOut size={16} />
        Выйти
      </Link>
    </div>
  );
}
