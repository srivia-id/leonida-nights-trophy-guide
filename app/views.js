// The checklist view: the trophy list, the selected trophy's detail panel,
// the right rail (sources + next up), and the audit strip. Everything is built
// from the data, so the strip's claims are always true of the app.
import { SOURCES, kindLabel, sourceById, sourceCitationCount, citedSteps, totalSteps } from './data.js';
import { store } from './store.js';
import { WATCH, UNCONFIRMED, counterFor, nextUp } from './plan.js';

export function isMasked(t) {
  return store.spoiler && t.hidden && !store.earned.has(t.id) && !store.revealed.has(t.id);
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function gradeBadge(t) {
  const b = el('span', 'grade-badge grade-' + t.grade, t.grade === 'platinum' ? 'Platinum' : t.grade === 'gold' ? 'Gold' : t.grade === 'silver' ? 'Silver' : 'Bronze');
  return b;
}

export function renderAuditStrip(trophies) {
  const strip = document.getElementById('auditStrip');
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) grades[t.grade]++;
  const hidden = trophies.filter((t) => t.hidden).length;
  const cited = trophies.filter((t) => (t.sources ?? []).length > 0).length;
  const steps = totalSteps(trophies);
  const citedCount = citedSteps(trophies);
  const single = trophies.filter((t) => (t.sources ?? []).length === 1).length;
  strip.replaceChildren();
  const parts = [
    `${trophies.length} official`,
    `${grades.platinum}P ${grades.gold}G ${grades.silver}S ${grades.bronze}B`,
    `${hidden} hidden`,
    `${cited}/${trophies.length} guides cite a source`,
    `${citedCount}/${steps} steps cited`,
    `${SOURCES.length} sources read 19/20 Nov 2026`,
    '1 possibly missable',
    `${WATCH.length} on watch`,
    `${UNCONFIRMED.length} unconfirmed`,
    `${single} single-source`,
    'time to platinum ≈163 h',
    'No Rockstar artwork',
  ];
  parts.forEach((p, i) => {
    if (i > 0) strip.append(document.createTextNode(' · '));
    const s = el('span', null, p);
    if (p === '1 possibly missable') s.className = 'warn-word';
    strip.append(s);
  });
  const b = el('b', null, ' — in our own words, every step cited.');
  strip.append(b);
}

export function renderChecklist(trophies, filter, onSelect) {
  const list = document.getElementById('trophyList');
  list.replaceChildren();
  const q = (filter.search ?? '').trim().toLowerCase();
  const shown = trophies.filter((t) => {
    if (filter.kind === 'missable' && !t.missable) return false;
    if (filter.kind === 'online') return false;
    if (filter.kind !== 'all' && filter.kind !== 'missable' && t.kind !== filter.kind) return false;
    if (filter.grade !== 'all' && t.grade !== filter.grade) return false;
    if (filter.earnedOnly && !store.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
  document.getElementById('filterCount').textContent = `${shown.length} of ${trophies.length} shown`;
  if (shown.length === 0) {
    list.append(el('li', 'empty-note', filter.kind === 'online' ? 'No online trophies in this list — every trophy is earned offline.' : 'No trophies match these filters.'));
    return;
  }
  for (const t of shown) {
    const li = el('li');
    if (store.earned.has(t.id)) li.classList.add('earned');
    if (store.selected === t.id) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = store.earned.has(t.id);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      store.toggleEarned(t.id);
      onSelect(t.id, true);
    });
    li.append(box);
    const mid = el('div');
    if (isMasked(t)) {
      mid.append(el('div', 't-hidden', 'Story trophy — hidden on PlayStation until earned'));
      const rev = el('button', 'reveal-btn', 'Reveal');
      rev.type = 'button';
      rev.addEventListener('click', (e) => {
        e.stopPropagation();
        store.revealed.add(t.id);
        store.save();
        onSelect(t.id, true);
      });
      mid.append(rev);
    } else {
      mid.append(el('div', 't-name', t.name));
      mid.append(el('div', 't-desc', t.description));
    }
    const chips = el('div');
    chips.append(el('span', 'mini-chip', t.stage));
    chips.append(el('span', 'mini-chip', kindLabel(t.kind)));
    if (t.missable) chips.append(el('span', 'mini-chip missable', 'Possibly missable'));
    if (t.hidden && !isMasked(t)) chips.append(el('span', 'mini-chip', 'Hidden on PSN'));
    mid.append(chips);
    li.append(mid);
    li.append(gradeBadge(t));
    li.addEventListener('click', () => onSelect(t.id, false));
    list.append(li);
  }
}

export function renderDetail(trophies, onChange) {
  const panel = document.getElementById('detailPanel');
  panel.replaceChildren();
  const t = trophies.find((x) => x.id === store.selected) ?? trophies[0];
  if (!t) return;
  if (isMasked(t)) {
    panel.append(el('h2', null, 'Story trophy — hidden'));
    panel.append(el('p', 'detail-official', 'This trophy is hidden on PlayStation until it is earned. Turn spoilers off, earn it, or reveal it to read its guide.'));
    const rev = el('button', 'reveal-btn', 'Reveal this trophy');
    rev.type = 'button';
    rev.addEventListener('click', () => {
      store.revealed.add(t.id);
      store.save();
      onChange();
    });
    panel.append(rev);
    return;
  }
  panel.append(el('h2', null, t.name));
  panel.append(el('p', 'detail-official', '“' + t.description + '” — as PlayStation publishes it.'));
  const meta = el('div', 'detail-meta');
  meta.append(gradeBadge(t));
  meta.append(el('span', 'mini-chip', t.stage));
  meta.append(el('span', 'mini-chip', kindLabel(t.kind)));
  if (t.hidden) meta.append(el('span', 'mini-chip', 'Hidden on PSN'));
  panel.append(meta);
  if (t.missable) {
    panel.append(el('div', 'missable-banner', 'POSSIBLY MISSABLE — do this as you go, not in the cleanup pass.'));
    panel.append(el('div', 'disagree-box', 'SOURCES DISAGREE — BOTH VERSIONS SHOWN: PowerPyx lists 18 meditation spots; other guides list 15. Aim for 18 so either count is covered.'));
  }
  if (UNCONFIRMED.includes(t.id) && !t.missable) {
    panel.append(el('div', 'disagree-box', 'UNCONFIRMED — the exact trigger is not pinned down by any source yet. This guide says what is known and marks the rest as unconfirmed.'));
  }
  panel.append(el('h3', null, 'Guide — in our own words'));
  panel.append(el('p', null, t.guide));
  panel.append(el('h3', null, 'Steps — each one cited'));
  const ol = el('ol', 'steps');
  for (const s of t.steps ?? []) {
    const li = el('li', null, s.t + ' ');
    const src = sourceById(s.s);
    li.append(el('span', 'cite', src ? `[${src.id} ${src.name}]` : ''));
    ol.append(li);
  }
  panel.append(ol);
  const counter = counterFor(t.id);
  if (counter) {
    const box = el('div', 'counter-box');
    box.append(el('span', null, `${counter.label}: `));
    const minus = el('button', null, '−');
    minus.type = 'button';
    const num = el('span', 'counter-num', `${store.counter(t.id)} / ${counter.target}`);
    const plus = el('button', null, '+');
    plus.type = 'button';
    minus.addEventListener('click', () => {
      num.textContent = `${store.setCounter(t.id, store.counter(t.id) - 1, counter.target)} / ${counter.target}`;
      onChange(true);
    });
    plus.addEventListener('click', () => {
      num.textContent = `${store.setCounter(t.id, store.counter(t.id) + 1, counter.target)} / ${counter.target}`;
      onChange(true);
    });
    box.append(minus, num, plus);
    panel.append(box);
  }
  panel.append(el('h3', null, 'Sources for this guide'));
  for (const sid of t.sources ?? []) {
    const src = sourceById(sid);
    if (src) panel.append(el('p', 'source-line', `[${src.id}] ${src.name} — ${src.title} (${src.place}), read ${src.read}.`));
  }
  const row = el('div', 'earned-row');
  const label = el('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = store.earned.has(t.id);
  box.addEventListener('change', () => {
    store.toggleEarned(t.id);
    onChange();
  });
  label.append(box, document.createTextNode(' Earned'));
  row.append(label);
  panel.append(row);
}

export function renderRail(trophies) {
  const rail = document.getElementById('railPanel');
  rail.replaceChildren();
  const sourcesBox = el('div', 'rail-box');
  sourcesBox.append(el('h3', null, 'Sources'));
  const ol = el('ol');
  for (const s of SOURCES) {
    const li = el('li', null, `${s.name} — ${s.title} (${s.place}), read ${s.read}. `);
    li.append(el('span', 'src-count', `cited by ${sourceCitationCount(trophies, s.id)} of 55 guides`));
    ol.append(li);
  }
  sourcesBox.append(ol);
  rail.append(sourcesBox);
  const nextBox = el('div', 'rail-box');
  nextBox.append(el('h3', null, 'Next up — earliest ungated'));
  const ul = el('ol', 'nextup');
  for (const t of nextUp(trophies, store.earned)) {
    const li = el('li');
    li.append(el('span', null, isMasked(t) ? 'Story trophy (hidden)' : t.name));
    li.append(el('span', 'src-count', ` — ${t.stage}`));
    ul.append(li);
  }
  nextBox.append(ul);
  rail.append(nextBox);
  const watchBox = el('div', 'rail-box');
  watchBox.append(el('h3', null, 'Missable watch'));
  const wul = el('ol', 'nextup');
  for (const w of WATCH) {
    const t = trophies.find((x) => x.id === w.id);
    const li = el('li');
    li.append(el('span', null, t ? t.name : ''));
    li.append(el('span', 'src-count', ` — ${w.status}`));
    wul.append(li);
  }
  watchBox.append(wul);
  rail.append(watchBox);
}
