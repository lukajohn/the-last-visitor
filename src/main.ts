type SceneId = 'bedroom' | 'office' | 'interview' | 'reconstruction';
type EvidenceKind = 'DOCUMENT' | 'MEDICAL' | 'FINANCIAL' | 'TESTIMONY' | 'PHOTOGRAPH' | 'ARCHIVE';
type Evidence = {
  id: string;
  title: string;
  kind: EvidenceKind;
  date: string;
  summary: string;
  detail: string;
  source: string;
};
type Hotspot = { id: string; x: number; y: number; w: number; h: number; label: string; evidenceId?: string; description?: string };
type SaveData = {
  version: number;
  scene: SceneId;
  collected: string[];
  deductions: string[];
  dialogueFlags: string[];
  presence: number;
  ended: boolean;
  soundEnabled: boolean;
};

const SAVE_KEY = 'the-last-visitor-save-v1';
const VERSION = 1;
const W = 480;
const H = 270;

const evidence: Evidence[] = [
  {
    id: 'letter', title: 'The Unsent Letter', kind: 'DOCUMENT', date: 'OCT 29, 1966',
    summary: 'A letter drafted but never mailed. Its timeline does not quite agree with the account given to police.',
    detail: 'The note is brief, almost domestic in tone. A sentence near the bottom mentions that a visitor was expected before supper — earlier than the time later given in the official account. The envelope is still blank.',
    source: 'Bedroom · writing desk',
  },
  {
    id: 'photo', title: 'A Familiar Face', kind: 'PHOTOGRAPH', date: 'UNDATED',
    summary: 'A faded photograph shows the same man beside a woman who is not the deceased.',
    detail: 'The photograph has no caption. On the reverse, in blue pencil: “A good day. Before everything changed.” The man is identifiable from other photographs in the file. It suggests a longer history than the current case first appeared to have.',
    source: 'Bedroom · bedside cabinet',
  },
  {
    id: 'policy', title: 'Policy Amendment', kind: 'FINANCIAL', date: 'SEP 14, 1966',
    summary: 'A beneficiary amendment was filed several weeks before the death.',
    detail: 'The document records a change to a life-insurance policy. The amendment is not proof of a crime, but it establishes a possible financial motive and a date worth comparing with the other records.',
    source: 'Bedroom · document folder',
  },
  {
    id: 'medical', title: 'Hospital Summary', kind: 'MEDICAL', date: 'NOV 03, 1966',
    summary: 'A physician recorded an unexplained episode of profound hypoglycemia.',
    detail: 'The summary describes a sudden, severe metabolic emergency and notes that the cause was not established at admission. The record does not identify who — if anyone — caused it. A later review would be needed to understand the finding in context.',
    source: 'Bedroom · medical envelope',
  },
  {
    id: 'neighbor', title: 'Statement: Mrs. Bell', kind: 'TESTIMONY', date: 'NOV 05, 1966',
    summary: 'A neighbor remembers seeing a visitor arrive earlier than the husband reported.',
    detail: '“I remember the car because its left headlamp was dim. It was still light out when it turned into the drive.” The statement gives no identity with certainty, but it places an unaccounted-for visitor at the house earlier in the evening.',
    source: 'Bedroom · telephone message pad',
  },
  {
    id: 'clipping', title: 'An Older Obituary', kind: 'ARCHIVE', date: '1947',
    summary: 'A newspaper clipping records an earlier death connected to the same social circle.',
    detail: 'The short obituary is easy to overlook. A name in the surviving correspondence links the deceased to a man later investigated in other suspicious deaths. The clipping is a lead, not a verdict; dates and testimony still need to be checked.',
    source: 'Bedroom · newspaper drawer',
  },
];

const hotspots: Hotspot[] = [
  { id: 'desk', x: 54, y: 148, w: 105, h: 73, label: 'Writing desk', evidenceId: 'letter' },
  { id: 'cabinet', x: 350, y: 145, w: 73, h: 76, label: 'Bedside cabinet', evidenceId: 'photo' },
  { id: 'folder', x: 186, y: 174, w: 62, h: 37, label: 'Document folder', evidenceId: 'policy' },
  { id: 'envelope', x: 276, y: 178, w: 58, h: 33, label: 'Medical envelope', evidenceId: 'medical' },
  { id: 'phone', x: 82, y: 111, w: 37, h: 34, label: 'Telephone message pad', evidenceId: 'neighbor' },
  { id: 'drawer', x: 346, y: 111, w: 75, h: 31, label: 'Newspaper drawer', evidenceId: 'clipping' },
];

const deductions = [
  { id: 'timeline', title: 'A TIMELINE THAT DOESN’T HOLD', description: 'The letter and the neighbor’s statement place an unaccounted-for visitor at the house earlier than the official account suggests.', pair: ['letter', 'neighbor'] },
  { id: 'motive', title: 'A FINANCIAL INTEREST', description: 'The policy amendment and the unsent letter establish a possible financial motive and a reason to examine the dates closely.', pair: ['policy', 'letter'] },
  { id: 'pattern', title: 'A PATTERN WORTH EXAMINING', description: 'The hospital summary and older obituary connect the present death to a wider set of suspicious circumstances. They justify further investigation, not a conclusion by themselves.', pair: ['medical', 'clipping'] },
] as const;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root #app was not found.');

app.innerHTML = `
  <div class="game-shell">
    <header class="topbar">
      <a class="wordmark" href="#home" aria-label="The Last Visitor home"><span class="mark">LV</span><span>THE LAST VISITOR</span></a>
      <div class="case-meta"><span class="live-dot"></span><span>CASE 06—11—67</span><span class="meta-divider">/</span><span id="chapter-label">THE BEDROOM</span></div>
      <div class="top-actions"><button class="icon-button" id="sound-toggle" aria-label="Toggle sound" title="Toggle sound">◖</button><button class="icon-button" id="help-button" aria-label="Controls" title="Controls">?</button></div>
    </header>
    <main id="game-main">
      <section class="title-screen" id="title-screen">
        <div class="title-backdrop"><div class="rain-layer"></div><div class="window-glow"></div><div class="title-shadow"></div></div>
        <div class="title-content">
          <p class="eyebrow">A CASE FILE IN SIX MOVEMENTS</p>
          <h1>THE LAST<br><em>VISITOR</em></h1>
          <p class="title-subtitle">Some doors should never have been opened.</p>
          <div class="title-rule"></div>
          <p class="title-copy">CALIFORNIA, 1967<br>A death has been called an accident.<br>The details disagree.</p>
          <div class="title-actions"><button class="primary-button" id="new-game">OPEN THE CASE <span>↗</span></button><button class="text-button" id="continue-game">CONTINUE FILE</button></div>
          <p class="title-foot">A WORK OF HISTORICAL FICTION · SOUND OPTIONAL</p>
        </div>
        <div class="title-credit">AN INTERACTIVE DETECTIVE STORY <span>—</span> VOL. 01</div>
      </section>
      <section class="play-screen hidden" id="play-screen">
        <div class="chapter-strip"><div><span class="chapter-number" id="chapter-number">01</span><span class="chapter-name" id="chapter-name">THE BEDROOM</span></div><span class="chapter-date" id="chapter-date">NOVEMBER 06, 1966 · 11:42 PM</span></div>
        <div class="stage-wrap">
          <div class="canvas-frame"><canvas id="game-canvas" width="960" height="540" aria-label="Interactive pixel-art investigation scene"></canvas><div class="canvas-grain"></div><div class="scene-caption" id="scene-caption">Click an object to examine it.</div><div class="presence-indicator" id="presence-indicator"><span></span> SOMETHING IS OUT OF PLACE</div></div>
          <aside class="case-sidebar">
            <div class="sidebar-head"><span class="eyebrow">INVESTIGATION</span><span class="file-number">NO. 0067</span></div>
            <div class="progress-block"><div class="progress-label"><span>CASE PROGRESS</span><b id="progress-count">0 / 6</b></div><div class="progress-track"><i id="progress-fill"></i></div></div>
            <div class="sidebar-section"><div class="section-heading">CURRENT OBJECTIVE <span>↘</span></div><p id="objective-text">Search the bedroom. Six details may help explain the final hours.</p></div>
            <div class="sidebar-section clue-list-section"><div class="section-heading">CASE FILE <span id="clue-count">00 ITEMS</span></div><div class="mini-evidence-list" id="mini-evidence-list"><p class="empty-list">No evidence collected.</p></div></div>
            <div class="sidebar-bottom"><button class="sidebar-button" id="journal-button">JOURNAL <span>J</span></button><button class="sidebar-button" id="board-button">EVIDENCE BOARD <span>B</span></button></div>
          </aside>
        </div>
        <div class="bottom-bar"><div class="scene-hint"><span class="hint-dot"></span><span id="bottom-hint">Examine the room. The smallest details matter.</span></div><div class="bottom-actions"><button class="quiet-button" id="back-button">← TITLE</button><button class="primary-button small" id="advance-button" disabled>RETURN TO OFFICE <span>↗</span></button></div></div>
      </section>
    </main>
    <footer class="site-footer"><span>THE LAST VISITOR <span class="footer-sep">/</span> A FICTIONALIZED INVESTIGATION</span><span>BEST EXPERIENCED WITH HEADPHONES · 16:9</span></footer>
  </div>
  <div class="modal-layer hidden" id="modal-layer" role="presentation"><section class="modal-card" id="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" id="modal-close" aria-label="Close">×</button><div id="modal-content"></div></section></div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d', { alpha: false })!;
ctx.imageSmoothingEnabled = false;
const $ = <T extends HTMLElement>(selector: string): T => {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing UI element: ${selector}`);
  return el;
};

let currentScene: SceneId = 'bedroom';
let collected = new Set<string>();
let completedDeductions = new Set<string>();
let dialogueFlags = new Set<string>();
let presence = 0;
let hoveredHotspot: string | null = null;
let selectedEvidence: string[] = [];
let modalOpen = false;
let soundEnabled = false;
let audioContext: AudioContext | null = null;
let rainNode: AudioBufferSourceNode | null = null;
let rainGain: GainNode | null = null;
let ended = false;
let animationFrame = 0;
let lastFrame = 0;
let elapsed = 0;
let toastTimer = 0;
let titleContinueAvailable = false;

function showToast(message: string): void {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
}

function openModal(content: string): void {
  $('#modal-content').innerHTML = content;
  $('#modal-layer').classList.remove('hidden');
  modalOpen = true;
  document.body.classList.add('modal-active');
}
function closeModal(): void {
  $('#modal-layer').classList.add('hidden');
  modalOpen = false;
  document.body.classList.remove('modal-active');
  selectedEvidence = [];
  renderSidebar();
}

function persist(): void {
  const save: SaveData = { version: VERSION, scene: currentScene, collected: [...collected], deductions: [...completedDeductions], dialogueFlags: [...dialogueFlags], presence, ended, soundEnabled };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { showToast('This browser could not save the case file.'); }
}
function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (data.version !== VERSION || !Array.isArray(data.collected) || !Array.isArray(data.deductions)) return null;
    return {
      version: VERSION,
      scene: ['bedroom', 'office', 'interview', 'reconstruction'].includes(String(data.scene)) ? data.scene as SceneId : 'bedroom',
      collected: data.collected.filter((id): id is string => evidence.some((item) => item.id === id)),
      deductions: data.deductions.filter((id): id is string => deductions.some((item) => item.id === id)),
      dialogueFlags: Array.isArray(data.dialogueFlags) ? data.dialogueFlags.filter((flag): flag is string => typeof flag === 'string') : [],
      presence: typeof data.presence === 'number' ? Math.max(0, Math.min(10, data.presence)) : 0,
      ended: Boolean(data.ended),
      soundEnabled: Boolean(data.soundEnabled),
    };
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

function renderSidebar(): void {
  $('#progress-count').textContent = `${collected.size} / ${evidence.length}`;
  $('#clue-count').textContent = `${String(collected.size).padStart(2, '0')} ITEMS`;
  $('#progress-fill').setAttribute('style', `width:${(collected.size / evidence.length) * 100}%`);
  const list = $('#mini-evidence-list');
  if (!collected.size) list.innerHTML = '<p class="empty-list">No evidence collected.</p>';
  else list.innerHTML = [...collected].map((id) => {
    const item = evidence.find((entry) => entry.id === id)!;
    return `<button class="mini-evidence" data-evidence="${item.id}"><span class="mini-type">${item.kind.slice(0, 3)}</span><span>${item.title}</span><i>↗</i></button>`;
  }).join('');
  list.querySelectorAll<HTMLButtonElement>('[data-evidence]').forEach((button) => button.addEventListener('click', () => inspectEvidence(button.dataset.evidence!)));
  const objective = currentScene === 'bedroom'
    ? 'Find at least three details before returning to the office. The full set may change what you can prove.'
    : currentScene === 'office'
      ? completedDeductions.size === 3 ? 'All three connections are established. Review the file, then question Archerd.' : `Connect evidence on the board. ${completedDeductions.size} of 3 deductions established.`
      : currentScene === 'interview' ? 'Put the contradictions to Archerd. Ask about the timeline, the policy, and the medical record.'
      : 'Review what the evidence can — and cannot — establish.';
  $('#objective-text').textContent = objective;
  const canAdvance = currentScene === 'bedroom' ? collected.size >= 3 : currentScene === 'office' || currentScene === 'interview';
  $('#advance-button').toggleAttribute('disabled', !canAdvance);
  $('#advance-button').innerHTML = currentScene === 'bedroom' ? 'RETURN TO OFFICE <span>↗</span>' : currentScene === 'office' ? 'BEGIN INTERVIEW <span>↗</span>' : currentScene === 'interview' ? (['timeline', 'motive', 'pattern'].every((flag) => dialogueFlags.has(`asked-${flag}`)) ? 'RECONSTRUCT THE CASE <span>↗</span>' : 'SUBMIT CURRENT FILE <span>↗</span>') : 'CASE REVIEW COMPLETE';
  $('#chapter-label').textContent = currentScene.toUpperCase();
  $('#chapter-name').textContent = currentScene === 'bedroom' ? 'THE BEDROOM' : currentScene === 'office' ? 'THE EVIDENCE ROOM' : currentScene === 'interview' ? 'THE INTERVIEW' : 'THE RECONSTRUCTION';
  $('#chapter-number').textContent = currentScene === 'bedroom' ? '01' : currentScene === 'office' ? '02' : currentScene === 'interview' ? '03' : '04';
  $('#chapter-date').textContent = currentScene === 'bedroom' ? 'NOVEMBER 06, 1966 · 11:42 PM' : currentScene === 'office' ? 'NOVEMBER 07, 1966 · 1:18 AM' : currentScene === 'interview' ? 'JULY 12, 1967 · 9:06 AM' : 'THE CASE FILE · RECONSTRUCTED';
  $('#board-button').classList.toggle('active', currentScene === 'office');
}

function inspectEvidence(id: string): void {
  const item = evidence.find((entry) => entry.id === id);
  if (!item) return;
  const isCollected = collected.has(id);
  openModal(`
    <p class="eyebrow">EVIDENCE ${String(evidence.findIndex((entry) => entry.id === id) + 1).padStart(2, '0')} / ${item.kind}</p>
    <h2 id="modal-title">${item.title}</h2>
    <div class="evidence-meta"><span>${item.date}</span><span>${item.source}</span></div>
    <p class="evidence-lede">${item.summary}</p>
    <p class="evidence-detail">${item.detail}</p>
    <div class="evidence-stamp">${isCollected ? 'ADDED TO CASE FILE' : 'UNVERIFIED LEAD'}</div>
    <div class="modal-actions">${isCollected ? '<button class="primary-button" id="modal-done">CLOSE FILE <span>↗</span></button>' : '<button class="primary-button" id="collect-evidence">ADD TO CASE FILE <span>＋</span></button>'}</div>
  `);
  $('#modal-done')?.addEventListener('click', closeModal);
  $('#collect-evidence')?.addEventListener('click', () => {
    if (!collected.has(id)) {
      collected.add(id);
      presence = Math.min(10, presence + 1);
      persist();
      renderSidebar();
      updatePresence();
      showToast('Evidence recorded. The case file has been updated.');
    }
    closeModal();
  });
}

function updatePresence(): void {
  const indicator = $('#presence-indicator');
  indicator.classList.toggle('visible', presence >= 3);
  if (presence === 3) showToast('A sound from the hallway. Then nothing.');
  if (presence === 5) showToast('The telephone light is on. You do not remember turning it on.');
}

function switchScene(scene: SceneId): void {
  currentScene = scene;
  hoveredHotspot = null;
  $('#title-screen').classList.add('hidden');
  $('#play-screen').classList.remove('hidden');
  $('#scene-caption').textContent = scene === 'bedroom' ? 'Click an object to examine it.' : scene === 'office' ? 'The evidence is yours. The connections are not.' : scene === 'interview' ? 'Listen carefully. Present evidence when a statement does not fit.' : 'A reconstruction is not the same thing as certainty.';
  $('#bottom-hint').textContent = scene === 'bedroom' ? 'Examine the room. The smallest details matter.' : scene === 'office' ? 'Select two evidence cards to test a connection.' : scene === 'interview' ? 'Ask carefully. A contradiction is more useful than an accusation.' : 'Separate what is documented from what is inferred.';
  $('#advance-button').textContent = scene === 'bedroom' ? 'RETURN TO OFFICE ↗' : scene === 'office' ? 'BEGIN INTERVIEW ↗' : scene === 'interview' ? 'RECONSTRUCT THE CASE ↗' : 'CLOSE THE CASE ↗';
  renderSidebar();
  persist();
  drawScene();
}

function beginNewGame(): void {
  collected = new Set(); completedDeductions = new Set(); dialogueFlags = new Set(); presence = 0; ended = false; currentScene = 'bedroom';
  localStorage.removeItem(SAVE_KEY);
  switchScene('bedroom');
  openModal(`<p class="eyebrow">CASE ASSIGNMENT / NOVEMBER 06, 1966</p><h2 id="modal-title">A death without an explanation.</h2><p class="evidence-lede">The report says the woman died after a sudden medical emergency. Her husband says there is nothing unusual to investigate.</p><p class="evidence-detail">You have been asked to review the bedroom before the property is released. The house is quiet. Rain has been falling for hours. On the desk, a telephone message is still open — and the official timeline leaves a small gap.</p><div class="evidence-stamp">FIELD NOTE · DO NOT ASSUME</div><div class="modal-actions"><button class="primary-button" id="briefing-close">ENTER THE ROOM <span>↗</span></button></div>`);
  $('#briefing-close').addEventListener('click', closeModal);
}
function continueGame(): void {
  const save = loadSave();
  if (!save) { showToast('No readable case file was found.'); return; }
  collected = new Set(save.collected); completedDeductions = new Set(save.deductions); dialogueFlags = new Set(save.dialogueFlags); presence = save.presence; ended = save.ended; soundEnabled = save.soundEnabled;
  updateSoundButton(); switchScene(save.scene); renderSidebar(); updatePresence();
  if (save.scene === 'interview' && !save.ended) openInterview();
  if (save.scene === 'reconstruction' && save.ended) showReconstruction();
}

function showTitle(): void {
  $('#play-screen').classList.add('hidden');
  $('#title-screen').classList.remove('hidden');
  const save = loadSave();
  titleContinueAvailable = Boolean(save);
  $('#continue-game').classList.toggle('hidden', !titleContinueAvailable);
  stopAudio();
}

function openBoard(): void {
  selectedEvidence = [];
  const cards = [...collected].map((id) => evidence.find((entry) => entry.id === id)!);
  const connectionLines = completedDeductions.size ? `<div class="deduction-summary">${deductions.filter((d) => completedDeductions.has(d.id)).map((d) => `<div class="deduction-done"><span>✓</span><div><b>${d.title}</b><p>${d.description}</p></div></div>`).join('')}</div>` : '';
  openModal(`
    <p class="eyebrow">INVESTIGATION / WORKING THEORY</p><h2 id="modal-title">The evidence board</h2>
    <p class="modal-intro">Select two cards to test a connection. A correct deduction will be recorded. A plausible theory is not the same as proof.</p>
    <div class="board-count"><span>${cards.length} ITEMS IN THE FILE</span><span>${completedDeductions.size} / 3 CONNECTIONS</span></div>
    <div class="board-grid" id="board-grid">${cards.map((card) => `<button class="board-card" data-card="${card.id}"><span class="card-type">${card.kind}</span><b>${card.title}</b><small>${card.date}</small><i class="card-select">＋</i></button>`).join('')}</div>
    <div class="board-feedback" id="board-feedback">Choose two pieces of evidence to compare.</div>
    ${connectionLines}
    <div class="modal-actions"><button class="primary-button" id="board-close">RETURN TO FILE <span>↗</span></button></div>
  `);
  const grid = $('#board-grid');
  grid.querySelectorAll<HTMLButtonElement>('[data-card]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.card!;
    if (selectedEvidence.includes(id)) selectedEvidence = selectedEvidence.filter((value) => value !== id);
    else if (selectedEvidence.length < 2) selectedEvidence.push(id);
    grid.querySelectorAll('[data-card]').forEach((node) => node.classList.toggle('selected', selectedEvidence.includes((node as HTMLElement).dataset.card!)));
    const feedback = $('#board-feedback');
    if (selectedEvidence.length === 2) evaluateConnection(feedback);
    else feedback.textContent = 'Select one more piece of evidence.';
  }));
  $('#board-close').addEventListener('click', () => { closeModal(); renderSidebar(); drawScene(); });
}

function evaluateConnection(feedback: HTMLElement): void {
  const pair = [...selectedEvidence].sort();
  const match = deductions.find((d) => [...d.pair].sort().join('|') === pair.join('|'));
  if (match) {
    if (completedDeductions.has(match.id)) feedback.innerHTML = `<span class="feedback-good">ALREADY ESTABLISHED</span><br>${match.description}`;
    else {
      completedDeductions.add(match.id); presence = Math.min(10, presence + 1); persist(); renderSidebar(); updatePresence();
      feedback.innerHTML = `<span class="feedback-good">CONNECTION ESTABLISHED · ${match.title}</span><br>${match.description}`;
      showToast('A new deduction has been added to the board.');
    }
  } else {
    feedback.innerHTML = '<span class="feedback-neutral">NO CLEAR CONNECTION</span><br>These records may still matter, but this pairing does not establish a deduction. Try another combination.';
  }
  selectedEvidence = [];
  document.querySelectorAll('.board-card.selected').forEach((node) => node.classList.remove('selected'));
  const counter = document.querySelector('.board-count span:last-child');
  if (counter) counter.textContent = `${completedDeductions.size} / 3 CONNECTIONS`;
}

const interviewTopics = [
  { id: 'timeline', title: 'The visitor’s timeline', unlock: 'timeline', line: 'You have a neighbor who remembers a car arriving before the time you gave the police. Your account places it later.', answer: 'Memory is an unreliable thing, detective. Especially after a death. People remember what they think they saw.', follow: 'Then we will keep the times separate until they can be checked.' },
  { id: 'motive', title: 'The policy amendment', unlock: 'motive', line: 'A policy beneficiary was changed weeks before the death. You did not mention it when we first spoke.', answer: 'A private financial arrangement is not a confession. You have a document. You do not have an explanation.', follow: 'No. I have a date, a beneficiary, and a question you have not answered.' },
  { id: 'pattern', title: 'The medical record', unlock: 'pattern', line: 'The hospital summary describes an unexplained medical emergency. There are earlier deaths in the wider file that deserve review.', answer: 'You are joining unrelated tragedies because you want them to form a pattern. That does not make the pattern real.', follow: 'That is why we are checking the records rather than guessing.' },
];

function openInterview(): void {
  renderInterview();
}
function renderInterview(): void {
  const asked = interviewTopics.filter((topic) => dialogueFlags.has(`asked-${topic.id}`)).length;
  openModal(`
    <p class="eyebrow">INTERVIEW ROOM / RECORDED STATEMENT</p><h2 id="modal-title">William Dale Archerd</h2>
    <div class="interview-portrait"><div class="portrait-head"><span></span></div><div class="portrait-caption"><b>W. D. ARCHERD</b><small>SUBJECT · 1967</small></div></div>
    <div class="dialogue-transcript"><p class="speaker">ARCHERD</p><p>“I have answered these questions. My wife was ill. I was there. I do not know what else you expect me to say.”</p><p class="speaker investigator">YOU</p><p>“I expect the details to agree.”</p></div>
    <div class="topic-progress"><span>LINES OF INQUIRY</span><b>${asked} / 3 EXAMINED</b></div>
    <div class="topic-list" id="topic-list">${interviewTopics.map((topic) => {
      const done = dialogueFlags.has(`asked-${topic.id}`); const unlocked = completedDeductions.has(topic.unlock);
      return `<button class="topic-button ${done ? 'done' : ''}" data-topic="${topic.id}" ${unlocked ? '' : 'disabled'}><span>${done ? '✓' : unlocked ? '↗' : '—'}</span><b>${topic.title}</b><small>${done ? 'QUESTIONED' : unlocked ? 'PRESENT CONTRADICTION' : 'ESTABLISH THE DEDUCTION FIRST'}</small></button>`;
    }).join('')}</div>
    <div class="board-feedback" id="interview-feedback">${asked === 3 ? 'All three lines of inquiry have been explored.' : 'Use the evidence, not assumptions. Establish a deduction before challenging the statement.'}</div>
    <div class="modal-actions"><button class="primary-button" id="interview-close">${asked === 3 ? 'FINISH INTERVIEW' : 'CLOSE INTERVIEW'} <span>↗</span></button></div>
  `);
  $('#topic-list').querySelectorAll<HTMLButtonElement>('[data-topic]').forEach((button) => button.addEventListener('click', () => {
    const topic = interviewTopics.find((entry) => entry.id === button.dataset.topic)!;
    dialogueFlags.add(`asked-${topic.id}`); persist();
    const feedback = $('#interview-feedback');
    feedback.innerHTML = `<div class="exchange"><span class="speaker investigator">YOU</span><p>“${topic.line}”</p><span class="speaker">ARCHERD</span><p>“${topic.answer}”</p><span class="speaker investigator">YOU</span><p>“${topic.follow}”</p></div>`;
    button.classList.add('done'); button.innerHTML = `<span>✓</span><b>${topic.title}</b><small>QUESTIONED</small>`;
    button.disabled = true;
    const newAsked = interviewTopics.filter((entry) => dialogueFlags.has(`asked-${entry.id}`)).length;
    $('.topic-progress b').textContent = `${newAsked} / 3 EXAMINED`;
    renderSidebar();
    if (newAsked === 3) $('#interview-close').textContent = 'FINISH INTERVIEW ↗';
  }));
  $('#interview-close').addEventListener('click', () => {
    closeModal();
    if (interviewTopics.every((topic) => dialogueFlags.has(`asked-${topic.id}`))) showToast('The interview is complete. The reconstruction can begin.');
  });
}

function showJournal(): void {
  const collectedList = [...collected].map((id) => evidence.find((entry) => entry.id === id)!);
  openModal(`<p class="eyebrow">DETECTIVE’S NOTEBOOK</p><h2 id="modal-title">Investigation journal</h2><p class="modal-intro">A working record. Confirmed details, suspicions, and unanswered questions remain separate.</p><div class="journal-block"><span class="journal-label">ESTABLISHED RECORDS</span>${collectedList.length ? collectedList.map((item) => `<div class="journal-entry"><b>${item.title}</b><small>${item.kind} · ${item.date}</small><p>${item.summary}</p></div>`).join('') : '<p>No records have been added yet.</p>'}</div><div class="journal-block"><span class="journal-label">CURRENT DEDUCTIONS</span>${deductions.filter((d) => completedDeductions.has(d.id)).map((d) => `<div class="journal-entry"><b>${d.title}</b><p>${d.description}</p></div>`).join('') || '<p>No deductions established yet. Compare evidence on the board.</p>'}</div><div class="modal-actions"><button class="primary-button" id="journal-close">CLOSE JOURNAL ↗</button></div>`);
  $('#journal-close').addEventListener('click', closeModal);
}

function showReconstruction(): void {
  const complete = completedDeductions.size === 3 && interviewTopics.every((topic) => dialogueFlags.has(`asked-${topic.id}`));
  const endingTitle = complete ? 'THE RECORD HOLDS' : 'AN INCOMPLETE FILE';
  const endingCopy = complete
    ? 'The contradictions have been documented. The timeline, financial record, and medical history are now part of a coherent evidentiary picture. The case can proceed to a full review. It is not a verdict. It is a case that can finally be examined.'
    : 'Some questions remain unanswered. The surviving records point toward inconsistencies, but the gaps are too large to present a complete case. The file remains open. The people named in it deserve more than a theory.';
  currentScene = 'reconstruction'; ended = true; persist();
  openModal(`<p class="eyebrow">FINAL MOVEMENT / CASE REVIEW</p><h2 id="modal-title">${endingTitle}</h2><div class="reconstruction-art"><div class="art-window"></div><div class="art-lamp"></div><div class="art-rain"></div><span>THE NIGHT DOES NOT GIVE UP ITS SECRETS.</span></div><p class="ending-copy">${endingCopy}</p><div class="ending-stats"><div><b>${collected.size}/6</b><small>RECORDS FOUND</small></div><div><b>${completedDeductions.size}/3</b><small>DEDUCTIONS</small></div><div><b>${interviewTopics.filter((topic) => dialogueFlags.has(`asked-${topic.id}`)).length}/3</b><small>QUESTIONS</small></div></div><p class="historical-note"><b>HISTORICAL NOTE</b> This game uses a fictionalized investigation inspired by the public record surrounding William Dale Archerd. The documents, dialogue, bedroom, and detective are dramatized and are not reproductions of actual case exhibits. Archerd was convicted of three murders; other deaths were investigated as suspected cases. This ending is a narrative device, not a claim about a specific historical prosecution.</p><div class="modal-actions"><button class="primary-button" id="replay-button">REOPEN THE CASE <span>↻</span></button><button class="text-button" id="finish-button">RETURN TO TITLE</button></div>`);
  $('#replay-button').addEventListener('click', () => { closeModal(); beginNewGame(); });
  $('#finish-button').addEventListener('click', () => { closeModal(); showTitle(); });
  $('#chapter-label').textContent = 'CASE REVIEW';
  $('#chapter-name').textContent = 'THE RECONSTRUCTION';
  $('#chapter-number').textContent = '04';
  $('#bottom-hint').textContent = 'The case is closed for now.';
  renderSidebar();
  drawScene();
}

function drawPixel(x: number, y: number, width: number, height: number, color: string): void {
  ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}
function drawText(text: string, x: number, y: number, color = '#c6b89a', size = 10, font = 'monospace'): void {
  ctx.fillStyle = color; ctx.font = `${size}px ${font}`; ctx.fillText(text, x, y);
}
function drawWindow(x: number, y: number, width: number, height: number, time: number): void {
  drawPixel(x - 4, y - 4, width + 8, height + 8, '#171a1c');
  drawPixel(x, y, width, height, '#1d3035');
  drawPixel(x + 4, y + 5, width - 8, height - 10, '#263f45');
  drawPixel(x + width / 2 - 2, y, 4, height, '#111719');
  drawPixel(x, y + height / 2 - 2, width, 4, '#111719');
  drawPixel(x + 9, y + 12, 8, 4, '#8d8a72');
  drawPixel(x + width - 20, y + height - 24, 12, 6, '#a18b6c');
  for (let i = 0; i < 18; i++) {
    const rx = x + ((i * 37 + Math.floor(time * (25 + i % 4))) % width);
    const ry = y + ((i * 19 + Math.floor(time * 58)) % height);
    drawPixel(rx, ry, 1, 9 + (i % 3) * 3, 'rgba(174,194,184,.32)');
  }
}
function drawBedroom(time: number): void {
  drawPixel(0, 0, W, H, '#17191b');
  drawPixel(0, 0, W, 168, '#242426');
  // Wallpaper and wainscoting.
  for (let y = 10; y < 158; y += 22) for (let x = 0; x < W; x += 32) drawPixel(x + ((y / 22) % 2) * 16, y, 1, 11, '#30302d');
  drawPixel(0, 162, W, 5, '#615344'); drawPixel(0, 168, W, 18, '#302a25');
  drawPixel(0, 186, W, 84, '#25221f');
  for (let x = 0; x < W; x += 28) drawPixel(x, 186, 1, 84, '#2d2823');
  // window and curtain.
  drawWindow(183, 22, 101, 101, time);
  drawPixel(173, 13, 10, 128, '#40332b'); drawPixel(285, 13, 10, 128, '#40332b');
  drawPixel(167, 12, 126, 7, '#544438');
  drawPixel(168, 16, 16, 123, '#4a3830'); drawPixel(281, 16, 15, 123, '#49372f');
  drawPixel(169, 135, 126, 5, '#6a5743');
  // bed and blanket.
  drawPixel(292, 129, 145, 9, '#594838'); drawPixel(301, 138, 127, 47, '#3b3c39');
  drawPixel(300, 132, 132, 14, '#a49378'); drawPixel(304, 139, 52, 10, '#b4a78d');
  drawPixel(360, 139, 65, 37, '#48504d'); drawPixel(307, 184, 7, 16, '#171716'); drawPixel(417, 184, 7, 16, '#171716');
  // nightstand.
  drawPixel(348, 108, 76, 35, '#5b4735'); drawPixel(352, 111, 68, 4, '#7b6046'); drawPixel(353, 144, 5, 33, '#453627'); drawPixel(414, 144, 5, 33, '#453627');
  drawPixel(355, 124, 61, 12, '#49392d'); drawPixel(380, 128, 3, 3, '#b09b75');
  // desk and lamp.
  drawPixel(45, 153, 128, 12, '#604a36'); drawPixel(52, 165, 112, 36, '#493a2e'); drawPixel(59, 201, 8, 29, '#342a23'); drawPixel(151, 201, 8, 29, '#342a23');
  drawPixel(95, 135, 20, 19, '#c1a76c'); drawPixel(102, 121, 6, 16, '#887350'); drawPixel(94, 119, 22, 5, '#e0c78d');
  drawPixel(93, 138, 22, 10, 'rgba(225,185,104,.12)');
  // documents scattered.
  drawPixel(58, 156, 30, 2, '#d6c7a3'); drawPixel(62, 160, 25, 1, '#9d927b');
  drawPixel(129, 157, 18, 3, '#c5b58f'); drawPixel(130, 162, 17, 1, '#938a74');
  // folder & medical envelope in foreground.
  drawPixel(190, 178, 54, 27, '#89704f'); drawPixel(193, 174, 22, 7, '#a88e66'); drawPixel(198, 185, 35, 1, '#c3b18d');
  drawPixel(276, 181, 54, 25, '#d2c9b2'); drawPixel(281, 185, 39, 1, '#8d8a7c'); drawPixel(281, 191, 32, 1, '#a7a08e');
  // telephone and message pad.
  drawPixel(78, 115, 33, 22, '#252728'); drawPixel(84, 109, 21, 8, '#383b3a'); drawPixel(88, 120, 13, 5, '#98907a');
  drawPixel(76, 137, 38, 6, '#17191a');
  // drawer and newspaper.
  drawPixel(354, 113, 69, 24, '#624b37'); drawPixel(360, 119, 57, 13, '#3e3027'); drawPixel(386, 124, 5, 2, '#b69b6d');
  // warm lamp falloff.
  const glow = ctx.createRadialGradient(104, 143, 5, 104, 143, 110);
  glow.addColorStop(0, 'rgba(222,169,91,.17)'); glow.addColorStop(1, 'rgba(222,169,91,0)'); ctx.fillStyle = glow; ctx.fillRect(0, 60, 230, 185);
  // distant figure at the window, only after investigation pressure builds.
  if (presence >= 3) {
    const alpha = .18 + (Math.sin(time * 1.1) + 1) * .06;
    ctx.fillStyle = `rgba(8,10,11,${alpha})`;
    ctx.fillRect(220, 72, 9, 27); ctx.fillRect(216, 78, 17, 20); ctx.fillRect(219, 98, 4, 17); ctx.fillRect(227, 98, 4, 17);
    drawPixel(221, 73, 2, 2, '#b7b2a0');
  }
  // vignette and floor shadow.
  const vignette = ctx.createRadialGradient(240, 118, 52, 240, 135, 295);
  vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
  drawText('NOV 06  /  11:42 PM', 12, 18, '#8a806f', 7);
}
function drawOffice(time: number): void {
  drawPixel(0, 0, W, H, '#171a1b'); drawPixel(0, 0, W, 177, '#242729');
  for (let x = 0; x < W; x += 38) drawPixel(x, 0, 2, 176, '#2d3030');
  drawWindow(18, 22, 88, 112, time); drawPixel(13, 16, 98, 5, '#665440');
  // cork board.
  drawPixel(135, 25, 295, 139, '#594938'); drawPixel(141, 31, 283, 127, '#8c775a');
  drawPixel(150, 40, 74, 44, '#d5c9ac'); drawPixel(234, 40, 73, 44, '#d5c9ac'); drawPixel(320, 40, 90, 44, '#d0c2a4');
  drawPixel(153, 47, 65, 2, '#847c6a'); drawPixel(153, 53, 46, 1, '#a39a82'); drawPixel(239, 47, 62, 2, '#807967'); drawPixel(239, 54, 57, 1, '#a29a86');
  drawPixel(325, 47, 78, 2, '#867a62'); drawPixel(325, 54, 65, 1, '#9b927c');
  drawPixel(183, 89, 88, 54, '#c7b99b'); drawPixel(188, 96, 78, 1, '#817a69'); drawPixel(188, 103, 67, 1, '#948b77');
  drawPixel(293, 91, 101, 52, '#d0c5aa'); drawPixel(299, 98, 89, 1, '#827b6a'); drawPixel(299, 105, 72, 1, '#948a74');
  // red string.
  ctx.strokeStyle = '#a34f40'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(185, 82); ctx.lineTo(240, 88); ctx.lineTo(333, 84); ctx.lineTo(341, 94); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(192, 87); ctx.lineTo(239, 116); ctx.lineTo(297, 117); ctx.stroke();
  for (const [x, y] of [[185, 82], [240, 88], [333, 84], [192, 87], [297, 117]] as const) drawPixel(x, y, 4, 4, '#b84f43');
  // desk.
  drawPixel(0, 184, W, 86, '#28231e'); drawPixel(22, 177, 435, 14, '#70563f'); drawPixel(39, 191, 401, 52, '#4a392c');
  drawPixel(63, 197, 110, 29, '#b9a987'); drawPixel(69, 203, 95, 1, '#746c59'); drawPixel(69, 211, 74, 1, '#92866d');
  drawPixel(196, 191, 102, 45, '#a8916b'); drawPixel(203, 197, 83, 2, '#685d4b'); drawPixel(203, 204, 74, 1, '#776d58');
  drawPixel(336, 193, 68, 31, '#292b2a'); drawPixel(347, 185, 46, 9, '#b99a5e'); drawPixel(365, 169, 9, 19, '#786448');
  const glow = ctx.createRadialGradient(365, 184, 3, 365, 184, 100); glow.addColorStop(0, 'rgba(226,170,89,.22)'); glow.addColorStop(1, 'rgba(226,170,89,0)'); ctx.fillStyle = glow; ctx.fillRect(245, 110, 210, 150);
  drawPixel(0, 247, W, 23, '#151617'); drawText('PROPERTY ROOM  /  TEMPORARY OFFICE', 13, 18, '#8b806f', 7);
  drawText(`EVIDENCE RECORDED: ${collected.size.toString().padStart(2, '0')}`, 15, 258, '#a99a7c', 7);
}
function drawInterview(time: number): void {
  drawPixel(0, 0, W, H, '#161819'); drawPixel(0, 0, W, 167, '#242728'); drawPixel(0, 168, W, 102, '#191b1c');
  drawWindow(22, 20, 87, 102, time); drawPixel(17, 14, 97, 7, '#675541');
  // overhead light pool.
  const pool = ctx.createRadialGradient(240, 8, 3, 240, 8, 190); pool.addColorStop(0, 'rgba(203,176,125,.19)'); pool.addColorStop(1, 'rgba(203,176,125,0)'); ctx.fillStyle = pool; ctx.fillRect(20, 0, 440, 220);
  // table.
  drawPixel(53, 172, 374, 15, '#68513b'); drawPixel(66, 187, 347, 32, '#4a392b'); drawPixel(82, 219, 12, 34, '#30261f'); drawPixel(386, 219, 12, 34, '#30261f');
  // Archerd silhouette.
  drawPixel(209, 71, 64, 70, '#111314'); drawPixel(222, 48, 39, 38, '#17191a'); drawPixel(228, 55, 27, 19, '#a99b80'); drawPixel(224, 46, 34, 10, '#c2b49b');
  drawPixel(205, 105, 81, 61, '#222627'); drawPixel(216, 121, 59, 41, '#343637'); drawPixel(237, 94, 5, 3, '#ddd0ad'); drawPixel(251, 94, 5, 3, '#ddd0ad');
  // detective silhouette foreground.
  drawPixel(63, 104, 92, 76, '#101213'); drawPixel(89, 82, 48, 39, '#16191a'); drawPixel(87, 75, 52, 12, '#262522');
  drawPixel(315, 104, 102, 76, '#111314'); drawPixel(339, 84, 54, 32, '#181b1c');
  drawText('RECORDED INTERVIEW', 15, 18, '#9a8d76', 7); drawText('JUL 12  /  1967', 386, 18, '#9a8d76', 7);
  const flicker = Math.sin(time * 9) > .98 ? .05 : 0; ctx.fillStyle = `rgba(245,220,170,${flicker})`; ctx.fillRect(0, 0, W, H);
}
function drawReconstruction(time: number): void {
  drawPixel(0, 0, W, H, '#0f1416'); drawPixel(0, 0, W, 270, '#1a2223');
  drawWindow(156, 23, 168, 156, time * .55);
  drawPixel(0, 186, W, 84, '#111516'); drawPixel(23, 182, 434, 9, '#514538');
  // empty chair, file, and a light left burning.
  drawPixel(73, 151, 78, 9, '#5c4835'); drawPixel(80, 160, 64, 43, '#45392f'); drawPixel(86, 202, 8, 32, '#302822'); drawPixel(133, 202, 8, 32, '#302822');
  drawPixel(320, 154, 81, 7, '#9a825b'); drawPixel(329, 160, 63, 35, '#796245'); drawPixel(338, 194, 8, 28, '#473a2b'); drawPixel(377, 194, 8, 28, '#473a2b');
  drawPixel(354, 127, 17, 27, '#dbc08a'); drawPixel(359, 117, 7, 12, '#7d694b');
  const glow = ctx.createRadialGradient(363, 139, 4, 363, 139, 122); glow.addColorStop(0, 'rgba(222,174,102,.20)'); glow.addColorStop(1, 'rgba(222,174,102,0)'); ctx.fillStyle = glow; ctx.fillRect(240, 20, 220, 240);
  drawText('WHAT THE RECORD CAN PROVE', 16, 18, '#9a907f', 7);
}

function drawScene(): void {
  if (!ctx || $('#play-screen').classList.contains('hidden')) return;
  ctx.save(); ctx.scale(2, 2);
  if (currentScene === 'bedroom') drawBedroom(elapsed);
  else if (currentScene === 'office') drawOffice(elapsed);
  else if (currentScene === 'interview') drawInterview(elapsed);
  else drawReconstruction(elapsed);
  if (currentScene === 'bedroom') {
    for (const spot of hotspots) {
      const isFound = Boolean(spot.evidenceId && collected.has(spot.evidenceId));
      const isHovered = hoveredHotspot === spot.id;
      if (isFound) { drawPixel(spot.x + spot.w / 2 - 2, spot.y + spot.h / 2 - 2, 4, 4, '#8f9b82'); continue; }
      if (isHovered) {
        ctx.strokeStyle = 'rgba(222,190,129,.9)'; ctx.lineWidth = .9; ctx.setLineDash([3, 2]); ctx.strokeRect(spot.x + 1, spot.y + 1, spot.w - 2, spot.h - 2); ctx.setLineDash([]);
        drawText(spot.label.toUpperCase(), Math.max(4, spot.x - 3), Math.max(12, spot.y - 6), '#e1d1ad', 6);
      }
    }
  }
  // Subtle scanline texture.
  ctx.fillStyle = 'rgba(0,0,0,.055)'; for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  ctx.restore();
}
function gameLoop(timestamp: number): void {
  const dt = Math.min((timestamp - lastFrame) / 1000 || 0, .05); lastFrame = timestamp; elapsed += dt;
  if (currentScene === 'bedroom' || currentScene === 'office' || currentScene === 'interview' || currentScene === 'reconstruction') drawScene();
  animationFrame = requestAnimationFrame(gameLoop);
}

function pointerToCanvas(event: PointerEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: ((event.clientX - rect.left) / rect.width) * W, y: ((event.clientY - rect.top) / rect.height) * H };
}
function hitHotspot(point: { x: number; y: number }): Hotspot | undefined {
  return hotspots.find((spot) => point.x >= spot.x && point.x <= spot.x + spot.w && point.y >= spot.y && point.y <= spot.y + spot.h && !(spot.evidenceId && collected.has(spot.evidenceId)));
}
canvas.addEventListener('pointermove', (event) => {
  const point = pointerToCanvas(event); const hit = currentScene === 'bedroom' ? hitHotspot(point) : undefined;
  const next = hit?.id ?? null;
  if (next !== hoveredHotspot) { hoveredHotspot = next; canvas.style.cursor = next ? 'pointer' : 'default'; drawScene(); }
});
canvas.addEventListener('pointerleave', () => { hoveredHotspot = null; canvas.style.cursor = 'default'; drawScene(); });
canvas.addEventListener('pointerup', (event) => {
  if (modalOpen || currentScene !== 'bedroom') return;
  const spot = hitHotspot(pointerToCanvas(event));
  if (spot?.evidenceId) inspectEvidence(spot.evidenceId);
});

function updateSoundButton(): void {
  $('#sound-toggle').classList.toggle('enabled', soundEnabled);
  $('#sound-toggle').textContent = soundEnabled ? '♫' : '◖';
  $('#sound-toggle').setAttribute('aria-label', soundEnabled ? 'Mute ambience' : 'Enable ambience');
}
async function startAudio(): Promise<void> {
  if (!soundEnabled) return;
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') await audioContext.resume();
    if (rainNode) return;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .18;
    rainNode = audioContext.createBufferSource(); rainNode.buffer = buffer; rainNode.loop = true;
    const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 460;
    rainGain = audioContext.createGain(); rainGain.gain.value = .11;
    rainNode.connect(filter); filter.connect(rainGain); rainGain.connect(audioContext.destination); rainNode.start();
  } catch { showToast('Audio is unavailable in this browser.'); soundEnabled = false; updateSoundButton(); }
}
function stopAudio(): void {
  try { rainNode?.stop(); } catch { /* already stopped */ }
  rainNode = null; rainGain = null;
}

$('#new-game').addEventListener('click', beginNewGame);
$('#continue-game').addEventListener('click', continueGame);
$('#back-button').addEventListener('click', showTitle);
$('#journal-button').addEventListener('click', showJournal);
$('#board-button').addEventListener('click', openBoard);
$('#advance-button').addEventListener('click', () => {
  if (currentScene === 'bedroom') {
    if (collected.size < 3) return;
    switchScene('office'); showToast('The records have been brought back to the office.');
  } else if (currentScene === 'office') {
    switchScene('interview'); openInterview();
  } else if (currentScene === 'interview') {
    switchScene('reconstruction'); showReconstruction();
  } else showReconstruction();
});
$('#sound-toggle').addEventListener('click', async () => {
  soundEnabled = !soundEnabled; updateSoundButton();
  if (soundEnabled) await startAudio(); else stopAudio();
  persist();
});
$('#help-button').addEventListener('click', () => openModal(`<p class="eyebrow">FIELD NOTES / CONTROLS</p><h2 id="modal-title">How to investigate</h2><div class="control-list"><div><kbd>CLICK</kbd><span>Inspect an object or choose a dialogue topic.</span></div><div><kbd>E</kbd><span>Inspect the object currently under the pointer.</span></div><div><kbd>I</kbd><span>Open the case inventory.</span></div><div><kbd>J</kbd><span>Open the investigation journal.</span></div><div><kbd>B</kbd><span>Open the evidence board.</span></div><div><kbd>ESC</kbd><span>Close the active panel or return to the title screen.</span></div></div><p class="modal-intro">There is no timer. Take your time. A connection is a lead to investigate, not automatic proof.</p><div class="modal-actions"><button class="primary-button" id="help-close">UNDERSTOOD <span>↗</span></button></div>`));
$('#modal-close').addEventListener('click', closeModal);
$('#modal-layer').addEventListener('click', (event) => { if (event.target === $('#modal-layer')) closeModal(); });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { if (modalOpen) closeModal(); else if (!$('#play-screen').classList.contains('hidden')) showTitle(); }
  if (modalOpen) return;
  if (event.key.toLowerCase() === 'j' && !$('#play-screen').classList.contains('hidden')) showJournal();
  if (event.key.toLowerCase() === 'b' && !$('#play-screen').classList.contains('hidden')) openBoard();
  if (event.key.toLowerCase() === 'i' && !$('#play-screen').classList.contains('hidden')) showJournal();
  if (event.key.toLowerCase() === 'e' && hoveredHotspot && currentScene === 'bedroom') {
    const spot = hotspots.find((item) => item.id === hoveredHotspot); if (spot?.evidenceId) inspectEvidence(spot.evidenceId);
  }
});

// The help and journal buttons are rendered dynamically inside modal content.
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.id === 'help-close') closeModal();
});

const saved = loadSave();
$('#continue-game').classList.toggle('hidden', !saved);
updateSoundButton();
showTitle();
renderSidebar();
if (saved?.soundEnabled) { soundEnabled = false; updateSoundButton(); }
window.addEventListener('resize', () => drawScene());
window.addEventListener('beforeunload', () => { cancelAnimationFrame(animationFrame); stopAudio(); });
animationFrame = requestAnimationFrame(gameLoop);
