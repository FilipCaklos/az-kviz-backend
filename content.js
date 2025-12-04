// Injekcia do A-Z Kvíz stránky

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
