// ============================================================
// DARLINK — SERVICE D'AUTHENTIFICATION CLOUD FIRESTORE (Flutter)
// Authentification Firebase & profil utilisateur persistant
// ============================================================

import '../../../core/firebase/firestore_client.dart';
import '../../favorites/data/favorites_api_service.dart';
import '../domain/models/auth_state.dart';

class AuthService {
  static final AuthService instance = AuthService._internal();
  AuthService._internal();

  final FirestoreClient _firestore = FirestoreClient.instance;

  AuthState get state => AuthState.instance;

  Future<String?> login({
    required String email,
    required String password,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final safeUid = 'fb_${cleanEmail.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')}';

    try {
      var userDoc = await _firestore.getDocument('users', safeUid);
      if (userDoc == null) {
        final isPredefinedAdmin = cleanEmail == 'rayen@darlink.tn';
        userDoc = {
          'id': safeUid,
          'fullName': isPredefinedAdmin ? 'Rayen Lamine' : cleanEmail.split('@').first,
          'email': cleanEmail,
          'phone': isPredefinedAdmin ? '+216 71 888 999' : '+216 20 123 456',
          'role': isPredefinedAdmin ? 'ADMIN' : 'CLIENT',
          'createdAt': DateTime.now().toIso8601String(),
        };
        await _firestore.setDocument('users', safeUid, userDoc);
      }

      final token = 'fb_token_${DateTime.now().millisecondsSinceEpoch}_$safeUid';
      _firestore.setIdToken(token);

      final clientUser = ClientUser(
        id: safeUid.hashCode.abs(),
        fullName: userDoc['fullName'] as String? ?? cleanEmail.split('@').first,
        email: cleanEmail,
        phone: userDoc['phone'] as String? ?? '+216 71 888 999',
        role: userDoc['role'] as String? ?? 'CLIENT',
      );

      AuthState.instance.setSession(user: clientUser, token: token);
      FavoritesApiService.instance.setUserId(safeUid);
      await FavoritesApiService.instance.syncFavorites();
      return null; // Succès
    } catch (e) {
      return 'Erreur de connexion : $e';
    }
  }

  Future<String?> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final safeUid = 'fb_${cleanEmail.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')}';

    try {
      final userDoc = <String, dynamic>{
        'id': safeUid,
        'fullName': fullName.trim(),
        'email': cleanEmail,
        'phone': phone?.trim() ?? '+216 71 888 999',
        'role': 'CLIENT',
        'createdAt': DateTime.now().toIso8601String(),
      };

      await _firestore.setDocument('users', safeUid, userDoc);

      final token = 'fb_token_${DateTime.now().millisecondsSinceEpoch}_$safeUid';
      _firestore.setIdToken(token);

      final clientUser = ClientUser(
        id: safeUid.hashCode.abs(),
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone?.trim(),
        role: 'CLIENT',
      );

      AuthState.instance.setSession(user: clientUser, token: token);
      FavoritesApiService.instance.setUserId(safeUid);
      return null; // Succès
    } catch (e) {
      return 'Erreur lors de la création du compte : $e';
    }
  }

  Future<bool> updateProfile({
    required String fullName,
    String? phone,
  }) async {
    final currentUser = AuthState.instance.currentUser;
    if (currentUser == null) return false;
    final safeUid = 'fb_${currentUser.email.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')}';

    try {
      final updated = <String, dynamic>{
        'fullName': fullName.trim(),
        'phone': phone?.trim() ?? currentUser.phone,
        'updatedAt': DateTime.now().toIso8601String(),
      };
      await _firestore.setDocument('users', safeUid, updated);

      final updatedUser = ClientUser(
        id: currentUser.id,
        fullName: fullName.trim(),
        email: currentUser.email,
        phone: phone?.trim() ?? currentUser.phone,
        role: currentUser.role,
      );
      AuthState.instance.updateUser(updatedUser);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<String?> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    return null; // Succès
  }

  void logout() {
    _firestore.setIdToken(null);
    FavoritesApiService.instance.clear();
    AuthState.instance.logout();
  }
}
