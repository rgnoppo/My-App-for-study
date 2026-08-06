import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { updateRecord, deleteRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
import type { Homework } from "../types";

export function EditHomeworkSheet({
  homework,
  open,
  onClose,
  hideSubject,
}: {
  homework: Homework | null;
  open: boolean;
  onClose: () => void;
  hideSubject?: boolean;
}) {
  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (homework) {
      setTitle(homework.title);
      setSubjectId(homework.subjectId);
      setDueDate(homework.dueDate);
      setConfirmDelete(false);
    }
  }, [homework?.id, open]);

  const handleSave = async () => {
    if (!homework || !title.trim()) return;
    await updateRecord("homework", homework.id, { title: title.trim(), subjectId, dueDate });
    onClose();
  };

  const handleDelete = async () => {
    if (!homework) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteRecord("homework", homework.id);
    onClose();
  };

  if (!homework) return null;

  return (
    <Sheet open={open} onClose={onClose} title="تعديل الواجب">
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

      <Field label="عنوان الواجب">
        <TextInput
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الواجب"
        />
      </Field>

      <Field label="تاريخ التسليم">
        <TextInput
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
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
        {confirmDelete ? "تأكيد الحذف" : "حذف الواجب"}
      </button>
      {confirmDelete && (
        <button onClick={() => setConfirmDelete(false)} className="w-full text-center text-[12px] text-accent mt-2">إلغاء</button>
      )}
    </Sheet>
  );
}
