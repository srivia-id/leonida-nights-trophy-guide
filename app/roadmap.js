// LEONIDA NIGHTS — the Roadmap tab: seven stages S1–S7, each with its
// trophies, its hours, and live earned progress.
import { kindLabel } from './data.js';

export function renderRoadmap(container, data, state) {
  container.replaceChildren();
  for (const stage of data.stages) {
    const members = data.trophies.filter((t) => t.stage === stage.id);
    const earned = members.filter((t) => state.earned.has(t.id)).length;
    const card = container.ownerDocument.createElement('article');
    card.className = 'stage-card';

    const title = container.ownerDocument.createElement('h3');
    title.textContent = `${stage.id} — ${stage.title}`;
    card.append(title);

    const meta = container.ownerDocument.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = `≈${stage.hours} hours · ${members.length} trophies`;
    card.append(meta);

    const note = container.ownerDocument.createElement('p');
    note.className = 'stage-note';
    note.textContent = stage.note;
    card.append(note);

    const chips = container.ownerDocument.createElement('div');
    chips.className = 'stage-trophies';
    for (const t of members) {
      const chip = container.ownerDocument.createElement('span');
      chip.className = 'tag' + (state.earned.has(t.id) ? ' done' : '');
      chip.textContent = `${t.name} · ${kindLabel(t.kind)}`;
      chip.title = t.description;
      chips.append(chip);
    }
    card.append(chips);

    const progress = container.ownerDocument.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = `${earned}/${members.length} earned in this stage`;
    card.append(progress);

    container.append(card);
  }
}
