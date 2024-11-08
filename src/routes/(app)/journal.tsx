import { type JSX, createSignal, onMount } from "solid-js";
import Editor from "@/components/editor";
import { createNote, readNote } from "@/lib/file-system/notes";
import type { Note } from "@/types/note";
import { format } from "date-fns";

const [state, setState] = createStore({
  curr,
});

export default function Journal(): JSX.Element {
  const [currentEntry, setCurrentEntry] = createSignal<Note | null>(null);

  const [currentDate, setCurrentDate] = createSignal<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  async function loadEntry(dateStr: string) {
    console.log("Loading entry for:", dateStr);

    try {
      const entry = await readNote(dateStr, "daily");
      console.log("Entry loaded:", entry);
      setCurrentEntry(entry);
      setCurrentDate(dateStr);
    } catch (error) {
      console.log("Creating new entry...");
      try {
        const initialContent = `# Journal Entry - ${format(
          new Date(dateStr),
          "MMMM do, yyyy",
        )}\n\n`;
        const newEntry = await createNote(initialContent, "daily");
        console.log("New entry created:", newEntry);
        setCurrentEntry(newEntry);
        setCurrentDate(dateStr);
      } catch (error) {
        console.error("Failed to create journal entry:", error);
      }
    }
  }

  // Load today's entry only if no entry is currently loaded
  onMount(() => {
    if (!currentEntry()) {
      loadEntry(format(new Date(), "yyyy-MM-dd"));
    }
  });

  return (
    <div class="h-full w-full p-4">
      <div class="flex items-center justify-between border-b p-4">
        <h1 class="text-xl font-semibold">
          Journal Entry - {format(new Date(currentDate()), "MMMM do, yyyy")}
        </h1>
        <button
          class="rounded bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => loadEntry(format(new Date(), "yyyy-MM-dd"))}
        >
          Go to Today
        </button>
      </div>
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
