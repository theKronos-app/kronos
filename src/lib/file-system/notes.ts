import {
	readTextFile,
	writeTextFile,
	exists,
	mkdir,
	remove,
	readDir,
} from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import type { Note } from "@/types/note";
import { getCurrentKronosphere } from "./kronospheres";
import YAML from "yaml";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";
import { parse as parseDate, format as formatDate } from "date-fns";
import { parseISO } from "date-fns";

// Helper function to ensure notes directory exists
async function ensureNotesDirectory(kronospherePath: string): Promise<string> {
	const notesDir = await join(kronospherePath, "notes");
	if (!(await exists(notesDir))) {
		await mkdir(notesDir, { recursive: true });
	}
	return notesDir;
}

// Helper function to create a valid filename from title
function createValidFilename(title: string): string {
	return (
		title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
			.replace(/^-+|-+$/g, "") || // Remove leading/trailing hyphens
		"untitled"
	); // Fallback if empty
}

// Helper function to extract title from content
function extractTitleFromContent(content: string): string {
	// Look for first heading or first line
	const match = content.match(/^#\s*(.+)$/m) || content.match(/^(.+)$/);
	return (match?.[1]?.trim() || "Untitled").slice(0, 50); // Limit length
}

// Helper function to parse dates from various formats
function parseDateSafely(dateString: string): Date {
	try {
		// Try parsing ISO format first
		const isoDate = parseISO(dateString);
		if (!Number.isNaN(isoDate.getTime())) {
			return isoDate;
		}

		// Try parsing MMM Do, YYYY format
		const parsedDate = parseDate(dateString, "MMM do, yyyy", new Date());
		if (!Number.isNaN(parsedDate.getTime())) {
			return parsedDate;
		}

		// Add more format attempts here if needed

		// Fallback to current date if parsing fails
		console.warn(`Failed to parse date: ${dateString}, using current date`);
		return new Date();
	} catch (error) {
		console.warn(`Error parsing date: ${dateString}`, error);
		return new Date();
	}
}

// Helper function to format date consistently
function formatDateForYAML(date: Date): string {
	return formatDate(date, "MMM do, yyyy");
}

// Helper function to parse YAML frontmatter from markdown content
function parseMarkdownWithFrontmatter(content: string): {
	metadata: Note["metadata"];
	content: string;
} {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		// No frontmatter found, return default metadata
		return {
			metadata: {
				created: new Date(),
				modified: new Date(),
				type: "document",
				tags: [],
				properties: {},
			},
			content: content,
		};
	}

	try {
		const yaml = match[1];
		const mainContent = match[2];
		const parsedMetadata = YAML.parse(yaml);

		const metadata = {
			created: parseDateSafely(parsedMetadata.created || ""),
			modified: parseDateSafely(parsedMetadata.modified || ""),
			type: parsedMetadata.type || "document",
			tags: parsedMetadata.tags || [],
			properties: parsedMetadata.properties || {},
		};

		return { metadata, content: mainContent };
	} catch (error) {
		console.error("Error parsing frontmatter:", error);
		return {
			metadata: {
				created: new Date(),
				modified: new Date(),
				type: "document",
				tags: [],
				properties: {},
			},
			content: content,
		};
	}
}

// Helper function to generate YAML frontmatter
function generateFrontmatter(metadata: Note["metadata"]): string {
	const frontmatter = {
		created: formatDateForYAML(metadata.created),
		modified: formatDateForYAML(metadata.modified),
		type: metadata.type,
		tags: metadata.tags,
		properties: metadata.properties,
	};

	return `---\n${YAML.stringify(frontmatter)}---\n`;
}

// Create a new note
export async function createNote(
	content: string,
	type: "daily" | "document" = "document",
): Promise<Note> {
	const currentKronosphere = await getCurrentKronosphere();
	if (!currentKronosphere) {
		throw new Error("No active Kronosphere");
	}

	const notesDir = await ensureNotesDirectory(currentKronosphere.path);
	const title = extractTitleFromContent(content);
	const baseFilename = createValidFilename(title);

	// Ensure unique filename
	let filename = baseFilename;
	let counter = 1;
	let notePath = await join(notesDir, `${filename}.md`);

	while (await exists(notePath)) {
		filename = `${baseFilename}-${counter}`;
		notePath = await join(notesDir, `${filename}.md`);
		counter++;
	}

	const now = new Date();
	const metadata: Note["metadata"] = {
		created: now,
		modified: now,
		type,
		tags: [],
		properties: {},
	};

	const fullContent = generateFrontmatter(metadata) + content;
	await writeTextFile(notePath, fullContent);

	return {
		id: filename,
		content,
		metadata,
		path: notePath,
	};
}

// Read a note by ID (filename without extension)
export async function readNote(id: string): Promise<Note> {
	const currentKronosphere = await getCurrentKronosphere();
	if (!currentKronosphere) {
		throw new Error("No active Kronosphere");
	}

	const notesDir = await ensureNotesDirectory(currentKronosphere.path);
	const notePath = await join(notesDir, `${id}.md`);

	if (!(await exists(notePath))) {
		throw new Error(`Note with id ${id} not found`);
	}

	const fileContent = await readTextFile(notePath);
	const { metadata, content } = parseMarkdownWithFrontmatter(fileContent);

	return {
		id,
		content,
		metadata,
		path: notePath,
	};
}

// Update a note
export async function updateNote(id: string, content: string): Promise<Note> {
	const currentKronosphere = await getCurrentKronosphere();
	if (!currentKronosphere) {
		throw new Error("No active Kronosphere");
	}

	const notesDir = await ensureNotesDirectory(currentKronosphere.path);
	const notePath = await join(notesDir, `${id}.md`);

	if (!(await exists(notePath))) {
		throw new Error(`Note with id ${id} not found`);
	}

	// Read existing note to preserve metadata
	const existingNote = await readNote(id);
	const metadata = {
		...existingNote.metadata,
		modified: new Date(),
	};

	const fullContent = generateFrontmatter(metadata) + content;
	await writeTextFile(notePath, fullContent);

	return {
		id,
		content,
		metadata,
		path: notePath,
	};
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
	const currentKronosphere = await getCurrentKronosphere();
	if (!currentKronosphere) {
		throw new Error("No active Kronosphere");
	}

	const notesDir = await ensureNotesDirectory(currentKronosphere.path);
	const notePath = await join(notesDir, `${id}.md`);

	if (!(await exists(notePath))) {
		throw new Error(`Note with id ${id} not found`);
	}

	await remove(notePath);
}

// List all notes in the current Kronosphere
export async function listNotes(): Promise<Note[]> {
	const currentKronosphere = await getCurrentKronosphere();
	if (!currentKronosphere) {
		throw new Error("No active Kronosphere");
	}

	const notesDir = await ensureNotesDirectory(currentKronosphere.path);
	const notes: Note[] = [];

	const entries = await readDir(notesDir);
	for (const entry of entries) {
		if (entry.name.endsWith('.md')) {
			const id = entry.name.replace('.md', '');
			const note = await readNote(id);
			notes.push(note);
		}
	}

	return notes;
}
