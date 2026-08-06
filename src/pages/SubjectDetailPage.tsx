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
import { EditHomeworkSheet } from "../components/EditHomeworkSheet";
import { EditExamSheet } from "../components/EditExamSheet";
import { EditMistakeSheet } from "../components/EditMistakeSheet";
import { buildTree } from "../lib/tree";
import { EXAM_TYPE_LABELS } from "../types";
import type { Homework, Exam, Mistake } from "../types";

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

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [tab, setTab] = useState<Tab>("lessons");

  // Add sheets
  const [nodeSheetOpen, setNodeSheetOpen] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [hwSheetOpen, setHwSheetOpen] = useState(false);
  const [examSheetOpen, setExamSheetOpen] = useState(false);
  const [mistakeSheetOpen, setMistakeSheetOpen] = useState(false);

  // Edit sheets
  const [editHw, setEditHw] = useState<Homework | null>(null);
  const [editHwOpen, setEditHwOpen] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [editExamOpen, setEditExamOpen] = useState(false);
  const [editMistake, setEditMistake] = useState<Mistake | null>(null);
  const [editMistakeOpen, setEditMistakeOpen] = useState(false);

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
                      <HomeworkListItem
                        key={h.id}
                        hw={h}
                        onEdit={() => { setEditHw(h); setEditHwOpen(true); }}
                      />
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
                      <li key={e.id} className="px-4 py-3 flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium truncate">{e.title}</p>
                          <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
                            {EXAM_TYPE_LABELS[e.type]}
                          </p>
                        </div>
                        <span className="text-[12px] text-ink-soft dark:text-ink-soft-d shrink-0">
                          {new Date(e.date).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                        </span>
                        <button
                          onClick={() => { setEditExam(e); setEditExamOpen(true); }}
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
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[14px] font-medium flex-1">{m.question}</p>
                        <button
                          onClick={() => { setEditMistake(m); setEditMistakeOpen(true); }}
                          aria-label="تعديل الخطأ"
                          className="shrink-0 p-1 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d"
                        >
                          <EditIcon />
                        </button>
                      </div>
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

      <EditHomeworkSheet
        homework={editHw}
        open={editHwOpen}
        onClose={() => { setEditHwOpen(false); setEditHw(null); }}
        hideSubject
      />
      <EditExamSheet
        exam={editExam}
        open={editExamOpen}
        onClose={() => { setEditExamOpen(false); setEditExam(null); }}
        hideSubject
      />
      <EditMistakeSheet
        mistake={editMistake}
        open={editMistakeOpen}
        onClose={() => { setEditMistakeOpen(false); setEditMistake(null); }}
      />
    </div>
  );
}

function HomeworkListItem({
  hw,
  onEdit,
}: {
  hw: Homework;
  onEdit: () => void;
}) {
  const toggle = () => updateRecord("homework", hw.id, { done: !hw.done });
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <button
        onClick={toggle}
        aria-label={hw.done ? "إلغاء الإنجاز" : "تحديد كمنجز"}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
          hw.done ? "bg-accent border-accent" : "border-line dark:border-line-d"
        }`}
      >
        {hw.done && (
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3.5}>
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium truncate ${hw.done ? "line-through text-ink-soft dark:text-ink-soft-d" : ""}`}>
          {hw.title}
        </p>
      </div>
      <span className="text-[12px] text-ink-soft dark:text-ink-soft-d shrink-0">
        {new Date(hw.dueDate).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
      </span>
      <button
        onClick={onEdit}
        aria-label="تعديل الواجب"
        className="shrink-0 p-1.5 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </li>
  );
}
