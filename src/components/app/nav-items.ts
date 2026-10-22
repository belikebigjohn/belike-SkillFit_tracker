import {
  Dumbbell,
  Home,
  LayoutGrid,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Главная", short: "Главная", icon: Home },
  { href: "/workouts", label: "Тренировки", short: "Тренировки", icon: Dumbbell },
  { href: "/exercises", label: "Упражнения", short: "Каталог", icon: LayoutGrid },
  { href: "/leaderboard", label: "Рейтинг", short: "Рейтинг", icon: Trophy },
  { href: "/profile", label: "Профиль", short: "Профиль", icon: User },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
