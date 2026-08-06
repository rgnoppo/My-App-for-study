import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateRecord, deleteRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
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

export function EditSubjectSheet({
  subject,
  open,
  onClose,
}: {
  subject: Subject | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState<string>(SUBJECT_ICONS[0]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setColor(subject.color);
      setIcon(subject.icon);
      setConfirmDelete(false);
    }
  }, [subject?.id, open]);

  const handleSave = async () => {
    if (!subject || !name.trim()) return;
    await updateRecord("subjects", subject.id, { name: name.trim(), color, icon });
    onClose();
  };

  const handleDelete = async () => {
    if (!subject) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteRecord("subjects", subject.id);
    onClose();
    navigate("/subjects", { replace: true });
  };

  if (!subject) return null;

  return (
    <Sheet open={open} onClose={onClose} title="تعديل المادة">
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

      <PrimaryButton onClick={handleSave} disabled={!name.trim()} className="mb-2.5">
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
        {confirmDelete ? "تأكيد الحذف نهائياً" : "حذف المادة"}
      </button>
      {confirmDelete && (
        <p className="text-center text-[12px] text-ink-soft dark:text-ink-soft-d mt-2">
          ده هيحذف المادة وكل دروسها وبياناتها.
          <button onClick={() => setConfirmDelete(false)} className="mr-1 text-accent underline">إلغاء</button>
        </p>
      )}
    </Sheet>
  );
}
