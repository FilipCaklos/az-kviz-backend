// Injekcia do A-Z Kvíz stránky

console.log('🚀 A-Z Kvíz Party Extension loaded on:', window.location.href);

// Detekcia invite linku na A-Z Kvíz Junior
function detectInviteLink() {
    // Skús nájsť input element s ID 'copy'
    const inputElement = document.getElementById('copy');
    
    console.log('🔍 Looking for invite link...', inputElement);
    
    if (inputElement && inputElement.value) {
        const inviteLink = inputElement.value;
        console.log('🎯 Detected invite link:', inviteLink);
        
        // Extrahuj party code z linku
        const partyCode = extractPartyCode(inviteLink);
        
        console.log('📋 Extracted party code:', partyCode);
        
        if (partyCode) {
            // Pošli do extension storage
            chrome.storage.local.set({ 
                detectedInviteLink: inviteLink,
                detectedPartyCode: partyCode 
            }, () => {
                console.log('✅ Saved to storage:', partyCode);
            });
            
            // Notifikuj užívateľa
            showNotification('🎉 Invite link detekovaný! Kód: ' + partyCode);
        }
    } else if (inputElement) {
        console.log('⚠️ Input element found but no value');
    } else {
        console.log('❌ Input element #copy not found');
    }
}

// Extrahuj party code z URL alebo textu
function extractPartyCode(text) {
    try {
        // Ak je to URL, parsuj ho
        if (text.includes('http')) {
            const urlObj = new URL(text);
            const code = urlObj.searchParams.get('code');
            if (code) return code;
        }
        
        // Skús regex na code parameter
        const codeMatch = text.match(/[?&]code=([A-Z0-9-]+)/i);
        if (codeMatch) return codeMatch[1];
        
        // Skús regex na lobby/ path
        const lobbyMatch = text.match(/\/lobby\/([A-Z0-9-]+)/i);
        if (lobbyMatch) return lobbyMatch[1];
        
        // Ak je to len samotný kód (6-10 znakov, písmená a čísla)
        if (/^[A-Z0-9-]{6,15}$/i.test(text.trim())) {
            return text.trim().toUpperCase();
        }
        
        return null;
    } catch (e) {
        console.error('Error extracting party code:', e);
        return null;
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
// Observer na sledovanie zmien v DOM (ak link ešte nie je načítaný)
const observer = new MutationObserver(() => {
    detectInviteLink();
});

// Sledovanie zmien priamo na input elemente
function watchInputElement() {
    const inputElement = document.getElementById('copy');
    if (inputElement) {
        console.log('✅ Found input element, watching for changes...');
        
        // Event listener na zmenu hodnoty
        inputElement.addEventListener('input', () => {
            console.log('📝 Input changed:', inputElement.value);
            detectInviteLink();
        });
        
        // Aj pre paste event
        inputElement.addEventListener('paste', () => {
            setTimeout(detectInviteLink, 100);
        });
        
        // Skontroluj aj hneď
        detectInviteLink();
    }
}

// Inicializácia
function init() {
    console.log('🔧 Initializing A-Z Kviz Party Extension...');
    
    // Skús hneď
    detectInviteLink();
    watchInputElement();
    
    // Sleduj DOM zmeny
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Pravidelná kontrola každé 3 sekundy
    setInterval(() => {
        detectInviteLink();
        if (!document.getElementById('copy')?.hasAttribute('data-watched')) {
            watchInputElement();
        }
    }, 3000);
}

// Spusti po načítaní
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
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
