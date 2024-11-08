import { createSignal } from "solid-js";
import { createNote, readNote } from "@/lib/file-system/notes";
import type { Note } from "@/types/note";
import { format } from "date-fns";
import { toastService } from "@/components/toast";
import { journalStore, setJournalStore } from "@/store/journal-store";

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
    try {
      const entry = await readNote(dateStr, "daily");
      setCurrentEntry(entry);
      setJournalStore("currentDate", dateStr);
    } catch {
      try {
        const initialContent = `# Journal Entry - ${format(
          new Date(dateStr),
          "MMMM do, yyyy",
        )}\n\n`;
        const newEntry = await createNote(initialContent, "daily");
        setCurrentEntry(newEntry);
        setJournalStore("currentDate", dateStr);
      } catch (error) {
        toastService.error({ description: "Failed to create journal entry" });
      }
    }
  }

  return {
    currentEntry,
    setCurrentEntry,
    currentDate: () => journalStore.currentDate,
    loadEntry,
  };
}
