// LEONIDA NIGHTS — the views: the trophy checklist with its filters, the trophy
// detail panel (guide, numbered steps, cited sources, counter), and the
// missables watch list. Spoiler-safe throughout: a hidden story trophy stays
// masked by name, description and guide until it is earned or spoilers are off.

import { KINDS, UNCONFIRMED, gradeLetter, sourceById } from './data.js';
import { counterValue, isEarned, setCounter } from './store.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function spoilerHides(state, trophy) {
  return state.spoiler && trophy.hidden && !isEarned(state, trophy);
}

export function filterTrophies(trophies, state, filter) {
  return trophies.filter((trophy) => {
    if (filter.kind === 'story' && trophy.kind !== 'story') return false;
    if (filter.kind === 'missable' && !trophy.missable) return false;
    if (filter.kind === 'collectibles' && trophy.kind !== 'collectibles') return false;
    if (filter.kind === 'activities' && trophy.kind !== 'activities') return false;
    if (filter.kind === 'side' && trophy.kind !== 'side') return false;
    if (filter.kind === 'crime' && trophy.kind !== 'crime') return false;
    if (filter.kind === 'money' && trophy.kind !== 'money') return false;
    if (filter.kind === 'exploration' && trophy.kind !== 'exploration') return false;
    if (filter.kind === 'misc' && trophy.kind !== 'misc') return false;
    if (filter.kind === 'online') return false;
    if (filter.grade !== 'all' && trophy.grade !== filter.grade) return false;
    if (filter.earnedOnly && !isEarned(state, trophy)) return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function gradeBadge(trophy) {
  return el('span', `grade grade-${trophy.grade}`, gradeLetter(trophy.grade));
}

function kindLabel(kind) {
  const found = KINDS.find((k) => k.id === kind);
  return found ? found.label : kind;
}

function checklistRow(trophy, state, selected, onSelect, onToggle) {
  const row = el('article', 't-row' + (selected ? ' selected' : '') + (isEarned(state, trophy) ? ' earned' : ''));
  if (selected) row.setAttribute('aria-current', 'true');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(state, trophy);
  box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  box.addEventListener('change', () => onToggle(trophy));
  row.append(box);
  const body = el('div', 't-body');
  if (spoilerHides(state, trophy)) {
    body.append(el('div', 't-name', 'Story trophy — hidden until earned'));
    body.append(el('p', 't-desc', 'Hidden on PlayStation until earned. Tick it off once you earn it to reveal its guide.'));
    body.append(el('span', 'tag tag-hidden', 'HIDDEN ON PSN'));
  } else {
    body.append(el('div', 't-name', trophy.name));
    body.append(el('p', 't-desc', trophy.description));
    if (trophy.hidden) body.append(el('span', 'tag tag-hidden', 'HIDDEN ON PSN'));
    if (trophy.missable) body.append(el('span', 'tag tag-missable', 'POSSIBLY MISSABLE'));
    if (trophy.count) body.append(el('span', 'tag tag-count', `${trophy.count} ${trophy.countLabel ?? ''}`.trim()));
  }
  const meta = el('div', 't-meta');
  meta.append(gradeBadge(trophy));
  meta.append(el('span', 'chip', kindLabel(trophy.kind)));
  meta.append(el('span', 'chip chip-stage', trophy.stage));
  row.append(body, meta);
  row.addEventListener('click', (event) => {
    if (event.target === box) return;
    onSelect(trophy);
  });
  return row;
}

export function renderChecklist(container, trophies, state, filter, selectedId, onSelect, onToggle) {
  container.replaceChildren();
  const shown = filterTrophies(trophies, state, filter);
  if (shown.length === 0) {
    container.append(el('p', 'empty', 'No trophies match these filters. Clear the search or pick another kind.'));
    return;
  }
  for (const trophy of shown) {
    container.append(checklistRow(trophy, state, trophy.id === selectedId, onSelect, onToggle));
  }
  container.append(el('p', 'list-count', `Showing ${shown.length} of ${trophies.length} trophies.`));
}

function sourceCite(sources) {
  const wrap = el('div', 'src-cites');
  wrap.append(el('strong', null, 'Sources: '));
  sources.forEach((id, i) => {
    const source = sourceById(id);
    if (!source) return;
    if (i > 0) wrap.append(document.createTextNode(', '));
    if (source.url) {
      const a = document.createElement('a');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = `[${i + 1}] ${source.name}`;
      wrap.append(a);
    } else {
      wrap.append(document.createTextNode(`[${i + 1}] ${source.name}`));
    }
  });
  return wrap;
}

function counterWidget(trophy, state, onCounter) {
  const wrap = el('div', 'counter');
  const value = counterValue(state, trophy);
  wrap.append(el('span', 'counter-label', `Progress: ${value} / ${trophy.count} ${trophy.countLabel ?? ''}`.trim()));
  const minus = el('button', 'counter-btn', '−');
  minus.type = 'button';
  minus.setAttribute('aria-label', `Decrease ${trophy.countLabel ?? 'progress'} count`);
  minus.addEventListener('click', () => onCounter(trophy, value - 1));
  const plus = el('button', 'counter-btn', '+');
  plus.type = 'button';
  plus.setAttribute('aria-label', `Increase ${trophy.countLabel ?? 'progress'} count`);
  plus.addEventListener('click', () => onCounter(trophy, value + 1));
  wrap.append(minus, plus);
  const bar = el('div', 'counter-bar');
  const fill = el('div', 'counter-fill');
  fill.style.width = `${trophy.count ? Math.min(100, (value / trophy.count) * 100) : 0}%`;
  bar.append(fill);
  wrap.append(bar);
  if (trophy.count && value >= trophy.count) {
    wrap.append(el('p', 'counter-done', 'Counter complete — tick the trophy earned in the checklist when you have it.'));
  }
  return wrap;
}

export function renderDetail(panel, trophy, state, onCounter, onReveal) {
  panel.replaceChildren();
  if (!trophy) {
    panel.append(el('p', 'empty', 'Pick a trophy from the checklist to see its guide, its steps and its sources.'));
    return;
  }
  if (spoilerHides(state, trophy)) {
    panel.append(el('h2', null, 'Story trophy — hidden until earned'));
    panel.append(el('p', null, 'This is a hidden story trophy. Its name, description and guide stay hidden while spoilers are on, until you earn it.'));
    const reveal = el('button', 'btn', 'Reveal this trophy anyway');
    reveal.type = 'button';
    reveal.addEventListener('click', () => onReveal(trophy));
    panel.append(reveal);
    return;
  }
  const head = el('div', 'detail-head');
  head.append(gradeBadge(trophy));
  head.append(el('h2', null, trophy.name));
  panel.append(head);
  panel.append(el('p', 'official', `Official description: “${trophy.description}”`));
  const tags = el('div', 'tags');
  tags.append(el('span', 'chip', kindLabel(trophy.kind)));
  tags.append(el('span', 'chip chip-stage', trophy.stage));
  if (trophy.hidden) tags.append(el('span', 'tag tag-hidden', 'HIDDEN ON PSN'));
  if (trophy.missable) tags.append(el('span', 'tag tag-missable', 'POSSIBLY MISSABLE'));
  panel.append(tags);

  if (trophy.missable) {
    const banner = el('div', 'callout callout-warn');
    banner.append(el('h3', null, 'Possibly missable — read this first'));
    banner.append(el('p', null, 'The first meditation spot is offered at Jason’s house in Chapter 1 and may not come back once the chapter ends. Meditate when the prompt appears, and keep a manual save from the start of Chapter 1.'));
    panel.append(banner);
  }
  if (trophy.id === 28) {
    const disagree = el('div', 'callout callout-info');
    disagree.append(el('h3', null, 'Sources disagree — both versions shown'));
    disagree.append(el('p', null, 'The trophy needs all 18 meditation spots. The 100% Completion checklist needs only 15 of them. Two different requirements: do all 18 for this trophy, and know that a missed Chapter 1 spot cannot cost you 100%.'));
    panel.append(disagree);
  }
  if (UNCONFIRMED.includes(trophy.id)) {
    const note = el('div', 'callout callout-dim');
    note.append(el('h3', null, 'Not pinned down yet'));
    note.append(el('p', null, 'No guide has confirmed this trophy’s exact trigger yet. The guide below gives the best lead from the official description and says so honestly instead of guessing.'));
    panel.append(note);
  }

  panel.append(el('p', 'guide', trophy.guide));
  const steps = el('ol', 'steps');
  for (const step of trophy.steps ?? []) {
    steps.append(el('li', null, step));
  }
  panel.append(steps);
  panel.append(sourceCite(trophy.sources ?? []));
  if (trophy.count) {
    panel.append(counterWidget(trophy, state, onCounter));
  }
}

export function renderMissables(container, trophies, state, watch, onSelect) {
  container.replaceChildren();
  container.append(
    el('p', 'view-intro', 'Only one trophy in the whole list may be missable. The other five entries here are things that are easy to overlook or get wrong, even though they cannot be missed.'),
  );
  for (const item of watch) {
    const trophy = trophies.find((t) => t.id === item.trophyId);
    if (!trophy) continue;
    const card = el('article', 'watch-card' + (item.level === 'possible' ? ' watch-possible' : ''));
    const head = el('div', 'watch-head');
    head.append(el('h3', null, item.title));
    head.append(el('span', item.level === 'possible' ? 'tag tag-missable' : 'tag tag-watch', item.level === 'possible' ? 'POSSIBLY MISSABLE' : 'WATCH'));
    card.append(head);
    card.append(el('p', null, item.why));
    card.append(el('p', 'watch-action', `Do this: ${item.action}`));
    const open = el('button', 'btn btn-small', 'Open its guide');
    open.type = 'button';
    open.addEventListener('click', () => onSelect(trophy));
    card.append(open);
    container.append(card);
  }
  const hiddenList = el('section', 'hidden-list');
  hiddenList.append(el('h3', null, 'Hidden story trophies — spoiler-safe'));
  hiddenList.append(
    el('p', null, '28 trophies stay hidden on PlayStation until earned: 12 story trophies and 16 side and secret ones. With spoilers on, they show here by chapter only, with no mission details.'),
  );
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  for (const chapter of chapters) {
    const story = trophies.filter((t) => t.kind === 'story' && t.hidden && stageChapter(t) === chapter);
    if (story.length === 0) continue;
    const line = el('p', 'chapter-line');
    line.append(el('strong', null, `${chapter}: `));
    line.append(document.createTextNode(story.map((t) => (spoilerHides(state, t) ? 'Story trophy (hidden)' : t.name)).join(' · ')));
    hiddenList.append(line);
  }
  container.append(hiddenList);
}

function stageChapter(trophy) {
  return { S1: 'Chapter 1', S2: 'Chapter 2', S3: 'Chapter 3', S4: 'Chapter 4', S5: 'Chapter 5' }[trophy.stage] ?? 'Chapter 1';
}
