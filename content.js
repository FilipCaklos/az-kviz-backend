// Content script na detekciu invite linkov z A-Z Kvíz a ČT stránok

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
        font-family: Arial, sans-serif;
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

// Inicializácia - spusť hneď
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
    
    // 4. Fallback polling každé 2 sekundy
    setInterval(detectAndSaveInviteLink, 2000);
    
    console.log('✅ Content script initialized');
}

// Spusť okamžite
initialize();

// Aj keď sa stránka načítava
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
}
