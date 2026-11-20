// LEONIDA NIGHTS — the progress store: earned trophies, per-trophy counters and
// the spoiler setting, saved in localStorage and exportable/importable as JSON.
// Nothing here touches the network; the file the user exports is built in the
// browser and downloaded locally.

export const STORE_KEY = 'leonida-nights-v1';

function blankState() {
  return { earned: [], counters: {}, spoiler: true, version: 1 };
}

function cleanState(raw) {
  const state = blankState();
  if (!raw || typeof raw !== 'object') return state;
  if (Array.isArray(raw.earned)) state.earned = raw.earned.filter((n) => typeof n === 'string');
  if (raw.counters && typeof raw.counters === 'object') {
    for (const [key, value] of Object.entries(raw.counters)) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) state.counters[key] = Math.floor(n);
    }
  }
  if (typeof raw.spoiler === 'boolean') state.spoiler = raw.spoiler;
  return state;
}

export function loadStore() {
  try {
    return cleanState(JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'));
  } catch {
    return blankState();
  }
}

export function saveStore(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function isEarned(state, trophy) {
  return state.earned.includes(trophy.name);
}

export function toggleEarned(state, trophy) {
  const at = state.earned.indexOf(trophy.name);
  if (at === -1) state.earned.push(trophy.name);
  else state.earned.splice(at, 1);
  saveStore(state);
  return state;
}

export function counterValue(state, trophy) {
  return state.counters[String(trophy.id)] ?? 0;
}

export function setCounter(state, trophy, value) {
  const max = trophy.count ?? 0;
  const clamped = Math.max(0, max > 0 ? Math.min(max, value) : value);
  state.counters[String(trophy.id)] = clamped;
  saveStore(state);
  return clamped;
}

export function exportState(state) {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

export function importState(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('that file is not valid JSON');
  }
  const state = cleanState(parsed);
  saveStore(state);
  return state;
}

export function downloadFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
