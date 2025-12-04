// Správa party a chatu
const partyState = {
    currentPartyId: null,
    currentPlayerName: null,
    currentPlayerRole: null, // 'host' alebo 'guest'
    parties: {}, // Uložené party dáta
};

// Generovanie náhodného invite kódu
function generateInviteCode() {
    return 'PARTY-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Vytvorenie novej party
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'createParty') {
        const partyId = generateInviteCode();
        const partyData = {
            partyId: partyId,
            name: request.partyName,
            host: request.playerName,
            players: [request.playerName],
            messages: [],
            createdAt: new Date().toISOString(),
            maxPlayers: 20,
        };

        partyState.parties[partyId] = partyData;
        partyState.currentPartyId = partyId;
        partyState.currentPlayerName = request.playerName;
        partyState.currentPlayerRole = 'host';

        // Uloženie do Chrome storage
        chrome.storage.local.set({ 
            partyState: partyState,
            currentParty: partyData 
        });

        sendResponse({ 
            success: true, 
            partyId: partyId,
            partyData: partyData
        });
    }
});

// Pripojenie do party
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'joinParty') {
        const partyId = request.partyCode;
        
        // Kontrola či party existuje
        if (partyState.parties[partyId]) {
            const party = partyState.parties[partyId];
            
            // Kontrola či je party plná
            if (party.players.length >= party.maxPlayers) {
                sendResponse({ 
                    success: false, 
                    error: 'Party je plná!' 
                });
                return;
            }

            // Pridanie hráča do party
            if (!party.players.includes(request.playerName)) {
                party.players.push(request.playerName);
            }

            partyState.currentPartyId = partyId;
            partyState.currentPlayerName = request.playerName;
            partyState.currentPlayerRole = 'guest';

            chrome.storage.local.set({ 
                partyState: partyState,
                currentParty: party 
            });

            // Pridanie systémovej správy
            party.messages.push({
                type: 'system',
                text: `${request.playerName} sa pripojil/a do party`,
                timestamp: new Date().toISOString()
            });

            sendResponse({ 
                success: true, 
                partyId: partyId,
                partyData: party
            });
        } else {
            sendResponse({ 
                success: false, 
                error: 'Party s týmto kódom neexistuje!' 
            });
        }
    }
});

// Posielanie správy v chate
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendMessage') {
        const partyId = request.partyId;
        
        if (partyState.parties[partyId]) {
            const party = partyState.parties[partyId];
            const message = {
                type: 'user',
                sender: request.playerName,
                text: request.message,
                timestamp: new Date().toISOString()
            };

            party.messages.push(message);

            chrome.storage.local.set({ 
                currentParty: party 
            });

            sendResponse({ 
                success: true, 
                messages: party.messages
            });
        }
    }
});

// Získanie údajov o party
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPartyData') {
        const partyId = request.partyId;
        
        if (partyState.parties[partyId]) {
            sendResponse({ 
                success: true, 
                partyData: partyState.parties[partyId]
            });
        } else {
            sendResponse({ 
                success: false, 
                error: 'Party sa nenašla' 
            });
        }
    }
});

// Opustenie party
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'leaveParty') {
        const partyId = request.partyId;
        
        if (partyState.parties[partyId]) {
            const party = partyState.parties[partyId];
            const playerIndex = party.players.indexOf(request.playerName);
            
            if (playerIndex > -1) {
                party.players.splice(playerIndex, 1);
            }

            // Ak host opustil party, zmaž ju
            if (party.host === request.playerName) {
                delete partyState.parties[partyId];
            }

            partyState.currentPartyId = null;
            partyState.currentPlayerName = null;

            chrome.storage.local.set({ 
                partyState: partyState 
            });

            sendResponse({ success: true });
        }
    }
});

// Počúvanie na zmeny
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        if (changes.partyState) {
            partyState = changes.partyState.newValue;
        }
    }
});
