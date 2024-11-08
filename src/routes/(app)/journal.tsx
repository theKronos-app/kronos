import { type JSX, onMount } from "solid-js";
import Editor from "@/components/editor";
import { format } from "date-fns";
import { useJournal } from "@/composables/useJournal";

export default function Journal(): JSX.Element {
  const { currentEntry, setCurrentEntry, currentDate, loadEntry } =
    useJournal();

  onMount(() => {
    if (!currentEntry()) {
      loadEntry(format(new Date(), "yyyy-MM-dd"));
    }
  });

  return (
    <div class="h-full w-full p-4">
      {/* <div class="flex items-center justify-between border-b p-4">
        <h1 class="text-xl font-semibold">
          Journal Entry - {format(new Date(currentDate()), "MMMM do, yyyy")}
        </h1>
        <button
          class="rounded bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => loadEntry(format(new Date(), "yyyy-MM-dd"))}
        >
          Go to Today
        </button>
      </div> */}
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
