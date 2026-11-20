// LEONIDA NIGHTS — entry point. Loads the guide, restores saved progress,
// wires the tabs, filters, spoiler setting and export/import, and renders
// every view. Nothing here reaches the network except the one fetch of the
// guide's own data file.
import { loadGuide, gradeCounts, auditStats } from './data.js';
import { loadSavedState, saveState, exportState, importState } from './store.js';
import { renderKindChips, renderList, renderDetail, filterTrophies } from './views.js';
import { renderRoadmap } from './roadmap.js';
import { renderAuditStrip, renderSourceList, renderSourceMatrix } from './sources.js';
import { renderNextUp, renderEstimate, renderWatch, renderMissableHero, renderSpoilerSafe } from './plan.js';

const state = loadSavedState();
const ui = { kind: 'all', grade: 'all', q: '', earnedOnly: false, selected: 28, revealed: new Set() };

const $ = (id) => document.getElementById(id);

function persist() {
  saveState(state);
}

function renderHeader(data) {
  $('earned-count').textContent = state.earned.size;
  const grades = gradeCounts(data);
  const earnedByGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of data.trophies) {
    if (state.earned.has(t.id)) earnedByGrade[t.grade] += 1;
  }
  $('grade-pills').replaceChildren();
  for (const [grade, label] of [['platinum', 'P'], ['gold', 'G'], ['silver', 'S'], ['bronze', 'B']]) {
    const pill = document.createElement('span');
    pill.className = 'pill';
    const letter = document.createElement('b');
    letter.textContent = label;
    pill.append(letter, document.createTextNode(`${earnedByGrade[grade]}/${grades[grade]} ${grade}`));
    $('grade-pills').append(pill);
  }
}

function renderAll(data) {
  renderHeader(data);
  renderAuditStrip($('audit-strip'), data);
  renderKindChips($('kind-chips'), data, ui, (kind) => {
    ui.kind = kind;
    renderAll(data);
  });
  const shown = renderList($('trophy-list'), data, state, ui, {
    onSelect: (id) => {
      ui.selected = id;
      renderAll(data);
    },
    onToggleEarned: (id, checked) => {
      if (checked) state.earned.add(id);
      else state.earned.delete(id);
      persist();
      renderAll(data);
    },
  });
  $('list-count').textContent = `Showing ${shown} of ${data.trophies.length}`;
  renderDetail($('detail'), data, state, ui, {
    onCounter: (id, delta) => {
      const trophy = data.trophies.find((t) => t.id === id);
      const current = state.counters.get(id) || 0;
      const next = Math.max(0, Math.min(trophy.counter.target, current + delta));
      if (next === 0) state.counters.delete(id);
      else state.counters.set(id, next);
      persist();
      renderAll(data);
    },
    onBalcony: (checked) => {
      state.balconyDone = checked;
      persist();
      renderAll(data);
    },
    onReveal: (id) => {
      ui.revealed.add(id);
      renderAll(data);
    },
  });
  renderNextUp($('next-up'), data, state, (id) => {
    ui.selected = id;
    switchTab('checklist');
    renderAll(data);
  });
  renderWatch($('rail-watch'), data);
  renderSourceList($('rail-sources'), data);
  renderRoadmap($('roadmap'), data, state);
  renderEstimate($('estimate-line'), data, state);
  renderMissableHero($('missable-hero'), data, state);
  renderWatch($('watch-list'), data);
  renderSpoilerSafe($('spoiler-safe'), data, state, (id) => {
    ui.selected = id;
    switchTab('checklist');
    renderAll(data);
  });
  renderSourceList($('source-list'), data);
  renderSourceMatrix($('source-matrix'), data);
  renderExportCard(data);
}

function renderExportCard(data) {
  const card = $('export-card');
  card.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = 'Take your progress with you';
  card.append(heading);
  const text = document.createElement('p');
  const stats = auditStats(data);
  text.textContent = `Export downloads a JSON file with your ${state.earned.size} earned trophies and your counters. Import reads one back. The file never leaves your machine unless you send it somewhere. This guide tracks ${stats.total} trophies with ${stats.totalSteps} cited steps across ${stats.sourcesRead} sources.`;
  card.append(text);
  const row = document.createElement('div');
  row.className = 'row';
  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.textContent = 'Export progress';
  exportButton.addEventListener('click', () => downloadExport());
  const importLabel = document.createElement('label');
  importLabel.className = 'import-label';
  importLabel.textContent = 'Import progress ';
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (file) await applyImport(file);
    importInput.value = '';
  });
  importLabel.append(importInput);
  row.append(exportButton, importLabel);
  card.append(row);
}

function downloadExport() {
  const payload = exportState(state);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-nights-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function applyImport(file) {
  try {
    const imported = importState(await file.text());
    state.earned = imported.earned;
    state.counters = imported.counters;
    state.balconyDone = imported.balconyDone;
    state.spoilerOn = imported.spoilerOn;
    $('spoiler-toggle').checked = state.spoilerOn;
    persist();
    renderAll(window.__guideData);
  } catch {
    alert('That file is not a LEONIDA NIGHTS progress export.');
  }
}

function switchTab(name) {
  for (const button of document.querySelectorAll('.tabs button')) {
    button.classList.toggle('active', button.dataset.tab === name);
  }
  for (const page of document.querySelectorAll('.tab-page')) {
    page.hidden = page.id !== `tab-${name}`;
  }
}

async function boot() {
  const data = await loadGuide();
  window.__guideData = data;

  $('spoiler-toggle').checked = state.spoilerOn;
  $('spoiler-toggle').addEventListener('change', (event) => {
    state.spoilerOn = event.target.checked;
    persist();
    renderAll(data);
  });
  $('search').addEventListener('input', (event) => {
    ui.q = event.target.value;
    renderAll(data);
  });
  $('grade-select').addEventListener('change', (event) => {
    ui.grade = event.target.value;
    renderAll(data);
  });
  $('earned-only').addEventListener('change', (event) => {
    ui.earnedOnly = event.target.checked;
    renderAll(data);
  });
  $('export-btn').addEventListener('click', downloadExport);
  $('import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) await applyImport(file);
    event.target.value = '';
  });
  for (const button of document.querySelectorAll('.tabs button')) {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
      renderAll(data);
    });
  }

  renderAll(data);
}

boot().catch((error) => {
  document.getElementById('audit-strip').textContent = `Could not load the guide: ${error.message}`;
});
