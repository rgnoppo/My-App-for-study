import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, newId } from "../db/db";
import { addRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
import type { Exam, ExamType } from "../types";
import { EXAM_TYPE_LABELS } from "../types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const EXAM_TYPES: ExamType[] = ["exam", "quiz", "final_review"];

export function AddExamSheet({
  open,
  onClose,
  fixedSubjectId,
}: {
  open: boolean;
  onClose: () => void;
  fixedSubjectId?: string;
}) {
  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(fixedSubjectId ?? "");
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<ExamType>("exam");

  const effectiveSubjectId = fixedSubjectId ?? subjectId;

  const handleClose = () => {
    setTitle("");
    setDate(todayISO());
    setType("exam");
    if (!fixedSubjectId) setSubjectId("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !effectiveSubjectId) return;
    const exam: Exam = {
      id: newId(),
      subjectId: effectiveSubjectId,
      title: title.trim(),
      date,
      type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addRecord("exams", exam);
    handleClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title="امتحان جديد">
      {!fixedSubjectId && (
        <Field label="المادة">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-xl border border-line dark:border-line-d bg-paper-dim/50 dark:bg-paper-dim-d/50 px-3.5 py-2.5 text-[15px]"
          >
            <option value="">اختر المادة</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="عنوان الامتحان">
        <TextInput
          autoFocus={!!fixedSubjectId}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: امتحان الشهر الأول"
        />
      </Field>

      <Field label="النوع">
        <div className="flex gap-2">
          {EXAM_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium border transition ${
                type === t
                  ? "border-accent bg-accent-soft dark:bg-accent/10 text-accent"
                  : "border-line dark:border-line-d text-ink-soft dark:text-ink-soft-d"
              }`}
            >
              {EXAM_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </Field>

      <Field label="التاريخ">
        <TextInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>

      <PrimaryButton
        onClick={handleSubmit}
        disabled={!title.trim() || !effectiveSubjectId}
      >
        إضافة الامتحان
      </PrimaryButton>
    </Sheet>
  );
}
