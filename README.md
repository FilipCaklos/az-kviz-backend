# A-Z Kvíz Party Extension

Google Chrome extension na pripojevie sa do party a hranie A-Z kvízu s chatom a invite funkciami.

## Funkčnosti

✅ **Vytvorenie Party** - Vytvor novú party s invite kódom
✅ **Pripojenie do Party** - Pripojiť sa do existujúcej party pomocou kódu
✅ **Chat** - Komunikácia s ostatnými hráčmi v party
✅ **Hráčov List** - Vidieť všetkých hráčov v party
✅ **Invite Kód** - Ľahko sa kopírujúci invite kód na zdieľanie
✅ **Spúštenie Kvízu** - Host môže spustiť kvíz pre všetkých
✅ **Real-time Sync** - Automatické aktualizovanie dát

## Inštalácia

1. Otvor Chrome a prejdi na `chrome://extensions/`
2. Aktivuj "Developer mode" (vpravo hore)
3. Klikni na "Load unpacked"
4. Vyber priečinok `e:\A-Z kviz`
5. Extension je inštalovaná!

## Ako Používať

### Vytvorenie Party
1. Klikni na extension ikonu
2. Vyber "Vytvoriť novú party"
3. Zadaj názov party
4. Klikni "Vygenerovať kód"
5. Klikni "Potvrdiť"
6. Zdieľaj invite kód s ostatnými

### Pripojenie do Party
1. Klikni na extension ikonu
2. Vyber "Pripojiť sa do party"
3. Zadaj svoje meno
4. Zadaj invite kód (ktorý ti poslal host)
5. Klikni "Pripojiť sa"

### Chat
- Napíš správu do inputu
- Klikni "Odoslať" alebo stlač Enter
- Vidíš všetky správy ostatných hráčov

### Spúštenie Kvízu
- Len host môže kliknúť "Spustiť Kvíz"
- Otvorí sa A-Z Kvíz s party panelom na pravej strane
- Všetci hráči budú môcť vidieť odpovede v party chate

## Technológie

- **Manifest V3** - Najnovší Chrome extension standard
- **Chrome Storage API** - Ukladanie dát
- **Chrome Runtime API** - Komunikácia medzi skriptami
- **Vanilla JavaScript** - Bez externých závislostí

## Súborová Štruktúra

```
e:\A-Z kviz\
├── manifest.json      # Konfigúrácia extension
├── popup.html        # UI popup
├── popup.css         # Štýly popup
├── popup.js          # Logika popup
├── background.js     # Service worker (party management)
├── content.js        # Injekcia do stránky
└── README.md         # Tento súbor
```

## Poznámky

- Party dáta sa ukladajú lokálne v prehliadači
- Invite kódy sú náhodne generované
- Maximum 20 hráčov na party
- Chat je real-time synchronizovaný každé 2 sekundy

## Budúce Funkčnosti

- 🔄 Backend synchronizácia (Firebase/Node.js)
- 🎯 Scoreboardy a štatistiky
- 📊 Grafika výsledkov
- 🔔 Notifikácie novej správy
- 🎤 Voice chat
- 📱 Mobile aplikácia
