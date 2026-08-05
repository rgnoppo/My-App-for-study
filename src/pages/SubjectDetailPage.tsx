import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { updateRecord } from "../db/mutations";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { TreeNodeItem } from "../components/TreeNodeItem";
import { AddNodeSheet } from "../components/AddNodeSheet";
import { AddHomeworkSheet } from "../components/AddHomeworkSheet";
import { AddExamSheet } from "../components/AddExamSheet";
import { AddMistakeSheet } from "../components/AddMistakeSheet";
import { buildTree } from "../lib/tree";
import { EXAM_TYPE_LABELS } from "../types";

type Tab = "lessons" | "homework" | "exams" | "mistakes";

const TABS: { key: Tab; label: string }[] = [
  { key: "lessons", label: "الدروس" },
  { key: "homework", label: "الواجبات" },
  { key: "exams", label: "الامتحانات" },
  { key: "mistakes", label: "الأخطاء" },
];

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [tab, setTab] = useState<Tab>("lessons");
  const [nodeSheetOpen, setNodeSheetOpen] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [hwSheetOpen, setHwSheetOpen] = useState(false);
  const [examSheetOpen, setExamSheetOpen] = useState(false);
  const [mistakeSheetOpen, setMistakeSheetOpen] = useState(false);

  const subject = useLiveQuery(
    () => (subjectId ? db.subjects.get(subjectId) : undefined),
    [subjectId]
  );
  const nodes = useLiveQuery(
    () =>
      subjectId ? db.nodes.where("subjectId").equals(subjectId).toArray() : [],
    [subjectId]
  );
  const homework = useLiveQuery(
    () =>
      subjectId
        ? db.homework.where("subjectId").equals(subjectId).toArray()
        : [],
    [subjectId]
  );
  const exams = useLiveQuery(
    () => (subjectId ? db.exams.where("subjectId").equals(subjectId).toArray() : []),
    [subjectId]
  );
  const mistakes = useLiveQuery(
    () =>
      subjectId
        ? db.mistakes.where("subjectId").equals(subjectId).toArray()
        : [],
    [subjectId]
  );

  if (!subjectId) return <Navigate to="/subjects" replace />;
  if (subject === null) return <Navigate to="/subjects" replace />;
  if (!subject) return <div className="max-w-md mx-auto px-4 py-6" />;

  const tree = buildTree(nodes ?? []);

  const openAddNode = (parentId: string | null) => {
    setAddParentId(parentId);
    setNodeSheetOpen(true);
  };

  const fabAction = () => {
    if (tab === "lessons") openAddNode(null);
    else if (tab === "homework") setHwSheetOpen(true);
    else if (tab === "exams") setExamSheetOpen(true);
    else setMistakeSheetOpen(true);
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      <PageHeader title={subject.name} back />

      <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto scroll-quiet -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
              tab === t.key
                ? "text-white"
                : "text-ink-soft dark:text-ink-soft-d border border-line dark:border-line-d"
            }`}
            style={tab === t.key ? { backgroundColor: subject.color } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {tab === "lessons" && (
          <>
            {tree.length === 0 ? (
              <EmptyState
                title="لسه مفيش دروس"
                hint="دوس على + عشان تضيف وحدة أو درس."
              />
            ) : (
              <Card className="px-3 py-1.5">
                {tree.map((n) => (
                  <TreeNodeItem
                    key={n.id}
                    node={n}
                    depth={0}
                    onAddChild={openAddNode}
                    subjectId={subjectId}
                  />
                ))}
              </Card>
            )}
          </>
        )}

        {tab === "homework" && (
          <>
            {!homework || homework.length === 0 ? (
              <EmptyState title="لا يوجد واجبات لهذه المادة" />
            ) : (
              <Card>
                <ul className="divide-y divide-line dark:divide-line-d">
                  {[...homework]
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .map((h) => (
                      <HomeworkListItem key={h.id} id={h.id} title={h.title} dueDate={h.dueDate} done={h.done} />
                    ))}
                </ul>
              </Card>
            )}
          </>
        )}

        {tab === "exams" && (
          <>
            {!exams || exams.length === 0 ? (
              <EmptyState title="لا يوجد امتحانات لهذه المادة" />
            ) : (
              <Card>
                <ul className="divide-y divide-line dark:divide-line-d">
                  {[...exams]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((e) => (
                      <li key={e.id} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium truncate">{e.title}</p>
                          <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
                            {EXAM_TYPE_LABELS[e.type]}
                          </p>
                        </div>
                        <span className="text-[12px] text-ink-soft dark:text-ink-soft-d shrink-0">
                          {new Date(e.date).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                        </span>
                      </li>
                    ))}
                </ul>
              </Card>
            )}
          </>
        )}

        {tab === "mistakes" && (
          <>
            {!mistakes || mistakes.length === 0 ? (
              <EmptyState title="لا يوجد أخطاء مسجلة لهذه المادة" />
            ) : (
              <div className="space-y-2.5">
                {mistakes
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((m) => (
                    <Card key={m.id} className="p-3.5">
                      <p className="text-[14px] font-medium">{m.question}</p>
                      {m.correctAnswer && (
                        <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mt-1">
                          الصح: <span className="underline decoration-clay decoration-2 underline-offset-2">{m.correctAnswer}</span>
                        </p>
                      )}
                    </Card>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={fabAction}
        aria-label="إضافة"
        className="fixed bottom-20 left-5 z-30 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition"
        style={{ backgroundColor: subject.color }}
      >
        <PlusIcon />
      </button>

      <AddNodeSheet
        open={nodeSheetOpen}
        onClose={() => setNodeSheetOpen(false)}
        subjectId={subjectId}
        parentId={addParentId}
      />
      <AddHomeworkSheet
        open={hwSheetOpen}
        onClose={() => setHwSheetOpen(false)}
        fixedSubjectId={subjectId}
      />
      <AddExamSheet
        open={examSheetOpen}
        onClose={() => setExamSheetOpen(false)}
        fixedSubjectId={subjectId}
      />
      <AddMistakeSheet
        open={mistakeSheetOpen}
        onClose={() => setMistakeSheetOpen(false)}
        fixedSubjectId={subjectId}
      />
    </div>
  );
}

function HomeworkListItem({
  id,
  title,
  dueDate,
  done,
}: {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
}) {
  const toggle = () => updateRecord("homework", id, { done: !done });
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <button
        onClick={toggle}
        aria-label={done ? "إلغاء الإنجاز" : "تحديد كمنجز"}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
          done ? "bg-accent border-accent" : "border-line dark:border-line-d"
        }`}
      >
        {done && (
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3.5}>
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium truncate ${done ? "line-through text-ink-soft dark:text-ink-soft-d" : ""}`}>
          {title}
        </p>
      </div>
      <span className="text-[12px] text-ink-soft dark:text-ink-soft-d shrink-0">
        {new Date(dueDate).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
      </span>
    </li>
  );
}
