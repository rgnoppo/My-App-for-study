import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line dark:border-line-d bg-white/60 dark:bg-white/[0.03] ${className}`}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; to: string };
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <h2 className="font-display font-bold text-[15px]">{title}</h2>
        {action && (
          <Link
            to={action.to}
            className="text-[13px] font-medium text-accent active:opacity-70"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
