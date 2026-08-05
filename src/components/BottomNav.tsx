import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" {...strokeProps}>
      <path d="M4 11.5L12 4l8 7.5M6 10v9.5a1 1 0 001 1h3.5v-6h3v6H17a1 1 0 001-1V10" />
    </svg>
  );
}
function SubjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" {...strokeProps}>
      <path d="M4 5.5c1.5-1 4-1.2 6 0v13c-2-1.2-4.5-1-6 0v-13zM20 5.5c-1.5-1-4-1.2-6 0v13c2-1.2 4.5-1 6 0v-13z" />
    </svg>
  );
}
function MistakesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" {...strokeProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5.2M12 15.8h.01" strokeWidth={2.2} />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" {...strokeProps}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5l-4.3-4.3" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" {...strokeProps}>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8L6.3 6.3" />
    </svg>
  );
}

const TABS: { to: string; label: string; icon: ReactNode }[] = [
  { to: "/", label: "الرئيسية", icon: <HomeIcon /> },
  { to: "/subjects", label: "المواد", icon: <SubjectsIcon /> },
  { to: "/mistakes", label: "الأخطاء", icon: <MistakesIcon /> },
  { to: "/search", label: "بحث", icon: <SearchIcon /> },
  { to: "/settings", label: "الإعدادات", icon: <SettingsIcon /> },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-paper/90 dark:bg-paper-d/90 backdrop-blur-md border-t border-line dark:border-line-d pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقل الرئيسي"
    >
      <ul className="flex items-stretch justify-between max-w-md mx-auto px-1">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-ink-soft dark:text-ink-soft-d"
                }`
              }
            >
              {tab.icon}
              <span className="text-[11px] font-medium leading-none">
                {tab.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
