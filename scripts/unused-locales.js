const fs = require('fs');
const path = require('path');
const glob = require('glob'); // npm install glob

// Configurazione
const SRC_PATH = './ts/**/*.{js,jsx,ts,tsx}';
const LOCALES_DIR = './locales/it/'; // La cartella dove hai it.json, en.json, etc.

const getFiles = () => glob.sync(SRC_PATH);

const getUsedKeysAndPatterns = (files) => {
  const keys = new Set();
  const dynamicPatterns = new Set();
  
  // Regex 1: Chiavi statiche t('user.profile')
  const staticRegex = /t\(\s*['"`]([^'"`]+)['"`]/g;
  // Regex 2: Chiavi dinamiche con template literals t(`status.${type}`) -> cattura 'status.'
  const dynamicRegex = /t\(\s*[`]([^`$]+)\${/g;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    
    while ((match = staticRegex.exec(content)) !== null) {
      keys.add(match[1]);
    }
    
    while ((match = dynamicRegex.exec(content)) !== null) {
      dynamicPatterns.add(match[1]);
    }
  });
  
  return { keys, dynamicPatterns };
};

// Funzione ricorsiva per estrarre tutte le chiavi da un JSON nidificato
const getAllKeysFromJson = (obj, prefix = '') => {
  return Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) return res;
    if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getAllKeysFromJson(obj[el], prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);
};

const run = () => {
  const files = getFiles();
  const { keys: usedKeys, dynamicPatterns } = getUsedKeysAndPatterns(files);
  const localeFiles = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));

  localeFiles.forEach(file => {
    const filePath = path.join(LOCALES_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const allJsonKeys = getAllKeysFromJson(content);
    
    const unused = allJsonKeys.filter(key => {
      // 1. Verifica se la chiave è usata esattamente
      if (usedKeys.has(key)) return false;
      
      // 2. PUNTO A FAVORE: Verifica se la chiave "inizia con" un pattern dinamico
      // Se nel codice hai t(`errors.${code}`) e nel JSON hai 'errors.404', non è inutilizzata.
      for (let pattern of dynamicPatterns) {
        if (key.startsWith(pattern)) return false;
      }
      
      return true;
    });

    console.log(`\n📊 Report per: ${file}`);
    console.log(`✅ Chiavi totali: ${allJsonKeys.length}`);
    console.log(`❌ Chiavi inutilizzate: ${unused.length}`);
    
    if (unused.length > 0) {
      console.log('--- Elenco Inutilizzate ---');
      unused.forEach(k => console.log(`  ${k}`));
    }
  });
};

run();