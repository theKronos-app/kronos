export type NoteType = "daily" | "weekly" | "document" | "tag";

export interface Note {
	id: string;
	content: string;
	modified: Date;
	created: Date;
	type: NoteType;
	tags: string[];
	linkedNotes?: string[]; // IDs of related notes
	aiInsights: string | null;
	path: string;
}
