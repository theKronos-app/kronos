// create a task type like the notes.ts for the task, AI!
export type TaskStatus = "active" | "completed" | "canceled";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  is_done: number | null; // Consider making this a boolean or a timestamp
  created_at: number;
  done_at: number | null;
  journal_date: string; // Consider making this a Date or number (timestamp)
  tags: string[];
  priority: number;
}
