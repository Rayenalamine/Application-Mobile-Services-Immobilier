// ============================================================
// DARLINK — ÉTAT D'AUTHENTIFICATION CLIENT (Flutter V4)
// Gestion de session JWT, utilisateur connecté et persistance
// ============================================================

import 'package:flutter/foundation.dart';

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
      id: json['id'] as int? ?? 1,
      fullName: json['fullName'] as String? ?? 'Rayen Lamine',
      email: json['email'] as String? ?? 'rayen@darlink.tn',
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'CLIENT',
    );
  }
}

class AuthState extends ChangeNotifier {
  static final AuthState instance = AuthState._internal();
  AuthState._internal();

  ClientUser? _currentUser = const ClientUser(
    id: 1,
    fullName: 'Rayen Lamine',
    email: 'rayen.lamine@darlink.tn',
    phone: '+216 20 123 456',
    role: 'CLIENT',
  );

  bool _isAuthenticated = true;
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

  void logout() {
    _currentUser = null;
    _token = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}

