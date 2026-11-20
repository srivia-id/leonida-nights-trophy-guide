// The trophy data and the sources every guide cites. Sources are named, never copied:
// each guide is written in our own words, and each step carries the number of the
// source its facts come from. Read 19-20 Nov 2026.
export const SOURCES = [
  { id: 1, name: 'PowerPyx', title: 'GTA 6 Trophy Guide', place: 'powerpyx.com', read: '20 Nov 2026' },
  { id: 2, name: 'Exophase', title: 'GTA VI Trophies', place: 'exophase.com', read: '19 Nov 2026' },
  { id: 3, name: 'PSNProfiles', title: 'GTA VI Trophy List', place: 'psnprofiles.com', read: '19 Nov 2026' },
  { id: 4, name: 'OutputLag', title: 'GTA 6 Trophy Guide', place: 'outputlag.com', read: '20 Nov 2026' },
  { id: 5, name: 'KeenGamer', title: 'GTA 6 Trophy Guide', place: 'keengamer.com', read: '20 Nov 2026' },
  { id: 6, name: 'eGamers', title: 'GTA 6 Trophies', place: 'egamers.com', read: '20 Nov 2026' },
  { id: 7, name: 'GTA-Zone', title: 'GTA 6 Trophy List', place: 'gta-zone.com', read: '19 Nov 2026' },
  { id: 8, name: 'GTABase', title: 'GTA VI Trophies', place: 'gtabase.com', read: '19 Nov 2026' },
  { id: 9, name: 'GTA Vibes', title: 'GTA 6 Trophy Guide', place: 'gtavibes.com', read: '20 Nov 2026' },
  { id: 10, name: 'Official list (kit)', title: 'The official 55 trophies, as PlayStation publishes them', place: 'kit starter, 18 Nov 2026', read: '18 Nov 2026' },
];

export function sourceById(id) {
  return SOURCES.find((s) => s.id === id) ?? null;
}

// Load the official trophy list with our own-words guides.
export async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  const doc = await res.json();
  return doc.trophies;
}

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  side: 'Side',
  crime: 'Crime',
  money: 'Money',
  misc: 'Misc',
  online: 'Online',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? kind;
}

export function gradeLabel(grade) {
  return grade === 'platinum' ? 'P' : grade === 'gold' ? 'G' : grade === 'silver' ? 'S' : 'B';
}

// How many trophies a source supports: count the guides that cite it.
export function sourceCitationCount(trophies, sourceId) {
  return trophies.filter((t) => (t.sources ?? []).includes(sourceId)).length;
}

// How many of the trophy's steps cite a source (every step carries one).
export function citedSteps(trophies) {
  return trophies.reduce((n, t) => n + (t.steps ?? []).filter((s) => s.s).length, 0);
}

export function totalSteps(trophies) {
  return trophies.reduce((n, t) => n + (t.steps ?? []).length, 0);
}
