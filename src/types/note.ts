export type NoteType = "daily" | "weekly" | "document";

export interface Note {
	id: string;
	content: string;

	modified: Date;
	created: Date;

	type: NoteType;

	tags: string[];
	properties: {
		// Daily-specific
		mood?: string;
		// Document-specific
		status?: "active" | "archived";
	};
	aiInsights: string | null;
	path: string;
}
