import type { StorageData } from "./types";

const KEY = "tp-v6";

export function load(): StorageData | null {
  try {
    const d = localStorage.getItem(KEY);
    return d ? JSON.parse(d) : null;
  } catch {
    return null;
  }
}

export function save(d: StorageData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}
