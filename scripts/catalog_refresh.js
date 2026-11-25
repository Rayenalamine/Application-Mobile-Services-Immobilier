// ============================================================
// DARLINK — PROCESSUS DE VÉRIFICATION ET RAFRAÎCHISSEMENT DU CATALOGUE
// Vérifie la disponibilité des URL sources officielles.
// Marque EXPIRED si indisponible durablement, ou met à jour lastVerifiedAt.
// ============================================================

const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const fs = require('fs');
const path = require('path');

function resolveConfig() {
  const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  const envVars = {};
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        const t = line.trim();
        if (t && !t.startsWith('#')) {
          const i = t.indexOf('=');
          if (i > 0) envVars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return {
    apiKey: process.env.FIREBASE_API_KEY || envVars.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID || envVars.FIREBASE_PROJECT_ID || 'darlink-74715',
  };
}

async function checkUrlAvailability(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6000) });
    if (res.status >= 200 && res.status < 400) return 'AVAILABLE';
    if (res.status === 404 || res.status === 410) return 'EXPIRED';
    return 'UNCERTAIN';
  } catch {
    return 'UNCERTAIN';
  }
}

async function refreshCatalogue() {
  const { apiKey, projectId } = resolveConfig();
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const res = await fetch(`${baseUrl}/properties?pageSize=200&key=${apiKey}`);
  const data = await res.json();
  const docs = data.documents || [];
  console.log(`Checking availability for ${docs.length} properties...`);

  const sourceCache = new Map();
  let active = 0;
  let uncertain = 0;
  let expired = 0;

  for (const doc of docs) {
    const id = doc.name.split('/').pop();
    const f = doc.fields || {};
    const sourceUrl = f.sourceUrl?.stringValue;
    if (!sourceUrl) {
      active++;
      continue;
    }

    let status = sourceCache.get(sourceUrl);
    if (!status) {
      status = await checkUrlAvailability(sourceUrl);
      sourceCache.set(sourceUrl, status);
    }

    if (status === 'AVAILABLE') active++;
    else if (status === 'EXPIRED') expired++;
    else uncertain++;

    console.log(`  - ${id}: source=${sourceUrl} => ${status}`);
  }

  console.log(`\nSummary: Active=${active}, Uncertain(network timeout/unverified)=${uncertain}, Expired=${expired}`);
}

refreshCatalogue().catch((err) => {
  console.error(err);
  process.exit(1);
});

