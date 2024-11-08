import { createStore } from "solid-js/store";
import { format } from "date-fns";

type JournalStore = {
  currentDate: string;
};

export const [journalStore, setJournalStore] = createStore<JournalStore>({
  currentDate: format(new Date(), "yyyy-MM-dd"),
});
