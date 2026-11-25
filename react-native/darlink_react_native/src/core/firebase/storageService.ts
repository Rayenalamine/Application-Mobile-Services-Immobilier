// ============================================================
// DARLINK — SERVICE FIREBASE STORAGE & VALIDATION IMAGES (React Native)
// Validation format & taille (<= 5 Mo), upload autorisé vers Storage REST API,
// URL signée, suivi d'attribution & suppression sécurisée.
// ============================================================

import { defaultFirebaseConfig } from './firebaseConfig';
import { firestoreEngine } from './firestoreEngine';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_PROPERTY_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadedImageResult {
  downloadUrl: string;
  storagePath: string;
  attribution: string;
  permissionStatus: 'OWNER_UPLOADED';
}

export function validateImageUpload(params: {
  mimeType: string;
  sizeBytes?: number;
  isAvatar?: boolean;
}): ImageValidationResult {
  const normalizedMime = params.mimeType.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    return { valid: false, error: 'Format non autorisé. Utilisez JPEG, PNG ou WebP.' };
  }
  const maxBytes = params.isAvatar ? MAX_AVATAR_BYTES : MAX_PROPERTY_IMAGE_BYTES;
  if (params.sizeBytes !== undefined && params.sizeBytes > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `L’image dépasse la limite autorisée (${maxMb} Mo).` };
  }
  return { valid: true };
}

export function isValidImageUrl(url?: string): boolean {
  if (!url || !url.trim()) return false;
  return /^https:\/\/.+/i.test(url.trim());
}

export async function uploadImageToFirebaseStorage(params: {
  idToken: string;
  userId: string;
  propertyId?: string;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array | ArrayBuffer;
  isAvatar?: boolean;
  attribution?: string;
}): Promise<UploadedImageResult> {
  const byteLength = params.bytes instanceof Uint8Array ? params.bytes.byteLength : params.bytes.byteLength;
  const check = validateImageUpload({
    mimeType: params.mimeType,
    sizeBytes: byteLength,
    isAvatar: params.isAvatar,
  });
  if (!check.valid) {
    throw new Error(check.error || 'Image invalide.');
  }

  const cleanName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = params.isAvatar
    ? `avatars/${params.userId}/${Date.now()}_${cleanName}`
    : `properties/${params.userId}/${params.propertyId || 'draft'}/${Date.now()}_${cleanName}`;

  const bucket = defaultFirebaseConfig.storageBucket;
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(storagePath)}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.idToken}`,
      'Content-Type': params.mimeType,
    },
    body: params.bytes as unknown as BodyInit,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Échec upload Firebase Storage (${res.status}): ${errText}`);
  }

  const meta = await res.json();
  const downloadToken = meta.downloadTokens ? String(meta.downloadTokens).split(',')[0] : '';
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media${downloadToken ? `&token=${downloadToken}` : ''}`;

  const attribution = params.attribution || `Photo fournie par le propriétaire (${params.userId})`;
  await firestoreEngine.setDocument('property_images', `${Date.now()}`, {
    uploaderUid: params.userId,
    propertyId: params.propertyId || 'avatar',
    storagePath,
    downloadUrl,
    mimeType: params.mimeType,
    sizeBytes: byteLength,
    attribution,
    permissionStatus: 'OWNER_UPLOADED',
    createdAt: new Date().toISOString(),
  });

  return {
    downloadUrl,
    storagePath,
    attribution,
    permissionStatus: 'OWNER_UPLOADED',
  };
}

export async function deleteStorageObject(idToken: string, storagePath: string): Promise<boolean> {
  const bucket = defaultFirebaseConfig.storageBucket;
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}`;
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${idToken}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

