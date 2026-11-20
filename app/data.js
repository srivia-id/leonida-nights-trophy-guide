// LEONIDA NIGHTS — guide data. Loads app/data/trophies.json once and
// answers every counting question the audit strip, the Sources tab and the
// planner ask, straight from that file, so no number on screen is typed by
// hand and every claim can be re-checked against the data.
export async function loadGuide() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  return response.json();
}

export function trophyById(data, id) {
  return data.trophies.find((t) => t.id === id);
}

export function gradeCounts(data) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of data.trophies) counts[t.grade] = (counts[t.grade] || 0) + 1;
  return counts;
}

export function sourcesOfTrophy(trophy) {
  const ids = new Set();
  for (const step of trophy.steps || []) {
    for (const n of step.sources || []) ids.add(n);
  }
  return [...ids].sort((a, b) => a - b);
}

export function citedByCount(data, sourceId) {
  const source = data.sources.find((s) => s.id === sourceId);
  if (source && source.list) return data.trophies.length;
  let count = 0;
  for (const t of data.trophies) {
    if (sourcesOfTrophy(t).includes(sourceId)) count += 1;
  }
  return count;
}

export function isMasked(trophy, state) {
  return state.spoilerOn && trophy.hidden && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

export function kindLabel(kind) {
  return { story: 'Story', side: 'Side', collectibles: 'Collectibles', activities: 'Activities', crime: 'Crime', money: 'Money', misc: 'Misc' }[kind] || kind;
}

export function auditStats(data) {
  const grades = gradeCounts(data);
  let totalSteps = 0;
  let citedSteps = 0;
  let guidesCiting = 0;
  let singleSource = 0;
  for (const t of data.trophies) {
    const sources = sourcesOfTrophy(t);
    if (sources.length > 0) guidesCiting += 1;
    if (sources.length === 1) singleSource += 1;
    for (const step of t.steps || []) {
      totalSteps += 1;
      if (step.sources && step.sources.length > 0) citedSteps += 1;
    }
  }
  return {
    total: data.trophies.length,
    grades,
    hidden: data.trophies.filter((t) => t.hidden).length,
    guidesCiting,
    totalSteps,
    citedSteps,
    sourcesRead: data.sources.length,
    possiblyMissable: data.trophies.filter((t) => t.missable === 'possible').length,
    watch: data.watch.length,
    unconfirmed: data.trophies.filter((t) => t.unconfirmed).length,
    disagree: data.trophies.filter((t) => t.disagree).length,
    singleSource,
  };
}

export function auditStripText(data) {
  const s = auditStats(data);
  const gradePart = `${s.grades.platinum}P ${s.grades.gold}G ${s.grades.silver}S ${s.grades.bronze}B`;
  return `${s.total} official · ${gradePart} · ${s.hidden} hidden · ${s.guidesCiting}/${s.total} guides cite a source · ${s.citedSteps}/${s.totalSteps} steps cited · ${s.sourcesRead} sources read 20 Nov 2026 · ${s.possiblyMissable} possibly missable · ${s.watch} watch · ${s.unconfirmed} unconfirmed · ${s.disagree} disagree · ${s.singleSource} single-source`;
}

export function remainingHours(data, state) {
  let total = 0;
  let remaining = 0;
  for (const stage of data.stages) {
    total += stage.hours;
    const members = data.trophies.filter((t) => t.stage === stage.id);
    const unearned = members.filter((t) => !state.earned.has(t.id)).length;
    remaining += stage.hours * (unearned / members.length);
  }
  return { total, remaining: Math.round(remaining) };
}
