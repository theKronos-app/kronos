// A kronosphere is basically a vault where all your files are kept.

import { mkdir, readDir, exists } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
import { join } from "@tauri-apps/api/path";

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

export async function isValidKronosphere(path: string): Promise<boolean> {
  try {
    const kronosDir = await join(path, ".kronos");
    return await exists(kronosDir);
  } catch (error) {
    console.error("Failed to check if valid kronosphere:", error);
    return false;
  }
}

export async function createKronosphere(
  name: string,
): Promise<Kronosphere | null> {
  try {
    const parentPath = await open({
      directory: true,
      multiple: false,
      title: "Select Parent Directory for Kronosphere",
    });

    if (!parentPath) {
      console.log("No directory selected");
      return null;
    }

    // Create the kronosphere directory with the given name
    const kronospherePath = await join(parentPath as string, name);
    await mkdir(kronospherePath, { recursive: true });
    
    // Create .kronos directory inside the kronosphere directory
    const kronosDir = await join(kronospherePath, ".kronos");
    await mkdir(kronosDir, { recursive: true });

    const newKronosphere: Kronosphere = {
      name,
      path: kronospherePath,
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

export async function openExistingKronosphere(): Promise<Kronosphere | null> {
  try {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Select Existing Kronosphere Directory",
    });

    if (!selectedPath) {
      return null;
    }

    if (!(await isValidKronosphere(selectedPath as string))) {
      throw new Error("Selected directory is not a valid Kronosphere");
    }

    const name = selectedPath.split("/").pop() || "Unnamed Kronosphere";
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
    console.error("Failed to open kronosphere:", error);
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
