import Dexie, { type Table } from "dexie";
import type { Subject, StudyNode, Homework, Exam, Mistake, SyncQueueItem } from "../types";

export class StudyOSDatabase extends Dexie {
  subjects!: Table<Subject, string>;
  nodes!: Table<StudyNode, string>;
  homework!: Table<Homework, string>;
  exams!: Table<Exam, string>;
  mistakes!: Table<Mistake, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("study-os-quantum");
    this.version(1).stores({
      subjects: "id, order, createdAt",
      nodes: "id, subjectId, parentId, type, status, order",
      homework: "id, subjectId, dueDate, done",
      exams: "id, subjectId, date, type",
      mistakes: "id, subjectId, lessonId, understood, createdAt",
    });
    this.version(2).stores({
      subjects: "id, order, createdAt",
      nodes: "id, subjectId, parentId, type, status, order",
      homework: "id, subjectId, dueDate, done",
      exams: "id, subjectId, date, type",
      mistakes: "id, subjectId, lessonId, understood, createdAt",
      syncQueue: "id, table, recordId, queuedAt",
    });
  }
}

export const db = new StudyOSDatabase();

export function newId(): string {
  return crypto.randomUUID();
}
