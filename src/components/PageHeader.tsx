import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-paper/90 dark:bg-paper-d/90 backdrop-blur-md border-b border-line dark:border-line-d">
      <div className="max-w-md mx-auto px-4 py-3.5 flex items-center gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            aria-label="رجوع"
            className="shrink-0 -mr-1 p-1.5 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d"
          >
            <BackIcon />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-[19px] leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-ink-soft dark:text-ink-soft-d truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
