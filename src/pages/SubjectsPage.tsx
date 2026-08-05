import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, newId } from "../db/db";
import { addRecord } from "../db/mutations";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Sheet } from "../components/Sheet";
import { Field, TextInput, PrimaryButton } from "../components/Field";
import { SubjectIcon, SUBJECT_ICONS } from "../lib/icons";
import type { Subject } from "../types";

const COLORS = [
  "#2F6F5E",
  "#B8542C",
  "#D9A441",
  "#3D6B8C",
  "#7A5AA6",
  "#A64B6B",
];

function AddIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SubjectsPage() {
  const subjects = useLiveQuery(() => db.subjects.orderBy("order").toArray());
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="max-w-md mx-auto pb-6">
      <PageHeader
        title="المواد"
        action={
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="إضافة مادة"
            className="p-2 -m-2 rounded-full text-accent active:bg-accent-soft dark:active:bg-accent/10"
          >
            <AddIcon />
          </button>
        }
      />

      <div className="px-4 pt-4">
        {subjects && subjects.length === 0 && (
          <EmptyState
            title="لسه مفيش مواد"
            hint="دوس على + عشان تضيف أول مادة دراسية."
          />
        )}

        {subjects && subjects.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((s) => (
              <Link key={s.id} to={`/subjects/${s.id}`}>
                <Card className="p-4 flex flex-col items-start gap-3 active:bg-paper-dim dark:active:bg-paper-dim-d transition h-full">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}22`, color: s.color }}
                  >
                    <SubjectIcon icon={s.icon} className="w-[22px] h-[22px]" />
                  </div>
                  <span className="font-display font-bold text-[15px] leading-tight">
                    {s.name}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <AddSubjectSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}

function AddSubjectSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState<string>(SUBJECT_ICONS[0]);

  const reset = () => {
    setName("");
    setColor(COLORS[0]);
    setIcon(SUBJECT_ICONS[0]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const count = await db.subjects.count();
    const subject: Subject = {
      id: newId(),
      name: name.trim(),
      color,
      icon,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: count,
    };
    await addRecord("subjects", subject);
    handleClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title="مادة جديدة">
      <Field label="اسم المادة">
        <TextInput
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: الفيزياء"
        />
      </Field>

      <Field label="اللون">
        <div className="flex gap-2.5 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`اللون ${c}`}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: c }}
            >
              {color === c && (
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </Field>

      <Field label="الأيقونة">
        <div className="grid grid-cols-6 gap-2.5">
          {SUBJECT_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`aspect-square rounded-xl flex items-center justify-center border transition ${
                icon === ic
                  ? "border-accent bg-accent-soft dark:bg-accent/10 text-accent"
                  : "border-line dark:border-line-d text-ink-soft dark:text-ink-soft-d"
              }`}
            >
              <SubjectIcon icon={ic} className="w-5 h-5" />
            </button>
          ))}
        </div>
      </Field>

      <PrimaryButton onClick={handleSubmit} disabled={!name.trim()}>
        إضافة المادة
      </PrimaryButton>
    </Sheet>
  );
}
