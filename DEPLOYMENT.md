# 🚀 DigitalOcean App Platform - Rýchly Setup

## Krok 1: Vytvor MySQL databázu (5 minút)

1. **Prihlás sa do DigitalOcean**: https://cloud.digitalocean.com
2. **Databases** → **Create Database Cluster**
3. Vyber:
   - **Database Engine**: MySQL 8
   - **Plan**: Basic ($15/mesiac)
   - **Datacenter**: Frankfurt (najbližšie k SK)
4. **Create Database Cluster** → počkaj 3-5 minút

5. **Vytvor databázu**:
   - V databáze klikni **Users & Databases**
   - **Add new database**: `az_kviz_party`
   - Klikni **Save**

6. **Naimportuj SQL schému**:
   - **Connection Details** → skopíruj údaje
   - Použij MySQL klient alebo DBeaver:
     ```bash
     mysql -h your-db-xxxxx.db.ondigitalocean.com -P 25060 -u doadmin -p az_kviz_party < database.sql
     ```
   - Alebo cez phpMyAdmin/Adminer

## Krok 2: Deploy Backend (10 minút)

### A) Cez GitHub (odporúčané)

1. **Vytvor GitHub repo**:
   ```bash
   cd "e:\A-Z kviz\backend"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   ```

2. **Vytvor nové repo na GitHub.com**
   - Choď na https://github.com/new
   - Názov: `az-kviz-backend`
   - Klikni **Create repository**

3. **Push kód**:
   ```bash
   git remote add origin https://github.com/TVOJ-USERNAME/az-kviz-backend.git
   git push -u origin main
   ```

4. **Deploy na DigitalOcean**:
   - **App Platform** → **Create App**
   - **GitHub** → autorizuj a vyber `az-kviz-backend`
   - **Branch**: `main`
   - **Build Command**: nechaj prázdne
   - **Run Command**: `npm start`
   - **HTTP Port**: `8080`

5. **Environment Variables** (DÔLEŽITÉ!):
   Klikni **Edit** vedľa Environment Variables a pridaj:
   
   ```
   DB_HOST = tvoja-databaza-xxxxx.db.ondigitalocean.com
   DB_PORT = 25060
   DB_USER = doadmin
   DB_PASSWORD = [skopíruj z Connection Details]
   DB_NAME = az_kviz_party
   PORT = 8080
   NODE_ENV = production
   CORS_ORIGIN = *
   ```

6. **Create Resources** → počkaj 5-10 minút

7. **Dostaneš URL**: `https://az-kviz-backend-xxxxx.ondigitalocean.app`

## Krok 3: Uprav Extension (2 minúty)

1. Otvor `e:\A-Z kviz\api.js`

2. Zmeň riadok 3:
   ```javascript
   BASE_URL: 'https://az-kviz-backend-xxxxx.ondigitalocean.app',
   ```

3. **Otestuj backend**:
   - Otvor v prehliadači: `https://az-kviz-backend-xxxxx.ondigitalocean.app/`
   - Malo by sa zobraziť: `{"status":"OK",...}`

## Krok 4: Načítaj Extension do Chrome (2 minúty)

1. Chrome → `chrome://extensions/`
2. Zapni **Developer mode** (vpravo hore)
3. **Load unpacked** → vyber `e:\A-Z kviz`
4. Extension je nainštalovaná! 🎉

## Test Party Systému

1. **Vytvor party**:
   - Klikni na extension ikonu
   - "Vytvoriť novú party"
   - Zadaj názov, vygeneruj kód
   - Potvrď

2. **Pripoj sa z iného prehliadača**:
   - Otvor Chrome v inkognito režime
   - Nainštaluj extension tam tiež
   - "Pripojiť sa do party"
   - Zadaj ten istý kód

3. **Testuj chat**:
   - Napíš správu v jednom prehliadači
   - Mala by sa objaviť v druhom real-time! ⚡

## 💰 Náklady

- **MySQL**: $15/mesiac
- **App Platform**: $5/mesiac (Basic)
- **Spolu**: $20/mesiac

## 🆘 Problémy?

### Backend sa nespustí
- Skontroluj logy: App Platform → tvoja app → **Runtime Logs**
- Skontroluj Environment Variables

### Databáza sa nepripojí
- Skontroluj Connection Details
- Over či SSL je povolené
- Skúsi ping databázu z App Platform

### CORS Error v extension
- V `api.js` over správnu URL
- V backend Environment Variables over `CORS_ORIGIN`

## 🎯 Ďalšie kroky

- Zabezpeč backend (autentifikácia)
- Pridaj rate limiting
- Monitoring a logy
- Automatické zálohy databázy
