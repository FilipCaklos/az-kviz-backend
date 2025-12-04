// Firebase konfigurácia - pomocou globálneho firebase objektu
const firebaseConfig = {
  apiKey: "AIzaSyDFXxLWcX_5pQEf7xu3wdtDJgHhWikoO30",
  authDomain: "a-z-kviz-party.firebaseapp.com",
  databaseURL: "https://a-z-kviz-party-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "a-z-kviz-party",
  storageBucket: "a-z-kviz-party.firebasestorage.app",
  messagingSenderId: "612232882186",
  appId: "1:612232882186:web:44755474c30a65c088d7f3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Firebase API wrapper
class FirebaseAPI {
    // Vytvorenie party
    static async createParty(partyName, hostName, partyCode) {
        try {
            const partyId = partyCode;
            const partyRef = database.ref(`parties/${partyId}`);
            
            const partyData = {
                partyId: partyId,
                partyCode: partyCode,
                partyName: partyName,
                hostName: hostName,
                createdAt: new Date().toISOString(),
                maxPlayers: 20,
                players: {
                    [hostName]: {
                        playerName: hostName,
                        isHost: true,
                        score: 0,
                        joinedAt: new Date().toISOString()
                    }
                },
                messages: {}
            };

            await set(partyRef, partyData);

            // Systémová správa
            const messageRef = database.ref(`parties/${partyId}/messages`).push();
            await set(messageRef, {
                playerName: 'System',
                messageType: 'system',
                messageText: `Party "${partyName}" bola vytvorená`,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                partyId: partyId,
                partyCode: partyCode,
                partyName: partyName,
                hostName: hostName
            };
        } catch (error) {
            console.error('Error creating party:', error);
            return { success: false, error: error.message };
        }
    }

    // Pripojenie do party
    static async joinParty(partyCode, playerName) {
        try {
            const partyRef = database.ref(`parties/${partyCode}`);
            
            return new Promise((resolve) => {
                partyRef.once('value', async (snapshot) => {
                    if (!snapshot.exists()) {
                        resolve({ success: false, error: 'Party s týmto kódom neexistuje' });
                        return;
                    }

                    const partyData = snapshot.val();
                    const players = partyData.players || {};
                    
                    if (Object.keys(players).length >= partyData.maxPlayers) {
                        resolve({ success: false, error: 'Party je plná' });
                        return;
                    }

                    // Pridaj hráča
                    const playerRef = database.ref(`parties/${partyCode}/players/${playerName}`);
                    await playerRef.set({
                        playerName: playerName,
                        isHost: false,
                        score: 0,
                        joinedAt: new Date().toISOString()
                    });

                    // Systémová správa
                    const messageRef = database.ref(`parties/${partyCode}/messages`).push();
                    await messageRef.set({
                        playerName: 'System',
                        messageType: 'system',
                        messageText: `${playerName} sa pripojil/a do party`,
                        timestamp: new Date().toISOString()
                    });

                    resolve({
                        success: true,
                        partyId: partyCode,
                        partyName: partyData.partyName,
                        hostName: partyData.hostName
                    });
                });
            });
        } catch (error) {
            console.error('Error joining party:', error);
            return { success: false, error: error.message };
        }
    }

    // Získanie party dát
    static async getPartyData(partyId) {
        try {
            const partyRef = database.ref(`parties/${partyId}`);
            
            return new Promise((resolve) => {
                partyRef.once('value', (snapshot) => {
                    if (!snapshot.exists()) {
                        resolve({ success: false, error: 'Party sa nenašla' });
                        return;
                    }

                    const partyData = snapshot.val();
                    const players = partyData.players ? Object.values(partyData.players) : [];
                    const messages = partyData.messages ? Object.values(partyData.messages) : [];

                    resolve({
                        success: true,
                        party: {
                            party_name: partyData.partyName,
                            party_code: partyData.partyCode,
                            host_name: partyData.hostName
                        },
                        players: players,
                        messages: messages
                    });
                });
            });
        } catch (error) {
            console.error('Error getting party data:', error);
            return { success: false, error: error.message };
        }
    }

    // Opustenie party
    static async leaveParty(partyId, playerName) {
        try {
            const playerRef = database.ref(`parties/${partyId}/players/${playerName}`);
            await playerRef.remove();

            // Systémová správa
            const messageRef = database.ref(`parties/${partyId}/messages`).push();
            await messageRef.set({
                playerName: 'System',
                messageType: 'system',
                messageText: `${playerName} opustil/a party`,
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Error leaving party:', error);
            return { success: false, error: error.message };
        }
    }

    // Posielanie správy
    static async sendMessage(partyId, playerName, message) {
        try {
            const messageRef = database.ref(`parties/${partyId}/messages`).push();
            await messageRef.set({
                playerName: playerName,
                messageType: 'user',
                messageText: message,
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: error.message };
        }
    }

    // Real-time listening na zmeny
    static listenToParty(partyId, callback) {
        const partyRef = database.ref(`parties/${partyId}`);
        return partyRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            }
        });
    }

    // Spustenie kvízu
    static async startQuiz(partyId) {
        try {
            const partyRef = database.ref(`parties/${partyId}`);
            await partyRef.update({
                quizStarted: true,
                quizStartedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Error starting quiz:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export
window.FirebaseAPI = FirebaseAPI;
