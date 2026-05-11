/* ══════════════════════════════
   DATA
══════════════════════════════ */
const QUOTES = [
  "In all the world, there is no heart for me like yours.",
  "You are my today and all of my tomorrows.",
  "I love you — not only for what you are, but for what I am when I'm with you.",
  "To the world you may be one person, but to one person you are the world.",
  "I have found the one whom my soul loves.",
  "Every love story is beautiful, but ours is my favorite.",
  "You are the reason I believe in love.",
  "With you, every moment becomes a memory I never want to forget.",
  "Distance means so little when someone means so much.",
  "You are my sun, my moon, and all my stars."
];

const RANDOM_MESSAGES = [
  "Nausheen, just thinking about your smile makes my whole day brighter. 💗",
  "Aman, every time I hear your voice, I feel like I'm home. 🏡",
  "No matter where life takes us, my heart always finds its way back to you.",
  "Nausheen, you make ordinary days feel like fairy tales. ✨",
  "Aman, I fall in love with you a little more every single day.",
  "With you, even silence feels like the most beautiful conversation. 🌙",
  "Nausheen, you are the best thing that has ever happened to me.",
  "Aman, your love is my favorite story — and I never want it to end.",
  "Some people search their whole lives to find what I have with you. 🌹",
  "Nausheen, I choose you. Every day, in every way, I choose you.",
  "Aman, the way you love me makes me believe in magic. 💫",
  "Being loved by you is the greatest adventure of my life."
];

const DEFAULT_OW = [
  {
    emoji: '💭', occasion: 'you miss me', from: 'aman',
    message: "Close your eyes, Nausheen. I'm right there with you — in every heartbeat, every breath, every quiet moment. Distance can never change how deeply I love you. I miss you too, more than words can ever say.",
    id: 1
  },
  {
    emoji: '😢', occasion: 'you feel sad', from: 'aman',
    message: "My love, even the darkest nights end with a sunrise. Whatever is making you sad right now — I want you to know that you are never alone. I am with you, always. Let your tears fall, but know that my arms are always open for you.",
    id: 2
  },
  {
    emoji: '🎉', occasion: 'you need a reason to smile', from: 'nausheen',
    message: "Aman, here is your reason — YOU are amazing. You make my world so beautifully whole. Your laugh, your kindness, the way you love me... that is everything. Smile, my love. The world is brighter with you in it.",
    id: 3
  },
  {
    emoji: '😴', occasion: "you can't sleep", from: 'nausheen',
    message: "Aman jaan, close your eyes. Imagine my hand in yours. Think of all our happy moments — our laughs, our dreams, our plans. Let them wrap around you like a warm blanket. I love you. Sleep well, my heart.",
    id: 4
  }
];

/* ══════════════════════════════
   STATE
══════════════════════════════ */
let selectedEmoji    = '🌹';
let selectedDateEmoji = '💍';
let selectedOwEmoji  = '💔';
let currentNoteFilter = 'all';
let quoteIndex = new Date().getDate() % QUOTES.length;

/* ══════════════════════════════
   STORAGE HELPERS
══════════════════════════════ */
async function load(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}

async function save(key, data) {
  try { await window.storage.set(key, JSON.stringify(data)); } catch {}
}

/* ══════════════════════════════
   NAVIGATION
══════════════════════════════ */
function showScreen(name, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'gallery')  renderGallery();
  if (name === 'notes')    renderNotes();
  if (name === 'dates')    renderDates();
  if (name === 'surprise') renderSurprise();
  if (name === 'home')     updateStats();
}

/* ══════════════════════════════
   MODALS
══════════════════════════════ */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

/* ══════════════════════════════
   EMOJI SELECTORS
══════════════════════════════ */
function selectEmoji(btn, e) {
  document.querySelectorAll('#emoji-picker .emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedEmoji = e;
}
function selectDateEmoji(btn, e) {
  document.querySelectorAll('#date-emoji-picker .emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedDateEmoji = e;
}
function selectOwEmoji(btn, e) {
  document.querySelectorAll('#ow-emoji-picker .emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedOwEmoji = e;
}

/* ══════════════════════════════
   GALLERY
══════════════════════════════ */
async function saveMemory() {
  const caption = document.getElementById('memory-caption').value.trim();
  const date    = document.getElementById('memory-date').value;
  if (!caption) return alert('Please add a caption!');
  const memories = await load('memories');
  memories.unshift({
    emoji: selectedEmoji, caption,
    date: date || new Date().toISOString().split('T')[0],
    id: Date.now()
  });
  await save('memories', memories);
  document.getElementById('memory-caption').value = '';
  document.getElementById('memory-date').value    = '';
  closeModal('memory-modal');
  renderGallery();
  updateStats();
}

async function renderGallery() {
  const memories = await load('memories');
  const c = document.getElementById('gallery-list');
  if (!memories.length) {
    c.innerHTML = `<div class="empty-state"><div class="emoji">📷</div><p>No memories yet.<br>Add your first beautiful moment!</p></div>`;
    return;
  }
  const byYear = {};
  memories.forEach(m => {
    const y = m.date ? m.date.split('-')[0] : '?';
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(m);
  });
  c.innerHTML = Object.keys(byYear).sort((a,b) => b - a).map(y => `
    <div class="year-group">
      <div class="year-label">💫 ${y}</div>
      <div class="memory-grid">
        ${byYear[y].map(m => `
          <div class="memory-card">
            <div class="memory-img">${m.emoji}</div>
            <div class="memory-caption">${m.caption}
              <div class="memory-date">${formatDate(m.date)}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

/* ══════════════════════════════
   NOTES
══════════════════════════════ */
function switchNoteTab(f, btn) {
  currentNoteFilter = f;
  document.querySelectorAll('.note-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderNotes();
}

async function saveNote() {
  const msg  = document.getElementById('note-message').value.trim();
  const from = document.getElementById('note-from').value;
  if (!msg) return alert('Please write a message!');
  const notes = await load('notes');
  notes.unshift({ from, message: msg, date: new Date().toISOString().split('T')[0], id: Date.now() });
  await save('notes', notes);
  document.getElementById('note-message').value = '';
  closeModal('note-modal');
  renderNotes();
  updateStats();
}

async function renderNotes() {
  let notes = await load('notes');
  if (currentNoteFilter !== 'all') notes = notes.filter(n => n.from === currentNoteFilter);
  const c = document.getElementById('notes-list');
  if (!notes.length) {
    c.innerHTML = `<div class="empty-state"><div class="emoji">💌</div><p>No notes yet.<br>Write your first love note!</p></div>`;
    return;
  }
  c.innerHTML = notes.map(n => `
    <div class="note-card">
      <div class="note-from">${n.from === 'aman' ? '💙 Aman → Nausheen' : '💗 Nausheen → Aman'}</div>
      <div class="note-message">"${n.message}"</div>
      <div class="note-date">${formatDate(n.date)}</div>
    </div>`).join('');
}

/* ══════════════════════════════
   DATES
══════════════════════════════ */
async function saveDate() {
  const title = document.getElementById('date-title').value.trim();
  const val   = document.getElementById('date-value').value;
  if (!title || !val) return alert('Please fill all fields!');
  const dates = await load('dates');
  dates.push({ emoji: selectedDateEmoji, title, date: val, id: Date.now() });
  dates.sort((a,b) => new Date(a.date) - new Date(b.date));
  await save('dates', dates);
  document.getElementById('date-title').value = '';
  document.getElementById('date-value').value = '';
  closeModal('date-modal');
  renderDates();
  updateStats();
}

async function renderDates() {
  const dates = await load('dates');
  const c = document.getElementById('dates-list');
  if (!dates.length) {
    c.innerHTML = `<div class="empty-state"><div class="emoji">📅</div><p>No special dates yet.</p></div>`;
    return;
  }
  const today = new Date(); today.setHours(0,0,0,0);
  c.innerHTML = dates.map(d => {
    const dt   = new Date(d.date);
    const diff = Math.round((dt - today) / 86400000);
    const lbl  = diff > 0 ? `in ${diff}d` : diff === 0 ? 'Today! 🎉' : `${Math.abs(diff)}d ago`;
    return `
      <div class="date-card">
        <div class="date-icon">${d.emoji}</div>
        <div class="date-info">
          <div class="date-title">${d.title}</div>
          <div class="date-value">${formatDate(d.date)}</div>
        </div>
        <div><div class="days-num">${lbl}</div></div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════
   SURPRISE
══════════════════════════════ */
async function renderSurprise() {
  document.getElementById('surprise-quote').textContent = QUOTES[quoteIndex];
  const ow   = await load('open-when');
  const grid = document.getElementById('open-when-grid');
  if (!ow.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">💌</div><p>No "Open When" messages yet.<br>Add one below!</p></div>`;
    return;
  }
  grid.innerHTML = ow.map(m => `
    <div class="open-when-card" onclick="openEnvelope(${m.id})">
      <div class="ow-emoji">${m.emoji}</div>
      <div class="ow-title">Open when...</div>
      <div class="ow-subtitle">${m.occasion}</div>
    </div>`).join('');
}

function showRandomMessage() {
  const el = document.getElementById('random-msg-text');
  el.style.opacity = 0;
  setTimeout(() => {
    el.textContent = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
    el.style.opacity = 1;
  }, 300);
}

function cycleQuote() {
  quoteIndex = (quoteIndex + 1) % QUOTES.length;
  document.getElementById('surprise-quote').textContent = QUOTES[quoteIndex];
}

async function saveOwMessage() {
  const occasion = document.getElementById('ow-occasion').value.trim();
  const msg      = document.getElementById('ow-message').value.trim();
  const from     = document.getElementById('ow-from').value;
  if (!occasion || !msg) return alert('Please fill all fields!');
  const ow = await load('open-when');
  ow.push({ emoji: selectedOwEmoji, occasion, from, message: msg, id: Date.now() });
  await save('open-when', ow);
  document.getElementById('ow-occasion').value = '';
  document.getElementById('ow-message').value  = '';
  closeModal('ow-modal');
  renderSurprise();
}

async function openEnvelope(id) {
  const ow = await load('open-when');
  const m  = ow.find(x => x.id === id);
  if (!m) return;
  document.getElementById('env-emoji').textContent    = m.emoji;
  document.getElementById('env-occasion').textContent = m.occasion;
  document.getElementById('env-message').textContent  = m.message;
  document.getElementById('env-from').textContent     = m.from === 'aman' ? '— With all my love, Aman 💙' : '— With all my love, Nausheen 💗';
  document.getElementById('envelope-overlay').classList.add('open');
}

function closeEnvelope() {
  document.getElementById('envelope-overlay').classList.remove('open');
}

/* ══════════════════════════════
   HOME STATS
══════════════════════════════ */
async function updateStats() {
  const [memories, notes, dates] = await Promise.all([load('memories'), load('notes'), load('dates')]);
  document.getElementById('stat-memories').textContent    = memories.length;
  document.getElementById('stat-notes').textContent       = notes.length;
  document.getElementById('stat-dates').textContent       = dates.length;
  const days = Math.floor((new Date() - new Date('2023-05-02')) / 86400000);
  document.getElementById('stat-days-together').textContent = days > 0 ? days : '—';
}

/* ══════════════════════════════
   ANNIVERSARY COUNTDOWN
══════════════════════════════ */
function updateCountdown() {
  const now  = new Date();
  let next   = new Date(now.getFullYear(), 4, 2); // May 2
  if (now >= next) next = new Date(now.getFullYear() + 1, 4, 2);
  const diff = next - now;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);
  document.getElementById('cd-days').textContent  = d;
  document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
  document.getElementById('cd-secs').textContent  = String(s).padStart(2,'0');
}

/* ══════════════════════════════
   HELPERS
══════════════════════════════ */
function formatDate(str) {
  if (!str) return '';
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' });
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
document.getElementById('daily-quote').textContent = QUOTES[new Date().getDate() % QUOTES.length];
updateCountdown();
setInterval(updateCountdown, 1000);
updateStats();

// Seed default data if empty
(async () => {
  const dates = await load('dates');
  if (!dates.length) {
    await save('dates', [
      { emoji:'💍', title:'Anniversary',     date:'2024-05-02', id:1 },
      { emoji:'💏', title:'The Day We Met',  date:'2023-05-02', id:2 }
    ]);
  }
  const ow = await load('open-when');
  if (!ow.length) await save('open-when', DEFAULT_OW);
})();