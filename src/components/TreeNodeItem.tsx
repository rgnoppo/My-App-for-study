import { useState } from "react";
import { Link } from "react-router-dom";
import type { TreeNodeWithChildren } from "../lib/tree";
import { StatusDot } from "./StatusDot";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
import { updateRecord, deleteRecord } from "../db/mutations";

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

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/** Inline edit/delete sheet for a node (unit or lesson) */
function EditNodeSheet({
  node,
  open,
  onClose,
}: {
  node: TreeNodeWithChildren | null;
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(node?.title ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync title when node changes
  if (node && title === "" && node.title) {
    setTitle(node.title);
  }

  const handleSave = async () => {
    if (!node || !title.trim()) return;
    await updateRecord("nodes", node.id, { title: title.trim() });
    onClose();
  };

  const handleDelete = async () => {
    if (!node) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteRecord("nodes", node.id);
    onClose();
  };

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  if (!node) return null;

  return (
    <Sheet open={open} onClose={handleClose} title={node.type === "unit" ? "تعديل الوحدة" : "تعديل الدرس"}>
      <Field label={node.type === "unit" ? "اسم الوحدة" : "اسم الدرس"}>
        <TextInput
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={node.type === "unit" ? "مثال: الوحدة الأولى" : "مثال: قانون نيوتن"}
        />
      </Field>
      <PrimaryButton onClick={handleSave} disabled={!title.trim()} className="mb-2.5">
        حفظ التغييرات
      </PrimaryButton>
      <button
        onClick={handleDelete}
        className={`w-full rounded-xl border font-medium text-[15px] py-3 transition ${
          confirmDelete
            ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            : "border-line dark:border-line-d text-clay"
        }`}
      >
        {confirmDelete ? "تأكيد الحذف نهائياً" : `حذف ${node.type === "unit" ? "الوحدة" : "الدرس"}`}
      </button>
      {confirmDelete && (
        <p className="text-center text-[12px] text-ink-soft dark:text-ink-soft-d mt-2">
          {node.type === "unit" ? "ده هيحذف الوحدة وكل دروسها." : "ده هيحذف الدرس وملاحظاته."}
          <button onClick={() => setConfirmDelete(false)} className="mr-1 text-accent underline">إلغاء</button>
        </p>
      )}
    </Sheet>
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
  const [editOpen, setEditOpen] = useState(false);
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

        {/* Edit button for all nodes */}
        <button
          onClick={() => setEditOpen(true)}
          className="shrink-0 p-1.5 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="تعديل"
        >
          <EditIcon />
        </button>

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

      <EditNodeSheet
        node={editOpen ? node : null}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
