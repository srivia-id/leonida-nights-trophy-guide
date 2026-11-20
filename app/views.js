// LEONIDA NIGHTS — the checklist tab: filter chips, the 55-row list, and the
// detail panel for the selected trophy, with its cited steps and counters.
import { isMasked, kindLabel, sourcesOfTrophy } from './data.js';

const KIND_ORDER = ['all', 'story', 'missable', 'collectibles', 'activities', 'side', 'crime', 'money', 'misc', 'online'];

export function renderKindChips(container, data, ui, onKind) {
  container.replaceChildren();
  for (const kind of KIND_ORDER) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip' + (ui.kind === kind ? ' active' : '');
    if (kind === 'all') button.textContent = `All ${data.trophies.length}`;
    else if (kind === 'missable') button.textContent = `Missable (${data.trophies.filter((t) => t.missable).length})`;
    else if (kind === 'online') button.textContent = 'Online 0';
    else button.textContent = `${kindLabel(kind)} (${data.trophies.filter((t) => t.kind === kind).length})`;
    button.addEventListener('click', () => onKind(kind));
    container.append(button);
  }
}

export function filterTrophies(data, state, ui) {
  const q = ui.q.trim().toLowerCase();
  return data.trophies.filter((t) => {
    if (ui.kind === 'missable' && !t.missable) return false;
    if (ui.kind !== 'all' && ui.kind !== 'missable' && ui.kind !== 'online' && t.kind !== ui.kind) return false;
    if (ui.kind === 'online') return false;
    if (ui.grade !== 'all' && t.grade !== ui.grade) return false;
    if (ui.earnedOnly && !state.earned.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${kindLabel(t.kind)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function gradeLetter(grade) {
  return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] || '?';
}

export function renderList(container, data, state, ui, handlers) {
  const rows = filterTrophies(data, state, ui);
  container.replaceChildren();
  for (const t of rows) {
    const masked = isMasked(t, state) && !ui.revealed.has(t.id);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trow' + (state.earned.has(t.id) ? ' earned' : '') + (ui.selected === t.id ? ' selected' : '');
    row.addEventListener('click', () => handlers.onSelect(t.id));

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${masked ? 'story trophy' : t.name} earned`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      handlers.onToggleEarned(t.id, box.checked);
    });
    row.append(box);

    const middle = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'tname';
    name.textContent = masked ? 'Story trophy — hidden until earned' : t.name;
    middle.append(name);
    const desc = document.createElement('span');
    desc.className = 'tdesc';
    desc.style.display = 'block';
    desc.textContent = masked ? 'Hidden on PlayStation until earned.' : t.description;
    middle.append(desc);
    const meta = document.createElement('span');
    meta.className = 'tmeta';
    meta.style.display = 'flex';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = kindLabel(t.kind);
    meta.append(kindTag);
    const stageTag = document.createElement('span');
    stageTag.className = 'tag';
    stageTag.textContent = t.stage;
    meta.append(stageTag);
    if (t.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden-tag';
      hiddenTag.textContent = 'HIDDEN ON PSN';
      meta.append(hiddenTag);
    }
    if (t.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'POSSIBLY MISSABLE';
      meta.append(missTag);
    }
    if (t.unconfirmed) {
      const uncTag = document.createElement('span');
      uncTag.className = 'tag unconfirmed-tag';
      uncTag.textContent = 'UNCONFIRMED';
      meta.append(uncTag);
    }
    if (t.counter) {
      const current = state.counters.get(t.id) || 0;
      if (current > 0) {
        const counterChip = document.createElement('span');
        counterChip.className = 'counter-chip';
        counterChip.textContent = `${current}/${t.counter.target} ${t.counter.label.toLowerCase()}`;
        meta.append(counterChip);
      }
    }
    middle.append(meta);
    row.append(middle);

    const badge = document.createElement('span');
    badge.className = `grade-badge ${t.grade}`;
    badge.textContent = gradeLetter(t.grade);
    badge.title = t.grade;
    row.append(badge);

    container.append(row);
  }
  return rows.length;
}

function citationSpan(document, data, sourceId) {
  const source = data.sources.find((s) => s.id === sourceId);
  const span = document.createElement('span');
  span.className = 'cite';
  if (source && source.url) {
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `[${sourceId}]`;
    link.title = `${source.name} — read ${source.read}`;
    span.append(link);
  } else {
    span.textContent = `[${sourceId}]`;
    span.title = source ? `${source.name} — read ${source.read}` : `Source ${sourceId}`;
  }
  return span;
}

export function renderDetail(container, data, state, ui, handlers) {
  const trophy = data.trophies.find((t) => t.id === ui.selected) || data.trophies[0];
  const masked = isMasked(trophy, state) && !ui.revealed.has(trophy.id);
  const doc = container.ownerDocument;
  container.replaceChildren();

  const title = doc.createElement('h2');
  title.textContent = masked ? 'Story trophy — hidden until earned' : trophy.name;
  container.append(title);

  const official = doc.createElement('p');
  official.className = 'official';
  official.textContent = masked
    ? 'Hidden on PlayStation until earned. Tick it earned, or turn Spoilers off, to reveal it.'
    : `“${trophy.description}” — official description, shown as PlayStation publishes it.`;
  container.append(official);

  const badges = doc.createElement('div');
  badges.className = 'badges';
  const gradeBadge = doc.createElement('span');
  gradeBadge.className = `grade-badge ${trophy.grade}`;
  gradeBadge.textContent = gradeLetter(trophy.grade);
  badges.append(gradeBadge);
  for (const [label, cls] of [
    [trophy.grade, 'tag'], [kindLabel(trophy.kind), 'tag'], [`Roadmap ${trophy.stage}`, 'tag'],
  ]) {
    const tag = doc.createElement('span');
    tag.className = cls;
    tag.textContent = label;
    badges.append(tag);
  }
  if (trophy.hidden) {
    const tag = doc.createElement('span');
    tag.className = 'tag hidden-tag';
    tag.textContent = 'HIDDEN ON PSN';
    badges.append(tag);
  }
  container.append(badges);

  if (masked) {
    const note = doc.createElement('p');
    note.className = 'masked';
    note.textContent = 'This is a hidden story trophy. Its name, description and guide stay hidden until you earn it — or until you turn Spoilers off at the top of the page.';
    container.append(note);
    const reveal = doc.createElement('button');
    reveal.type = 'button';
    reveal.className = 'chip';
    reveal.textContent = 'Reveal this trophy';
    reveal.addEventListener('click', () => handlers.onReveal(trophy.id));
    container.append(reveal);
    return;
  }

  if (trophy.missable) {
    const banner = doc.createElement('div');
    banner.className = 'missable-banner';
    banner.textContent = 'POSSIBLY MISSABLE — the only trophy on the list that might be. See step 1, then keep a Chapter 1 manual save.';
    container.append(banner);
  }
  if (trophy.disagree) {
    const box = doc.createElement('div');
    box.className = 'disagree-box';
    const head = doc.createElement('b');
    head.textContent = 'SOURCES DISAGREE — BOTH VERSIONS SHOWN';
    box.append(head);
    box.append(doc.createTextNode('Two sources give different versions of a fact on this trophy. The steps below show both, and this guide does not pick one.'));
    container.append(box);
  }
  if (trophy.unconfirmed) {
    const box = doc.createElement('div');
    box.className = 'unconfirmed-box';
    const head = doc.createElement('b');
    head.textContent = 'UNCONFIRMED';
    box.append(head);
    box.append(doc.createTextNode('No source has pinned this method down yet. The steps below say what is known, what is only a belief, and what is still being found.'));
    container.append(box);
  }

  const guide = doc.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  container.append(guide);

  if (trophy.counter) {
    const current = state.counters.get(trophy.id) || 0;
    const widget = doc.createElement('div');
    widget.className = 'counter-widget';
    const minus = doc.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Decrease counter');
    minus.addEventListener('click', () => handlers.onCounter(trophy.id, -1));
    const plus = doc.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Increase counter');
    plus.addEventListener('click', () => handlers.onCounter(trophy.id, 1));
    const big = doc.createElement('span');
    big.className = 'count-big';
    big.textContent = `${current}/${trophy.counter.target}`;
    const label = doc.createElement('span');
    label.textContent = trophy.counter.label + (trophy.counter.unit ? ` (${trophy.counter.unit})` : '');
    const bar = doc.createElement('span');
    bar.className = 'bar';
    const fill = doc.createElement('i');
    fill.style.width = `${Math.min(100, Math.round((current / trophy.counter.target) * 100))}%`;
    bar.append(fill);
    widget.append(minus, big, label, bar, plus);
    container.append(widget);
  }

  if (trophy.balcony) {
    const label = doc.createElement('label');
    label.className = 'balcony-check';
    const box = doc.createElement('input');
    box.type = 'checkbox';
    box.checked = state.balconyDone;
    box.addEventListener('change', () => handlers.onBalcony(box.checked));
    label.append(box, doc.createTextNode(' Chapter 1 balcony meditation done — keep the Chapter 1 save until the trophy pops.'));
    container.append(label);
  }

  const steps = doc.createElement('ol');
  steps.className = 'steps';
  for (const step of trophy.steps || []) {
    const li = doc.createElement('li');
    li.append(doc.createTextNode(step.text + ' '));
    for (const sourceId of step.sources || []) {
      li.append(citationSpan(doc, data, sourceId), doc.createTextNode(' '));
    }
    steps.append(li);
  }
  container.append(steps);

  const citedBy = doc.createElement('p');
  citedBy.className = 'cited-by';
  const sourceNames = sourcesOfTrophy(trophy).map((n) => {
    const s = data.sources.find((x) => x.id === n);
    return s ? `${s.name} [${n}]` : `Source ${n}`;
  }).join(', ');
  citedBy.textContent = `Sources for this guide: ${sourceNames}. All sources read 20 Nov 2026.`;
  container.append(citedBy);
}
