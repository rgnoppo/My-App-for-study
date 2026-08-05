// Thin wrappers around Dexie writes. Every add/update/delete in the app
// goes through these instead of calling db.table.add/update/delete
// directly, so that:
//   1. updatedAt is always stamped consistently
//   2. the change is queued for the sync engine automatically
// This keeps sync invisible to page code — pages don't need to know or
// care whether sync is enabled.

import { db } from "./db";
import { queueChange } from "../lib/sync";
import type { SyncTable } from "../types";

type AnyRecord = Record<string, unknown> & { id: string };

export async function addRecord<T extends AnyRecord>(
  table: SyncTable,
  record: T
): Promise<void> {
  await db[table].add(record as never);
  await queueChange(table, record.id, record);
}

export async function updateRecord(
  table: SyncTable,
  id: string,
  changes: Record<string, unknown>
): Promise<void> {
  const updatedAt = Date.now();
  await db[table].update(id, { ...changes, updatedAt } as never);
  const fresh = await db[table].get(id as never);
  if (fresh) await queueChange(table, id, fresh as AnyRecord);
}

export async function deleteRecord(table: SyncTable, id: string): Promise<void> {
  const existing = await db[table].get(id as never);
  if (!existing) return;
  // Soft-delete: the queued payload carries deleted:true so other devices
  // (and Supabase) learn about the deletion, even though we remove the
  // row locally right away so the UI stops showing it immediately.
  const tombstone = { ...(existing as AnyRecord), deleted: true, updatedAt: Date.now() };
  await queueChange(table, id, tombstone);
  await db[table].delete(id as never);
}
