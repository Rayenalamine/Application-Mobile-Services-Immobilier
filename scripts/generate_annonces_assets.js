// ============================================================
// DARLINK — GÉNÉRATEUR D'ASSETS IMAGES POUR LES 6 ANNONCES LOCALES
// Génère des fichiers PNG valides haute résolution (600x400)
// sans dépendance externe (zlib natif Node.js).
// ============================================================

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, baseColor, accentColor, title) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return crc ^ -1;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 2; // Color type 2: Truecolor RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const stride = 1 + width * 3;
  const raw = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    raw[rowOffset] = 0; // Filter none
    const ny = y / height;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const px = rowOffset + 1 + x * 3;

      // Dégradé architectural diagonal avec effet de vignettage et carte luxe
      const diag = (nx * 0.7 + ny * 0.3);
      const vignette = 1 - 0.25 * ((nx - 0.5) ** 2 + (ny - 0.5) ** 2);

      let r = baseColor[0] * (1 - diag) + accentColor[0] * diag;
      let g = baseColor[1] * (1 - diag) + accentColor[1] * diag;
      let b = baseColor[2] * (1 - diag) + accentColor[2] * diag;

      // Liseré architectural élégant (cadre intérieur fin)
      const borderDist = Math.min(x, y, width - 1 - x, height - 1 - y);
      if (borderDist === 16 || borderDist === 17) {
        r = Math.min(255, r * 1.35);
        g = Math.min(255, g * 1.35);
        b = Math.min(255, b * 1.35);
      } else if (borderDist < 16) {
        r *= 0.85;
        g *= 0.85;
        b *= 0.85;
      }

      // Motif de texture légère (bandes horizontales architecturales modernes)
      if (y > height * 0.55 && y % 14 < 2) {
        r = Math.min(255, r * 1.08);
        g = Math.min(255, g * 1.08);
        b = Math.min(255, b * 1.08);
      }

      raw[px] = Math.max(0, Math.min(255, Math.floor(r * vignette)));
      raw[px + 1] = Math.max(0, Math.min(255, Math.floor(g * vignette)));
      raw[px + 2] = Math.max(0, Math.min(255, Math.floor(b * vignette)));
    }
  }

  const idat = makeChunk('IDAT', zlib.deflateSync(raw, { level: 9 }));
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

const ANNONCES_CONFIG = [
  {
    fileName: 'villa_sidi_bou_said.png',
    title: 'Villa Sidi Bou Saïd',
    base: [22, 85, 170],      // Bleu Sidi Bou Saïd profond
    accent: [220, 235, 255],   // Blanc azur
  },
  {
    fileName: 'appartement_la_marsa.png',
    title: 'Appartement La Marsa',
    base: [18, 135, 150],     // Turquoise côtier méditerranéen
    accent: [235, 220, 190],   // Sable doré
  },
  {
    fileName: 'penthouse_lac2.png',
    title: 'Penthouse Lac 2',
    base: [165, 135, 85],     // Champagne luxe
    accent: [240, 235, 220],   // Platine perle
  },
  {
    fileName: 'villa_hammamet.png',
    title: 'Villa Hammamet',
    base: [195, 90, 40],      // Terre cuite et coucher de soleil
    accent: [245, 190, 110],   // Ocre doré
  },
  {
    fileName: 'appartement_sousse.png',
    title: 'Appartement Sousse',
    base: [38, 105, 175],     // Bleu saphir marina
    accent: [190, 215, 240],   // Brume d'argent
  },
  {
    fileName: 'maison_djerba.png',
    title: 'Maison Djerba',
    base: [185, 145, 68],     // Sable djerbien et chaux
    accent: [250, 245, 230],   // Blanc éclatant
  },
];

const TARGET_DIRS = [
  path.resolve(__dirname, '../react-native/darlink_react_native/assets/annonces'),
  path.resolve(__dirname, '../flutter/services_immobilier_flutter/assets/annonces'),
  path.resolve(__dirname, '../assets/annonces'),
];

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Créé: ${dir}`);
  }
}

for (const cfg of ANNONCES_CONFIG) {
  const pngBuf = createPng(600, 400, cfg.base, cfg.accent, cfg.title);
  for (const dir of TARGET_DIRS) {
    const dest = path.join(dir, cfg.fileName);
    fs.writeFileSync(dest, pngBuf);
    console.log(`✅ Fichier généré : ${dest} (${pngBuf.length} octets)`);
  }
}

console.log('✨ Les 6 images d\'annonces ont été générées avec succès dans tous les dossiers assets.');
