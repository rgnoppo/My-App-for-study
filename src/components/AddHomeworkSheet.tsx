import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, newId } from "../db/db";
import { addRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
import type { Homework } from "../types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AddHomeworkSheet({
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
  const [dueDate, setDueDate] = useState(todayISO());

  const effectiveSubjectId = fixedSubjectId ?? subjectId;

  const handleClose = () => {
    setTitle("");
    setDueDate(todayISO());
    if (!fixedSubjectId) setSubjectId("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !effectiveSubjectId) return;
    const hw: Homework = {
      id: newId(),
      subjectId: effectiveSubjectId,
      title: title.trim(),
      dueDate,
      done: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addRecord("homework", hw);
    handleClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title="واجب جديد">
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

      <Field label="عنوان الواجب">
        <TextInput
          autoFocus={!!fixedSubjectId}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: حل تمارين الوحدة الثانية"
        />
      </Field>

      <Field label="تاريخ التسليم">
        <TextInput
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </Field>

      <PrimaryButton
        onClick={handleSubmit}
        disabled={!title.trim() || !effectiveSubjectId}
      >
        إضافة الواجب
      </PrimaryButton>
    </Sheet>
  );
}
