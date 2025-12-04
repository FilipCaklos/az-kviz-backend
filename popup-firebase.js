// UI Kontrola a Event Listenery - Firebase verzia

let currentPartyId = null;
let currentPlayerName = null;
let currentPlayerRole = null;
let partyListener = null;

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

// Čakaj na načítanie Firebase
setTimeout(() => {
    initializeApp();
}, 500);

function initializeApp() {
    // Skontroluj či je detekovaný invite link
    chrome.storage.local.get(['detectedInviteLink', 'detectedPartyCode'], (result) => {
        if (result.detectedPartyCode && !currentPartyId) {
            // Zobraz detekovaný link
            showDetectedInvite(result.detectedPartyCode);
        }
    });

    // Inicializácia pri otvorení popup
    chrome.storage.local.get(['currentPartyId', 'currentPlayerName', 'currentPlayerRole'], async (result) => {
        if (result.currentPartyId && result.currentPlayerName) {
            currentPartyId = result.currentPartyId;
            currentPlayerName = result.currentPlayerName;
            currentPlayerRole = result.currentPlayerRole;

            const partyData = await window.FirebaseAPI.getPartyData(currentPartyId);
            if (partyData.success) {
                loadPartyRoom(partyData);
                setupRealTimeListeners(currentPartyId);
            } else {
                chrome.storage.local.remove(['currentPartyId', 'currentPlayerName', 'currentPlayerRole']);
            }
        }
    });

    // Event listenery
    createPartyBtn.addEventListener('click', () => {
        showMenu(createPartyMenu);
        hideMenu(mainMenu);
    });

    joinPartyBtn.addEventListener('click', () => {
        showMenu(joinPartyMenu);
        hideMenu(mainMenu);
        
        // Auto-vyplň party code ak je detekovaný
        chrome.storage.local.get(['detectedPartyCode'], (result) => {
            if (result.detectedPartyCode) {
                partyCodeInput.value = result.detectedPartyCode;
            }
        });
    });

    generateCodeBtn.addEventListener('click', () => {
        const code = 'PARTY-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        inviteCodeInput.value = code;
        showNotification('Kód bol vygenerovaný!', 'success');
    });

    confirmCreateBtn.addEventListener('click', async () => {
        const partyName = partyNameInput.value.trim();
        const inviteCode = inviteCodeInput.value.trim();
        const playerName = partyNameInput.value.trim() || 'Host';

        if (!partyName || !inviteCode) {
            showNotification('Vyplň názov party a invite kód!', 'error');
            return;
        }

        showNotification('Vytváram party...', 'info');

        const response = await window.FirebaseAPI.createParty(partyName, playerName, inviteCode);
        
        if (response.success) {
            currentPartyId = response.partyId;
            currentPlayerName = response.hostName;
            currentPlayerRole = 'host';
            
            chrome.storage.local.set({
                currentPartyId,
                currentPlayerName,
                currentPlayerRole
            });
            
            const partyData = await window.FirebaseAPI.getPartyData(currentPartyId);
            if (partyData.success) {
                loadPartyRoom(partyData);
                setupRealTimeListeners(currentPartyId);
            }
            
            showNotification('Party bola vytvorená!', 'success');
        } else {
            showNotification(response.error || 'Chyba pri vytváraní party', 'error');
        }
    });

    joinBtn.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        const partyCode = partyCodeInput.value.trim();

        if (!playerName || !partyCode) {
            showNotification('Vyplň meno a invite kód!', 'error');
            return;
        }

        showNotification('Pripájam sa...', 'info');

        const response = await window.FirebaseAPI.joinParty(partyCode, playerName);
        
        if (response.success) {
            currentPartyId = response.partyId;
            currentPlayerName = playerName;
            currentPlayerRole = 'guest';
            
            chrome.storage.local.set({
                currentPartyId,
                currentPlayerName,
                currentPlayerRole
            });
            
            const partyData = await window.FirebaseAPI.getPartyData(currentPartyId);
            if (partyData.success) {
                loadPartyRoom(partyData);
                setupRealTimeListeners(currentPartyId);
            }
            
            showNotification('Pripojiť sa do party!', 'success');
        } else {
            showNotification(response.error || 'Chyba pri pripojení', 'error');
        }
    });

    sendBtn.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (!message || !currentPartyId) return;

        await window.FirebaseAPI.sendMessage(currentPartyId, currentPlayerName, message);
        messageInput.value = '';
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    copyCodeBtn.addEventListener('click', () => {
        const code = displayInviteCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Kód bol skopírovaný!', 'success');
        });
    });

    leavePartyBtn.addEventListener('click', async () => {
        if (!confirm('Naozaj chceš opustiť party?')) return;

        await window.FirebaseAPI.leaveParty(currentPartyId, currentPlayerName);
        
        if (partyListener) {
            partyListener();
        }
        
        currentPartyId = null;
        currentPlayerName = null;
        
        chrome.storage.local.remove(['currentPartyId', 'currentPlayerName', 'currentPlayerRole']);
        
        hideMenu(partyRoom);
        showMenu(mainMenu);
        showNotification('Opustili si party', 'info');
    });

    startQuizBtn.addEventListener('click', async () => {
        showNotification('Spúšťam kvíz...', 'info');
        await window.FirebaseAPI.startQuiz(currentPartyId);
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'startQuiz',
                    partyId: currentPartyId
                });
            }
        });
        });
    });
}

function showDetectedInvite(partyCode) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: #4299e1;
        color: white;
        padding: 12px;
        margin-bottom: 15px;
        border-radius: 8px;
        font-size: 13px;
        text-align: center;
        cursor: pointer;
    `;
    notification.innerHTML = `
        🎯 Detekovaný invite link z A-Z Kvíz!<br>
        <strong>${partyCode}</strong><br>
        <small>Klikni pre rýchle pripojenie</small>
    `;
    
    notification.addEventListener('click', () => {
        partyCodeInput.value = partyCode;
        showMenu(joinPartyMenu);
        hideMenu(mainMenu);
    });
    
    mainMenu.prepend(notification);
}

function loadPartyRoom(partyData) {u);
            hideMenu(joinPartyMenu);
            showMenu(mainMenu);
        });
    });
}

function loadPartyRoom(partyData) {
    hideMenu(mainMenu);
    hideMenu(createPartyMenu);
    hideMenu(joinPartyMenu);
    showMenu(partyRoom);

    partyTitle.textContent = partyData.party.party_name;
    displayInviteCode.textContent = partyData.party.party_code;
    playerCount.textContent = partyData.players.length;

    updatePlayersList(partyData.players);
    updateChatMessages(partyData.messages || []);

    if (currentPlayerRole === 'host') {
        startQuizBtn.style.display = 'block';
    } else {
        startQuizBtn.style.display = 'none';
    }
}

function setupRealTimeListeners(partyId) {
    if (partyListener) {
        partyListener();
    }

    partyListener = window.FirebaseAPI.listenToParty(partyId, (partyData) => {
        const players = partyData.players ? Object.values(partyData.players) : [];
        const messages = partyData.messages ? Object.values(partyData.messages) : [];

        playerCount.textContent = players.length;
        updatePlayersList(players);
        updateChatMessages(messages);

        if (partyData.quizStarted && !window.quizNotified) {
            showNotification('Kvíz začal!', 'success');
            window.quizNotified = true;
        }
    });
}

function updatePlayersList(players) {
    playersList.innerHTML = players.map(player => 
        `<li>${player.playerName} ${player.playerName === currentPlayerName ? '(ty)' : ''} ${player.isHost ? '👑' : ''}</li>`
    ).join('');
}

function updateChatMessages(messages) {
    chatMessages.innerHTML = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(msg => {
        if (msg.messageType === 'system') {
            return `<div class="chat-message" style="font-style: italic; color: #999;">
                        <span>${msg.messageText}</span>
                    </div>`;
        } else {
            const time = new Date(msg.timestamp).toLocaleTimeString('sk-SK', {hour: '2-digit', minute: '2-digit'});
            return `<div class="chat-message">
                        <span class="sender">${msg.playerName}</span>
                        <span class="time">${time}</span>
                        <div>${msg.messageText}</div>
                    </div>`;
        }
    }).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showMenu(element) {
    element.classList.remove('hidden');
}

function hideMenu(element) {
    element.classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
