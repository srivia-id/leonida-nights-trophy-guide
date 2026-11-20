// LEONIDA NIGHTS — the guide's reference data: the sources every guide cites,
// the platinum roadmap's seven stages, and the missables watch list.
// Trophy data itself lives in data/trophies.json (the official list + our guides).
// Source ids here are the numbers each trophy's "sources" field points at.

export const SOURCES = [
  {
    id: 1,
    name: 'PowerPyx',
    title: 'GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/',
    read: '21 Nov 2026',
    note: 'Roadmap, difficulty 4/10, about 200 hours, the one possibly missable trophy, cheats.',
  },
  {
    id: 2,
    name: 'Vice City Hustle',
    title: 'GTA 6 Trophy List: All 55 Trophies and Achievements',
    url: 'https://www.vicecityhustle.com/guides/gta-6-trophy-list-all-55-trophies',
    read: '21 Nov 2026',
    note: 'Full list with grades, the 28 hidden trophies by chapter, per-trophy conditions and counts.',
  },
  {
    id: 3,
    name: 'GameMapa',
    title: 'All 55 GTA 6 Trophies: Full List, Gamerscore and Platinum Roadmap',
    url: 'https://gamemapa.com/en/gta-6/guides/gta-6-trophy-achievement-list/',
    read: '21 Nov 2026',
    note: 'Cross-check of the list against PowerPyx and GamesRadar+, plus the missable warning.',
  },
  {
    id: 4,
    name: 'Sixshore',
    title: 'GTA 6 Trophy and Achievement List: All 55, Missables and Roadmap',
    url: 'https://sixshore.com/gta-6/guides/trophies-and-achievements/',
    read: '21 Nov 2026',
    note: 'List cross-check: 28 hidden, 0 online trophies, about 200 to 250 hours.',
  },
  {
    id: 5,
    name: 'Exophase',
    title: 'GTA VI trophy list',
    url: null,
    read: '21 Nov 2026',
    note: 'Official names, descriptions and grades as the kit starter carries them.',
  },
  {
    id: 6,
    name: 'PSNProfiles',
    title: 'GTA VI trophy list',
    url: null,
    read: '21 Nov 2026',
    note: 'PSN-tracked counts behind the numbers in the guides (42 range challenges, 18 meditations).',
  },
  {
    id: 7,
    name: 'GTABase',
    title: 'GTA VI achievement list and cheat notes',
    url: null,
    read: '21 Nov 2026',
    note: 'Cheat block lasts for the current session; list counts cross-checked against it.',
  },
  {
    id: 8,
    name: 'Official PlayStation list (kit starter)',
    title: 'The official 55 trophies, 2026-11-18',
    url: null,
    read: '21 Nov 2026',
    note: 'The starter’s official list: every name, description and grade in this guide comes from it.',
  },
];

export const KINDS = [
  { id: 'all', label: 'All 55' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'side', label: 'Side' },
  { id: 'crime', label: 'Crime' },
  { id: 'money', label: 'Money' },
  { id: 'exploration', label: 'Exploration' },
  { id: 'misc', label: 'Misc' },
  { id: 'online', label: 'Online (0)' },
];

export const STAGES = [
  {
    id: 'S1',
    title: 'Chapter 1 — Open Leonida',
    hours: 'about 12 hours',
    blurb:
      'Play the opening chapter and start everything that grows over time: scan vehicles, open WAiNK It at every notable spot, try each activity once, and meditate at Jason’s house the moment the game offers it. That meditation may not come back.',
  },
  {
    id: 'S2',
    title: 'Chapter 2 — Partners and the state',
    hours: 'about 15 hours',
    blurb:
      'The map opens up. Take the Scooter Bros app from Moses, start Billy’s jobs at the Thrillbilly Mudclub, and begin Bret’s hunting quests as Jason. Keep scanning and stunting as you travel.',
  },
  {
    id: 'S3',
    title: 'Chapter 3 — Vice City',
    hours: 'about 15 hours',
    blurb:
      'The story moves into Vice City. Do Yasmani’s jobs for the Snap Gun, which opens the quiet way into a jewelry store, and keep the collectible and activity counts climbing.',
  },
  {
    id: 'S4',
    title: 'Chapter 4 — The big jobs',
    hours: 'about 15 hours',
    blurb:
      'Four story missions and the chapter trophy land here. Take the optional mission that opens bank vaults, then rob vaults with a getaway planned: every one brings a four-star wanted level.',
  },
  {
    id: 'S5',
    title: 'Chapter 5 — The endgame',
    hours: 'about 10 hours',
    blurb:
      'The last story missions and the final mission, which earns the gold story trophy. After the credits the game returns you to free roam and the 100% Completion checklist opens.',
  },
  {
    id: 'S6',
    title: 'After the story — the 100% checklist',
    hours: 'about 100 hours',
    blurb:
      'Work the checklist under Progress, then Stats, then 100% Completion. Finish the full rows first — all robberies, underwater discoveries, shooting ranges, drone races and Bret’s quests — then the partial rows: 70 of 80 challenges, 200 of 277 vehicles, 100 of 255 animals, 50 of 66 weapons.',
  },
  {
    id: 'S7',
    title: 'Cleanup — side finals and the last secrets',
    hours: 'about 10 hours',
    blurb:
      'Finish the side-character final missions, the eight Strangers & Freaks strands, and the five trophies whose triggers the guides have not confirmed yet. The platinum pops with the last trophy you earn.',
  },
];

// The watch list: the one possibly missable trophy, plus five things that are
// easy to overlook or get wrong even though they cannot be missed.
export const WATCH = [
  {
    trophyId: 28,
    level: 'possible',
    title: 'Positive Mental Attitude — possibly missable',
    why: 'The first meditation spot is offered at Jason’s house in Chapter 1 and becomes permanently unavailable once that chapter ends. Nobody has confirmed yet whether the trophy needs that exact spot.',
    action: 'Meditate the moment the Chapter 1 prompt appears, and keep a manual save from the start of Chapter 1.',
  },
  {
    trophyId: 20,
    level: 'watch',
    title: 'Baited My Tackle — easy to miss the invite',
    why: 'Cal only invites you by text after a Chapter 1 mission, marked with a purple icon. Ignore the message and the challenge never starts.',
    action: 'Watch your phone in Chapter 1 and answer Cal’s text when it arrives.',
  },
  {
    trophyId: 48,
    level: 'watch',
    title: 'Actions Speak Louder — the permanent profile',
    why: '500 actions change your Criminal Profile, and the guides warn against pushing toward the Irredeemable profile: it is permanent.',
    action: 'Vary your actions and check where the profile is heading; do not chase one extreme.',
  },
  {
    trophyId: 17,
    level: 'watch',
    title: 'The Shootist — start early, chip away',
    why: '42 gold medals across 12 ranges, and every one is also required for 100% completion. Left to the end it becomes a long grind.',
    action: 'Gold each range’s challenges when you find it, instead of saving all 42 for cleanup.',
  },
  {
    trophyId: 25,
    level: 'watch',
    title: 'Strangers & Freaks — only some strands count',
    why: 'Kirk, Kyle, Yago and Pilot Pete count; Moses, Tyrone, Yasmani, Andy and Billy do not, because they have their own trophies.',
    action: 'Prioritise the four counting strangers and do not rely on the side-character finals for this trophy.',
  },
  {
    trophyId: 14,
    level: 'watch',
    title: 'A Long Road — the checklist is the platinum',
    why: '100% completion needs 70 of 80 challenges, 200 of 277 vehicles, 100 of 255 animals and 50 of 66 weapons — all of which grow only if you scan and study while travelling.',
    action: 'Scan vehicles and study animals through binoculars from Chapter 1, so the counts are already high after the story.',
  },
];

// Trophies whose exact trigger no guide has confirmed yet (5 of them).
export const UNCONFIRMED = [44, 45, 49, 50, 51];

// The guides' time range for the full platinum: about 200 hours (PowerPyx) to
// 250 hours (Push Square). Kept here so every estimate in the app quotes the
// same range from the same place.
export const PLATINUM_HOURS = { low: 200, high: 250, sources: 'PowerPyx / Push Square' };

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export function gradeLetter(grade) {
  return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] ?? '?';
}

export function sourceById(id) {
  return SOURCES.find((s) => s.id === id) ?? null;
}

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id) ?? null;
}

export function stageOf(trophy) {
  return STAGES.find((s) => s.id === trophy.stage) ?? STAGES[0];
}

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  const doc = await response.json();
  return doc.trophies;
}

export function countSteps(trophies) {
  return trophies.reduce((n, t) => n + (t.steps?.length ?? 0), 0);
}

export function citedGuides(trophies) {
  return trophies.filter((t) => (t.sources?.length ?? 0) > 0 && (t.guide ?? '').trim() !== '').length;
}

// The trophies that cite one source, in list order — the source matrix's rows.
export function trophiesCiting(trophies, sourceId) {
  return trophies.filter((t) => (t.sources ?? []).includes(sourceId));
}
