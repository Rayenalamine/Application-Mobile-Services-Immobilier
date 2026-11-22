// ============================================================
// DARLINK — ÉTAT D'AUTHENTIFICATION CLIENT RÉEL (Flutter V4)
// Gestion de session JWT, utilisateur connecté et persistance
// ============================================================

import 'package:flutter/foundation.dart';
import '../../../favorites/data/favorites_api_service.dart';

class ClientUser {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final String role;

  const ClientUser({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    required this.role,
  });

  factory ClientUser.fromJson(Map<String, dynamic> json) {
    return ClientUser(
      id: json['id'] as int? ?? 0,
      fullName: json['fullName'] as String? ?? 'Utilisateur',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'CLIENT',
    );
  }

  ClientUser copyWith({
    int? id,
    String? fullName,
    String? email,
    String? phone,
    String? role,
  }) {
    return ClientUser(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
    );
  }
}

class AuthState extends ChangeNotifier {
  static final AuthState instance = AuthState._internal();
  AuthState._internal();

  ClientUser? _currentUser;
  bool _isAuthenticated = false;
  String? _token;

  ClientUser? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;

  void setSession({required ClientUser user, required String token}) {
    _currentUser = user;
    _token = token;
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
    _isAuthenticated = false;
    FavoritesApiService.instance.clear();
    notifyListeners();
  }
}
