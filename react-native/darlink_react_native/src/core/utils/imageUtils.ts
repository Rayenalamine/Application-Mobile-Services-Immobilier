// ============================================================
// DARLINK — UTILITAIRE DE RÉSOLUTION D'IMAGES (React Native)
// Résout les assets locaux (assets/annonces/...) et les URLs distantes
// ============================================================

const LOCAL_ANNONCES: Record<string, any> = {
  'assets/annonces/villa_sidi_bou_said.png': require('../../../assets/annonces/villa_sidi_bou_said.png'),
  'assets/annonces/appartement_la_marsa.png': require('../../../assets/annonces/appartement_la_marsa.png'),
  'assets/annonces/penthouse_lac2.png': require('../../../assets/annonces/penthouse_lac2.png'),
  'assets/annonces/villa_hammamet.png': require('../../../assets/annonces/villa_hammamet.png'),
  'assets/annonces/appartement_sousse.png': require('../../../assets/annonces/appartement_sousse.png'),
  'assets/annonces/maison_djerba.png': require('../../../assets/annonces/maison_djerba.png'),
};

export function resolveImageSource(imageUrl?: string | null): any {
  if (!imageUrl || imageUrl.trim().length === 0) return null;
  const clean = imageUrl.trim();
  if (LOCAL_ANNONCES[clean]) {
    return LOCAL_ANNONCES[clean];
  }
  return { uri: clean };
}
