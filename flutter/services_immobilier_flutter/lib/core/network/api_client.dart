// ============================================================
// DARLINK — CLIENT RÉSEAU HTTP CENTRALISÉ (Flutter V3)
// Communication REST avec le backend Spring Boot & gestion RFC 9457
// ============================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../errors/problem_details.dart';

class ApiClient {
  static final ApiClient instance = ApiClient._internal();
  ApiClient._internal();

  /// URL de base du backend Spring Boot
  String baseUrl = 'http://localhost:8085/api/v1';

  /// Jeton JWT de session
  String? authToken;

  Map<String, String> _getHeaders() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json, application/problem+json',
    };
    if (authToken != null && authToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }

  /// Ping de santé du serveur
  Future<bool> checkHealth() async {
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/health'))
          .timeout(const Duration(seconds: 3));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Requête GET générique
  Future<dynamic> get(String endpoint, {Map<String, dynamic>? queryParams}) async {
    Uri uri = Uri.parse('$baseUrl$endpoint');
    if (queryParams != null && queryParams.isNotEmpty) {
      final mapped = queryParams
          .where((k, v) => v != null)
          .map((k, v) => MapEntry(k, v.toString()));
      uri = uri.replace(queryParameters: mapped);
    }

    try {
      final res = await http
          .get(uri, headers: _getHeaders())
          .timeout(const Duration(seconds: 5));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return jsonDecode(utf8.decode(res.bodyBytes));
      } else {
        throw ProblemDetailsException.fromResponse(res.statusCode, res.body);
      }
    } catch (e) {
      if (e is ProblemDetailsException) rethrow;
      throw ProblemDetailsException(
        title: 'Erreur réseau',
        status: 0,
        detail: 'Impossible de contacter le serveur backend ($baseUrl).',
      );
    }
  }

  /// Requête POST générique
  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    try {
      final res = await http
          .post(uri, headers: _getHeaders(), body: jsonEncode(data))
          .timeout(const Duration(seconds: 5));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return jsonDecode(utf8.decode(res.bodyBytes));
      } else {
        throw ProblemDetailsException.fromResponse(res.statusCode, res.body);
      }
    } catch (e) {
      if (e is ProblemDetailsException) rethrow;
      throw ProblemDetailsException(
        title: 'Erreur réseau',
        status: 0,
        detail: 'Impossible de transmettre les données au serveur backend ($baseUrl).',
      );
    }
  }

  /// Requête DELETE générique
  Future<dynamic> delete(String endpoint) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    try {
      final res = await http
          .delete(uri, headers: _getHeaders())
          .timeout(const Duration(seconds: 5));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (res.body.isEmpty) return null;
        return jsonDecode(utf8.decode(res.bodyBytes));
      } else {
        throw ProblemDetailsException.fromResponse(res.statusCode, res.body);
      }
    } catch (e) {
      if (e is ProblemDetailsException) rethrow;
      throw ProblemDetailsException(
        title: 'Erreur réseau',
        status: 0,
        detail: 'Impossible de supprimer la ressource sur le serveur backend.',
      );
    }
  }
}

extension _MapWhere<K, V> on Map<K, V> {
  Map<K, V> where(bool Function(K key, V value) test) {
    final result = <K, V>{};
    forEach((key, value) {
      if (test(key, value)) result[key] = value;
    });
    return result;
  }
}

