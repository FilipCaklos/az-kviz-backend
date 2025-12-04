// UI Kontrola a Event Listenery

let currentPartyId = null;
let currentPlayerId = null;
let currentPlayerName = null;
let currentPlayerRole = null;
let socketManager = new SocketManager();

// Elementy
const mainMenu = document.getElementById('mainMenu');
const createPartyMenu = document.getElementById('createPartyMenu');
const joinPartyMenu = document.getElementById('joinPartyMenu');
const partyRoom = document.getElementById('partyRoom');

const createPartyBtn = document.getElementById('createPartyBtn');
const joinPartyBtn = document.getElementById('joinPartyBtn');
const generateCodeBtn = document.getElementById('generateCodeBtn');
const confirmCreateBtn = document.getElementById('confirmCreateBtn');
const joinBtn = document.getElementById('joinBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const leavePartyBtn = document.getElementById('leavePartyBtn');
const sendBtn = document.getElementById('sendBtn');
const copyCodeBtn = document.getElementById('copyCodeBtn');

const partyNameInput = document.getElementById('partyName');
const inviteCodeInput = document.getElementById('inviteCode');
const playerNameInput = document.getElementById('playerName');
const partyCodeInput = document.getElementById('partyCode');
const messageInput = document.getElementById('messageInput');

const partyTitle = document.getElementById('partyTitle');
const displayInviteCode = document.getElementById('displayInviteCode');
const playerCount = document.getElementById('playerCount');
const playersList = document.getElementById('playersList');
const chatMessages = document.getElementById('chatMessages');

// Inicializácia pri otvorení popup
document.addEventListener('DOMContentLoaded', async () => {
    chrome.storage.local.get(['currentPartyId', 'currentPlayerId', 'currentPlayerName', 'currentPlayerRole'], async (result) => {
        if (result.currentPartyId && result.currentPlayerId) {
            // Užívateľ je už v party
            currentPartyId = result.currentPartyId;
            currentPlayerId = result.currentPlayerId;
            currentPlayerName = result.currentPlayerName;
            currentPlayerRole = result.currentPlayerRole;

            // Načítaj party dáta z backendu
            const partyData = await API.getPartyData(currentPartyId);
            if (partyData.success) {
                setupWebSocket(currentPartyId, currentPlayerId);
                loadPartyRoom(partyData);
            } else {
                // Party už neexistuje, vyčisti storage
                chrome.storage.local.remove(['currentPartyId', 'currentPlayerId', 'currentPlayerName', 'currentPlayerRole']);
            }
        }
    });
});

// Event listenery na hlavnom menu
createPartyBtn.addEventListener('click', () => {
    showMenu(createPartyMenu);
    hideMenu(mainMenu);
});

joinPartyBtn.addEventListener('click', () => {
    showMenu(joinPartyMenu);
    hideMenu(mainMenu);
});

// Generovanie invite kódu
generateCodeBtn.addEventListener('click', () => {
    const code = 'PARTY-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    inviteCodeInput.value = code;
    showNotification('Kód bol vygenerovaný!', 'success');
});

// Potvrdenie vytvorenia party
confirmCreateBtn.addEventListener('click', async () => {
    const partyName = partyNameInput.value.trim();
    const inviteCode = inviteCodeInput.value.trim();
    const playerName = partyNameInput.value || 'Neznámy hráč';

    if (!partyName || !inviteCode) {
        showNotification('Vyplň názov party a invite kód!', 'error');
        return;
    }

    showNotification('Vytváram party...', 'info');

    const response = await API.createParty(partyName, playerName, inviteCode);
    
    if (response.success) {
        currentPartyId = response.partyId;
        currentPlayerId = response.playerId;
        currentPlayerName = response.hostName;
        currentPlayerRole = 'host';
        
        // Ulož do storage
        chrome.storage.local.set({
            currentPartyId,
            currentPlayerId,
            currentPlayerName,
            currentPlayerRole
        });
        
        // Pripoj WebSocket
        setupWebSocket(currentPartyId, currentPlayerId);
        
// Pripojenie do party
joinBtn.addEventListener('click', async () => {
    const playerName = playerNameInput.value.trim();
    const partyCode = partyCodeInput.value.trim();

    if (!playerName || !partyCode) {
        showNotification('Vyplň meno a invite kód!', 'error');
        return;
    }

    showNotification('Pripájam sa...', 'info');

    const response = await API.joinParty(partyCode, playerName);
    
    if (response.success) {
        currentPartyId = response.partyId;
        currentPlayerId = response.playerId;
        currentPlayerName = playerName;
        currentPlayerRole = 'guest';
        
        // Ulož do storage
        chrome.storage.local.set({
            currentPartyId,
            currentPlayerId,
            currentPlayerName,
            currentPlayerRole
        });
        
        // Pripoj WebSocket
        setupWebSocket(currentPartyId, currentPlayerId);
        
        // Načítaj party dáta
        const partyData = await API.getPartyData(currentPartyId);
        if (partyData.success) {
            loadPartyRoom(partyData);
        }
        
        showNotification('Pripojiť sa do party!', 'success');
    } else {
        showNotification(response.error || 'Chyba pri pripojení', 'error');
    }
});         currentPlayerRole = 'guest';
            
            loadPartyRoom(response.partyData, {
// Načítanie party room
function loadPartyRoom(partyData) {
    hideMenu(mainMenu);
    hideMenu(createPartyMenu);
    hideMenu(joinPartyMenu);
    showMenu(partyRoom);

    partyTitle.textContent = partyData.party.party_name;
    displayInviteCode.textContent = partyData.party.party_code;
    playerCount.textContent = partyData.players.length;

    // Načítanie hráčov
    updatePlayersList(partyData.players);

    // Načítanie správ
    updateChatMessages(partyData.messages || []);

    // Nastaviť "start kvíz" button viditeľný len pre hosta
    if (currentPlayerRole === 'host') {
        startQuizBtn.style.display = 'block';
    } else {
        startQuizBtn.style.display = 'none';
    }
}   updateChatMessages(partyData.messages || []);

    // Nastaviť "start kvíz" button viditeľný len pre hosta
    if (currentPlayerRole === 'host') {
        startQuizBtn.style.display = 'block';
// Posielanie správy
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();

    if (!message || !currentPartyId) return;

    socketManager.sendMessage(currentPlayerName, message);
    messageInput.value = '';
});     playerName: currentPlayerName,
        message: message
    }, (response) => {
        if (response.success) {
            messageInput.value = '';
            updateChatMessages(response.messages);
        }
    });
});

// Odoslanie správy pri Enter
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

// Kopírovanie invite kódu
copyCodeBtn.addEventListener('click', () => {
    const code = displayInviteCode.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Kód bol skopírovaný!', 'success');
    });
});

// Opustenie party
// Opustenie party
leavePartyBtn.addEventListener('click', async () => {
    if (!confirm('Naozaj chceš opustiť party?')) return;

    const response = await API.leaveParty(currentPartyId, currentPlayerId, currentPlayerName);
    
    if (response.success) {
        socketManager.disconnect();
        
        currentPartyId = null;
        currentPlayerId = null;
        currentPlayerName = null;
        
        chrome.storage.local.remove(['currentPartyId', 'currentPlayerId', 'currentPlayerName', 'currentPlayerRole']);
        
        hideMenu(partyRoom);
        showMenu(mainMenu);
        showNotification('Opustili si party', 'info');
    }
});
// Spustenie kvízu
startQuizBtn.addEventListener('click', () => {
    showNotification('Spúšťam kvíz...', 'info');
    // Tu môžeš integrovať spustenie kvízu
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'startQuiz',
                partyId: currentPartyId
            });
// Spustenie kvízu
startQuizBtn.addEventListener('click', () => {
    showNotification('Spúšťam kvíz...', 'info');
    socketManager.startQuiz();
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'startQuiz',
                partyId: currentPartyId
            });
        }
    });
});
// Pomocné funkcie
function showMenu(element) {
    element.classList.remove('hidden');
}

function hideMenu(element) {
    element.classList.add('hidden');
}

function updatePlayersList(players) {
    playersList.innerHTML = players.map(player => 
        `<li>${player} ${player === currentPlayerName ? '(ty)' : ''}</li>`
    ).join('');
}

function updateChatMessages(messages) {
    chatMessages.innerHTML = messages.map(msg => {
        if (msg.type === 'system') {
function updatePlayersList(players) {
    playersList.innerHTML = players.map(player => 
        `<li>${player.player_name} ${player.player_name === currentPlayerName ? '(ty)' : ''} ${player.is_host ? '👑' : ''}</li>`
    ).join('');
}           const time = new Date(msg.timestamp).toLocaleTimeString('sk-SK', {hour: '2-digit', minute: '2-digit'});
            return `<div class="chat-message">
function updateChatMessages(messages) {
    chatMessages.innerHTML = messages.map(msg => {
        if (msg.message_type === 'system') {
            return `<div class="chat-message" style="font-style: italic; color: #999;">
                        <span>${msg.message_text}</span>
                    </div>`;
        } else {
            const time = new Date(msg.created_at).toLocaleTimeString('sk-SK', {hour: '2-digit', minute: '2-digit'});
            return `<div class="chat-message">
                        <span class="sender">${msg.player_name}</span>
                        <span class="time">${time}</span>
                        <div>${msg.message_text}</div>
                    </div>`;
        }
    }).join('');

    // Scroll na koniec
    chatMessages.scrollTop = chatMessages.scrollHeight;
}   }, 3000);
}

// Automatické aktualizovanie party dát
function startPartyRefresh(partyId) {
    const refreshInterval = setInterval(() => {
        chrome.runtime.sendMessage({
            action: 'getPartyData',
            partyId: partyId
// WebSocket setup
function setupWebSocket(partyId, playerId) {
    const socket = socketManager.connect(partyId, playerId);

    // Počúvaj na nové správy
    socket.on('newMessage', (data) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        const time = new Date(data.timestamp).toLocaleTimeString('sk-SK', {hour: '2-digit', minute: '2-digit'});
        messageDiv.innerHTML = `
            <span class="sender">${data.playerName}</span>
            <span class="time">${time}</span>
            <div>${data.message}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Počúvaj na nových hráčov
    socket.on('playerJoined', async (data) => {
        showNotification(`${data.playerName} sa pripojil/a`, 'info');
        const partyData = await API.getPartyData(currentPartyId);
        if (partyData.success) {
            playerCount.textContent = partyData.players.length;
            updatePlayersList(partyData.players);
        }
    });

    // Počúvaj na odchod hráčov
    socket.on('playerLeft', async (data) => {
        showNotification(`${data.playerName} opustil/a party`, 'info');
        const partyData = await API.getPartyData(currentPartyId);
        if (partyData.success) {
            playerCount.textContent = partyData.players.length;
            updatePlayersList(partyData.players);
        }
    });

    // Počúvaj na spustenie kvízu
    socket.on('quizStarted', () => {
        showNotification('Kvíz začal!', 'success');
    });
}