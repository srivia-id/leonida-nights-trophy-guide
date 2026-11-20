// LEONIDA NIGHTS — planner: the Next Up list, the watch list with reasons,
// the missable hero, and the time-to-platinum estimate.
import { remainingHours } from './data.js';

function nextUpList(data, state) {
  const unearned = data.trophies.filter((t) => !state.earned.has(t.id));
  const byStageOrder = (t) => data.stages.findIndex((s) => s.id === t.stage);
  const scored = unearned.map((t) => {
    let score = byStageOrder(t) * 10;
    if (t.missable) score -= 100;
    if (t.stage === 'S1') score -= 20;
    if (t.counter && (state.counters.get(t.id) || 0) > 0) score -= 5;
    return { trophy: t, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 5).map((entry) => entry.trophy);
}

export function renderNextUp(container, data, state, onSelect) {
  container.replaceChildren();
  const doc = container.ownerDocument;
  const heading = doc.createElement('h3');
  heading.textContent = 'Next up — earliest ungated';
  container.append(heading);
  const list = nextUpList(data, state);
  if (list.length === 0) {
    const done = doc.createElement('p');
    done.textContent = 'Every trophy is earned. The platinum is yours — Leonida Legend.';
    container.append(done);
    return;
  }
  for (const t of list) {
    const item = doc.createElement('div');
    item.className = 'next-item';
    const name = doc.createElement('b');
    const link = doc.createElement('a');
    link.href = '#';
    link.textContent = t.name;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      onSelect(t.id);
    });
    name.append(link);
    item.append(name);
    const why = doc.createElement('span');
    why.textContent = t.missable
      ? 'Possibly missable — do it before Chapter 1 ends.'
      : t.stage === 'S1'
        ? 'Chapter 1 — earliest stage, do it while you are here.'
        : `Roadmap ${t.stage} — the earliest stage with trophies left.`;
    item.append(why);
    container.append(item);
  }
}

export function renderEstimate(element, data, state) {
  const { total, remaining } = remainingHours(data, state);
  element.textContent = `Time to platinum ≈ ${total} hours in total (PowerPyx: 60–80 story, about 100 checklist, 10–20 cleanup) · about ${remaining} hours left at your current progress.`;
}

export function renderWatch(container, data) {
  container.replaceChildren();
  const doc = container.ownerDocument;
  const heading = doc.createElement('h3');
  heading.textContent = 'Watch list — six things to mind';
  container.append(heading);
  for (const item of data.watch) {
    const block = doc.createElement('div');
    block.className = 'watch-item';
    const title = doc.createElement('b');
    title.textContent = item.title;
    block.append(title);
    block.append(doc.createTextNode(item.reason));
    container.append(block);
  }
}

export function renderMissableHero(container, data, state) {
  container.replaceChildren();
  const doc = container.ownerDocument;
  const trophy = data.trophies.find((t) => t.missable === 'possible');
  const heading = doc.createElement('h3');
  heading.textContent = `The one possibly missable trophy: ${trophy.name}`;
  container.append(heading);
  const intro = doc.createElement('p');
  intro.textContent = 'One trophy, and only possibly. Every other trophy can be earned after the story in free-roam, and every story trophy pops on its own. This one needs a minute of your attention in Chapter 1.';
  container.append(intro);
  const list = doc.createElement('ol');
  for (const step of trophy.steps) {
    const li = doc.createElement('li');
    li.textContent = step.text;
    list.append(li);
  }
  container.append(list);
  const status = doc.createElement('p');
  status.textContent = state.earned.has(trophy.id)
    ? 'Earned — the missable is safe.'
    : state.balconyDone
      ? 'Balcony meditation done — the risky part is behind you. Finish the other 17 spots when you can.'
      : 'Balcony meditation not done yet — do it before Chapter 1 ends.';
  container.append(status);
}

export function renderSpoilerSafe(container, data, state, onSelect) {
  container.replaceChildren();
  const doc = container.ownerDocument;
  const heading = doc.createElement('h3');
  heading.textContent = 'Spoiler-safe — hidden story trophies';
  container.append(heading);
  const note = doc.createElement('p');
  note.textContent = state.spoilerOn
    ? 'Spoilers are off: the 12 hidden story trophies below show only their chapter until you earn them. Turn Spoilers off at the top of the page to reveal them all.'
    : 'Spoilers are on: every hidden story trophy is shown in full.';
  container.append(note);
  for (const t of data.trophies.filter((x) => x.hidden && x.kind === 'story')) {
    const row = doc.createElement('div');
    row.className = 'hidden-row';
    const label = doc.createElement('span');
    const masked = state.spoilerOn && !state.earned.has(t.id);
    label.textContent = masked
      ? `Story trophy — ${t.stage === 'S1' ? 'Chapter 1' : t.stage === 'S2' ? 'Chapters 2–3' : t.stage === 'S3' ? 'Chapter 4' : 'Chapter 5 & finale'} (hidden until earned)`
      : `${t.name} — ${t.description}`;
    row.append(label);
    const action = doc.createElement('button');
    action.type = 'button';
    action.className = 'reveal';
    action.textContent = state.earned.has(t.id) ? 'Earned ✓' : masked ? 'Reveal' : 'Open guide';
    action.addEventListener('click', () => onSelect(t.id));
    row.append(action);
    container.append(row);
  }
}
