import { type JSX, createSignal, onMount } from "solid-js";
import Editor from "@/components/editor";
import { createNote, readNote } from "@/lib/file-system/notes";
import type { Note } from "@/types/note";
import { format } from "date-fns";

export default function Journal(): JSX.Element {
  const [currentEntry, setCurrentEntry] = createSignal<Note | null>(null);

  async function loadOrCreateTodayEntry() {
    const today = format(new Date(), "yyyy-MM-dd");
    console.log("Loading today's entry:", today);

    try {
      const entry = await readNote(today, "daily");
      console.log("Entry loaded:", entry);
      setCurrentEntry(entry);
    } catch (error) {
      console.log("Creating new entry...");
      try {
        // Create with initial content
        const initialContent = `# Journal Entry - ${format(new Date(), "MMMM do, yyyy")}\n\n`;
        const newEntry = await createNote(initialContent, "daily");
        console.log("New entry created:", newEntry);
        setCurrentEntry(newEntry);
      } catch (error) {
        console.error("Failed to create today's journal entry:", error);
      }
    }
  }

  onMount(() => {
    loadOrCreateTodayEntry();
  });
  return (
    <div class="h-full w-full p-4">
      {currentEntry() && currentEntry()?.id && (
        <Editor
          noteId={currentEntry()!.id}
          type="daily"
          onSave={(note) => setCurrentEntry(note)}
        />
      )}
    </div>
  );
}
