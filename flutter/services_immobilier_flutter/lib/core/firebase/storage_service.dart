// ============================================================
// DARLINK — SERVICE FIREBASE STORAGE & VALIDATION IMAGES (Flutter)
// Validation format & taille, upload autorisé vers Firebase Storage REST API,
// métadonnées d'attribution et suppression sécurisée.
// ============================================================

import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'firebase_config.dart';
import 'firestore_client.dart';

class StorageService {
  static final StorageService instance = StorageService._internal();
  StorageService._internal();

  static const int maxPropertyImageBytes = 5 * 1024 * 1024;
  static const int maxAvatarBytes = 2 * 1024 * 1024;
  static const Set<String> allowedMimeTypes = {
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  };

  static String? validateImage({
    required String mimeType,
    int? sizeBytes,
    bool isAvatar = false,
  }) {
    final norm = mimeType.toLowerCase().trim();
    if (!allowedMimeTypes.contains(norm)) {
      return 'Format non autorisé. Utilisez JPEG, PNG ou WebP.';
    }
    final maxBytes = isAvatar ? maxAvatarBytes : maxPropertyImageBytes;
    if (sizeBytes != null && sizeBytes > maxBytes) {
      return 'Fichier trop volumineux (max ${maxBytes ~/ (1024 * 1024)} Mo).';
    }
    return null;
  }

  static bool isValidImageUrl(String? url) {
    if (url == null || url.trim().isEmpty) return false;
    return url.trim().toLowerCase().startsWith('https://');
  }

  Future<Map<String, String>> uploadImage({
    required String idToken,
    required String userId,
    String propertyId = 'draft',
    required String fileName,
    required String mimeType,
    required Uint8List bytes,
    bool isAvatar = false,
    String? attribution,
  }) async {
    final err = validateImage(mimeType: mimeType, sizeBytes: bytes.lengthInBytes, isAvatar: isAvatar);
    if (err != null) {
      throw Exception(err);
    }

    final cleanName = fileName.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
    final ts = DateTime.now().millisecondsSinceEpoch;
    final storagePath = isAvatar
        ? 'avatars/$userId/${ts}_$cleanName'
        : 'properties/$userId/$propertyId/${ts}_$cleanName';

    final bucket = FirebaseConfig.storageBucket;
    final url = Uri.parse(
      'https://firebasestorage.googleapis.com/v0/b/$bucket/o?uploadType=media&name=${Uri.encodeQueryComponent(storagePath)}',
    );

    final res = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $idToken',
        'Content-Type': mimeType,
      },
      body: bytes,
    );

    if (res.statusCode != 200) {
      throw Exception('Échec upload Firebase Storage (${res.statusCode})');
    }

    final meta = json.decode(res.body) as Map<String, dynamic>;
    final tokenRaw = (meta['downloadTokens'] as String?) ?? '';
    final downloadToken = tokenRaw.isNotEmpty ? tokenRaw.split(',').first : '';
    final downloadUrl =
        'https://firebasestorage.googleapis.com/v0/b/$bucket/o/${Uri.encodeComponent(storagePath)}?alt=media${downloadToken.isNotEmpty ? '&token=$downloadToken' : ''}';

    final finalAttr = attribution ?? 'Photo fournie par le propriétaire ($userId)';
    await FirestoreClient.instance.setDocument('property_images', '$ts', {
      'uploaderUid': userId,
      'propertyId': propertyId,
      'storagePath': storagePath,
      'downloadUrl': downloadUrl,
      'mimeType': mimeType,
      'sizeBytes': bytes.lengthInBytes,
      'attribution': finalAttr,
      'permissionStatus': 'OWNER_UPLOADED',
      'createdAt': DateTime.now().toIso8601String(),
    });

    return {
      'downloadUrl': downloadUrl,
      'storagePath': storagePath,
      'attribution': finalAttr,
    };
  }

  Future<bool> deleteObject(String idToken, String storagePath) async {
    final bucket = FirebaseConfig.storageBucket;
    final url = Uri.parse(
      'https://firebasestorage.googleapis.com/v0/b/$bucket/o/${Uri.encodeComponent(storagePath)}',
    );
    try {
      final res = await http.delete(url, headers: {'Authorization': 'Bearer $idToken'});
      return res.statusCode == 200 || res.statusCode == 204;
    } catch (_) {
      return false;
    }
  }
}

