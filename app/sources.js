// LEONIDA NIGHTS — the sources view: the source matrix (which source backs which
// trophies), the full source list with read dates, the honest-disagreement box,
// and the five trophies whose triggers no guide has confirmed yet.

import { SOURCES, UNCONFIRMED, sourceById, trophyById, trophiesCiting } from './data.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sourceLink(source) {
  if (!source.url) return el('span', 'src-name', source.name);
  const a = document.createElement('a');
  a.className = 'src-name';
  a.href = source.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = source.name;
  return a;
}

function matrixTable(trophies) {
  const table = el('table', 'matrix');
  const head = el('tr');
  head.append(el('th', null, 'Source'), el('th', null, 'Cited by'), el('th', null, 'Trophies'));
  table.append(head);
  for (const source of SOURCES) {
    const citing = trophiesCiting(trophies, source.id);
    if (citing.length === 0) continue;
    const row = el('tr');
    const nameCell = el('td');
    nameCell.append(sourceLink(source));
    row.append(nameCell, el('td', 'num', String(citing.length)), el('td', null, citing.map((t) => t.name).join(', ')));
    table.append(row);
  }
  return table;
}

function sourceList() {
  const list = el('ol', 'source-list');
  for (const source of SOURCES) {
    const item = el('li');
    const head = el('div', 'src-head');
    head.append(sourceLink(source));
    head.append(el('span', 'src-read', `read ${source.read}`));
    item.append(head, el('p', 'src-title', source.title), el('p', 'src-note', source.note));
    list.append(item);
  }
  return list;
}

export function renderSources(container, trophies) {
  container.replaceChildren();
  container.append(
    el('p', 'view-intro', 'Every guide in this entry is written in our own words and cites where each fact comes from. A link opens only if you follow it; the app itself fetches nothing.'),
  );

  const disagree = el('section', 'callout callout-warn');
  disagree.append(el('h3', null, 'Where the sources disagree — both versions shown'));
  disagree.append(
    el(
      'p',
      null,
      'Positive Mental Attitude needs all 18 meditation spots, but the 100% Completion checklist asks for only 15 of them. Those are two different requirements, not a contradiction: meditate at all 18 spots for the trophy, and know that a missed Chapter 1 spot still cannot cost you the 100% trophy.',
    ),
  );
  container.append(disagree);

  const unconfirmed = el('section', 'callout callout-dim');
  unconfirmed.append(el('h3', null, 'Not pinned down yet — 5 triggers unconfirmed'));
  const names = UNCONFIRMED.map((id) => trophyById(trophies, id)?.name ?? `#${id}`).join(', ');
  unconfirmed.append(
    el('p', null, `${names}. No guide has confirmed how these five pop yet, so this entry says so instead of guessing. Their guides give the best lead from the description and mark the trigger unconfirmed.`),
  );
  container.append(unconfirmed);

  container.append(el('h3', null, 'Source matrix — which source backs which trophies'));
  container.append(matrixTable(trophies));
  container.append(el('h3', null, 'Sources read for this guide'));
  container.append(sourceList());
}
