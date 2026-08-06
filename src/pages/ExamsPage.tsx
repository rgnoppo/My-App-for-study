import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { AddExamSheet } from "../components/AddExamSheet";
import { EditExamSheet } from "../components/EditExamSheet";
import { EXAM_TYPE_LABELS } from "../types";
import type { Exam } from "../types";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function ExamsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const exams = useLiveQuery(() => db.exams.toArray());

  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s]));

  const filtered = (exams ?? [])
    .filter((e) => filterSubject === "all" || e.subjectId === filterSubject)
    .sort((a, b) => a.date.localeCompare(b.date));

  const openEdit = (exam: Exam) => {
    setEditExam(exam);
    setEditSheetOpen(true);
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      <PageHeader
        title="الامتحانات"
        action={
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="إضافة امتحان"
            className="p-2 -m-2 rounded-full text-accent active:bg-accent-soft dark:active:bg-accent/10"
          >
            <PlusIcon />
          </button>
        }
      />

      {subjects && subjects.length > 0 && (
        <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto scroll-quiet">
          <FilterChip active={filterSubject === "all"} label="الكل" onClick={() => setFilterSubject("all")} />
          {subjects.map((s) => (
            <FilterChip
              key={s.id}
              active={filterSubject === s.id}
              label={s.name}
              onClick={() => setFilterSubject(s.id)}
              color={s.color}
            />
          ))}
        </div>
      )}

      <div className="px-4 pt-4">
        {filtered.length === 0 ? (
          <EmptyState title="لا يوجد امتحانات" hint="دوس على + عشان تضيف امتحان جديد." />
        ) : (
          <Card>
            <ul className="divide-y divide-line dark:divide-line-d">
              {filtered.map((e) => (
                <li key={e.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate">{e.title}</p>
                    <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
                      {subjectMap.get(e.subjectId)?.name ?? "بدون مادة"} · {EXAM_TYPE_LABELS[e.type]}
                    </p>
                  </div>
                  <span className="text-[12px] text-ink-soft dark:text-ink-soft-d shrink-0">
                    {new Date(e.date).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                  </span>
                  <button
                    onClick={() => openEdit(e)}
                    aria-label="تعديل الامتحان"
                    className="shrink-0 p-1.5 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d"
                  >
                    <EditIcon />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <AddExamSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <EditExamSheet
        exam={editExam}
        open={editSheetOpen}
        onClose={() => { setEditSheetOpen(false); setEditExam(null); }}
      />
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  color,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
        active ? "text-white" : "text-ink-soft dark:text-ink-soft-d border border-line dark:border-line-d"
      }`}
      style={active ? { backgroundColor: color ?? "#2F6F5E" } : undefined}
    >
      {label}
    </button>
  );
}
