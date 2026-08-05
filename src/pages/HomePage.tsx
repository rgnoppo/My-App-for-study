import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../db/db";
import { Section, Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusDot";
import { SubjectIcon } from "../lib/icons";
import type { Homework, Exam, Subject, StudyNode } from "../types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(dateISO: string): number {
  const today = new Date(todayISO());
  const target = new Date(dateISO);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function dueLabel(dateISO: string): string {
  const d = daysUntil(dateISO);
  if (d < 0) return "متأخر";
  if (d === 0) return "النهاردة";
  if (d === 1) return "بكرة";
  return `خلال ${d} أيام`;
}

function dueColor(dateISO: string): string {
  const d = daysUntil(dateISO);
  if (d < 0) return "text-clay";
  if (d <= 1) return "text-amber";
  return "text-ink-soft dark:text-ink-soft-d";
}

export function HomePage() {
  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const homework = useLiveQuery(() => db.homework.toArray());
  const exams = useLiveQuery(() => db.exams.toArray());
  const mistakes = useLiveQuery(() =>
    db.mistakes.filter((m) => !m.understood).toArray()
  );
  const nodes = useLiveQuery(() => db.nodes.toArray());

  const loading = !subjects || !homework || !exams || !mistakes || !nodes;

  if (loading) {
    return <div className="max-w-md mx-auto px-4 py-6" />;
  }

  const upcomingHomework = [...homework]
    .filter((h) => !h.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const upcomingExams = [...exams]
    .filter((e) => daysUntil(e.date) >= -1)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const mistakesToReview = mistakes.slice(0, 4);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const lastLessonPerSubject: { subject: Subject; lesson: StudyNode }[] = subjects
    .map((s) => {
      const subjectLessons = nodes
        .filter((n) => n.subjectId === s.id && n.type === "lesson")
        .sort((a, b) => b.updatedAt - a.updatedAt);
      return subjectLessons[0] ? { subject: s, lesson: subjectLessons[0] } : null;
    })
    .filter((x): x is { subject: Subject; lesson: StudyNode } => x !== null)
    .slice(0, 5);

  const hasNothing =
    upcomingHomework.length === 0 &&
    upcomingExams.length === 0 &&
    mistakesToReview.length === 0 &&
    lastLessonPerSubject.length === 0;

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-6">
      <div className="mb-6 px-0.5">
        <h1 className="font-display font-extrabold text-[22px]">أهلاً 👋</h1>
        <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mt-0.5">
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {hasNothing && subjects.length === 0 && (
        <Card className="mb-6">
          <div className="p-6 text-center">
            <p className="font-display font-bold text-[16px] mb-1.5">
              ابدأ بإضافة مادة
            </p>
            <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mb-4">
              كل حاجة في التطبيق بتتنظم جوه المواد الدراسية.
            </p>
            <Link
              to="/subjects"
              className="inline-block rounded-xl bg-accent text-white font-semibold text-[14px] px-5 py-2.5 active:opacity-85"
            >
              إضافة مادة
            </Link>
          </div>
        </Card>
      )}

      {upcomingHomework.length > 0 && (
        <Section title="الواجبات" action={{ label: "الكل", to: "/homework" }}>
          <Card>
            <ul className="divide-y divide-line dark:divide-line-d">
              {upcomingHomework.map((h) => (
                <HomeworkRow
                  key={h.id}
                  hw={h}
                  subjectName={subjectMap.get(h.subjectId)?.name}
                />
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {upcomingExams.length > 0 && (
        <Section title="الامتحانات القادمة" action={{ label: "الكل", to: "/exams" }}>
          <Card>
            <ul className="divide-y divide-line dark:divide-line-d">
              {upcomingExams.map((e) => (
                <ExamRow
                  key={e.id}
                  exam={e}
                  subjectName={subjectMap.get(e.subjectId)?.name}
                />
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {mistakesToReview.length > 0 && (
        <Section
          title="أخطاء تحتاج مراجعة"
          action={{ label: "الكل", to: "/mistakes" }}
        >
          <Card>
            <ul className="divide-y divide-line dark:divide-line-d">
              {mistakesToReview.map((m) => (
                <li key={m.id} className="px-4 py-3">
                  <p className="text-[14px] font-medium truncate">
                    {m.question}
                  </p>
                  <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
                    {subjectMap.get(m.subjectId)?.name ?? "بدون مادة"}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {lastLessonPerSubject.length > 0 && (
        <Section title="آخر ما وصلت إليه">
          <div className="grid grid-cols-1 gap-2.5">
            {lastLessonPerSubject.map(({ subject, lesson }) => (
              <Link key={subject.id} to={`/subjects/${subject.id}`}>
                <Card className="p-3.5 flex items-center gap-3 active:bg-paper-dim dark:active:bg-paper-dim-d transition">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${subject.color}22`, color: subject.color }}
                  >
                    <SubjectIcon icon={subject.icon} className="w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-ink-soft dark:text-ink-soft-d">
                      {subject.name}
                    </p>
                    <p className="text-[14px] font-medium truncate">
                      {lesson.title}
                    </p>
                  </div>
                  <StatusBadge status={lesson.status ?? "not_started"} />
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {subjects.length > 0 && hasNothing && (
        <EmptyState
          title="مفيش حاجة عاجلة دلوقتي"
          hint="ذاكر براحتك، هنا هيظهر أي واجب أو امتحان قريب."
        />
      )}
    </div>
  );
}

function HomeworkRow({ hw, subjectName }: { hw: Homework; subjectName?: string }) {
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium truncate">{hw.title}</p>
        <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
          {subjectName ?? "بدون مادة"}
        </p>
      </div>
      <span className={`text-[12px] font-semibold shrink-0 ${dueColor(hw.dueDate)}`}>
        {dueLabel(hw.dueDate)}
      </span>
    </li>
  );
}

function ExamRow({ exam, subjectName }: { exam: Exam; subjectName?: string }) {
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium truncate">{exam.title}</p>
        <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
          {subjectName ?? "بدون مادة"}
        </p>
      </div>
      <span className={`text-[12px] font-semibold shrink-0 ${dueColor(exam.date)}`}>
        {dueLabel(exam.date)}
      </span>
    </li>
  );
}
