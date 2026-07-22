// LocalStorage history

export interface HistoryEntry {
  id: string;
  timestamp: number;
  modelId: string;
  color: string;
  templateId: string;
  showPrice: boolean;
  customText: string;
  prompt: string;
  resultUrls: string[];
  additionalModels?: Array<{ modelId: string; color: string }>;
  inspoPreview?: string;
}

const KEY = "beebike-history";
const MAX_ENTRIES = 50;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const existing = loadHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function deleteHistoryEntry(id: string) {
  if (typeof window === "undefined") return;
  const existing = loadHistory();
  localStorage.setItem(KEY, JSON.stringify(existing.filter(e => e.id !== id)));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
