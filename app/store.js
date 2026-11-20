// Progress saved in the browser: earned trophies, counters, spoiler setting,
// revealed story trophies, and the selected trophy. Export and import as JSON.
const KEY = 'leonida-nights-v1';

function readState() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export const store = {
  earned: new Set(readState().earned ?? []),
  counters: readState().counters ?? {},
  spoiler: readState().spoiler ?? true,
  revealed: new Set(readState().revealed ?? []),
  selected: readState().selected ?? 28,

  save() {
    writeState({
      earned: [...this.earned],
      counters: this.counters,
      spoiler: this.spoiler,
      revealed: [...this.revealed],
      selected: this.selected,
    });
  },

  toggleEarned(id) {
    if (this.earned.has(id)) this.earned.delete(id);
    else this.earned.add(id);
    this.save();
  },

  setCounter(id, value, max) {
    const clamped = Math.max(0, Math.min(max, value));
    this.counters[id] = clamped;
    this.save();
    return clamped;
  },

  counter(id) {
    return this.counters[id] ?? 0;
  },

  exportJson() {
    return JSON.stringify(
      { app: 'leonida-nights', earned: [...this.earned], counters: this.counters },
      null,
      2,
    );
  },

  // Import a file exported by this app (or a hand-made one with the same shape).
  importJson(text) {
    const data = JSON.parse(text);
    if (!Array.isArray(data.earned)) throw new Error('no earned list in file');
    this.earned = new Set(data.earned.filter((id) => Number.isInteger(id)));
    if (data.counters && typeof data.counters === 'object') this.counters = data.counters;
    this.save();
  },
};

export function downloadProgress() {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-nights-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
