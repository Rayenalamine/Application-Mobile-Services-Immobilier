// ============================================================
// DARLINK — SERVICE D'AUTHENTIFICATION FIREBASE AUTH RÉEL (Flutter)
// Identity Toolkit REST API : inscription, connexion JWT,
// vérification email, reset MDP, changement email/MDP, suppression compte
// ============================================================

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/firebase/firebase_config.dart';
import '../../../core/firebase/firestore_client.dart';
import '../../favorites/data/favorites_api_service.dart';
import '../domain/models/auth_state.dart';

class PasswordStrengthResult {
  final int score;
  final String label;
  final bool valid;
  final List<String> issues;

  const PasswordStrengthResult({
    required this.score,
    required this.label,
    required this.valid,
    required this.issues,
  });
}

class AuthService {
  static final AuthService instance = AuthService._internal();
  AuthService._internal();

  final FirestoreClient _firestore = FirestoreClient.instance;

  static const _keyToken = 'darlink_auth_id_token';
  static const _keyRefresh = 'darlink_auth_refresh_token';
  static const _keyUser = 'darlink_auth_user_json';

  AuthState get state => AuthState.instance;

  static PasswordStrengthResult evaluatePasswordStrength(String password) {
    final issues = <String>[];
    int score = 0;
    if (password.length >= 8) {
      score++;
    } else {
      issues.add('Au moins 8 caractères');
    }
    if (RegExp(r'[A-Z]').hasMatch(password)) {
      score++;
    } else {
      issues.add('Une lettre majuscule');
    }
    if (RegExp(r'[0-9]').hasMatch(password)) {
      score++;
    } else {
      issues.add('Un chiffre');
    }
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(password)) {
      score++;
    } else {
      issues.add('Un caractère spécial');
    }

    const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
    return PasswordStrengthResult(
      score: score,
      label: labels[score],
      valid: password.length >= 8 &&
          RegExp(r'[A-Z]').hasMatch(password) &&
          RegExp(r'[0-9]').hasMatch(password),
      issues: issues,
    );
  }

  String _mapAuthError(String? code) {
    switch (code) {
      case 'EMAIL_EXISTS':
        return 'Cette adresse e-mail est déjà associée à un compte DarLink.';
      case 'EMAIL_NOT_FOUND':
      case 'INVALID_LOGIN_CREDENTIALS':
      case 'INVALID_PASSWORD':
        return 'Adresse e-mail ou mot de passe incorrect.';
      case 'USER_DISABLED':
        return 'Ce compte a été désactivé.';
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        return 'Trop de tentatives. Veuillez patienter avant de réessayer.';
      case 'INVALID_EMAIL':
        return 'Format d’adresse e-mail invalide.';
      case 'WEAK_PASSWORD':
        return 'Mot de passe trop faible (minimum 8 caractères requis).';
      case 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN':
      case 'TOKEN_EXPIRED':
        return 'Session expirée. Veuillez vous reconnecter.';
      default:
        return code != null ? 'Erreur Firebase Auth ($code).' : 'Erreur d’authentification.';
    }
  }

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_keyToken);
      final refresh = prefs.getString(_keyRefresh);
      final userJson = prefs.getString(_keyUser);
      if (token != null && token.isNotEmpty && userJson != null) {
        final map = json.decode(userJson) as Map<String, dynamic>;
        final user = ClientUser.fromJson(map);
        _firestore.setIdToken(token);
        AuthState.instance.setSession(user: user, token: token, refreshToken: refresh);
        FavoritesApiService.instance.setUserId(user.effectiveUid);
        await refreshSessionIfNeeded();
        await FavoritesApiService.instance.syncFavorites();
      }
    } catch (_) {}
  }

  Future<void> _persistSession(ClientUser user, String token, String? refresh) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyToken, token);
      if (refresh != null) await prefs.setString(_keyRefresh, refresh);
      await prefs.setString(
        _keyUser,
        json.encode({
          'id': user.id,
          'uid': user.effectiveUid,
          'fullName': user.fullName,
          'email': user.email,
          'phone': user.phone,
          'role': user.role,
          'emailVerified': user.emailVerified,
          'photoUrl': user.photoUrl,
          'agencyId': user.agencyId,
        }),
      );
    } catch (_) {}
  }

  Future<Map<String, dynamic>?> _lookupAccount(String idToken) async {
    try {
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:lookup?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': idToken}),
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body) as Map<String, dynamic>;
        final users = data['users'] as List<dynamic>?;
        if (users != null && users.isNotEmpty) {
          return users.first as Map<String, dynamic>;
        }
      }
    } catch (_) {}
    return null;
  }

  Future<bool> refreshSessionIfNeeded() async {
    final token = AuthState.instance.token;
    if (token == null || token.isEmpty) return false;
    final info = await _lookupAccount(token);
    if (info != null) {
      final verified = info['emailVerified'] == true;
      final cur = AuthState.instance.currentUser;
      if (cur != null && cur.emailVerified != verified) {
        final updated = cur.copyWith(emailVerified: verified);
        AuthState.instance.updateUser(updated);
        await _persistSession(updated, token, AuthState.instance.refreshToken);
      }
      return true;
    }

    final refresh = AuthState.instance.refreshToken;
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final res = await http.post(
        Uri.parse('https://securetoken.googleapis.com/v1/token?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'grant_type=refresh_token&refresh_token=${Uri.encodeComponent(refresh)}',
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body) as Map<String, dynamic>;
        final newToken = data['id_token'] as String?;
        final newRefresh = data['refresh_token'] as String? ?? refresh;
        final cur = AuthState.instance.currentUser;
        if (newToken != null && cur != null) {
          _firestore.setIdToken(newToken);
          AuthState.instance.setSession(user: cur, token: newToken, refreshToken: newRefresh);
          await _persistSession(cur, newToken, newRefresh);
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  Future<String?> login({
    required String email,
    required String password,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.isEmpty || password.isEmpty) {
      return 'Veuillez renseigner votre adresse e-mail et votre mot de passe.';
    }

    try {
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:signInWithPassword?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': cleanEmail,
          'password': password,
          'returnSecureToken': true,
        }),
      );
      final data = json.decode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        final errCode = (data['error'] as Map<String, dynamic>?)?['message'] as String?;
        return _mapAuthError(errCode);
      }

      final uid = data['localId'] as String;
      final token = data['idToken'] as String;
      final refresh = data['refreshToken'] as String?;
      _firestore.setIdToken(token);

      final info = await _lookupAccount(token);
      final emailVerified = info?['emailVerified'] == true;

      var userDoc = await _firestore.getDocument('users', uid);
      if (userDoc == null) {
        userDoc = {
          'id': uid,
          'fullName': (info?['displayName'] as String?) ?? cleanEmail.split('@').first,
          'email': cleanEmail,
          'phone': '',
          'role': 'USER',
          'emailVerified': emailVerified,
          'accountStatus': 'ACTIVE',
          'createdAt': DateTime.now().toIso8601String(),
        };
        await _firestore.setDocument('users', uid, userDoc);
      } else if (userDoc['emailVerified'] != emailVerified) {
        await _firestore.patchFields('users', uid, {'emailVerified': emailVerified});
      }

      final clientUser = ClientUser(
        id: uid.hashCode.abs(),
        uid: uid,
        fullName: (userDoc['fullName'] as String?) ?? cleanEmail.split('@').first,
        email: cleanEmail,
        phone: userDoc['phone'] as String?,
        role: ClientUser.normalizeRole(userDoc['role'] as String?),
        emailVerified: emailVerified,
        photoUrl: userDoc['photoUrl'] as String?,
        agencyId: userDoc['agencyId'] as String?,
      );

      AuthState.instance.setSession(user: clientUser, token: token, refreshToken: refresh);
      await _persistSession(clientUser, token, refresh);
      FavoritesApiService.instance.setUserId(uid);
      await FavoritesApiService.instance.syncFavorites();
      return null;
    } catch (e) {
      return 'Impossible de se connecter à Firebase Authentication.';
    }
  }

  Future<String?> register({
    required String fullName,
    required String email,
    required String password,
    String? confirmPassword,
    String? phone,
    String requestedRole = 'USER',
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanName = fullName.trim();
    if (cleanName.length < 2) {
      return 'Veuillez saisir votre nom complet.';
    }
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(cleanEmail)) {
      return 'Format d’adresse e-mail invalide.';
    }
    final strength = evaluatePasswordStrength(password);
    if (!strength.valid) {
      return 'Mot de passe insuffisant : ${strength.issues.join(', ')}.';
    }
    if (confirmPassword != null && password != confirmPassword) {
      return 'La confirmation du mot de passe ne correspond pas.';
    }

    // Jamais d'auto-élévation ADMIN depuis le client
    final upper = requestedRole.toUpperCase();
    final safeRole = (upper == 'OWNER' || upper == 'AGENCY') ? upper : 'USER';

    try {
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:signUp?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': cleanEmail,
          'password': password,
          'returnSecureToken': true,
        }),
      );
      final data = json.decode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        final errCode = (data['error'] as Map<String, dynamic>?)?['message'] as String?;
        return _mapAuthError(errCode);
      }

      final uid = data['localId'] as String;
      final token = data['idToken'] as String;
      final refresh = data['refreshToken'] as String?;
      _firestore.setIdToken(token);

      await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:update?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': token, 'displayName': cleanName}),
      ).catchError((_) => http.Response('', 500));

      final userDoc = <String, dynamic>{
        'id': uid,
        'fullName': cleanName,
        'email': cleanEmail,
        'phone': phone?.trim() ?? '',
        'role': safeRole,
        'emailVerified': false,
        'accountStatus': 'ACTIVE',
        'createdAt': DateTime.now().toIso8601String(),
      };
      await _firestore.setDocument('users', uid, userDoc);

      final clientUser = ClientUser(
        id: uid.hashCode.abs(),
        uid: uid,
        fullName: cleanName,
        email: cleanEmail,
        phone: phone?.trim(),
        role: safeRole,
        emailVerified: false,
      );

      AuthState.instance.setSession(user: clientUser, token: token, refreshToken: refresh);
      await _persistSession(clientUser, token, refresh);
      FavoritesApiService.instance.setUserId(uid);

      await resendVerificationEmail();
      return null;
    } catch (_) {
      return 'Erreur réseau lors de la création du compte Firebase.';
    }
  }

  Future<bool> resendVerificationEmail() async {
    final token = AuthState.instance.token;
    if (token == null || token.isEmpty) return false;
    try {
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:sendOobCode?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'requestType': 'VERIFY_EMAIL', 'idToken': token}),
      );
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> refreshVerificationStatus() async {
    final token = AuthState.instance.token;
    final cur = AuthState.instance.currentUser;
    if (token == null || cur == null) return false;
    final info = await _lookupAccount(token);
    if (info == null) return false;
    final verified = info['emailVerified'] == true;
    final updated = cur.copyWith(emailVerified: verified);
    AuthState.instance.updateUser(updated);
    await _firestore.patchFields('users', cur.effectiveUid, {'emailVerified': verified});
    await _persistSession(updated, token, AuthState.instance.refreshToken);
    return verified;
  }

  Future<String?> sendPasswordResetEmail(String email) async {
    final cleanEmail = email.trim().toLowerCase();
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(cleanEmail)) {
      return 'Veuillez saisir une adresse e-mail valide.';
    }
    try {
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:sendOobCode?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'requestType': 'PASSWORD_RESET', 'email': cleanEmail}),
      );
      if (res.statusCode != 200) {
        final data = json.decode(res.body) as Map<String, dynamic>;
        final errCode = (data['error'] as Map<String, dynamic>?)?['message'] as String?;
        return _mapAuthError(errCode);
      }
      return null;
    } catch (_) {
      return 'Impossible d’envoyer l’e-mail de réinitialisation.';
    }
  }

  Future<String?> _reauthenticate(String currentPassword) async {
    final cur = AuthState.instance.currentUser;
    if (cur == null) return 'Utilisateur non connecté.';
    final res = await http.post(
      Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:signInWithPassword?key=${FirebaseConfig.apiKey}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': cur.email,
        'password': currentPassword,
        'returnSecureToken': true,
      }),
    );
    final data = json.decode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200) {
      final errCode = (data['error'] as Map<String, dynamic>?)?['message'] as String?;
      return _mapAuthError(errCode);
    }
    final newToken = data['idToken'] as String;
    final newRefresh = data['refreshToken'] as String?;
    _firestore.setIdToken(newToken);
    AuthState.instance.setSession(user: cur, token: newToken, refreshToken: newRefresh);
    return null;
  }

  Future<bool> updateProfile({
    required String fullName,
    String? phone,
    String? photoUrl,
    String? role,
  }) async {
    final currentUser = AuthState.instance.currentUser;
    final token = AuthState.instance.token;
    if (currentUser == null || token == null) return false;
    final uid = currentUser.effectiveUid;
    final upperRole = role?.toUpperCase();
    final safeRole = (upperRole == 'USER' || upperRole == 'OWNER' || upperRole == 'AGENCY')
        ? upperRole!
        : currentUser.role;

    try {
      await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:update?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'idToken': token,
          'displayName': fullName.trim(),
          if (photoUrl != null) 'photoUrl': photoUrl,
        }),
      ).catchError((_) => http.Response('', 500));

      final patch = <String, dynamic>{
        'fullName': fullName.trim(),
        'phone': phone?.trim() ?? currentUser.phone ?? '',
        'role': safeRole,
        if (photoUrl != null) 'photoUrl': photoUrl,
        'updatedAt': DateTime.now().toIso8601String(),
      };
      final ok = await _firestore.patchFields('users', uid, patch);
      if (!ok) return false;

      final updatedUser = currentUser.copyWith(
        fullName: fullName.trim(),
        phone: phone?.trim() ?? currentUser.phone,
        photoUrl: photoUrl ?? currentUser.photoUrl,
        role: safeRole,
      );
      AuthState.instance.updateUser(updatedUser);
      await _persistSession(updatedUser, token, AuthState.instance.refreshToken);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<String?> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final strength = evaluatePasswordStrength(newPassword);
    if (!strength.valid) {
      return 'Nouveau mot de passe insuffisant : ${strength.issues.join(', ')}.';
    }
    final reauthErr = await _reauthenticate(currentPassword);
    if (reauthErr != null) return reauthErr;

    final token = AuthState.instance.token!;
    try {
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:update?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': token, 'password': newPassword, 'returnSecureToken': true}),
      );
      final data = json.decode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        final errCode = (data['error'] as Map<String, dynamic>?)?['message'] as String?;
        return _mapAuthError(errCode);
      }
      final newToken = data['idToken'] as String?;
      final cur = AuthState.instance.currentUser;
      if (newToken != null && cur != null) {
        _firestore.setIdToken(newToken);
        AuthState.instance.setSession(user: cur, token: newToken, refreshToken: data['refreshToken'] as String?);
        await _persistSession(cur, newToken, AuthState.instance.refreshToken);
      }
      return null;
    } catch (_) {
      return 'Erreur lors de la modification du mot de passe.';
    }
  }

  Future<String?> changeEmail({
    required String currentPassword,
    required String newEmail,
  }) async {
    final cleanEmail = newEmail.trim().toLowerCase();
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(cleanEmail)) {
      return 'Format d’adresse e-mail invalide.';
    }
    final reauthErr = await _reauthenticate(currentPassword);
    if (reauthErr != null) return reauthErr;

    final token = AuthState.instance.token!;
    final cur = AuthState.instance.currentUser!;
    try {
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:update?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': token, 'email': cleanEmail, 'returnSecureToken': true}),
      );
      final data = json.decode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        final errCode = (data['error'] as Map<String, dynamic>?)?['message'] as String?;
        return _mapAuthError(errCode);
      }
      final newToken = (data['idToken'] as String?) ?? token;
      final updatedUser = cur.copyWith(email: cleanEmail, emailVerified: false);
      _firestore.setIdToken(newToken);
      AuthState.instance.setSession(user: updatedUser, token: newToken, refreshToken: data['refreshToken'] as String?);
      await _firestore.patchFields('users', cur.effectiveUid, {
        'email': cleanEmail,
        'emailVerified': false,
        'updatedAt': DateTime.now().toIso8601String(),
      });
      await resendVerificationEmail();
      await _persistSession(updatedUser, newToken, AuthState.instance.refreshToken);
      return null;
    } catch (_) {
      return 'Erreur lors du changement d’adresse e-mail.';
    }
  }

  Future<String?> deleteAccount({required String currentPassword}) async {
    final cur = AuthState.instance.currentUser;
    if (cur == null) return 'Utilisateur non connecté.';
    final uid = cur.effectiveUid;

    final reauthErr = await _reauthenticate(currentPassword);
    if (reauthErr != null) return reauthErr;

    final token = AuthState.instance.token!;
    try {
      // 1. Archiver et anonymiser les annonces du compte supprimé
      final ownListings = await _firestore.runStructuredQuery(
        collectionId: 'properties',
        whereFilters: [
          {
            'field': {'fieldPath': 'ownerId'},
            'op': 'EQUAL',
            'value': {'stringValue': uid},
          }
        ],
        limit: 100,
      );
      for (final p in ownListings) {
        await _firestore.patchFields('properties', p['id'].toString(), {
          'listingStatus': 'ARCHIVED',
          'agentName': 'Compte supprimé',
          'agentPhone': '',
          'updatedAt': DateTime.now().toIso8601String(),
        });
      }

      // 2. Supprimer les favoris
      final favs = await _firestore.getCollection('users/$uid/favorites', pageSize: 100);
      for (final f in favs) {
        await _firestore.deleteDocument('users/$uid/favorites', f['id'].toString());
      }

      // 3. Supprimer le document utilisateur
      await _firestore.deleteDocument('users', uid);

      // 4. Supprimer le compte Firebase Authentication
      final res = await http.post(
        Uri.parse('${FirebaseConfig.authBaseUrl}/accounts:delete?key=${FirebaseConfig.apiKey}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': token}),
      );
      if (res.statusCode != 200) {
        final data = json.decode(res.body) as Map<String, dynamic>;
        final errCode = (data['error'] as Map<String, dynamic>?)?['message'] as String?;
        return _mapAuthError(errCode);
      }

      await logout();
      return null;
    } catch (_) {
      return 'Erreur lors de la suppression du compte.';
    }
  }

  Map<String, String> getDiagnosticInfo() {
    final cur = AuthState.instance.currentUser;
    final uid = cur?.effectiveUid;
    final displayUid = (uid != null && uid.length >= 6) ? '${uid.substring(0, 6)}...' : (uid ?? 'Guest (Unauthenticated)');
    return {
      'projectId': FirebaseConfig.projectId,
      'platform': 'Flutter ${defaultTargetPlatform.name}',
      'authUid': displayUid,
      'databaseId': '(default)',
    };
  }

  Future<void> logout() async {
    _firestore.setIdToken(null);
    FavoritesApiService.instance.clear();
    AuthState.instance.logout();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_keyToken);
      await prefs.remove(_keyRefresh);
      await prefs.remove(_keyUser);
    } catch (_) {}
  }
}
