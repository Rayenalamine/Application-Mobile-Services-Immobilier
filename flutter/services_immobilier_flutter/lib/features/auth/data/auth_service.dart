// ============================================================
// DARLINK — SERVICE D'AUTHENTIFICATION API RÉEL (Flutter V4)
// Connexion, inscription JWT et synchronisation de profil
// ============================================================

import '../../../core/network/api_client.dart';
import '../domain/models/auth_state.dart';

class AuthService {
  static final AuthService instance = AuthService._internal();
  AuthService._internal();

  final ApiClient _api = ApiClient.instance;

  AuthState get state => AuthState.instance;

  Future<String?> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _api.post('/auth/login', {
        'email': email.trim().toLowerCase(),
        'password': password,
      });

      if (res is Map<String, dynamic> && res.containsKey('token')) {
        final token = res['token'] as String;
        final userMap = res['user'] as Map<String, dynamic>? ?? {};
        final user = ClientUser.fromJson(userMap);
        _api.authToken = token;
        AuthState.instance.setSession(user: user, token: token);
        return null; // Succès
      }
      return 'Réponse serveur inattendue.';
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('401') || msg.contains('Identifiants invalides')) {
        return 'Email ou mot de passe incorrect.';
      }
      return 'Erreur de connexion au serveur (${e.toString()})';
    }
  }

  Future<String?> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final res = await _api.post('/auth/register', {
        'fullName': fullName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'phone': phone?.trim(),
      });

      if (res is Map<String, dynamic> && res.containsKey('token')) {
        final token = res['token'] as String;
        final userMap = res['user'] as Map<String, dynamic>? ?? {};
        final user = ClientUser.fromJson(userMap);
        _api.authToken = token;
        AuthState.instance.setSession(user: user, token: token);
        return null; // Succès
      }
      return 'Réponse serveur inattendue.';
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('existe déjà')) {
        return 'Cet email est déjà associé à un compte.';
      }
      return 'Erreur lors de la création du compte (${e.toString()})';
    }
  }

  Future<bool> updateProfile({
    required String fullName,
    String? phone,
  }) async {
    try {
      final res = await _api.put('/users/me', {
        'fullName': fullName.trim(),
        'phone': phone?.trim(),
      });

      if (res is Map<String, dynamic> && res.containsKey('id')) {
        final updated = ClientUser.fromJson(res);
        AuthState.instance.updateUser(updated);
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<String?> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final res = await _api.post('/users/me/change-password', {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });

      if (res is Map<String, dynamic> && res.containsKey('message')) {
        return null; // Succès
      }
      return 'Erreur lors du changement de mot de passe.';
    } catch (e) {
      if (e.toString().contains('incorrect')) {
        return 'Le mot de passe actuel est incorrect.';
      }
      return 'Erreur : ${e.toString()}';
    }
  }

  void logout() {
    _api.authToken = null;
    AuthState.instance.logout();
  }
}
