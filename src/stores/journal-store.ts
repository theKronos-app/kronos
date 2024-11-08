import { Store, load } from "@tauri-apps/plugin-store";
import type { Note } from "@/types/note";
import { format } from "date-fns";

interface JournalState {
  currentEntry: Note | null;
  selectedDate: string; // ISO string format
}

let store: Store | null = null;

async function initStore() {
  if (!store) {
    store = await load("journal.json", {
      defaults: {
        currentEntry: null,
        selectedDate: new Date().toISOString(),
      },
    });
  }
  return store;
}

export const journalStore = {
  async getCurrentEntry() {
    const store = await initStore();
    return store.get<Note | null>("currentEntry");
  },

  async setCurrentEntry(entry: Note | null) {
    const store = await initStore();
    await store.set("currententry", entry);
    await store.save();
  },

  async getselecteddate() {
    const store = await initstore();
    const datestr = await store.get<string>("selecteddate");
    return new date(datestr);
  },

  async setselecteddate(date: date) {
    const store = await initstore();
    await store.set("selecteddate", date.toisostring());
    await store.save();
  },

  async clear() {
    const store = await initstore();
    await store.clear();
    await store.save();
  },
};
