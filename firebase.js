// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDFXxLWcX_5pQEf7xu3wdtDJgHhWikoO30",
  authDomain: "a-z-kviz-party.firebaseapp.com",
  databaseURL: "https://a-z-kviz-party-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "a-z-kviz-party"
};

// Firebase SDK (inline - bez extern. skriptov)
const db = {
  ref: (path) => ({ path }),
  get: async (path) => {
    const res = await fetch(firebaseConfig.databaseURL + path + '.json');
    return res.json();
  },
  set: async (path, data) => {
    return fetch(firebaseConfig.databaseURL + path + '.json', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

// Funkcie
const Firebase = {
  generateCode: () => {
    return 'PARTY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  },

  createParty: async (name, playerName) => {
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
    
    await db.set('/parties/' + code, partyData);
    return code;
  },

  joinParty: async (code, playerName) => {
    const party = await db.get('/parties/' + code);
    if (!party) return null;
    
    const updated = {
      ...party,
      players: {
        ...party.players,
        [playerName]: { name: playerName, joined: new Date().toISOString() }
      }
    };
    
    await db.set('/parties/' + code, updated);
    return party;
  },

  getParty: async (code) => {
    return db.get('/parties/' + code);
  },

  addMessage: async (code, playerName, text) => {
    const party = await db.get('/parties/' + code);
    const messages = party.messages || [];
    
    messages.push({
      player: playerName,
      text,
      time: new Date().toISOString()
    });
    
    await db.set('/parties/' + code + '/messages', messages);
  }
};
