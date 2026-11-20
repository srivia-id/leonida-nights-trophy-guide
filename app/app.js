// LEONIDA NIGHTS — the bootstrapper: loads the trophy data, wires the header,
// the audit strip, the tabs, the filters and the hash routes, and keeps the
// checklist, the detail panel and the sidebar in step with the store.

import { KINDS, SOURCES, WATCH, citedGuides, countSteps, loadTrophies } from './data.js';
import { downloadFile, exportState, importState, isEarned, loadStore, saveStore, setCounter, toggleEarned } from './store.js';
import { nextUp, timeEstimate } from './plan.js';
import { renderRoadmap } from './roadmap.js';
import { renderSources } from './sources.js';
import { renderChecklist, renderDetail, renderMissables } from './views.js';

const $ = (id) => document.getElementById(id);
const GRADE_COUNT = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

let trophies = [];
let state = loadStore();
let filter = { kind: 'all', grade: 'all', query: '', earnedOnly: false };
let selectedId = 28;
let revealed = new Set();
let view = 'checklist';

function earnedCount() {
  return trophies.filter((t) => isEarned(state, t)).length;
}

function gradeEarned(grade) {
  return trophies.filter((t) => t.grade === grade && isEarned(state, t)).length;
}

function renderHeader() {
  const total = trophies.length;
  const earned = earnedCount();
  $('progress').textContent = `${earned} of ${total} earned`;
  document.title = `${earned}/${total} earned · LEONIDA NIGHTS — GTA VI Trophy Guide & Tracker`;
  $('grade-counts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${gradeEarned(g)}/${GRADE_COUNT[g]} ${g[0].toUpperCase() + g.slice(1)}`)
    .join(' · ');
  $('spoiler').checked = state.spoiler;
  const steps = countSteps(trophies);
  const cited = citedGuides(trophies);
  $('audit').textContent =
    `55 official · 1P 2G 6S 46B · 28 hidden · ${cited}/55 guides cite a source · ${steps} steps cited · ` +
    `${SOURCES.length} sources read 21 Nov 2026 · 1 possibly missable · 6 on watch · 5 unconfirmed · 0 online`;
}

function renderNextUp() {
  const next = nextUp(trophies, state);
  const panel = document.createElement('div');
  panel.className = 'nextup';
  panel.id = 'nextup';
  const heading = document.createElement('h3');
  heading.textContent = 'Next up';
  panel.append(heading);
  if (next.trophy) {
    const name = document.createElement('p');
    name.className = 'next-name';
    name.textContent = next.trophy.name;
    const reason = document.createElement('p');
    reason.textContent = next.reason;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'btn btn-small';
    open.textContent = 'Open its guide';
    open.addEventListener('click', () => selectTrophy(next.trophy, true));
    panel.append(name, reason, open);
  } else {
    const done = document.createElement('p');
    done.textContent = next.reason;
    panel.append(done);
  }
  const time = document.createElement('p');
  time.className = 'next-time';
  time.textContent = timeEstimate(earnedCount(), trophies.length);
  panel.append(time);
  return panel;
}

function renderMain() {
  renderHeader();
  const main = $('main');
  main.replaceChildren();
  if (view === 'roadmap') {
    const wrap = document.createElement('div');
    wrap.className = 'view-roadmap';
    renderRoadmap(wrap, trophies, state, (t) => selectTrophy(t, true));
    main.append(wrap);
    return;
  }
  if (view === 'missables') {
    const wrap = document.createElement('div');
    wrap.className = 'view-missables';
    renderMissables(wrap, trophies, state, WATCH, (t) => selectTrophy(t, true));
    main.append(wrap);
    return;
  }
  if (view === 'sources') {
    const wrap = document.createElement('div');
    wrap.className = 'view-sources';
    renderSources(wrap, trophies);
    main.append(wrap);
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'grid';
  const list = document.createElement('div');
  list.className = 'list-col';
  list.id = 'list-col';
  renderChecklist(list, trophies, state, filter, selectedId, (t) => selectTrophy(t, false), (t) => {
    toggleEarned(state, t);
    renderMain();
  });
  // Keep the selected trophy visible in the scrollable list after every render.
  const selectedRow = list.querySelector('.t-row.selected');
  if (selectedRow) selectedRow.scrollIntoView({ block: 'nearest' });
  const detail = document.createElement('aside');
  detail.className = 'detail-col';
  detail.id = 'detail-col';
  const selected = trophies.find((t) => t.id === selectedId) ?? null;
  const shown = selected && revealed.has(selected.id) ? { ...selected, hidden: false } : selected;
  renderDetail(detail, shown, state, (t, value) => {
    setCounter(state, t, value);
    renderMain();
  }, (t) => {
    revealed.add(t.id);
    renderMain();
  });
  const side = document.createElement('aside');
  side.className = 'side-col';
  side.append(renderNextUp());
  const srcBox = document.createElement('div');
  srcBox.className = 'src-box';
  const srcHead = document.createElement('h3');
  srcHead.textContent = 'Sources';
  const srcNote = document.createElement('p');
  srcNote.textContent = `${SOURCES.length} sources read 21 Nov 2026. Every guide cites its sources by name, with a link where the source is online.`;
  const srcLink = document.createElement('button');
  srcLink.type = 'button';
  srcLink.className = 'btn btn-small';
  srcLink.textContent = 'Open the source matrix';
  srcLink.addEventListener('click', () => go('sources'));
  srcBox.append(srcHead, srcNote, srcLink);
  side.append(srcBox);
  grid.append(list, detail, side);
  main.append(grid);
}

function selectTrophy(trophy, switchToChecklist) {
  selectedId = trophy.id;
  if (switchToChecklist) view = 'checklist';
  syncTabs();
  location.hash = `#/guide/${trophy.id}`;
  renderMain();
  const detail = $('detail-col');
  if (detail) detail.scrollIntoView({ block: 'nearest' });
}

function syncTabs() {
  for (const button of document.querySelectorAll('.tab')) {
    button.classList.toggle('active', button.dataset.view === view);
  }
  $('filters').style.display = view === 'checklist' ? '' : 'none';
}

function go(nextView) {
  view = nextView;
  const hash = { checklist: '#/', roadmap: '#/roadmap', missables: '#/missables', sources: '#/sources' }[nextView];
  if (location.hash !== hash) location.hash = hash;
  syncTabs();
  renderMain();
}

function readHash() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/guide/')) {
    const id = Number(hash.slice('#/guide/'.length));
    if (Number.isInteger(id) && trophies.some((t) => t.id === id)) {
      selectedId = id;
      view = 'checklist';
    }
  } else if (hash === '#/roadmap') view = 'roadmap';
  else if (hash === '#/missables') view = 'missables';
  else if (hash === '#/sources') view = 'sources';
  else view = 'checklist';
  syncTabs();
}

function buildFilters() {
  const chips = $('kind-chips');
  chips.replaceChildren();
  for (const kind of KINDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip-btn' + (filter.kind === kind.id ? ' active' : '');
    chip.textContent = kind.label;
    chip.addEventListener('click', () => {
      filter.kind = kind.id;
      buildFilters();
      renderMain();
    });
    chips.append(chip);
  }
  $('grade').addEventListener('change', (e) => {
    filter.grade = e.target.value;
    renderMain();
  });
  $('search').addEventListener('input', (e) => {
    filter.query = e.target.value.trim();
    renderMain();
  });
  $('earned-only').addEventListener('change', (e) => {
    filter.earnedOnly = e.target.checked;
    renderMain();
  });
}

function wireChrome() {
  for (const button of document.querySelectorAll('.tab')) {
    button.addEventListener('click', () => go(button.dataset.view));
  }
  $('spoiler').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    revealed.clear();
    saveStore(state);
    renderMain();
  });
  $('export').addEventListener('click', () => {
    downloadFile('leonida-nights-progress.json', exportState(state));
  });
  $('import').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      state = importState(await file.text());
      revealed.clear();
      renderMain();
    } catch (err) {
      alert(`Could not import that file: ${err.message}`);
    }
    e.target.value = '';
  });
  window.addEventListener('hashchange', () => {
    readHash();
    renderMain();
  });
}

async function boot() {
  trophies = await loadTrophies();
  buildFilters();
  wireChrome();
  readHash();
  renderMain();
}

boot().catch((err) => {
  document.body.replaceChildren();
  const p = document.createElement('p');
  p.textContent = `LEONIDA NIGHTS could not start: ${err.message}`;
  document.body.append(p);
});
