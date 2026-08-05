import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, newId } from "../db/db";
import { addRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextArea, PrimaryButton } from "./Field";
import type { Mistake } from "../types";

export function AddMistakeSheet({
  open,
  onClose,
  fixedSubjectId,
}: {
  open: boolean;
  onClose: () => void;
  fixedSubjectId?: string;
}) {
  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const lessons = useLiveQuery(() =>
    fixedSubjectId
      ? db.nodes
          .where("subjectId")
          .equals(fixedSubjectId)
          .filter((n) => n.type === "lesson")
          .toArray()
      : db.nodes.filter((n) => n.type === "lesson").toArray()
  );

  const [subjectId, setSubjectId] = useState(fixedSubjectId ?? "");
  const [lessonId, setLessonId] = useState("");
  const [question, setQuestion] = useState("");
  const [myAnswer, setMyAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [reason, setReason] = useState("");

  const effectiveSubjectId = fixedSubjectId ?? subjectId;

  const relevantLessons = (lessons ?? []).filter(
    (l) => !effectiveSubjectId || l.subjectId === effectiveSubjectId
  );

  const reset = () => {
    setQuestion("");
    setMyAnswer("");
    setCorrectAnswer("");
    setReason("");
    setLessonId("");
    if (!fixedSubjectId) setSubjectId("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!question.trim() || !effectiveSubjectId) return;
    const mistake: Mistake = {
      id: newId(),
      subjectId: effectiveSubjectId,
      lessonId: lessonId || null,
      question: question.trim(),
      myAnswer: myAnswer.trim(),
      correctAnswer: correctAnswer.trim(),
      reason: reason.trim(),
      understood: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addRecord("mistakes", mistake);
    handleClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title="تسجيل خطأ">
      {!fixedSubjectId && (
        <Field label="المادة">
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setLessonId("");
            }}
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

      {relevantLessons.length > 0 && (
        <Field label="الدرس (اختياري)">
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className="w-full rounded-xl border border-line dark:border-line-d bg-paper-dim/50 dark:bg-paper-dim-d/50 px-3.5 py-2.5 text-[15px]"
          >
            <option value="">بدون ربط بدرس</option>
            {relevantLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="السؤال">
        <TextArea
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="نص السؤال اللي أخطأت فيه"
        />
      </Field>

      <Field label="إجابتي">
        <TextArea
          rows={2}
          value={myAnswer}
          onChange={(e) => setMyAnswer(e.target.value)}
          placeholder="الإجابة اللي كتبتها"
        />
      </Field>

      <Field label="الإجابة الصحيحة">
        <TextArea
          rows={2}
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="الإجابة الصح"
        />
      </Field>

      <Field label="سبب الخطأ">
        <TextArea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثال: لخبطت في القاعدة، أو مقريتش السؤال كويس"
        />
      </Field>

      <PrimaryButton
        onClick={handleSubmit}
        disabled={!question.trim() || !effectiveSubjectId}
      >
        حفظ الخطأ
      </PrimaryButton>
    </Sheet>
  );
}
