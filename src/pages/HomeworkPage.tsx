import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { updateRecord } from "../db/mutations";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { AddHomeworkSheet } from "../components/AddHomeworkSheet";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function HomeworkPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const homework = useLiveQuery(() => db.homework.toArray());

  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s]));

  const filtered = (homework ?? [])
    .filter((h) => filterSubject === "all" || h.subjectId === filterSubject)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  return (
    <div className="max-w-md mx-auto pb-24">
      <PageHeader
        title="الواجبات"
        action={
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="إضافة واجب"
            className="p-2 -m-2 rounded-full text-accent active:bg-accent-soft dark:active:bg-accent/10"
          >
            <PlusIcon />
          </button>
        }
      />

      {subjects && subjects.length > 0 && (
        <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto scroll-quiet">
          <FilterChip
            active={filterSubject === "all"}
            label="الكل"
            onClick={() => setFilterSubject("all")}
          />
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
          <EmptyState title="لا يوجد واجبات" hint="دوس على + عشان تضيف واجب جديد." />
        ) : (
          <Card>
            <ul className="divide-y divide-line dark:divide-line-d">
              {filtered.map((h) => (
                <li key={h.id} className="px-4 py-3 flex items-center gap-3">
                  <button
                    onClick={() => updateRecord("homework", h.id, { done: !h.done })}
                    aria-label={h.done ? "إلغاء الإنجاز" : "تحديد كمنجز"}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      h.done ? "bg-accent border-accent" : "border-line dark:border-line-d"
                    }`}
                  >
                    {h.done && (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3.5}>
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium truncate ${h.done ? "line-through text-ink-soft dark:text-ink-soft-d" : ""}`}>
                      {h.title}
                    </p>
                    <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
                      {subjectMap.get(h.subjectId)?.name ?? "بدون مادة"}
                    </p>
                  </div>
                  <span className="text-[12px] text-ink-soft dark:text-ink-soft-d shrink-0">
                    {new Date(h.dueDate).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <AddHomeworkSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
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
