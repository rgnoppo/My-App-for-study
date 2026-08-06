import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { updateRecord } from "../db/mutations";
import { PageHeader } from "../components/PageHeader";
import { TextArea } from "../components/Field";
import { STATUS_ORDER, STATUS_LABELS } from "../types";
import type { LessonStatus } from "../types";
import { StatusDot } from "../components/StatusDot";

export function LessonDetailPage() {
  const { subjectId, lessonId } = useParams<{
    subjectId: string;
    lessonId: string;
  }>();

  const lesson = useLiveQuery(
    () => (lessonId ? db.nodes.get(lessonId) : undefined),
    [lessonId]
  );

  const [notes, setNotes] = useState("");
  const [savedRecently, setSavedRecently] = useState(false);

  useEffect(() => {
    if (lesson) setNotes(lesson.notes);
  }, [lesson?.id]);

  if (!subjectId || !lessonId) return <Navigate to="/subjects" replace />;
  if (lesson === null) return <Navigate to={`/subjects/${subjectId}`} replace />;
  if (!lesson) return <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-6" />;

  const setStatus = (status: LessonStatus) => {
    updateRecord("nodes", lessonId, { status });
  };

  const saveNotes = async () => {
    await updateRecord("nodes", lessonId, { notes });
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 1500);
  };

  return (
    <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-10">
      <PageHeader title={lesson.title} back />

      <div className="px-4 pt-4">
        <p className="text-[13px] font-medium text-ink-soft dark:text-ink-soft-d mb-2">
          الحالة
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition ${
                lesson.status === s
                  ? "border-accent bg-accent-soft dark:bg-accent/10"
                  : "border-line dark:border-line-d"
              }`}
            >
              <StatusDot status={s} size="md" />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-medium text-ink-soft dark:text-ink-soft-d">
            ملاحظاتي
          </p>
          {savedRecently && (
            <span className="text-[12px] text-accent font-medium">تم الحفظ</span>
          )}
        </div>
        <TextArea
          rows={10}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="اكتب ملاحظاتك على هذا الدرس..."
        />
      </div>
    </div>
  );
}
