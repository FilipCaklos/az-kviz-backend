// Backend API konfigurácia
const API_CONFIG = {
    // Zmeň túto URL po deployi na DigitalOcean
    BASE_URL: 'http://localhost:8080', // Pre development
    // BASE_URL: 'https://your-app.ondigitalocean.app', // Pre production
    
    ENDPOINTS: {
        CREATE_PARTY: '/api/party/create',
        JOIN_PARTY: '/api/party/join',
        GET_PARTY: '/api/party',
        LEAVE_PARTY: '/api/party/leave'
    }
};

// Helper funkcie pre API calls
class API {
    static async createParty(partyName, hostName, partyCode) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_PARTY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ partyName, hostName, partyCode })
            });

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    static async joinParty(partyCode, playerName) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.JOIN_PARTY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ partyCode, playerName })
            });

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    static async getPartyData(partyId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_PARTY}/${partyId}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    static async leaveParty(partyId, playerId, playerName) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LEAVE_PARTY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ partyId, playerId, playerName })
            });

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }
}

// WebSocket connection
class SocketManager {
    constructor() {
        this.socket = null;
        this.partyId = null;
    }

    connect(partyId, playerId) {
        // Socket.io client
        this.socket = io(API_CONFIG.BASE_URL);
        this.partyId = partyId;

        this.socket.on('connect', () => {
            console.log('✅ WebSocket pripojený');
            this.socket.emit('joinRoom', partyId);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket odpojený');
        });

        return this.socket;
    }

    sendMessage(playerName, message) {
        if (this.socket && this.partyId) {
            this.socket.emit('sendMessage', {
                partyId: this.partyId,
                playerId: localStorage.getItem('playerId'),
                playerName: playerName,
                message: message
            });
        }
    }

    startQuiz() {
        if (this.socket && this.partyId) {
            this.socket.emit('startQuiz', { partyId: this.partyId });
        }
    }

    submitAnswer(playerName, questionNumber, answer, isCorrect) {
        if (this.socket && this.partyId) {
            this.socket.emit('submitAnswer', {
                partyId: this.partyId,
                playerId: localStorage.getItem('playerId'),
                playerName: playerName,
                questionNumber: questionNumber,
                answer: answer,
                isCorrect: isCorrect
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.partyId = null;
        }
    }
}
