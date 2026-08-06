import { db, newId } from "../db/db";
import { supabase } from "./supabaseClient";
import type { SyncTable } from "../types";

// ---------------------------------------------------------------------
// Field name mapping: IndexedDB uses camelCase, Postgres uses snake_case.
// ---------------------------------------------------------------------

type AnyRecord = Record<string, unknown>;

function toSnakeRow(table: SyncTable, row: AnyRecord, userId: string): AnyRecord {
  const base: AnyRecord = { id: row.id, user_id: userId, deleted: row.deleted ?? false };
  switch (table) {
    case "subjects":
      return {
        ...base,
        name: row.name,
        color: row.color,
        icon: row.icon,
        order: row.order,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      };
    case "nodes":
      return {
        ...base,
        subject_id: row.subjectId,
        parent_id: row.parentId,
        type: row.type,
        title: row.title,
        status: row.status,
        notes: row.notes,
        order: row.order,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      };
    case "homework":
      return {
        ...base,
        subject_id: row.subjectId,
        title: row.title,
        due_date: row.dueDate,
        done: row.done,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      };
    case "exams":
      return {
        ...base,
        subject_id: row.subjectId,
        title: row.title,
        date: row.date,
        type: row.type,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      };
    case "mistakes":
      return {
        ...base,
        subject_id: row.subjectId,
        lesson_id: row.lessonId,
        question: row.question,
        my_answer: row.myAnswer,
        correct_answer: row.correctAnswer,
        reason: row.reason,
        understood: row.understood,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      };
  }
}

function fromSnakeRow(table: SyncTable, row: AnyRecord): AnyRecord {
  const base: AnyRecord = { id: row.id, deleted: row.deleted ?? false };
  switch (table) {
    case "subjects":
      return {
        ...base,
        name: row.name,
        color: row.color,
        icon: row.icon,
        order: row.order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    case "nodes":
      return {
        ...base,
        subjectId: row.subject_id,
        parentId: row.parent_id,
        type: row.type,
        title: row.title,
        status: row.status,
        notes: row.notes,
        order: row.order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    case "homework":
      return {
        ...base,
        subjectId: row.subject_id,
        title: row.title,
        dueDate: row.due_date,
        done: row.done,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    case "exams":
      return {
        ...base,
        subjectId: row.subject_id,
        title: row.title,
        date: row.date,
        type: row.type,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    case "mistakes":
      return {
        ...base,
        subjectId: row.subject_id,
        lessonId: row.lesson_id,
        question: row.question,
        myAnswer: row.my_answer,
        correctAnswer: row.correct_answer,
        reason: row.reason,
        understood: row.understood,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
  }
}

const ALL_TABLES: SyncTable[] = ["subjects", "nodes", "homework", "exams", "mistakes"];

function localTable(table: SyncTable) {
  return db[table];
}

// ---------------------------------------------------------------------
// Queueing: called by every write path (see db/mutations.ts) so the
// change is remembered even offline. The full record snapshot is
// captured at queue time so the push step never needs to re-read a
// possibly already hard-deleted local row — avoids a race condition.
// ---------------------------------------------------------------------
export async function queueChange(
  table: SyncTable,
  recordId: string,
  payload: AnyRecord
): Promise<void> {
  await db.syncQueue.add({ id: newId(), table, recordId, queuedAt: Date.now(), payload });
}

// ---------------------------------------------------------------------
// PUSH: send every queued local change to Supabase.
// ---------------------------------------------------------------------
async function pushQueue(userId: string): Promise<void> {
  if (!supabase) return;
  const items = await db.syncQueue.toArray();
  if (items.length === 0) return;

  const latestByKey = new Map<string, (typeof items)[number]>();
  for (const item of items) {
    const key = `${item.table}:${item.recordId}`;
    const prev = latestByKey.get(key);
    if (!prev || item.queuedAt >= prev.queuedAt) latestByKey.set(key, item);
  }

  for (const item of latestByKey.values()) {
    const payload = toSnakeRow(item.table, item.payload, userId);
    const { error } = await supabase.from(item.table).upsert(payload);
    if (error) {
      console.error(`Sync push failed for ${item.table}:${item.recordId}`, error);
      continue;
    }
    await db.syncQueue.where({ table: item.table, recordId: item.recordId }).delete();
  }
}

// ---------------------------------------------------------------------
// PULL: fetch remote rows updated after our last sync point, merge into
// IndexedDB using last-write-wins on updatedAt.
// ---------------------------------------------------------------------
const LAST_PULL_KEY = "study-os-last-pull";

function getLastPull(): number {
  // Returns a millisecond epoch timestamp, matching the bigint
  // updated_at column in Postgres. 0 means "never pulled before".
  const raw = localStorage.getItem(LAST_PULL_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}
function setLastPull(ts: number): void {
  localStorage.setItem(LAST_PULL_KEY, String(ts));
}

async function pullTable(table: SyncTable, userId: string, since: number): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .gt("updated_at", since);

  if (error) {
    console.error(`Sync pull failed for ${table}`, error);
    return;
  }
  if (!data || data.length === 0) return;

  await db.transaction("rw", localTable(table), async () => {
    for (const remoteRow of data) {
      const local = fromSnakeRow(table, remoteRow as AnyRecord);
      const existing = await localTable(table).get(local.id as string);
      const existingUpdatedAt = existing
        ? ((existing as unknown as Record<string, unknown>).updatedAt as number)
        : -1;

      if (!existing || (local.updatedAt as number) >= existingUpdatedAt) {
        if (local.deleted) {
          await localTable(table).delete(local.id as string);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await localTable(table).put(local as any);
        }
      }
    }
  });
}

// ---------------------------------------------------------------------
// Public entry points.
// ---------------------------------------------------------------------
export async function runSync(userId: string): Promise<void> {
  if (!supabase) return;
  await pushQueue(userId);
  const since = getLastPull();
  // Capture start time BEFORE pulling so we don't miss rows written
  // between the pull and us saving the cursor.
  const startedAt = Date.now();
  for (const table of ALL_TABLES) {
    await pullTable(table, userId, since);
  }
  setLastPull(startedAt);
}

export async function pushFullLocalSnapshot(userId: string): Promise<void> {
  // Used once right after first login so anything created locally before
  // signing in gets uploaded even without queue entries.
  if (!supabase) return;
  for (const table of ALL_TABLES) {
    const rows = await localTable(table).toArray();
    if (rows.length === 0) continue;
    const payload = rows.map((r) => toSnakeRow(table, r as unknown as AnyRecord, userId));
    const { error } = await supabase.from(table).upsert(payload);
    if (error) console.error(`Initial upload failed for ${table}`, error);
  }
}
