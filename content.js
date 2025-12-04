// Injekcia do A-Z Kvíz stránky

// Detekcia invite linku na A-Z Kvíz Junior
function detectInviteLink() {
    const inputElement = document.getElementById('copy');
    
    if (inputElement && inputElement.value) {
        const inviteLink = inputElement.value;
        console.log('🎯 Detected invite link:', inviteLink);
        
        // Extrahuj party code z linku
        const partyCode = extractPartyCode(inviteLink);
        
        if (partyCode) {
            // Pošli do extension storage
            chrome.storage.local.set({ 
                detectedInviteLink: inviteLink,
                detectedPartyCode: partyCode 
            });
            
            // Notifikuj užívateľa
            showNotification('Invite link detekovaný! Otvor extension pre pripojenie.');
        }
    }
}

// Extrahuj party code z URL
function extractPartyCode(url) {
    try {
        // Príklad: https://junior.az-kviz.sk/lobby?code=ABC123
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        return code || null;
    } catch (e) {
        // Ak URL parsing zlyhá, skús regex
        const match = url.match(/code=([A-Z0-9]+)/i);
        return match ? match[1] : null;
    }
}

// Notifikácia na stránke
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Observer na sledovanie zmien v DOM (ak link ešte nie je načítaný)
const observer = new MutationObserver((mutations) => {
    detectInviteLink();
});

// Spusti detekciu po načítaní stránky
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(detectInviteLink, 1000);
        
        // Sleduj zmeny v DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
} else {
    setTimeout(detectInviteLink, 1000);
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Počúvaj na zmeny v input elemente
setInterval(detectInviteLink, 2000);

// Počúvanie správ z extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startQuiz') {
        initializeQuizParty(request.partyId);
        sendResponse({ success: true });
    }
});

// Inicializácia kvízu v party mode
function initializeQuizParty(partyId) {
    console.log('Inicializujem kvíz pre party:', partyId);
    
    // Zisti aktuálnu stránku a injektuj party UI
    const partyOverlay = createPartyOverlay(partyId);
    document.body.appendChild(partyOverlay);

    // Monitoruj odpovede v kvíze
    monitorQuizAnswers(partyId);
}

// Vytvorenie overlay UI pre party
function createPartyOverlay(partyId) {
    const overlay = document.createElement('div');
    overlay.id = 'party-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 350px;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-left: 2px solid #667eea;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: white;
        box-shadow: -4px 0 12px rgba(0, 0, 0, 0.2);
    `;

    overlay.innerHTML = `
        <div style="padding: 20px; border-bottom: 2px solid rgba(255,255,255,0.2);">
            <h2 style="margin: 0; font-size: 18px;">Party Kvíz</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Kód: ${partyId}</p>
        </div>

        <div id="party-scores" style="
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: rgba(0,0,0,0.1);
        "></div>

        <div id="party-chat" style="
            height: 200px;
            display: flex;
            flex-direction: column;
            border-top: 2px solid rgba(255,255,255,0.2);
            background: rgba(0,0,0,0.2);
        ">
            <div id="party-messages" style="
                flex: 1;
                overflow-y: auto;
                padding: 10px;
                font-size: 12px;
            "></div>
            <div style="
                display: flex;
                gap: 5px;
                padding: 10px;
                border-top: 1px solid rgba(255,255,255,0.2);
            ">
                <input type="text" id="party-msg-input" placeholder="Správa..." style="
                    flex: 1;
                    padding: 8px;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                ">
                <button id="party-msg-send" style="
                    padding: 8px 12px;
                    background: #48bb78;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                ">Odoslať</button>
            </div>
        </div>
    `;

    return overlay;
}

// Monitorovanie odpovedí v kvíze
function monitorQuizAnswers(partyId) {
    // Podľa typu kvízu (Sporcle, a-z kvíz, atď.)
    // Monitoruj správne odpovede a pošli ich do party chat

    // Príklad pre Sporcle:
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // Získaj správu o výsledku
            setTimeout(() => {
                const answerInput = document.querySelector('[name="guess"]');
                if (answerInput && answerInput.value) {
                    const answer = answerInput.value;
                    
                    // Pošli správu do party
                    chrome.runtime.sendMessage({
                        action: 'sendMessage',
                        partyId: partyId,
                        playerName: getCurrentPlayerName(),
                        message: `Odpoveď: ${answer}`
                    });
                }
            }, 100);
        }
    });
}

//获取aktuálneho hráča
function getCurrentPlayerName() {
    return localStorage.getItem('partyPlayerName') || 'Hráč';
}

// Vysielanie event o správe v party chate
document.addEventListener('DOMContentLoaded', () => {
    const msgInput = document.getElementById('party-msg-input');
    const msgSend = document.getElementById('party-msg-send');

    if (msgInput && msgSend) {
        msgSend.addEventListener('click', () => {
            if (msgInput.value.trim()) {
                const partyOverlay = document.getElementById('party-overlay');
                const partyId = partyOverlay.querySelector('p').textContent.split(': ')[1];

                chrome.runtime.sendMessage({
                    action: 'sendMessage',
                    partyId: partyId,
                    playerName: getCurrentPlayerName(),
                    message: msgInput.value
                });

                msgInput.value = '';
            }
        });

        msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                msgSend.click();
            }
        });
    }
});
