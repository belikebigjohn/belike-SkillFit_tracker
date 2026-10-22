import { toast } from "sonner";

import type { AchievementUnlock } from "@/lib/types";

/** Mutations return newly unlocked achievements — surface them as toasts. */
export function announceUnlocks(unlocked: AchievementUnlock[] | undefined): void {
  for (const a of unlocked ?? []) {
    toast.success(`Достижение открыто: «${a.title}»`, {
      description: "Начислены очки серии — смотрите профиль",
      duration: 5000,
    });
  }
}
