import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { updateRecord, deleteRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextArea, PrimaryButton } from "./Field";
import type { Mistake } from "../types";

export function EditMistakeSheet({
  mistake,
  open,
  onClose,
}: {
  mistake: Mistake | null;
  open: boolean;
  onClose: () => void;
}) {
  const lessons = useLiveQuery(() =>
    mistake ? db.nodes.where("subjectId").equals(mistake.subjectId).filter((n) => n.type === "lesson").toArray() : []
  , [mistake?.subjectId]);

  const [lessonId, setLessonId] = useState("");
  const [question, setQuestion] = useState("");
  const [myAnswer, setMyAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [reason, setReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (mistake) {
      setLessonId(mistake.lessonId ?? "");
      setQuestion(mistake.question);
      setMyAnswer(mistake.myAnswer);
      setCorrectAnswer(mistake.correctAnswer);
      setReason(mistake.reason);
      setConfirmDelete(false);
    }
  }, [mistake?.id, open]);

  const handleSave = async () => {
    if (!mistake || !question.trim()) return;
    await updateRecord("mistakes", mistake.id, {
      lessonId: lessonId || null,
      question: question.trim(),
      myAnswer: myAnswer.trim(),
      correctAnswer: correctAnswer.trim(),
      reason: reason.trim(),
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!mistake) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteRecord("mistakes", mistake.id);
    onClose();
  };

  if (!mistake) return null;

  return (
    <Sheet open={open} onClose={onClose} title="تعديل الخطأ">
      {lessons && lessons.length > 0 && (
        <Field label="الدرس (اختياري)">
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className="w-full rounded-xl border border-line dark:border-line-d bg-paper-dim/50 dark:bg-paper-dim-d/50 px-3.5 py-2.5 text-[15px]"
          >
            <option value="">بدون ربط بدرس</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </Field>
      )}

      <Field label="السؤال">
        <TextArea rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="نص السؤال" />
      </Field>

      <Field label="إجابتي">
        <TextArea rows={2} value={myAnswer} onChange={(e) => setMyAnswer(e.target.value)} placeholder="الإجابة اللي كتبتها" />
      </Field>

      <Field label="الإجابة الصحيحة">
        <TextArea rows={2} value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="الإجابة الصح" />
      </Field>

      <Field label="سبب الخطأ">
        <TextArea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="سبب الخطأ" />
      </Field>

      <PrimaryButton onClick={handleSave} disabled={!question.trim()} className="mb-2.5">
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
        {confirmDelete ? "تأكيد الحذف" : "حذف الخطأ"}
      </button>
      {confirmDelete && (
        <button onClick={() => setConfirmDelete(false)} className="w-full text-center text-[12px] text-accent mt-2">إلغاء</button>
      )}
    </Sheet>
  );
}
