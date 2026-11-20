// LEONIDA NIGHTS — wiring: load the trophies, route the tabs, keep the header,
// the filters and the progress in step. The app works offline: it fetches only
// its own data file, and saves progress in this browser's local storage.
import { loadTrophies, kindLabel } from './data.js';
import { store, downloadProgress } from './store.js';
import { renderAuditStrip, renderChecklist, renderDetail, renderRail } from './views.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { renderSources, renderCounters } from './sources.js';

const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'side', 'crime', 'money', 'misc', 'online'];
const filter = { kind: 'all', grade: 'all', search: '', earnedOnly: false };

let trophies = [];

function renderHeader() {
  const earned = store.earned.size;
  document.getElementById('progressCount').textContent = String(earned);
  document.getElementById('progressFill').style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    if (store.earned.has(t.id)) counts[t.grade]++;
  }
  document.getElementById('gradeCounts').textContent = `P ${counts.platinum} · G ${counts.gold} · S ${counts.silver} · B ${counts.bronze}`;
}

function renderAll() {
  renderHeader();
  renderAuditStrip(trophies);
  renderChecklist(trophies, filter, (id, keepFocus) => {
    store.selected = id;
    store.save();
    renderAll();
    if (keepFocus) {
      const item = document.querySelector(`#trophyList li.selected`);
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  });
  renderDetail(trophies, (countersOnly) => {
    if (!countersOnly) renderAll();
    else {
      renderCounters();
      renderHeader();
    }
  });
  renderRail(trophies);
  renderRoadmap(trophies);
  renderMissables(trophies);
  renderSources(trophies);
  renderCounters();
}

function showTab(name) {
  for (const view of document.querySelectorAll('.view')) view.hidden = true;
  const target = document.getElementById('view-' + name) ?? document.getElementById('view-checklist');
  target.hidden = false;
  for (const a of document.querySelectorAll('#tabs a')) {
    a.classList.toggle('active', a.dataset.tab === name);
  }
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'checklist';
  showTab(['checklist', 'roadmap', 'missables', 'sources'].includes(hash) ? hash : 'checklist');
}

function buildKindChips() {
  const host = document.getElementById('kindChips');
  for (const kind of KINDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (filter.kind === kind ? ' active' : '');
    chip.textContent = kind === 'all' ? 'All 55' : kind === 'online' ? 'Online 0' : kindLabel(kind);
    chip.addEventListener('click', () => {
      filter.kind = kind;
      for (const c of host.children) c.classList.remove('active');
      chip.classList.add('active');
      renderChecklist(trophies, filter, (id, keepFocus) => {
        store.selected = id;
        store.save();
        renderAll();
        if (keepFocus) {
          const item = document.querySelector('#trophyList li.selected');
          if (item) item.scrollIntoView({ block: 'nearest' });
        }
      });
    });
    host.append(chip);
  }
}

function wireControls() {
  document.getElementById('gradeFilter').addEventListener('change', (e) => {
    filter.grade = e.target.value;
    renderChecklist(trophies, filter, selectTrophy);
  });
  document.getElementById('searchInput').addEventListener('input', (e) => {
    filter.search = e.target.value;
    renderChecklist(trophies, filter, selectTrophy);
  });
  document.getElementById('earnedOnly').addEventListener('change', (e) => {
    filter.earnedOnly = e.target.checked;
    renderChecklist(trophies, filter, selectTrophy);
  });
  document.getElementById('spoilerToggle').checked = store.spoiler;
  document.getElementById('spoilerToggle').addEventListener('change', (e) => {
    store.spoiler = e.target.checked;
    store.save();
    renderAll();
  });
  const doExport = () => {
    downloadProgress();
    document.getElementById('exportNote').textContent = `Exported ${store.earned.size} earned trophies as leonida-nights-progress.json.`;
  };
  document.getElementById('exportBtn').addEventListener('click', doExport);
  document.getElementById('exportBtn2').addEventListener('click', doExport);
  const doImport = async (file) => {
    if (!file) return;
    try {
      store.importJson(await file.text());
      document.getElementById('exportNote').textContent = `Imported ${store.earned.size} earned trophies.`;
      renderAll();
    } catch {
      document.getElementById('exportNote').textContent = 'That file could not be imported — it is not a LEONIDA NIGHTS progress file.';
    }
  };
  document.getElementById('importFile').addEventListener('change', (e) => doImport(e.target.files[0]));
  document.getElementById('importFile2').addEventListener('change', (e) => doImport(e.target.files[0]));
}

function selectTrophy(id) {
  store.selected = id;
  store.save();
  renderAll();
}

window.addEventListener('hashchange', route);

trophies = await loadTrophies();
buildKindChips();
wireControls();
renderAll();
route();
