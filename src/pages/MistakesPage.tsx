import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { updateRecord } from "../db/mutations";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { AddMistakeSheet } from "../components/AddMistakeSheet";
import { EditMistakeSheet } from "../components/EditMistakeSheet";
import { matches } from "../lib/search";
import type { Mistake } from "../types";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5l-4.3-4.3" />
    </svg>
  );
}


type Filter = "all" | "unresolved" | "resolved";

export function MistakesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("unresolved");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [editMistake, setEditMistake] = useState<Mistake | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const mistakes = useLiveQuery(() => db.mistakes.toArray());
  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s]));

  const filtered = (mistakes ?? [])
    .filter((m) => {
      if (filter === "unresolved" && m.understood) return false;
      if (filter === "resolved" && !m.understood) return false;
      if (subjectFilter !== "all" && m.subjectId !== subjectFilter) return false;
      if (query.trim()) {
        const hay = `${m.question} ${m.reason} ${m.myAnswer} ${m.correctAnswer}`;
        return matches(hay, query);
      }
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const openEdit = (m: Mistake) => {
    setEditMistake(m);
    setEditSheetOpen(true);
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      <PageHeader
        title="فجوات المعرفة"
        subtitle="كل خطأ بيتحفظ عشان متكررهوش"
        action={
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="تسجيل خطأ"
            className="p-2 -m-2 rounded-full text-accent active:bg-accent-soft dark:active:bg-accent/10"
          >
            <PlusIcon />
          </button>
        }
      />

      <div className="px-4 pt-3">
        <div className="relative mb-3">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-d pointer-events-none">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأخطاء... مثال: أخطاء النحو"
            className="w-full rounded-xl border border-line dark:border-line-d bg-paper-dim/50 dark:bg-paper-dim-d/50 pr-9 pl-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scroll-quiet mb-2">
          <Chip active={filter === "unresolved"} label="غير مفهومة" onClick={() => setFilter("unresolved")} />
          <Chip active={filter === "resolved"} label="مفهومة" onClick={() => setFilter("resolved")} />
          <Chip active={filter === "all"} label="الكل" onClick={() => setFilter("all")} />
        </div>

        {subjects && subjects.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto scroll-quiet mb-4">
            <Chip active={subjectFilter === "all"} label="كل المواد" onClick={() => setSubjectFilter("all")} subtle />
            {subjects.map((s) => (
              <Chip
                key={s.id}
                active={subjectFilter === s.id}
                label={s.name}
                onClick={() => setSubjectFilter(s.id)}
                color={s.color}
                subtle
              />
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            title="لا يوجد أخطاء مطابقة"
            hint="سجل الأخطاء أول بأول عشان تراجعها بسهولة."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <MistakeCard
                key={m.id}
                mistake={m}
                subjectName={subjectMap.get(m.subjectId)?.name}
                onEdit={() => openEdit(m)}
              />
            ))}
          </div>
        )}
      </div>

      <AddMistakeSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <EditMistakeSheet
        mistake={editMistake}
        open={editSheetOpen}
        onClose={() => { setEditSheetOpen(false); setEditMistake(null); }}
      />
    </div>
  );
}

function MistakeCard({
  mistake,
  subjectName,
  onEdit,
}: {
  mistake: Mistake;
  subjectName?: string;
  onEdit: () => void;
}) {
  const toggleUnderstood = () =>
    updateRecord("mistakes", mistake.id, { understood: !mistake.understood });

  return (
    <div className="relative rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-line dark:border-line-d overflow-hidden">
      <div
        className="h-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-clay) 0 6px, transparent 6px 12px)",
          opacity: 0.55,
        }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-ink-soft dark:text-ink-soft-d uppercase tracking-wide">
            {subjectName ?? "بدون مادة"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleUnderstood}
              className={`text-[12px] font-medium px-2.5 py-1 rounded-full transition ${
                mistake.understood
                  ? "bg-accent-soft text-accent dark:bg-accent/10"
                  : "bg-clay-soft text-clay dark:bg-clay/10"
              }`}
            >
              {mistake.understood ? "مفهوم ✓" : "لسه مش مفهوم"}
            </button>
            <button
              onClick={onEdit}
              aria-label="تعديل الخطأ"
              className="p-1.5 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-[15px] font-medium leading-snug mb-2.5">
          {mistake.question}
        </p>

        {mistake.myAnswer && (
          <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mb-1">
            <span className="font-medium">إجابتي: </span>
            {mistake.myAnswer}
          </p>
        )}

        {mistake.correctAnswer && (
          <p className="text-[13px] mb-1">
            <span className="font-medium text-ink-soft dark:text-ink-soft-d">الصح: </span>
            <span className="underline decoration-clay decoration-2 underline-offset-2">
              {mistake.correctAnswer}
            </span>
          </p>
        )}

        {mistake.reason && (
          <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mt-2 pt-2 border-t border-dashed border-line dark:border-line-d">
            {mistake.reason}
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  label,
  onClick,
  color,
  subtle,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  color?: string;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
        active
          ? subtle
            ? "text-white"
            : "bg-ink text-paper dark:bg-ink-d dark:text-paper-d"
          : "text-ink-soft dark:text-ink-soft-d border border-line dark:border-line-d"
      }`}
      style={active && subtle ? { backgroundColor: color ?? "#2F6F5E" } : undefined}
    >
      {label}
    </button>
  );
}
