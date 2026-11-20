// LEONIDA NIGHTS — saved progress. One localStorage key holds the whole
// tracker state: which trophies are earned, the per-trophy counters, the
// Chapter 1 balcony meditation, and the spoiler setting.
const STORAGE_KEY = 'leonida-nights-v1';

export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      counters: new Map(Object.entries(parsed.counters || {}).map(([k, v]) => [Number(k), Number(v) || 0])),
      balconyDone: parsed.balconyDone === true,
      spoilerOn: parsed.spoilerOn !== false,
    };
  } catch {
    return freshState();
  }
}

export function freshState() {
  return { earned: new Set(), counters: new Map(), balconyDone: false, spoilerOn: true };
}

export function saveState(state) {
  const payload = {
    earned: [...state.earned].sort((a, b) => a - b),
    counters: Object.fromEntries(state.counters),
    balconyDone: state.balconyDone,
    spoilerOn: state.spoilerOn,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function exportState(state) {
  const payload = saveState(state);
  return { app: 'LEONIDA NIGHTS — GTA VI Trophy Guide & Tracker', version: 1, exportedAt: new Date().toISOString(), ...payload };
}

export function importState(text) {
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55) : [];
  const counters = {};
  if (parsed.counters && typeof parsed.counters === 'object') {
    for (const [k, v] of Object.entries(parsed.counters)) {
      const id = Number(k);
      if (Number.isInteger(id) && id >= 1 && id <= 55 && Number.isFinite(Number(v)) && Number(v) >= 0) counters[id] = Math.floor(Number(v));
    }
  }
  return {
    earned: new Set(earned),
    counters: new Map(Object.entries(counters).map(([k, v]) => [Number(k), v])),
    balconyDone: parsed.balconyDone === true,
    spoilerOn: parsed.spoilerOn !== false,
  };
}
