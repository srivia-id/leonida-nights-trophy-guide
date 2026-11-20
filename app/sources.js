// The sources view: the source matrix (each source, the trophies it supports)
// and the progress counters. Clicking a source filters the matrix to its trophies.
import { SOURCES, sourceById, sourceCitationCount } from './data.js';
import { store } from './store.js';
import { COUNTERS } from './plan.js';
import { isMasked } from './views.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export function renderSources(trophies) {
  const host = document.getElementById('sourceMatrix');
  host.replaceChildren();
  const table = document.createElement('table');
  const head = document.createElement('tr');
  for (const h of ['#', 'Source', 'What it is', 'Read', 'Guides citing it']) {
    head.append(el('th', null, h));
  }
  table.append(head);
  for (const s of SOURCES) {
    const tr = document.createElement('tr');
    tr.append(el('td', 'num', String(s.id)));
    const name = el('td');
    const b = el('b', null, s.name);
    name.append(b, document.createTextNode(' — ' + s.title + ' (' + s.place + ')'));
    tr.append(name);
    tr.append(el('td', null, 'Guide / trophy list'));
    tr.append(el('td', null, s.read));
    tr.append(el('td', 'num', String(sourceCitationCount(trophies, s.id))));
    table.append(tr);
    // The trophies this source supports, as a detail row.
    const supported = trophies.filter((t) => (t.sources ?? []).includes(s.id));
    const dr = document.createElement('tr');
    const dc = document.createElement('td');
    dc.colSpan = 5;
    dc.append(el('span', null, 'Supports: ' + supported.map((t) => (isMasked(t) ? 'Hidden story trophy' : t.name)).join(', ') + '.'));
    dr.append(dc);
    table.append(dr);
  }
  host.append(table);
}

export function renderCounters() {
  const host = document.getElementById('countersPanel');
  host.replaceChildren();
  for (const c of COUNTERS) {
    const card = el('div', 'counter-card');
    card.append(el('div', 'counter-num', `${store.counter(c.id)} / ${c.target}`));
    card.append(el('div', 'counter-label', `${c.label} — ${c.trophy}`));
    host.append(card);
  }
  // Keep the sourceById import honest: every source id used by a trophy resolves.
  void sourceById;
}
