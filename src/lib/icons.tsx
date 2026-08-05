import type { ReactNode } from "react";

export const SUBJECT_ICONS = [
  "book",
  "globe",
  "flask",
  "calculator",
  "landmark",
  "code",
  "palette",
  "atom",
  "map",
  "quill",
  "music",
  "compass",
] as const;

export type SubjectIconKey = (typeof SUBJECT_ICONS)[number];

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const paths: Record<SubjectIconKey, ReactNode> = {
  book: (
    <path d="M4 5.5c1.5-1 4-1.2 6 0v13c-2-1.2-4.5-1-6 0v-13zM20 5.5c-1.5-1-4-1.2-6 0v13c2-1.2 4.5-1 6 0v-13z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.4 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.4-3.8-8.5S9.5 5.8 12 3.5z" />
    </>
  ),
  flask: (
    <path d="M9.5 3h5M10 3v6.2L5.3 18a2 2 0 001.8 2.9h9.8a2 2 0 001.8-2.9L14 9.2V3M8.5 14.5h7" />
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth={2.2} />
    </>
  ),
  landmark: (
    <path d="M4 21h16M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6M4 10h16" />
  ),
  code: <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />,
  palette: (
    <path d="M12 3a9 8 0 100 16c1.1 0 2-.8 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.9 1.9-1.9H16a5 4.5 0 005-4.5C21 5.5 17 3 12 3zM7.5 12a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM11 8.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM15.5 9.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" />
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)" />
    </>
  ),
  map: <path d="M9 3.5L4 5.5v15l5-2 6 2 5-2v-15l-5 2-6-2z M9 3.5v15M15 5.5v15" />,
  quill: <path d="M20 4c-5 0-11 3-13.5 10.5C5.5 17 5 19 4 20c1.5-.5 3.5-1 5.5-2.5C17 15 20 9 20 4zM9 15L4 20" />,
  music: (
    <path d="M9 18V5l11-2v13M9 18a3 3 0 11-3-3 3 3 0 013 3zM20 16a3 3 0 11-3-3 3 3 0 013 3z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-4-2 2-6 4 2z" />
    </>
  ),
};

export function SubjectIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const key = (SUBJECT_ICONS.includes(icon as SubjectIconKey)
    ? icon
    : "book") as SubjectIconKey;
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      {paths[key]}
    </svg>
  );
}
