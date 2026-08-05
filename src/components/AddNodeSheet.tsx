import { useState } from "react";
import { db, newId } from "../db/db";
import { addRecord } from "../db/mutations";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
import type { StudyNode } from "../types";

export function AddNodeSheet({
  open,
  onClose,
  subjectId,
  parentId,
}: {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  parentId: string | null;
}) {
  const [type, setType] = useState<"unit" | "lesson">("lesson");
  const [title, setTitle] = useState("");

  const handleClose = () => {
    setTitle("");
    setType("lesson");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const siblingCount = await db.nodes
      .where("subjectId")
      .equals(subjectId)
      .filter((n) => n.parentId === parentId)
      .count();

    const node: StudyNode = {
      id: newId(),
      subjectId,
      parentId,
      type,
      title: title.trim(),
      status: type === "lesson" ? "not_started" : null,
      notes: "",
      order: siblingCount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addRecord("nodes", node);
    handleClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title="إضافة">
      <Field label="النوع">
        <div className="flex gap-2">
          <button
            onClick={() => setType("lesson")}
            className={`flex-1 rounded-xl py-2.5 text-[14px] font-medium border transition ${
              type === "lesson"
                ? "border-accent bg-accent-soft dark:bg-accent/10 text-accent"
                : "border-line dark:border-line-d text-ink-soft dark:text-ink-soft-d"
            }`}
          >
            درس
          </button>
          <button
            onClick={() => setType("unit")}
            className={`flex-1 rounded-xl py-2.5 text-[14px] font-medium border transition ${
              type === "unit"
                ? "border-accent bg-accent-soft dark:bg-accent/10 text-accent"
                : "border-line dark:border-line-d text-ink-soft dark:text-ink-soft-d"
            }`}
          >
            وحدة
          </button>
        </div>
      </Field>

      <Field label={type === "lesson" ? "اسم الدرس" : "اسم الوحدة"}>
        <TextInput
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "lesson" ? "مثال: قانون نيوتن الثاني" : "مثال: الوحدة الأولى"}
        />
      </Field>

      <PrimaryButton onClick={handleSubmit} disabled={!title.trim()}>
        إضافة
      </PrimaryButton>
    </Sheet>
  );
}
