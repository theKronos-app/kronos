import { createSignal } from "solid-js";
import type { Note } from "@/types/note";
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

			let entry: Note;

			if (existingEntry.length > 0) {
				console.log("Found existing note, loading...");
				entry = existingEntry[0];
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
							"daily",
							"",
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

	async function updateEntryMetadata(metadata: Note["metadata"]) {
		if (!currentEntry()) return;

		try {
			const db = await getDb();
			const now = Date.now();

			await db.execute(
				"UPDATE notes SET modified_at = ?, properties = ? WHERE id = ?",
				[now, JSON.stringify(metadata), currentEntry()!.id],
			);

			const updatedEntryResult = await db.select<Note[]>(
				"SELECT * FROM notes WHERE id = ?",
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
