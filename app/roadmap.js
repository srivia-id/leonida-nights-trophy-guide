// The roadmap view: the seven stages S1-S7, each with its trophies and its
// progress, and the missables view: the watch list plus the hidden trophies.
import { store } from './store.js';
import { STAGES, WATCH, stageTrophies } from './plan.js';
import { isMasked } from './views.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export function renderRoadmap(trophies) {
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const stage of STAGES) {
    const list = stageTrophies(trophies, stage.code);
    const earned = list.filter((t) => store.earned.has(t.id)).length;
    const card = el('div', 'stage');
    const h = el('h3');
    h.append(el('span', 'stage-code', stage.code + ' — '), document.createTextNode(stage.title));
    card.append(h);
    card.append(el('p', null, stage.text));
    card.append(el('div', 'stage-progress', `${earned} / ${list.length} earned in this stage`));
    const ul = el('ul');
    for (const t of list) {
      const li = el('li', store.earned.has(t.id) ? 'earned' : null, isMasked(t) ? 'Story trophy — hidden on PlayStation until earned' : `${t.name} (${t.grade})`);
      ul.append(li);
    }
    card.append(ul);
    host.append(card);
  }
}

export function renderMissables(trophies) {
  const host = document.getElementById('watchList');
  host.replaceChildren();
  for (const w of WATCH) {
    const t = trophies.find((x) => x.id === w.id);
    if (!t) continue;
    const card = el('div', 'watch-card' + (w.danger ? ' danger' : ''));
    card.append(el('div', 'status', w.status));
    card.append(el('h3', null, isMasked(t) ? 'Story trophy — hidden' : t.name));
    card.append(el('p', null, '“' + t.description + '”'));
    card.append(el('p', null, w.reason));
    if (t.missable) {
      card.append(el('p', null, 'Sources disagree on the count: PowerPyx lists 18 meditation spots, other guides list 15. This guide targets 18 and says so in the open.'));
    }
    host.append(card);
  }
  const hiddenHost = document.getElementById('hiddenList');
  hiddenHost.replaceChildren();
  for (const t of trophies.filter((x) => x.hidden)) {
    const cell = el('div', 'hidden-cell' + (store.earned.has(t.id) ? ' earned' : ''), store.earned.has(t.id) || !isMasked(t) ? t.name : 'Hidden trophy — earn to reveal');
    hiddenHost.append(cell);
  }
}
