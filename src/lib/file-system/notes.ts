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
import { parse as parseDate, format as formatDate, format } from "date-fns";
import { parseISO } from "date-fns";

// Helper function to ensure journal directory structure exists
async function ensureJournalDirectory(kronospherePath: string): Promise<{
  journalDir: string;
  dailyDir: string;
  weeklyDir: string;
}> {
  const journalDir = await join(kronospherePath, "journal");
  const dailyDir = await join(journalDir, "daily");
  const weeklyDir = await join(journalDir, "weekly");

  if (!(await exists(journalDir))) {
    await mkdir(journalDir, { recursive: true });
  }
  if (!(await exists(dailyDir))) {
    await mkdir(dailyDir, { recursive: true });
  }
  if (!(await exists(weeklyDir))) {
    await mkdir(weeklyDir, { recursive: true });
  }

  return { journalDir, dailyDir, weeklyDir };
}

// Helper function to get journal entry paths
async function getJournalEntryPath(
  type: "daily" | "weekly",
): Promise<{ path: string; id: string }> {
  const currentKronosphere = await getCurrentKronosphere();
  if (!currentKronosphere) {
    throw new Error("No active Kronosphere");
  }

  const { dailyDir, weeklyDir } = await ensureJournalDirectory(
    currentKronosphere.path,
  );
  const now = new Date();

  if (type === "daily") {
    const id = formatDate(now, "yyyy-MM-dd");
    const path = await join(dailyDir, `${id}.md`);
    return { path, id };
  } else {
    const weekNum = formatDate(now, "ww").padStart(2, "0");
    const id = `${formatDate(now, "yyyy")}-W${weekNum}`;
    const path = await join(weeklyDir, `${id}.md`);
    return { path, id };
  }
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
// function extractTitleFromContent(content: string): string {
//   // Look for first heading or first line
//   const match = content.match(/^#\s*(.+)$/m) || content.match(/^(.+)$/);
//   return (match?.[1]?.trim() || "Untitled").slice(0, 50); // Limit length
// }

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

// Helper function to determine the correct path based on note type
async function getNotePathInfo(
  id: string,
  type: "daily" | "weekly" | "document" = "document",
) {
  const currentKronosphere = await getCurrentKronosphere();
  if (!currentKronosphere) {
    throw new Error("No active Kronosphere");
  }

  switch (type) {
    case "daily": {
      const { dailyDir } = await ensureJournalDirectory(
        currentKronosphere.path,
      );
      const path = await join(dailyDir, `${id}.md`);
      return { path, id };
    }
    case "weekly": {
      const { weeklyDir } = await ensureJournalDirectory(
        currentKronosphere.path,
      );
      const path = await join(weeklyDir, `${id}.md`);
      return { path, id };
    }
    default: {
      const notesDir = await join(currentKronosphere.path, "notes");
      if (!(await exists(notesDir))) {
        await mkdir(notesDir, { recursive: true });
      }
      if (!id) {
        throw new Error("ID is required for document notes");
      }
      const path = await join(notesDir, `${id}.md`);
      return { path, id };
    }
  }
}

// Create a new note
export async function createNote(
  content: string,
  type: "daily" | "weekly" | "document" = "document",
  id?: string,
): Promise<Note> {
  const currentKronosphere = await getCurrentKronosphere();
  if (!currentKronosphere) {
    throw new Error("No active Kronosphere");
  }

  // Get path based on type and id
  const pathInfo = await getNotePathInfo(
    id || format(new Date(), "yyyy-MM-dd"),
    type,
  );
  const { path } = pathInfo;

  const now = new Date();
  const metadata: Note["metadata"] = {
    created: now,
    modified: now,
    type,
    tags: [],
    properties: {},
  };

  const fullContent = generateFrontmatter(metadata) + content;
  await writeTextFile(path, fullContent);

  return {
    id: pathInfo.id,
    content,
    metadata,
    path,
  };
}

// Read a note by ID (filename without extension)
export async function readNote(
  id: string,
  type: "daily" | "weekly" | "document" = "document",
): Promise<Note> {
  const { path } = await getNotePathInfo(id, type);

  let fileContent = "";
  try {
    if (await exists(path)) {
      fileContent = await readTextFile(path);
    }
  } catch (error) {
    console.warn(`Could not read note ${id}:`, error);
  }

  // If file doesn't exist or is empty, create default metadata
  if (!fileContent) {
    const metadata = {
      created: new Date(),
      modified: new Date(),
      type,
      tags: [],
      properties: {},
    };
    return { id, content: "", metadata, path };
  }

  const { metadata, content } = parseMarkdownWithFrontmatter(fileContent);
  return { id, content: content.trim(), metadata, path };
}

// Update a note
export async function updateNote(
  id: string,
  content: string,
  type: "daily" | "weekly" | "document" = "document",
): Promise<Note> {
  const { path } = await getNotePathInfo(id, type);

  let existingNote;
  try {
    existingNote = await readNote(id, type);
  } catch (error) {
    // If note doesn't exist, create new metadata
    existingNote = {
      id,
      content: "",
      metadata: {
        created: new Date(),
        modified: new Date(),
        type,
        tags: [],
        properties: {},
      },
      path,
    };
  }

  const metadata = {
    ...existingNote.metadata,
    modified: new Date(),
  };

  // Only update if content has changed
  if (content !== existingNote.content) {
    const fullContent = generateFrontmatter(metadata) + content;
    await writeTextFile(path, fullContent);
  }

  return {
    id,
    content,
    metadata,
    path,
  };
}

// Delete a note
export async function deleteNote(
  id: string,
  type: "daily" | "weekly" | "document" = "document",
): Promise<void> {
  const { path } = await getNotePathInfo(id, type);

  if (!(await exists(path))) {
    throw new Error(`Note with id ${id} not found`);
  }

  await remove(path);
}

// List all notes in the current Kronosphere
export async function listNotes(
  type: "daily" | "weekly" | "document" = "document",
): Promise<Note[]> {
  const currentKronosphere = await getCurrentKronosphere();
  if (!currentKronosphere) {
    throw new Error("No active Kronosphere");
  }

  const { path } = await getNotePathInfo("", type);
  const notes: Note[] = [];

  const entries = await readDir(path);
  for (const entry of entries) {
    if (entry.name.endsWith(".md")) {
      const id = entry.name.replace(".md", "");
      const note = await readNote(id, type);
      notes.push(note);
    }
  }

  return notes;
}
