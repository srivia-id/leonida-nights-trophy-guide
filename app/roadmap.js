// LEONIDA NIGHTS — the platinum roadmap view: seven stages, S1–S7, each with
// its trophies, its hours and its earned count, built from the official
// descriptions (which chapters and missions, which collectibles and counts).

import { STAGES, gradeLetter } from './data.js';
import { isEarned } from './store.js';
import { stageProgress } from './plan.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function stageCard(stage, trophies, state, onSelect) {
  const card = el('section', 'stage-card');
  const head = el('div', 'stage-head');
  const title = el('h3', null, `${stage.id} · ${stage.title}`);
  const progress = stageProgress(trophies, state, stage.id);
  const meta = el('p', 'stage-meta', `${stage.hours} · ${progress.earned}/${progress.total} earned`);
  head.append(title, meta);
  card.append(head, el('p', 'stage-blurb', stage.blurb));
  const list = el('ul', 'stage-trophies');
  for (const trophy of trophies.filter((t) => t.stage === stage.id)) {
    const item = el('li', 'stage-trophy' + (isEarned(state, trophy) ? ' earned' : ''));
    const box = el('span', 'tick', isEarned(state, trophy) ? '✓' : '○');
    const name = el('span', 't-name', trophy.name);
    const badge = el('span', `grade grade-${trophy.grade}`, gradeLetter(trophy.grade));
    item.append(box, name, badge);
    if (trophy.missable) item.append(el('span', 'flag flag-missable', 'POSSIBLY MISSABLE'));
    item.addEventListener('click', () => onSelect(trophy));
    list.append(item);
  }
  card.append(list);
  return card;
}

export function renderRoadmap(container, trophies, state, onSelect) {
  container.replaceChildren();
  const intro = el(
    'p',
    'view-intro',
    'One playthrough, about 200 hours at the guides’ pace: five story chapters, then the 100% checklist, then cleanup. Click any trophy to open its guide.',
  );
  container.append(intro);
  for (const stage of STAGES) {
    container.append(stageCard(stage, trophies, state, onSelect));
  }
}
