// The platinum roadmap: seven stages in play order, the watch list, and the
// counters the game itself tracks. Stages are built from the trophies' own
// "stage" field; the text here says what to do in each stage and why.
export const STAGES = [
  {
    code: 'S1',
    title: 'Chapter 1 — First steps',
    text: 'Learn the map, start the meditation spots from day one, and keep a manual save before the chapter’s final mission. The cocktail on Ocean Beach is the easiest bronze in the list — do it now.',
  },
  {
    code: 'S2',
    title: 'Chapter 2 — The crew',
    text: 'The first heist lands here. Do the partner trophies (Hot Together, Retail Therapy) while your partner is riding with you — they are watched, not missable, but the moment passes.',
  },
  {
    code: 'S3',
    title: 'Chapter 3 — Vice City opens',
    text: 'The city is wide open now. Start the drone races and the shooting range between missions, and case the jewelry store for the stealth robbery.',
  },
  {
    code: 'S4',
    title: 'Chapter 4 & the finale',
    text: 'The last chapter and the final mission. Check the watch list before the finale, stock up, and play the ending in one sitting if you can.',
  },
  {
    code: 'S5',
    title: 'Strangers & side stories',
    text: 'Free roam after the credits. Finish the stranger strands — Andy, Kenton, Billy, Randy, Tyrone and three more — plus fishing, the arcade and the bowling alley.',
  },
  {
    code: 'S6',
    title: 'Activities & collectibles',
    text: 'The long grinds, with the whole map open: 250 stunts, 42 shooting-range golds, 100 WAiNK It spots, 100 vehicles, card sets and the last of the map.',
  },
  {
    code: 'S7',
    title: 'Crime, money & the platinum',
    text: 'Five bank vaults, one robbery per gang, the money trophies, and 100% completion. The platinum pops when the last of these does.',
  },
];

// The watch list: one possibly missable trophy, five to watch. Each entry says why.
export const WATCH = [
  {
    id: 28,
    status: 'Possibly missable',
    danger: true,
    reason: 'Sources disagree on the count — PowerPyx lists 18 meditation spots, other guides list 15. Meditate at every spot you pass from Chapter 1, aim for 18, and keep a manual save from early Chapter 1 in case a spot turns out to be chapter-locked.',
  },
  {
    id: 33,
    status: 'Watch',
    danger: false,
    reason: 'Needs your partner riding with you at 4 stars wanted. Do it in S2, while the partner is available in the story — after the finale the moment may not come back the same way.',
  },
  {
    id: 34,
    status: 'Watch',
    danger: false,
    reason: 'Three shops back-to-back with your partner, without losing your wanted level. Plan a route through three nearby shops first; the chain breaks if the heat drops between robberies.',
  },
  {
    id: 39,
    status: 'Watch',
    danger: false,
    reason: 'Undetected only. If you are spotted, the attempt fails the condition — case the store first, go in quiet, and leave and retry another day if the alarm trips.',
  },
  {
    id: 37,
    status: 'Watch',
    danger: false,
    reason: 'An unscheduled departure at VCIA: find a plane, take off before security reaches you. It is a one-shot free-roam moment — plan it before going loud at the airport.',
  },
  {
    id: 48,
    status: 'Watch',
    danger: false,
    reason: 'A story choice, for better or worse. Either choice pops the trophy, but the choice itself shapes the story — keep a manual save before the big decision moments.',
  },
];

// Guides whose facts are not pinned down yet — the app says so, instead of
// claiming a certainty no source supports.
export const UNCONFIRMED = [28, 49, 50];

// Counters the game tracks, with their targets. The detail panel offers + / −.
export const COUNTERS = [
  { id: 28, target: 18, label: 'Meditations', trophy: 'Positive Mental Attitude' },
  { id: 15, target: 250, label: 'Stunts', trophy: 'Cunning Stunts' },
  { id: 17, target: 42, label: 'Shooting Range golds', trophy: 'The Shootist' },
  { id: 19, target: 20, label: 'Race wins', trophy: 'Earn Cash, Not Kudos' },
  { id: 30, target: 3, label: 'Card sets', trophy: 'Don’t Touch My Deck' },
  { id: 31, target: 100, label: 'WAiNK It locations', trophy: 'You WAiNKer!' },
  { id: 32, target: 50, label: 'Challenges', trophy: 'One Last Thing' },
  { id: 35, target: 100, label: 'Vehicles discovered', trophy: 'Whip It Good' },
];

export function counterFor(id) {
  return COUNTERS.find((c) => c.id === id) ?? null;
}

// The next trophy to chase: the earliest stage, then the earliest id, not yet earned.
export function nextUp(trophies, earned) {
  const order = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
  const rest = trophies.filter((t) => !earned.has(t.id));
  rest.sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage) || a.id - b.id);
  return rest.slice(0, 5);
}

export function stageTrophies(trophies, code) {
  return trophies.filter((t) => t.stage === code).sort((a, b) => a.id - b.id);
}
