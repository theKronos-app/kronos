// A kronosphere is basically a vault where all your files are kept.

import { mkdir, readDir } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";

interface Kronosphere {
  name: string;
  path: string;
  lastModified: number;
  lastOpened: number;
  active: boolean;
}

interface KronosphereState {
  kronospheres: Kronosphere[];
  currentKronosphere: Kronosphere | null;
}

const store = await load("kronospheres.json", { autoSave: true });

// Initialize store with default state if empty
const initializeStore = async () => {
  const state = await store.get<KronosphereState>("state");
  if (!state) {
    await store.set("state", {
      kronospheres: [],
      currentKronosphere: null,
    });
  }
};

await initializeStore();

export async function createKronosphere(
  name: string,
): Promise<Kronosphere | null> {
  try {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Select or Create a Kronosphere Directory",
    });

    if (!selectedPath) {
      console.log("No directory selected");
      return null;
    }

    await mkdir(selectedPath, { recursive: true });

    const newKronosphere: Kronosphere = {
      name,
      path: selectedPath as string,
      lastModified: Date.now(),
      lastOpened: Date.now(),
      active: true,
    };

    const state = await store.get<KronosphereState>("state");
    const updatedKronospheres = [
      ...(state?.kronospheres || []).map((k) => ({ ...k, active: false })),
      newKronosphere,
    ];

    await store.set("state", {
      kronospheres: updatedKronospheres,
      currentKronosphere: newKronosphere,
    });

    return newKronosphere;
  } catch (error) {
    console.error("Failed to create kronosphere:", error);
    throw error;
  }
}

export async function setCurrentKronosphere(
  kronosphere: Kronosphere,
): Promise<void> {
  try {
    const state = await store.get<KronosphereState>("state");
    if (!state) return;

    const updatedKronospheres = state.kronospheres.map((k) => ({
      ...k,
      active: k.path === kronosphere.path,
    }));

    await store.set("state", {
      kronospheres: updatedKronospheres,
      currentKronosphere: kronosphere,
    });
  } catch (error) {
    console.error("Failed to set current kronosphere:", error);
    throw error;
  }
}

export async function getCurrentKronosphere(): Promise<Kronosphere | null> {
  try {
    const state = await store.get<KronosphereState>("state");
    return state?.currentKronosphere || null;
  } catch (error) {
    console.error("Failed to get current kronosphere:", error);
    return null;
  }
}

export async function getAllKronospheres(): Promise<Kronosphere[]> {
  try {
    const state = await store.get<KronosphereState>("state");
    return state?.kronospheres || [];
  } catch (error) {
    console.error("Failed to get kronospheres:", error);
    return [];
  }
}
