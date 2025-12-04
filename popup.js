// UI elementy
const mainMenu = document.getElementById('mainMenu');
const createSection = document.getElementById('createSection');
const joinSection = document.getElementById('joinSection');
const partySection = document.getElementById('partySection');

const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const createPartyBtn = document.getElementById('createPartyBtn');
const joinPartyBtn = document.getElementById('joinPartyBtn');
const sendBtn = document.getElementById('sendBtn');
const leaveBtn = document.getElementById('leaveBtn');

const partyNameInput = document.getElementById('partyNameInput');
const playerNameInput = document.getElementById('playerNameInput');
const playerNameInput2 = document.getElementById('playerNameInput2');
const codeInput = document.getElementById('codeInput');
const messageInput = document.getElementById('messageInput');

const partyTitle = document.getElementById('partyTitle');
const playersDiv = document.getElementById('players');
const messagesDiv = document.getElementById('messages');

let currentParty = null;
let currentPlayerName = null;

// Ukáž menu
function showMenu(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Načítaj uložené dáta pri otvorení
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['partyCode', 'playerName'], (result) => {
    if (result.partyCode) {
      loadParty(result.partyCode, result.playerName);
    }
  });

  // Načítaj detekovaný kód
  chrome.storage.local.get(['detectedPartyCode'], (result) => {
    if (result.detectedPartyCode) {
      codeInput.value = result.detectedPartyCode;
    }
  });
});

// Vytvoriť party
createPartyBtn.addEventListener('click', async () => {
  const name = partyNameInput.value.trim();
  const player = playerNameInput.value.trim();

  if (!name || !player) {
    alert('Vyplň názov a meno!');
    return;
  }

  const code = await Firebase.createParty(name, player);
  currentParty = code;
  currentPlayerName = player;

  chrome.storage.local.set({ partyCode: code, playerName: player });
  loadParty(code, player);
});

// Pripojiť sa
joinPartyBtn.addEventListener('click', async () => {
  const code = codeInput.value.trim();
  const player = playerNameInput2.value.trim();

  if (!code || !player) {
    alert('Vyplň kód a meno!');
    return;
  }

  const party = await Firebase.joinParty(code, player);
  if (!party) {
    alert('Party neexistuje!');
    return;
  }

  currentParty = code;
  currentPlayerName = player;

  chrome.storage.local.set({ partyCode: code, playerName: player });
  loadParty(code, player);
});

// Načítaj party
async function loadParty(code, player) {
  const party = await Firebase.getParty(code);
  if (!party) return;

  partyTitle.textContent = `Party: ${party.name} (${code})`;
  
  // Hráči
  playersDiv.innerHTML = Object.values(party.players || {})
    .map(p => `<div>👤 ${p.name}</div>`)
    .join('');

  // Správy
  updateMessages(party.messages || []);
  
  showMenu('partySection');

  // Refresh každé 2 sekundy
  window.partyRefresh = setInterval(async () => {
    const updated = await Firebase.getParty(code);
    if (updated) {
      playersDiv.innerHTML = Object.values(updated.players || {})
        .map(p => `<div>👤 ${p.name}</div>`)
        .join('');
      updateMessages(updated.messages || []);
    }
  }, 2000);
}

// Aktualizuj správy
function updateMessages(messages) {
  messagesDiv.innerHTML = messages
    .map(m => `
      <div class="message">
        <span class="sender">${m.player}</span>
        <span class="time">${new Date(m.time).toLocaleTimeString('sk-SK', {hour: '2-digit', minute: '2-digit'})}</span>
        <div>${m.text}</div>
      </div>
    `)
    .join('');
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Odoslať správu
sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  await Firebase.addMessage(currentParty, currentPlayerName, text);
  messageInput.value = '';

  const party = await Firebase.getParty(currentParty);
  updateMessages(party.messages || []);
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

// Opustiť party
leaveBtn.addEventListener('click', () => {
  clearInterval(window.partyRefresh);
  chrome.storage.local.remove(['partyCode', 'playerName']);
  currentParty = null;
  currentPlayerName = null;
  showMenu('mainMenu');
});

// Menu tlačidlá
createBtn.addEventListener('click', () => showMenu('createSection'));
joinBtn.addEventListener('click', () => showMenu('joinSection'));
