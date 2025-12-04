// Content script - hľadá invite link na stránke

console.log('✅ Extension spustená na:', window.location.href);

// Funkcia na detekciu invite linku
function detectInviteLink() {
  // Hľadaj input s id="copy"
  const input = document.getElementById('copy');
  
  if (input && input.value) {
    const link = input.value.trim();
    console.log('🔗 Nájdený link:', link);
    
    // Ulož do storage
    chrome.storage.local.set({ detectedPartyCode: extractCode(link) });
  }
}

// Extrahuj party code z linku
function extractCode(text) {
  // Ak je to URL s #qu parametrom
  if (text.includes('#qu')) {
    const parts = text.split('#qu');
    if (parts[1]) return parts[1].toUpperCase();
  }
  
  // Ak je to len samotný kód
  if (/^[A-Z0-9\-]{6,20}$/.test(text.trim())) {
    return text.trim().toUpperCase();
  }
  
  return null;
}

// Sleduj zmeny na input poli
const input = document.getElementById('copy');
if (input) {
  input.addEventListener('input', detectInviteLink);
  input.addEventListener('paste', () => setTimeout(detectInviteLink, 100));
}

// Skontroluj hneď pri načítaní
detectInviteLink();

// Sleduj DOM zmeny
const observer = new MutationObserver(detectInviteLink);
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

// Fallback - skontroluj každé 3 sekundy
setInterval(detectInviteLink, 3000);
