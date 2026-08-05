import { useState } from "react";
import { Link } from "react-router-dom";
import type { TreeNodeWithChildren } from "../lib/tree";
import { StatusDot } from "./StatusDot";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TreeNodeItem({
  node,
  depth,
  onAddChild,
  subjectId,
}: {
  node: TreeNodeWithChildren;
  depth: number;
  onAddChild: (parentId: string) => void;
  subjectId: string;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isUnit = node.type === "unit";

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-2 group relative"
        style={{ paddingRight: depth * 18 }}
      >
        {depth > 0 && (
          <span
            className="absolute top-0 bottom-0 border-r border-line dark:border-line-d"
            style={{ right: (depth - 1) * 18 + 8 }}
            aria-hidden
          />
        )}

        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 text-ink-soft dark:text-ink-soft-d p-0.5"
            aria-label={open ? "طي" : "فتح"}
          >
            <ChevronIcon open={open} />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        {isUnit ? (
          <span className="flex-1 min-w-0 font-display font-bold text-[14px] truncate">
            {node.title}
          </span>
        ) : (
          <Link
            to={`/subjects/${subjectId}/lessons/${node.id}`}
            className="flex-1 min-w-0 flex items-center gap-2 py-0.5"
          >
            <StatusDot status={node.status ?? "not_started"} />
            <span className="text-[14px] truncate">{node.title}</span>
          </Link>
        )}

        {isUnit && (
          <button
            onClick={() => onAddChild(node.id)}
            className="shrink-0 p-1.5 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d"
            aria-label="إضافة داخل هذه الوحدة"
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              subjectId={subjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
