import { type JSX, onMount, createEffect, Show } from "solid-js";
import Editor from "@/components/editor";
import { format } from "date-fns";
import type { NoteType } from "@/types/note";
import { useJournal } from "@/composables/useJournal";
import { journalStore } from "@/store/journal-store";
import MetadataEditor from "@/components/metadata-editor";
import { toastService } from "@/components/toast";

export default function Journal(): JSX.Element {
	const { currentEntry, setCurrentEntry, loadEntry, updateEntryMetadata } =
		useJournal();
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
		<div class="h-full w-full relative ">
			<Show when={!isLoading()} fallback={<div>Loading...</div>}>
				{currentEntry() ? (
					<div class="flex gap-8">
						{/* <MetadataEditor */}
						{/* 	metadata={currentEntry()!.metadata || {}} */}
						{/* 	onChange={(metadata) => { */}
						{/* 		const updatedNote = { */}
						{/* 			...currentEntry()!, */}
						{/* 			metadata, */}
						{/* 		}; */}
						{/* 		setCurrentEntry(updatedNote); */}
						{/* 	}} */}
						{/* /> */}
						<div class="fixed top-20 w-64">
							<MetadataEditor
								note={currentEntry()!}
								onChange={(note) => {
									// Handle tag updates and linked notes
									updateEntryMetadata({
										...note,
										tags: note.tags,
										linkedNotes: note.linkedNotes || []
									});
								}}
							/>
						</div>
						<div class="flex-1"></div>
						<div class="p-4 max-w-[900px]">
							<Editor
								noteId={currentEntry()!.id}
								type="daily" as NoteType
								onSave={(note) => setCurrentEntry(note)}
							/>
						</div>

						<div class="flex-1"></div>
					</div>
				) : (
					<div>Failed to load journal entry</div>
				)}
			</Show>
		</div>
	);
}
