// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDFXxLWcX_5pQEf7xu3wdtDJgHhWikoO30",
  authDomain: "a-z-kviz-party.firebaseapp.com",
  databaseURL: "https://a-z-kviz-party-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "a-z-kviz-party"
};

// Firebase REST API helper
const FirebaseAPI = {
  get: async (path) => {
    try {
      const url = `${firebaseConfig.databaseURL}${path}.json?auth=${firebaseConfig.apiKey}`;
      console.log('[API GET]', url);
      const res = await fetch(url);
      const data = await res.json();
      console.log('[API RESULT]', data);
      return data;
    } catch (err) {
      console.error('[API ERROR]', err);
      return null;
    }
  },
  
  set: async (path, data) => {
    try {
      const url = `${firebaseConfig.databaseURL}${path}.json?auth=${firebaseConfig.apiKey}`;
      console.log('[API SET]', url, data);
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      console.log('[API SET RESULT]', result);
      return result;
    } catch (err) {
      console.error('[API SET ERROR]', err);
      return null;
    }
  }
};

// Funkcie
const Firebase = {
  generateCode: () => {
    return 'PARTY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  },

  createParty: async (name, playerName) => {
    console.log('[CREATE PARTY]', { name, playerName });
    const code = Firebase.generateCode();
    const partyData = {
      name,
      code,
      owner: playerName,
      created: new Date().toISOString(),
      players: {
        [playerName]: { name: playerName, joined: new Date().toISOString() }
      },
      messages: []
    };
    
    const result = await FirebaseAPI.set('/parties/' + code, partyData);
    console.log('[CREATE PARTY RESULT]', result);
    return code;
  },

  joinParty: async (code, playerName) => {
    console.log('[JOIN PARTY]', { code, playerName });
    const party = await FirebaseAPI.get('/parties/' + code);
    if (!party) {
      console.error('[JOIN PARTY] Party not found:', code);
      return null;
    }
    
    const updated = {
      ...party,
      players: {
        ...party.players,
        [playerName]: { name: playerName, joined: new Date().toISOString() }
      }
    };
    
    const result = await FirebaseAPI.set('/parties/' + code, updated);
    console.log('[JOIN PARTY RESULT]', result);
    return party;
  },

  getParty: async (code) => {
    console.log('[GET PARTY]', code);
    const party = await FirebaseAPI.get('/parties/' + code);
    console.log('[GET PARTY RESULT]', party);
    return party;
  },

  addMessage: async (code, playerName, text) => {
    console.log('[ADD MESSAGE]', { code, playerName, text });
    const party = await FirebaseAPI.get('/parties/' + code);
    if (!party) {
      console.error('[ADD MESSAGE] Party not found');
      return null;
    }
    
    const messages = party.messages || [];
    messages.push({
      player: playerName,
      text,
      time: new Date().toISOString()
    });
    
    const result = await FirebaseAPI.set('/parties/' + code + '/messages', messages);
    console.log('[ADD MESSAGE RESULT]', result);
    return result;
  }
};
