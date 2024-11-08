import { type JSX, onMount, createEffect } from "solid-js";
import Editor from "@/components/editor";
import { format } from "date-fns";
import { useJournal } from "@/composables/useJournal";
import { journalStore } from "@/store/journal-store";

export default function Journal(): JSX.Element {
  const { currentEntry, setCurrentEntry, loadEntry } = useJournal();
  const [isLoading, setIsLoading] = createSignal(true);

  // Initial load
  onMount(async () => {
    setIsLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");
    await loadEntry(today);
    setIsLoading(false);
  });

  // Watch for store changes
  createEffect(async () => {
    if (journalStore.currentDate) {
      setIsLoading(true);
      await loadEntry(journalStore.currentDate);
      setIsLoading(false);
    }
  });

  return (
    <div class="h-full w-full p-4">
      {!isLoading() && currentEntry() && (
        <Editor
          noteId={currentEntry()!.id}
          type="daily"
          onSave={(note) => setCurrentEntry(note)}
        />
      )}
    </div>
  );
}
