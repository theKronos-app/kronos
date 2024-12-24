// create a task type like the notes.ts for the task, AI!
export type TaskStatus = "active" | "completed" | "canceled";

export interface Task {
	id: string;
	title: string;
	notes?: string;
	is_done: Date | null;
	created_at: Date;
	journal_date: Date;
	tags: string[];
	priority: number;
}
