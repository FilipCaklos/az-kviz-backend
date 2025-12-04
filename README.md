# A-Z Kvíz Party Extension

Jednoduchá Chrome extension pre party mode na A-Z kvíze s chatom.

## Inštalácia

1. Otvori `chrome://extensions/`
2. Zapni "Developer mode" (pravý horný roh)
3. Klikni "Load unpacked"
4. Vybri zložku `e:\A-Z kviz`

## Ako používať

### Vytvorenie party
1. Klikni extension ikonu
2. Klikni "Vytvoriť party"
3. Zadaj názov party a tvoje meno
4. Klikni "Vytvoriť"
5. **Zdieľaj kód** s ostatnými hráčmi

### Pripojenie sa
1. Klikni extension ikonu
2. Klikni "Pripojiť sa"
3. Zadaj party kód a tvoje meno
4. Klikni "Pripojiť sa"

### Chat
- Napíš správu v pole
- Klikni "Odoslať" alebo Enter
- Všetci v party vidia správy v reálnom čase

## Auto-detekcia

Keď si na stránke https://decko.ceskatelevize.cz/az-kviz-junior/:
1. Klikni "Copy" tlačidlo
2. Extension automaticky detekuje kód
3. V popup budú automat. vyplnený kód

## Debug

Otvori Chrome DevTools (F12) a pozri "Console" aby videl:
- `[CREATE PARTY]` - vytvorenie party
- `[JOIN PARTY]` - pripojenie sa
- `[SEND MESSAGE]` - odoslanie správy
- `[API GET/SET]` - Firebase API volania

## Súbory

- `manifest.json` - Konfigurácia extension
- `popup.html` - UI
- `popup.js` - Logika popup
- `firebase.js` - Firebase REST API helper
- `content.js` - Auto-detekcia invite linku

## Firebase

Databáza: `a-z-kviz-party`
REST API URL: `https://a-z-kviz-party-default-rtdb.europe-west1.firebasedatabase.app`

Pravidlá sú otvorené (beta):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
