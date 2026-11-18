// ============================================================
// DARLINK — GESTION DES ERREURS NORMALISÉES RFC 9457 (Flutter)
// Désérialisation et gestion uniforme des réponses Problem Details
// ============================================================

import 'dart:convert';

class ProblemDetailsException implements Exception {
  final String? type;
  final String title;
  final int status;
  final String detail;
  final String? instance;
  final DateTime timestamp;

  ProblemDetailsException({
    this.type,
    required this.title,
    required this.status,
    required this.detail,
    this.instance,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  factory ProblemDetailsException.fromJson(Map<String, dynamic> json) {
    return ProblemDetailsException(
      type: json['type'] as String?,
      title: json['title'] as String? ?? 'Erreur du serveur',
      status: json['status'] as int? ?? 500,
      detail: json['detail'] as String? ?? 'Une erreur est survenue lors du traitement.',
      instance: json['instance'] as String?,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  factory ProblemDetailsException.fromResponse(int statusCode, String body) {
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) {
        return ProblemDetailsException.fromJson(decoded);
      }
    } catch (_) {
      // Ignorer si le corps n'est pas du JSON
    }

    return ProblemDetailsException(
      title: 'Erreur HTTP $statusCode',
      status: statusCode,
      detail: body.isNotEmpty ? body : 'Le serveur a retourné une erreur inattendue.',
    );
  }

  @override
  String toString() => '[$status] $title: $detail';
}

