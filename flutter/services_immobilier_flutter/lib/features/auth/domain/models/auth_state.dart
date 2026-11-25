// ============================================================
// DARLINK — ÉTAT D'AUTHENTIFICATION CLIENT RÉEL (Flutter)
// Gestion de session Firebase Auth JWT, rôle, vérification e-mail
// ============================================================

import 'package:flutter/foundation.dart';
import '../../../favorites/data/favorites_api_service.dart';

class ClientUser {
  final int id;
  final String uid;
  final String fullName;
  final String email;
  final String? phone;
  final String role; // USER | OWNER | AGENCY | ADMIN
  final bool emailVerified;
  final String? photoUrl;
  final String? agencyId;

  const ClientUser({
    required this.id,
    this.uid = '',
    required this.fullName,
    required this.email,
    this.phone,
    required this.role,
    this.emailVerified = false,
    this.photoUrl,
    this.agencyId,
  });

  String get effectiveUid => uid.isNotEmpty ? uid : id.toString();

  factory ClientUser.fromJson(Map<String, dynamic> json) {
    final uidVal = (json['uid'] ?? json['id'] ?? '').toString();
    return ClientUser(
      id: json['id'] is int ? json['id'] as int : uidVal.hashCode.abs(),
      uid: uidVal,
      fullName: json['fullName'] as String? ?? 'Utilisateur',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String?,
      role: normalizeRole(json['role'] as String?),
      emailVerified: json['emailVerified'] as bool? ?? false,
      photoUrl: json['photoUrl'] as String?,
      agencyId: json['agencyId'] as String?,
    );
  }

  static String normalizeRole(String? raw) {
    final r = (raw ?? 'USER').toUpperCase().trim();
    if (r == 'CLIENT') return 'USER';
    if (r == 'USER' || r == 'OWNER' || r == 'AGENCY' || r == 'ADMIN') return r;
    return 'USER';
  }

  ClientUser copyWith({
    int? id,
    String? uid,
    String? fullName,
    String? email,
    String? phone,
    String? role,
    bool? emailVerified,
    String? photoUrl,
    String? agencyId,
  }) {
    return ClientUser(
      id: id ?? this.id,
      uid: uid ?? this.uid,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      emailVerified: emailVerified ?? this.emailVerified,
      photoUrl: photoUrl ?? this.photoUrl,
      agencyId: agencyId ?? this.agencyId,
    );
  }
}

class AuthState extends ChangeNotifier {
  static final AuthState instance = AuthState._internal();
  AuthState._internal();

  ClientUser? _currentUser;
  bool _isAuthenticated = false;
  String? _token;
  String? _refreshToken;

  ClientUser? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;
  String? get refreshToken => _refreshToken;

  void setSession({
    required ClientUser user,
    required String token,
    String? refreshToken,
  }) {
    _currentUser = user;
    _token = token;
    _refreshToken = refreshToken ?? _refreshToken;
    _isAuthenticated = true;
    notifyListeners();
  }

  void updateUser(ClientUser user) {
    _currentUser = user;
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    _token = null;
    _refreshToken = null;
    _isAuthenticated = false;
    FavoritesApiService.instance.clear();
    notifyListeners();
  }
}
