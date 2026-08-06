import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { updateRecord, deleteRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
import type { Exam, ExamType } from "../types";
import { EXAM_TYPE_LABELS } from "../types";

const EXAM_TYPES: ExamType[] = ["exam", "quiz", "final_review"];

export function EditExamSheet({
  exam,
  open,
  onClose,
  hideSubject,
}: {
  exam: Exam | null;
  open: boolean;
  onClose: () => void;
  hideSubject?: boolean;
}) {
  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<ExamType>("exam");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setSubjectId(exam.subjectId);
      setDate(exam.date);
      setType(exam.type);
      setConfirmDelete(false);
    }
  }, [exam?.id, open]);

  const handleSave = async () => {
    if (!exam || !title.trim()) return;
    await updateRecord("exams", exam.id, { title: title.trim(), subjectId, date, type });
    onClose();
  };

  const handleDelete = async () => {
    if (!exam) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteRecord("exams", exam.id);
    onClose();
  };

  if (!exam) return null;

  return (
    <Sheet open={open} onClose={onClose} title="تعديل الامتحان">
      {!hideSubject && (
        <Field label="المادة">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-xl border border-line dark:border-line-d bg-paper-dim/50 dark:bg-paper-dim-d/50 px-3.5 py-2.5 text-[15px]"
          >
            <option value="">اختر المادة</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
      )}

      <Field label="عنوان الامتحان">
        <TextInput
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الامتحان"
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
        {confirmDelete ? "تأكيد الحذف" : "حذف الامتحان"}
      </button>
      {confirmDelete && (
        <button onClick={() => setConfirmDelete(false)} className="w-full text-center text-[12px] text-accent mt-2">إلغاء</button>
      )}
    </Sheet>
  );
}
