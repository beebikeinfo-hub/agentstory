export const DEFAULT_COPY_CHIPS = [
  "Bez registracije. Bez dozvole.",
  "Besplatna dostava u Srbiji",
  "Garancija 2 godine",
  "Domet do 60 km",
  "Punjenje preko noći",
  "Dostupno u BG, NS, KV",
];

const KEY = "beebike-copy-chips";

export function loadCopyChips(): string[] {
  if (typeof window === "undefined") return DEFAULT_COPY_CHIPS;
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULT_COPY_CHIPS;
    return JSON.parse(stored);
  } catch {
    return DEFAULT_COPY_CHIPS;
  }
}

export function saveCopyChips(chips: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(chips));
}

export function addCopyChip(chip: string) {
  const current = loadCopyChips();
  if (current.includes(chip)) return current;
  const updated = [...current, chip];
  saveCopyChips(updated);
  return updated;
}

export function removeCopyChip(chip: string) {
  const current = loadCopyChips();
  const updated = current.filter(c => c !== chip);
  saveCopyChips(updated);
  return updated;
}

export function resetCopyChips() {
  saveCopyChips(DEFAULT_COPY_CHIPS);
  return DEFAULT_COPY_CHIPS;
}
