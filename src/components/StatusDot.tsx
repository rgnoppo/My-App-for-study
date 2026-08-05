import type { LessonStatus } from "../types";
import { STATUS_LABELS } from "../types";

const STATUS_STYLES: Record<LessonStatus, string> = {
  not_started: "bg-ink-soft/30 dark:bg-ink-soft-d/30",
  in_progress: "bg-amber",
  done: "bg-accent",
  reviewed: "bg-blue",
};

export function StatusDot({
  status,
  size = "sm",
}: {
  status: LessonStatus;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  return (
    <span
      className={`inline-block rounded-full ${dim} ${STATUS_STYLES[status]} shrink-0`}
      title={STATUS_LABELS[status]}
    />
  );
}

export function StatusBadge({ status }: { status: LessonStatus }) {
  const textStyles: Record<LessonStatus, string> = {
    not_started: "text-ink-soft dark:text-ink-soft-d",
    in_progress: "text-amber",
    done: "text-accent",
    reviewed: "text-blue",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${textStyles[status]}`}
    >
      <StatusDot status={status} />
      {STATUS_LABELS[status]}
    </span>
  );
}
