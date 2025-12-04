# 🔵 Azure Deployment Guide

## Krok 1: Vytvor Azure účet

1. Choď na https://azure.microsoft.com/free/
2. Klikni **Start free** → prihlás sa Microsoft účtom
3. Dostaneš **$200 credit na 30 dní**

## Krok 2: Vytvor MySQL databázu (5 minút)

1. Prihlás sa do **Azure Portal**: https://portal.azure.com
2. Hľadaj **Azure Database for MySQL flexible servers**
3. Klikni **+ Create**

### Nastavenia:
- **Subscription**: Free Trial
- **Resource group**: Vytvor nový → `az-kviz-rg`
- **Server name**: `az-kviz-mysql` (musí byť unikátny)
- **Region**: West Europe (najbližšie k SK)
- **MySQL version**: 8.0
- **Workload type**: Development (lacnejšie)
- **Compute + Storage**: 
  - **Tier**: Burstable, B1ms (1 vCore, 2 GiB RAM) - **~$13/mesiac**
  - **Storage**: 20 GiB

### Authentication:
- **Admin username**: `azureadmin`
- **Password**: Vytvor silné heslo (ulož si ho!)

### Networking:
- **Connectivity method**: Public access
- ✅ Začiarkni **Allow public access from any Azure service**
- **+ Add current client IP address** (aby si sa mohol pripojiť)

4. **Review + Create** → **Create** (čakaj 5-10 minút)

## Krok 3: Vytvor databázu a tabuľky

1. Po vytvorení choď do tvojho MySQL servera
2. V ľavom menu klikni **Databases**
3. Klikni **+ Add** → Názov: `az_kviz_party` → **Save**

4. **Pripoj sa k databáze**:
   - V ľavom menu: **Connect**
   - Skopíruj **Server name**: `az-kviz-mysql.mysql.database.azure.com`
   
5. **Spusti SQL schému**:
   ```bash
   mysql -h az-kviz-mysql.mysql.database.azure.com -u azureadmin -p az_kviz_party < database.sql
   ```
   Alebo cez **MySQL Workbench** / **Azure Data Studio**

## Krok 4: Deploy Web App (Node.js)

### A) Cez Azure Portal (jednoduchšie)

1. V Azure Portal hľadaj **App Services**
2. Klikni **+ Create** → **Web App**

### Nastavenia:
- **Resource Group**: `az-kviz-rg` (ten istý)
- **Name**: `az-kviz-backend` (musí byť unikátny)
- **Publish**: Code
- **Runtime stack**: Node 20 LTS
- **Operating System**: Linux
- **Region**: West Europe

### App Service Plan:
- **Linux Plan**: Vytvor nový
- **Pricing plan**: 
  - **Basic B1** (~$13/mesiac) - odporúčané
  - alebo **Free F1** (len pre test, bez WebSocket support!)

3. **Review + Create** → **Create**

### B) Deployment zo GitHub

1. Po vytvorení App Service choď do nej
2. V ľavom menu: **Deployment Center**
3. **Source**: GitHub
4. **Authorize** a vyber:
   - **Organization**: FilipCaklos
   - **Repository**: az-kviz-backend
   - **Branch**: main
5. **Save** → Azure automaticky vytvorí GitHub Action

## Krok 5: Environment Variables

1. V App Service choď na **Configuration** (ľavé menu)
2. Klikni **+ New application setting** pre každú premennú:

```
DB_HOST = az-kviz-mysql.mysql.database.azure.com
DB_PORT = 3306
DB_USER = azureadmin
DB_PASSWORD = [tvoje heslo z MySQL]
DB_NAME = az_kviz_party
PORT = 8080
NODE_ENV = production
CORS_ORIGIN = *
WEBSITE_NODE_DEFAULT_VERSION = ~20
```

3. **Save** → **Continue** (app sa reštartuje)

## Krok 6: Otestuj Backend

1. Choď do **Overview** v App Service
2. Skopíruj **Default domain**: `https://az-kviz-backend.azurewebsites.net`
3. Otvor v prehliadači → malo by sa zobraziť: `{"status":"OK",...}`

## Krok 7: Uprav Extension

V súbore `e:\A-Z kviz\api.js` zmeň:

```javascript
BASE_URL: 'https://az-kviz-backend.azurewebsites.net',
```

## 💰 Cena na Azure

### S Free Credit:
- **Prvý mesiac**: $200 credit → **ZADARMO**

### Po uplynutí:
- **MySQL Flexible Server** (B1ms): ~$13/mesiac
- **App Service** (Basic B1): ~$13/mesiac
- **Spolu**: ~$26/mesiac

### Free Tier možnosti:
- **App Service F1**: Zadarmo (ale bez WebSocket!)
- **Azure for Students**: $100/rok ak si študent

## 🔧 Troubleshooting

### MySQL connection failed
```bash
# Over firewall rules v MySQL serveri
# Settings → Networking → Firewall rules
# Pridaj svoje IP alebo 0.0.0.0/0 (všetky - len pre test!)
```

### App Service sa nespustí
```bash
# Pozri logy:
# App Service → Monitoring → Log stream
# Alebo: App Service → Diagnose and solve problems
```

### WebSocket nefunguje
- Over že máš **Basic B1** alebo vyšší plan (Free F1 nepodporuje WebSocket!)

## 🎯 Ďalšie kroky

1. **Custom domain**: Pridaj vlastnú doménu
2. **SSL certifikát**: Automaticky zadarma od Azure
3. **Scaling**: Automatické škálovanie pri vysokej záťaži
4. **Monitoring**: Application Insights pre logy
5. **CI/CD**: GitHub Actions už je nastavený!

## 🆓 Azure for Students

Ak si študent:
- https://azure.microsoft.com/en-us/free/students/
- $100/rok bez kreditnej karty
- Plno free služieb
