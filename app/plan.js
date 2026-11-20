// LEONIDA NIGHTS — the "Next up" planner: the earliest ungated trophy left, and
// a transparent estimate of the time still ahead. The order follows the roadmap
// stages S1–S7, so the plan always points at the earliest stage with work left.

import { PLATINUM_HOURS, STAGES } from './data.js';
import { isEarned as earnedIn } from './store.js';

const STAGE_INDEX = Object.fromEntries(STAGES.map((s, i) => [s.id, i]));

export function sortForPlan(trophies) {
  return [...trophies].sort((a, b) => {
    const stageDiff = (STAGE_INDEX[a.stage] ?? 99) - (STAGE_INDEX[b.stage] ?? 99);
    if (stageDiff !== 0) return stageDiff;
    return a.id - b.id;
  });
}

// The next trophy to chase: the first unearned one in roadmap order, with the
// reason it is next (its stage, and whether it is missable or a watch item).
export function nextUp(trophies, state) {
  for (const trophy of sortForPlan(trophies)) {
    if (trophy.grade === 'platinum') continue;
    if (!earnedIn(state, trophy)) {
      const stage = STAGES[STAGE_INDEX[trophy.stage] ?? 0];
      let reason = `Earliest unfinished stage: ${stage.title}.`;
      if (trophy.missable) reason = 'Possibly missable — do this before its window closes. ' + reason;
      return { trophy, stage, reason };
    }
  }
  return { trophy: null, stage: null, reason: 'Every trophy is earned. The platinum is yours.' };
}

// Rough, transparent time math: the guides put the platinum at about 200 hours
// (PowerPyx) to 250 hours (Push Square), so the estimate scales the remaining
// trophies against that range instead of inventing a precise number.
export function timeEstimate(earnedCount, total) {
  const remaining = Math.max(0, total - earnedCount);
  if (remaining === 0) return 'Done — 0 hours left.';
  const low = Math.round((remaining / total) * PLATINUM_HOURS.low);
  const high = Math.round((remaining / total) * PLATINUM_HOURS.high);
  return `About ${low}–${high} hours left at the guides’ pace (${PLATINUM_HOURS.low}–${PLATINUM_HOURS.high} hours for the full platinum).`;
}

export function stageProgress(trophies, state, stageId) {
  const inStage = trophies.filter((t) => t.stage === stageId);
  const earned = inStage.filter((t) => earnedIn(state, t)).length;
  return { total: inStage.length, earned };
}
