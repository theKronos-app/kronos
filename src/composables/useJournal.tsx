import { createSignal } from "solid-js";
import type { Note, NoteType } from "@/types/note";
import { format } from "date-fns";
import { toastService } from "@/components/toast";
import { journalStore, setJournalStore } from "@/store/journal-store";
import Database from "@tauri-apps/plugin-sql";

/**
 * Composable for managing journal entries. Handles:
 * - Current entry state and date tracking
 * - Loading existing entries by date
 * - Creating new entries if none exist
 * - Entry state management and updates
 */

async function getDb(): Promise<Database> {
	return await Database.load("sqlite:kronoshpere.db");
}

export function useJournal() {
	const [currentEntry, setCurrentEntry] = createSignal<Note | null>(null);

	async function loadEntry(dateStr: string) {
		console.log("Loading entry for date:", dateStr);

		// Clear the current entry first
		setCurrentEntry(null);

		try {
			const db = await getDb();

			// Try to find existing entry
			const existingEntry = await db.select<Note[]>(
				"SELECT * FROM notes WHERE id = $1 AND type = 'daily'",
				[dateStr],
			);
			console.log(
				"🚀 -> src/composables/useJournal.tsx:36 -> existingEntry: ",
				existingEntry,
			);

			let entry: Note;

			if (existingEntry.length > 0) {
				console.log("Found existing note, loading...");
				entry = existingEntry[0];

				// Ensure metadata exists and is initialized
				entry.metadata = entry.metadata || {
					created: new Date(),
					modified: new Date(),
					type: "daily" as NoteType,
					tags: [],
					properties: {},
				};

				// Robust properties parsing
				try {
					if (entry.properties) {
						if (typeof entry.properties === 'string') {
							try {
								// Try parsing as JSON string
								entry.properties = JSON.parse(entry.properties);
							} catch {
								// If parsing fails, set to empty object
								entry.properties = {};
							}
						}
					} else {
						entry.properties = {};
					}
				} catch (parseError) {
					console.error("Failed to parse properties:", parseError);
					entry.properties = {};
				}

				// Robust tags parsing
				let parsedTags: string[] = [];
				try {
					if (entry.tags) {
						if (typeof entry.tags === 'string') {
							// Try parsing as JSON array or object
							try {
								const parsed = JSON.parse(entry.tags);
								parsedTags = Array.isArray(parsed) 
									? parsed 
									: parsed.tags || [];
							} catch {
								// Fallback to comma-separated string
								parsedTags = entry.tags.split(',')
									.map(tag => tag.trim())
									.filter(tag => tag);
							}
						} else if (Array.isArray(entry.tags)) {
							parsedTags = entry.tags;
						}
					}
					entry.tags = parsedTags;
				} catch (parseError) {
					console.error("Failed to parse tags:", parseError);
					entry.tags = [];
				}
			} else {
				console.log("No existing note found, creating new entry...");
				const initialContent = `## Journal Entry - ${format(
					new Date(dateStr),
					"MMMM do, yyyy",
				)}\n\n`;

				const now = Date.now();
				try {
					await db.execute(
						"INSERT OR REPLACE INTO notes (id, content, created_at, modified_at, type, tags, properties) VALUES ($1, $2, $3, $4, $5, $6, $7)",
						[
							dateStr,
							initialContent,
							now,
							now,
							"daily" as NoteType,
							JSON.stringify([]), // Store as JSON string
							JSON.stringify({}),
						],
					);
				} catch (insertError) {
					console.error("Error inserting note:", insertError);
					toastService.error({ description: "Failed to create journal entry" });
					return null;
				}

				const newEntryResult = await db.select<Note[]>(
					"SELECT * FROM notes WHERE id = $1",
					[dateStr],
				);
				entry = newEntryResult[0];

				// Ensure metadata is initialized for new entries
				entry.metadata = {
					created: new Date(now),
					modified: new Date(now),
					type: "daily" as NoteType,
					tags: [],
					properties: {},
				};
			}

			// Update both the current entry and the store
			setCurrentEntry(entry);
			setJournalStore("currentDate", dateStr);

			console.log("Successfully loaded entry:", entry);
			return entry;
		} catch (error) {
			console.error("Failed to handle journal entry:", error);
			toastService.error({ description: "Failed to handle journal entry" });
			return null;
		}
	}

	async function updateEntryMetadata(note: Note) {
		if (!currentEntry()) return;

		try {
			const db = await getDb();
			const now = Date.now();

			await db.execute(
				"UPDATE notes SET modified_at = $1, properties = $2, tags = $3, ai_insights = $4 WHERE id = $5",
				[
					now,
					JSON.stringify(note.properties || {}),
					JSON.stringify(note.tags || []),
					note.aiInsights ?? null,
					currentEntry()!.id,
				],
			);

			const updatedEntryResult = await db.select<Note[]>(
				"SELECT * FROM notes WHERE id = $1",
				[currentEntry()!.id],
			);

			const updatedEntry = updatedEntryResult[0];
			setCurrentEntry(updatedEntry);
		} catch (error) {
			console.error("Failed to update metadata:", error);
			toastService.error({ description: "Failed to update metadata" });
		}
	}

	return {
		currentEntry,
		setCurrentEntry,
		currentDate: () => journalStore.currentDate,
		loadEntry,
		updateEntryMetadata,
	};
}
