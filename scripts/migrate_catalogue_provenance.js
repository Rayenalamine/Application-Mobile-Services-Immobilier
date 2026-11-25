// ============================================================
// DARLINK — CATALOGUE PROVENANCE BACKUP & MIGRATION TOOL
// Supports:
//   --backup           Export all live Firestore properties to JSON backup
//   --dry-run          Identify legacy/placeholder records & missing provenance
//   --apply --confirm  Execute migration (ONLY after explicit user approval)
// ============================================================

const fs = require('fs');
const path = require('path');
const https = require('https');

function resolveConfig() {
  const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../react-native/darlink_react_native/.env'),
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
  const apiKey =
    process.env.FIREBASE_API_KEY ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    envVars.FIREBASE_API_KEY ||
    envVars.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    envVars.FIREBASE_PROJECT_ID ||
    envVars.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    'darlink-74715';
  if (!apiKey) throw new Error('Missing FIREBASE_API_KEY / EXPO_PUBLIC_FIREBASE_API_KEY');
  return { apiKey, projectId };
}

function safeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        family: 4,
        timeout: 20000,
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, body }));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}

function isSuspiciousOrPlaceholder(id, fields) {
  const reasons = [];
  const imageUrl = fields.imageUrl?.stringValue || '';
  const agentPhone = fields.agentPhone?.stringValue || '';
  const ownerId = fields.ownerId?.stringValue || '';
  const agentName = fields.agentName?.stringValue || '';
  const listingCategory = fields.listingCategory?.stringValue || '';

  if (/^(1|2|3|4|5|6|7|8|9|10|11|12|13)$/.test(id)) reasons.push('legacy-numeric-id');
  if (imageUrl.includes('unsplash.com')) reasons.push('stock-unsplash-photo');
  if (agentPhone.includes('71 888 999')) reasons.push('placeholder-phone');
  if (ownerId === 'user_admin_1') reasons.push('placeholder-owner');
  if (agentName === 'Rayen Lamine') reasons.push('placeholder-agent');
  if (!listingCategory) reasons.push('missing-listingCategory');
  if (!fields.sourceType?.stringValue) reasons.push('missing-sourceType');
  if (!fields.verificationStatus?.stringValue) reasons.push('missing-verificationStatus');

  return reasons;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const doBackup = args.has('--backup');
  const doApply = args.has('--apply') && args.has('--confirm');
  const doDryRun = args.has('--dry-run') || (!doBackup && !doApply);

  const { apiKey, projectId } = resolveConfig();
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const res = await safeRequest(`${baseUrl}/properties?pageSize=200&key=${apiKey}`);
  if (!res.ok) throw new Error(`Failed to fetch properties: HTTP ${res.status} ${res.body}`);
  const data = JSON.parse(res.body);
  const docs = data.documents || [];

  if (doBackup) {
    const backupDir = path.resolve(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outFile = path.join(backupDir, `properties_backup_${stamp}.json`);
    fs.writeFileSync(outFile, res.body, 'utf8');
    console.log(`✅ Backup exported (${docs.length} docs): ${outFile}`);
  }

  console.log(`\n=== PROVENANCE AUDIT (${docs.length} live properties) ===`);
  let placeholderCount = 0;
  let needsProvenanceCount = 0;

  for (const doc of docs) {
    const id = doc.name.split('/').pop();
    const f = doc.fields || {};
    const reasons = isSuspiciousOrPlaceholder(id, f);
    const isPlaceholder = reasons.some((r) =>
      ['legacy-numeric-id', 'stock-unsplash-photo', 'placeholder-phone', 'placeholder-owner', 'placeholder-agent'].includes(r)
    );
    if (isPlaceholder) placeholderCount++;
    if (reasons.length > 0) {
      needsProvenanceCount++;
      console.log(`  - [${isPlaceholder ? 'ARCHIVE_PLACEHOLDER' : 'ENRICH_PROVENANCE'}] ${id}: ${reasons.join(', ')}`);
    }
  }

  console.log(`\nSummary: total=${docs.length}, placeholders=${placeholderCount}, needing_migration=${needsProvenanceCount}`);

  if (doDryRun && !doApply) {
    console.log('ℹ️ Dry-run complete. No production documents were modified.');
    console.log('   To apply after explicit approval, run with --apply --confirm.');
    return;
  }

  if (doApply) {
    console.log('⚠️ Apply mode requires admin credentials and explicit approval.');
    // Intentionally guarded: actual live mutation is only executed when explicitly invoked with admin token.
    const adminToken = process.env.FIREBASE_ADMIN_ID_TOKEN;
    if (!adminToken) {
      throw new Error('FIREBASE_ADMIN_ID_TOKEN env var is required for --apply --confirm.');
    }
    for (const doc of docs) {
      const id = doc.name.split('/').pop();
      const f = doc.fields || {};
      const reasons = isSuspiciousOrPlaceholder(id, f);
      if (reasons.length === 0) continue;

      const isInstitutional = id.startsWith('ref_') || Boolean(f.sourceName?.stringValue);
      const patch = isInstitutional
        ? {
            listingCategory: { stringValue: 'DEVELOPMENT_REFERENCE' },
            sourceType: { stringValue: 'INSTITUTIONAL_PORTAL' },
            verificationStatus: { stringValue: 'VERIFIED_INSTITUTIONAL_REFERENCE' },
            availabilityStatus: { stringValue: 'PROGRAMME_REFERENCE_ONLY' },
            currency: { stringValue: 'TND' },
          }
        : {
            listingStatus: { stringValue: 'ARCHIVED' },
            verificationStatus: { stringValue: 'ARCHIVED_PLACEHOLDER' },
          };

      const mask = Object.keys(patch).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
      const patchRes = await safeRequest(`${baseUrl}/properties/${id}?${mask}&key=${apiKey}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ fields: patch }),
      });
      console.log(`  PATCH ${id} -> HTTP ${patchRes.status}`);
    }
  }
}

main().catch((err) => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});

