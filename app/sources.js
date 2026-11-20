// LEONIDA NIGHTS — the Sources tab: the numbered source list with its
// cited-by counts, the per-trophy source matrix, and the audit strip text
// that also sits at the top of every page.
import { auditStripText, citedByCount, sourcesOfTrophy } from './data.js';

export function renderAuditStrip(element, data) {
  element.textContent = auditStripText(data);
}

export function renderSourceList(container, data) {
  container.replaceChildren();
  const heading = container.ownerDocument.createElement('h3');
  heading.textContent = 'Sources — read 20 Nov 2026';
  container.append(heading);
  for (const source of data.sources) {
    const entry = container.ownerDocument.createElement('div');
    entry.className = 'source-entry';
    const num = container.ownerDocument.createElement('span');
    num.className = 'src-num';
    num.textContent = `[${source.id}] `;
    entry.append(num);
    if (source.url) {
      const link = container.ownerDocument.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = `${source.name} — ${source.title}`;
      entry.append(link);
    } else {
      const strong = container.ownerDocument.createElement('strong');
      strong.textContent = `${source.name} — ${source.title}`;
      entry.append(strong);
    }
    const counted = container.ownerDocument.createElement('div');
    counted.className = 'src-note';
    counted.textContent = source.list
      ? `List source — the official names, descriptions, grades and hidden flags of all 55 trophies come from here. Cited by 55 of 55 guides.`
      : `Cited by ${citedByCount(data, source.id)} of 55 guides · read ${source.read}.`;
    entry.append(counted);
    if (source.note && !source.list) {
      const note = container.ownerDocument.createElement('div');
      note.className = 'src-note';
      note.textContent = source.note;
      entry.append(note);
    }
    container.append(entry);
  }
}

export function renderSourceMatrix(container, data) {
  container.replaceChildren();
  const heading = container.ownerDocument.createElement('h3');
  heading.textContent = 'Source matrix — which sources each guide cites';
  container.append(heading);
  const table = container.ownerDocument.createElement('table');
  table.className = 'matrix-table';
  const head = container.ownerDocument.createElement('tr');
  for (const label of ['Trophy', 'Sources']) {
    const th = container.ownerDocument.createElement('th');
    th.textContent = label;
    head.append(th);
  }
  table.append(head);
  for (const t of data.trophies) {
    const row = container.ownerDocument.createElement('tr');
    const nameCell = container.ownerDocument.createElement('td');
    nameCell.textContent = t.name;
    row.append(nameCell);
    const numsCell = container.ownerDocument.createElement('td');
    numsCell.className = 'nums';
    numsCell.textContent = sourcesOfTrophy(t).map((n) => `[${n}]`).join(' ');
    row.append(numsCell);
    table.append(row);
  }
  container.append(table);
}
