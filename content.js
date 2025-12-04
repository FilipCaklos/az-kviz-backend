// Content script na detekciu invite linkov z A-Z Kvíz Junior stránky

console.log('🚀 A-Z Kvíz Party Extension loaded on:', window.location.href);

// Extrahuj party code z textu (URL alebo samotný kód)
function extractPartyCode(text) {
    if (!text) return null;
    
    try {
        // Ak je to URL, parsuj ho
        if (text.includes('http')) {
            try {
                const urlObj = new URL(text);
                const code = urlObj.searchParams.get('code');
                if (code) {
                    console.log('✅ Code z URL parametra:', code);
                    return code;
                }
            } catch (e) {
                console.log('⚠️ URL parse error:', e);
            }
        }
        
        // Regex na code parameter v URL
        const codeMatch = text.match(/[?&]code=([A-Z0-9-]+)/i);
        if (codeMatch) {
            console.log('✅ Code z regex URL:', codeMatch[1]);
            return codeMatch[1];
        }
        
        // Regex na /lobby/ path
        const lobbyMatch = text.match(/\/lobby\/([A-Z0-9-]+)/i);
        if (lobbyMatch) {
            console.log('✅ Code z lobby path:', lobbyMatch[1]);
            return lobbyMatch[1];
        }
        
        // Ak je to samotný kód (6-15 znakov, písmená a čísla s pomlčkami)
        const clean = text.trim().toUpperCase();
        if (/^[A-Z0-9\-]{6,15}$/.test(clean)) {
            console.log('✅ Code ako samotný text:', clean);
            return clean;
        }
        
        return null;
    } catch (e) {
        console.error('❌ Error extracting party code:', e);
        return null;
    }
}

// Zobrazenie notifikácie na stránke
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
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Detekcia a uloženie invite linku
function detectAndSaveInviteLink() {
    const inputElement = document.getElementById('copy');
    
    if (inputElement && inputElement.value) {
        const inviteLink = inputElement.value.trim();
        console.log('🎯 Found invite link in input:', inviteLink);
        
        const partyCode = extractPartyCode(inviteLink);
        
        if (partyCode) {
            console.log('📋 Extracted party code:', partyCode);
            
            // Ulož do chrome storage
            chrome.storage.local.set({
                detectedInviteLink: inviteLink,
                detectedPartyCode: partyCode,
                detectedAt: new Date().toISOString()
            }, () => {
                console.log('✅ Saved to storage:', { partyCode, inviteLink });
            });
            
            // Zobraz notifikáciu
            showNotification(`✨ Kód detekovaný: ${partyCode}`);
        }
    }
}

// Inicializácia - čaká na DOMContentLoaded
function initialize() {
    console.log('🔧 Initializing content script...');
    
    // Debug: Zobraz všetky input polia
    const allInputs = document.querySelectorAll('input');
    console.log('📊 Found inputs:', allInputs.length);
    allInputs.forEach((input, idx) => {
        console.log(`Input ${idx}:`, {
            id: input.id,
            name: input.name,
            type: input.type,
            value: input.value?.substring(0, 50),
            class: input.className
        });
    });
    
    // 1. Skús hneď detektovať (ak je už načítane)
    detectAndSaveInviteLink();
    
    // 2. Sleduj input element
    const inputElement = document.getElementById('copy');
    if (inputElement) {
        console.log('👀 Watching input element for changes');
        
        // Event listener na input zmenu
        inputElement.addEventListener('input', () => {
            console.log('📝 Input value changed');
            detectAndSaveInviteLink();
        });
        
        // Event listener na paste
        inputElement.addEventListener('paste', () => {
            console.log('📌 Paste event detected');
            setTimeout(detectAndSaveInviteLink, 100);
        });
        
        // Event listener na change
        inputElement.addEventListener('change', () => {
            console.log('🔄 Change event detected');
            detectAndSaveInviteLink();
        });
    }
    
    // 3. MutationObserver pre prípad dynamického načítania
    const observer = new MutationObserver((mutations) => {
        // Skontroluj či input element existuje teraz
        const input = document.getElementById('copy');
        if (input && !input.hasAttribute('data-watched')) {
            console.log('🆕 Input element added to DOM, watching it');
            input.setAttribute('data-watched', 'true');
            
            input.addEventListener('input', detectAndSaveInviteLink);
            input.addEventListener('paste', () => {
                setTimeout(detectAndSaveInviteLink, 100);
            });
            
            detectAndSaveInviteLink();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Content script initialized');
}

// Spusť po načítaní stránky
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
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
