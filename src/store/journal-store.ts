import { createStore } from "solid-js/store";
import { format } from "date-fns";

type JournalStore = {
  currentDate: string;
  lastOpenedDate: string | null;
};

// Try to get last opened date from localStorage
const storedLastOpened = localStorage.getItem("lastOpenedDate");

export const [journalStore, setJournalStore] = createStore<JournalStore>({
  currentDate: storedLastOpened || format(new Date(), "yyyy-MM-dd"),
  lastOpenedDate: storedLastOpened
});

// Watch for date changes and persist to localStorage
createEffect(() => {
  if (journalStore.currentDate) {
    localStorage.setItem("lastOpenedDate", journalStore.currentDate);
    setJournalStore("lastOpenedDate", journalStore.currentDate);
  }
});
