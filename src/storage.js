const KEY = "tp-v6";

export function load() {
  try {
    const d = localStorage.getItem(KEY);
    return d ? JSON.parse(d) : null;
  } catch {
    return null;
  }
}

export function save(d) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}
