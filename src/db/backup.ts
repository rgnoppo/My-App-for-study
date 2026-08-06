import { db } from "./db";
import type { BackupData, SyncTable } from "../types";
import { queueChange, runSync } from "../lib/sync";

const SYNC_TABLES: SyncTable[] = ["subjects", "nodes", "homework", "exams", "mistakes"];

export async function exportBackup(): Promise<void> {
  const [subjects, nodes, homework, exams, mistakes] = await Promise.all([
    db.subjects.toArray(),
    db.nodes.toArray(),
    db.homework.toArray(),
    db.exams.toArray(),
    db.mistakes.toArray(),
  ]);

  const data: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    subjects,
    nodes,
    homework,
    exams,
    mistakes,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `study-os-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as BackupData;

  if (!data || data.version !== 1 || !Array.isArray(data.subjects)) {
    throw new Error("ملف النسخة الاحتياطية غير صالح");
  }

  await db.transaction(
    "rw",
    db.subjects,
    db.nodes,
    db.homework,
    db.exams,
    db.mistakes,
    async () => {
      await Promise.all([
        db.subjects.clear(),
        db.nodes.clear(),
        db.homework.clear(),
        db.exams.clear(),
        db.mistakes.clear(),
      ]);
      await Promise.all([
        db.subjects.bulkAdd(data.subjects),
        db.nodes.bulkAdd(data.nodes ?? []),
        db.homework.bulkAdd(data.homework ?? []),
        db.exams.bulkAdd(data.exams ?? []),
        db.mistakes.bulkAdd(data.mistakes ?? []),
      ]);
    }
  );
}

export async function resetAllData(userId?: string | null): Promise<void> {
  // If sync is on, queue a tombstone for every existing row BEFORE wiping
  // locally, so the deletion propagates to Supabase and every other
  // device instead of only clearing this device's local copy.
  if (userId) {
    for (const table of SYNC_TABLES) {
      const rows = await db[table].toArray();
      for (const row of rows) {
        await queueChange(table, row.id, { ...row, deleted: true, updatedAt: Date.now() });
      }
    }
  }

  await db.transaction(
    "rw",
    db.subjects,
    db.nodes,
    db.homework,
    db.exams,
    db.mistakes,
    async () => {
      await Promise.all([
        db.subjects.clear(),
        db.nodes.clear(),
        db.homework.clear(),
        db.exams.clear(),
        db.mistakes.clear(),
      ]);
    }
  );

  if (userId) {
    await runSync(userId);
  }
}
