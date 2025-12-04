# 🔥 Firebase Setup - Super Jednoduché

## Krok 1: Vytvor Firebase projekt (5 minút)

1. Choď na: https://console.firebase.google.com
2. Klikni **"Add project"** alebo **"Pridať projekt"**
3. **Project name**: `az-kviz-party`
4. **Google Analytics**: Vypni (nepotrebuješ)
5. Klikni **"Create project"**
6. Čakaj 30 sekúnd...
7. Klikni **"Continue"**

## Krok 2: Zapni Realtime Database

1. V ľavom menu nájdi **"Build"** → **"Realtime Database"**
2. Klikni **"Create Database"**
3. **Database location**: Vyber najbližší (napr. europe-west1)
4. **Security rules**: Vyber **"Start in test mode"** (neskôr zabezpečíme)
5. Klikni **"Enable"**

**Hotovo!** Dostaneš URL typu: `https://az-kviz-party-default-rtdb.europe-west1.firebasedatabase.app/`

## Krok 3: Získaj Firebase config

1. V Firebase Console klikni na ikonu **"Settings"** ⚙️ (vedľa Project Overview)
2. Vyber **"Project settings"**
3. Scroll dole na **"Your apps"**
4. Klikni **"</> Web"** (web app ikona)
5. **App nickname**: `az-kviz-extension`
6. ❌ **NEVYBERAJ** "Firebase Hosting"
7. Klikni **"Register app"**
8. **Skopíruj firebaseConfig** (celý objekt):

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

9. Klikni **"Continue to console"**

## Krok 4: Všetko je hotové! ✅

**Žiadny server, žiadna Azure, žiadna MySQL.**

Teraz ti upravím extension aby používal Firebase namiesto backend servera.

Daj mi vedieť keď máš **firebaseConfig** a ja to zapojím! 🚀

---

## 💰 Cena Firebase

- **Realtime Database**: 
  - **1 GB storage**: Zadarmo
  - **10 GB/mesiac download**: Zadarmo
  - Pre tvoj use case: **100% ZADARMO**

## 🎯 Výhody

- ✅ Žiadny setup servera
- ✅ Real-time automaticky
- ✅ Škáluje automaticky
- ✅ Zadarmo (pre malé projekty)
- ✅ Jednoduché API
