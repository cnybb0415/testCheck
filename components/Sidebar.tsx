"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpenCheck, Layers, CalendarCheck, AlertCircle, Compass, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/exam", label: "기출문제", icon: BookOpenCheck },
  { href: "/cards", label: "카드퀴즈", icon: Layers },
  { href: "/daily", label: "오늘의 문제", icon: CalendarCheck },
  { href: "/wrong-notes", label: "오답노트", icon: AlertCircle },
  { href: "/guide", label: "학습 가이드", icon: Compass },
  { href: "/dashboard", label: "대시보드", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-4 flex h-[calc(100vh-2rem)] w-[76px] shrink-0 flex-col items-center gap-2 rounded-xl2 bg-white py-6 shadow-card sm:w-[220px] sm:items-stretch sm:px-4">
      <div className="mb-6 flex items-center gap-2 px-2 sm:px-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-400 text-sm font-bold text-white">
          정
        </div>
        <span className="hidden text-sm font-semibold text-ink sm:inline">실기 학습</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:justify-start ${
                active ? "bg-mint-100 text-mint-600" : "text-ink-soft hover:bg-mint-50 hover:text-ink"
              }`}
            >
              <Icon size={19} strokeWidth={2} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
