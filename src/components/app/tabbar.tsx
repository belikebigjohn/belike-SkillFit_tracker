"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActive, NAV_ITEMS } from "@/components/app/nav-items";

export default function Tabbar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="Основная навигация">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            {item.short}
          </Link>
        );
      })}
    </nav>
  );
}
