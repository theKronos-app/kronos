import { type JSX, onMount, createEffect } from "solid-js";
import Editor from "@/components/editor";
import { format } from "date-fns";
import { useJournal } from "@/composables/useJournal";
import { journalStore } from "@/store/journal-store";
import MetadataEditor from "@/components/metadata-editor";

export default function Journal(): JSX.Element {
	const [isLoading, setIsLoading] = createSignal(true);

	// // Initial load
	// onMount(async () => {
	//   setIsLoading(true);
	//   const today = format(new Date(), "yyyy-MM-dd");
	//   await loadEntry(today);
	//   setIsLoading(false);
	// });
	//
	// // Watch for store changes
	// createEffect(async () => {
	//   if (journalStore.currentDate) {
	//     setIsLoading(true);
	//     await loadEntry(journalStore.currentDate);
	//     setIsLoading(false);
	//   }
	// });
	//
	return <div class="h-full w-full">Journal</div>;
}
