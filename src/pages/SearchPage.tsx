import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { matches } from "../lib/search";
import { StatusDot } from "../components/StatusDot";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5l-4.3-4.3" />
    </svg>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState("");

  const subjects = useLiveQuery(() => db.subjects.toArray());
  const nodes = useLiveQuery(() => db.nodes.toArray());
  const homework = useLiveQuery(() => db.homework.toArray());
  const mistakes = useLiveQuery(() => db.mistakes.toArray());

  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s]));

  const results = useMemo(() => {
    if (!query.trim() || !nodes || !homework || !mistakes) {
      return { lessons: [], homework: [], mistakes: [] };
    }
    return {
      lessons: nodes.filter(
        (n) => n.type === "lesson" && (matches(n.title, query) || matches(n.notes, query))
      ),
      homework: homework.filter((h) => matches(h.title, query)),
      mistakes: mistakes.filter((m) =>
        matches(`${m.question} ${m.reason} ${m.myAnswer} ${m.correctAnswer}`, query)
      ),
    };
  }, [query, nodes, homework, mistakes]);

  const hasQuery = query.trim().length > 0;
  const totalResults =
    results.lessons.length + results.homework.length + results.mistakes.length;

  return (
    <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-24">
      <PageHeader title="بحث شامل" />

      <div className="px-4 pt-4">
        <div className="relative mb-5">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-d pointer-events-none">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='ابحث في كل التطبيق... مثال: "فاعل"'
            className="w-full rounded-xl border border-line dark:border-line-d bg-paper-dim/50 dark:bg-paper-dim-d/50 pr-9 pl-3.5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
          />
        </div>

        {!hasQuery && (
          <EmptyState
            title="ابحث في الدروس والواجبات والأخطاء"
            hint="نتايج البحث هتظهر هنا فورًا وانت بتكتب."
          />
        )}

        {hasQuery && totalResults === 0 && (
          <EmptyState title="مفيش نتايج" hint="جرب كلمة تانية." />
        )}

        {hasQuery && results.lessons.length > 0 && (
          <ResultSection title="الدروس">
            {results.lessons.map((l) => (
              <Link
                key={l.id}
                to={`/subjects/${l.subjectId}/lessons/${l.id}`}
                className="flex items-center gap-2.5 py-2.5 px-1"
              >
                <StatusDot status={l.status ?? "not_started"} />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium truncate">{l.title}</p>
                  <p className="text-[12px] text-ink-soft dark:text-ink-soft-d truncate">
                    {subjectMap.get(l.subjectId)?.name}
                  </p>
                </div>
              </Link>
            ))}
          </ResultSection>
        )}

        {hasQuery && results.homework.length > 0 && (
          <ResultSection title="الواجبات">
            {results.homework.map((h) => (
              <Link key={h.id} to="/homework" className="block py-2.5 px-1">
                <p className="text-[14px] font-medium truncate">{h.title}</p>
                <p className="text-[12px] text-ink-soft dark:text-ink-soft-d truncate">
                  {subjectMap.get(h.subjectId)?.name}
                </p>
              </Link>
            ))}
          </ResultSection>
        )}

        {hasQuery && results.mistakes.length > 0 && (
          <ResultSection title="الأخطاء">
            {results.mistakes.map((m) => (
              <Link key={m.id} to="/mistakes" className="block py-2.5 px-1">
                <p className="text-[14px] font-medium truncate">{m.question}</p>
                <p className="text-[12px] text-ink-soft dark:text-ink-soft-d truncate">
                  {subjectMap.get(m.subjectId)?.name}
                </p>
              </Link>
            ))}
          </ResultSection>
        )}
      </div>
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="font-display font-bold text-[13px] text-ink-soft dark:text-ink-soft-d mb-1 px-1">
        {title}
      </h2>
      <div className="rounded-2xl border border-line dark:border-line-d bg-white/60 dark:bg-white/[0.03] divide-y divide-line dark:divide-line-d px-3">
        {children}
      </div>
    </section>
  );
}
