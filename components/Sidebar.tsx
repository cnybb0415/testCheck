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

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname?.startsWith(href);
  }

  return (
    <>
      {/* 데스크톱: 좌측 고정 사이드바 */}
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[220px] shrink-0 flex-col gap-2 rounded-xl2 bg-white px-4 py-6 shadow-card sm:flex">
        <div className="mb-6 flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-400 text-sm font-bold text-white">
            정
          </div>
          <span className="text-sm font-semibold text-ink">실기 학습</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(href) ? "bg-mint-100 text-mint-600" : "text-ink-soft hover:bg-mint-50 hover:text-ink"
              }`}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 모바일: 하단 고정 탭바 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-black/5 bg-white px-0.5 pt-1 shadow-[0_-2px_10px_rgb(31_42_36_/_0.06)] sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 4px)" }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[9px] font-medium leading-none transition-colors ${
              isActive(href) ? "text-mint-600" : "text-ink-faint"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
