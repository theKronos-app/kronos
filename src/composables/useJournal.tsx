import { createSignal } from "solid-js";
import { createNote, readNote } from "@/lib/file-system/notes";
import type { Note } from "@/types/note";
import { format } from "date-fns";
import { toastService } from "@/components/toast";
import { journalStore, setJournalStore } from "@/store/journal-store";
import { getCurrentKronosphere } from "@/lib/file-system/kronospheres";
import { join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";

/**
 * Composable for managing journal entries. Handles:
 * - Current entry state and date tracking
 * - Loading existing entries by date
 * - Creating new entries if none exist
 * - Entry state management and updates
 */

export function useJournal() {
  const [currentEntry, setCurrentEntry] = createSignal<Note | null>(null);

  async function loadEntry(dateStr: string) {
    console.log("Loading entry for date:", dateStr);

    // Clear the current entry first
    setCurrentEntry(null);

    try {
      const currentKronosphere = await getCurrentKronosphere();
      if (!currentKronosphere) {
        throw new Error("No active Kronosphere");
      }

      const notePath = await join(
        currentKronosphere.path,
        "journal",
        "daily",
        `${dateStr}.md`,
      );

      const noteExists = await exists(notePath);
      let entry: Note;

      if (noteExists) {
        console.log("Found existing note, loading...");
        entry = await readNote(dateStr, "daily");
        console.log("Existing entry loaded:", entry);
      } else {
        console.log("No existing note found, creating new entry...");
        const initialContent = `## Journal Entry - ${format(
          new Date(dateStr),
          "MMMM do, yyyy",
        )}\n\n`;
        entry = await createNote(initialContent, "daily", dateStr);
        console.log("New entry created:", entry);

        // Verify the new entry was created and load it
        entry = await readNote(dateStr, "daily");
      }

      // Verify the entry ID matches the requested date
      if (entry.id !== dateStr) {
        throw new Error(
          `Entry ID mismatch: expected ${dateStr}, got ${entry.id}`,
        );
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

  return {
    currentEntry,
    setCurrentEntry,
    currentDate: () => journalStore.currentDate,
    loadEntry,
  };
}
