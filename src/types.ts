export type LessonStatus = "not_started" | "in_progress" | "done" | "reviewed";

export const STATUS_LABELS: Record<LessonStatus, string> = {
  not_started: "لم يبدأ",
  in_progress: "أثناء الشرح",
  done: "انتهى",
  reviewed: "تمت مراجعته",
};

export const STATUS_ORDER: LessonStatus[] = [
  "not_started",
  "in_progress",
  "done",
  "reviewed",
];

export interface Subject {
  [key: string]: unknown;
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
  order: number;
  deleted?: boolean;
}

export interface StudyNode {
  [key: string]: unknown;
  id: string;
  subjectId: string;
  parentId: string | null;
  type: "unit" | "lesson";
  title: string;
  status: LessonStatus | null;
  notes: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface Homework {
  [key: string]: unknown;
  id: string;
  subjectId: string;
  title: string;
  dueDate: string;
  done: boolean;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export type ExamType = "exam" | "quiz" | "final_review";

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  exam: "امتحان",
  quiz: "تقييم/اختبار",
  final_review: "مراجعة نهائية",
};

export interface Exam {
  [key: string]: unknown;
  id: string;
  subjectId: string;
  title: string;
  date: string;
  type: ExamType;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface Mistake {
  [key: string]: unknown;
  id: string;
  subjectId: string;
  lessonId: string | null;
  question: string;
  myAnswer: string;
  correctAnswer: string;
  reason: string;
  understood: boolean;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface BackupData {
  version: 1;
  exportedAt: number;
  subjects: Subject[];
  nodes: StudyNode[];
  homework: Homework[];
  exams: Exam[];
  mistakes: Mistake[];
}

export type SyncTable = "subjects" | "nodes" | "homework" | "exams" | "mistakes";

export interface SyncQueueItem {
  id: string;
  table: SyncTable;
  recordId: string;
  queuedAt: number;
  payload: Record<string, unknown>;
}

export type SyncStatus = "offline" | "synced" | "syncing" | "error";
