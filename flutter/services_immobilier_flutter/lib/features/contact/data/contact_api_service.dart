// ============================================================
// DARLINK — SERVICE API DEMANDES DE CONTACT (Flutter)
// ============================================================

import '../../../core/network/api_client.dart';

class ContactRequestModel {
  final String id;
  final String propertyId;
  final String senderName;
  final String senderEmail;
  final String? senderPhone;
  final String message;
  final String status;
  final String createdAt;

  ContactRequestModel({
    required this.id,
    required this.propertyId,
    required this.senderName,
    required this.senderEmail,
    this.senderPhone,
    required this.message,
    required this.status,
    required this.createdAt,
  });

  factory ContactRequestModel.fromJson(Map<String, dynamic> json) {
    return ContactRequestModel(
      id: json['id']?.toString() ?? '',
      propertyId: json['propertyId']?.toString() ?? '',
      senderName: json['senderName'] as String? ?? 'Visiteur',
      senderEmail: json['senderEmail'] as String? ?? '',
      senderPhone: json['senderPhone'] as String?,
      message: json['message'] as String? ?? '',
      status: json['status'] as String? ?? 'PENDING',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class ContactApiService {
  static final ContactApiService instance = ContactApiService._internal();
  ContactApiService._internal();

  final ApiClient _api = ApiClient.instance;

  Future<ContactRequestModel?> sendContactRequest({
    required String propertyId,
    required String senderName,
    required String senderEmail,
    String? senderPhone,
    required String message,
  }) async {
    final payload = {
      'propertyId': int.tryParse(propertyId) ?? 1,
      'senderName': senderName,
      'senderEmail': senderEmail,
      'senderPhone': senderPhone,
      'message': message,
    };

    try {
      final res = await _api.post('/contact-requests', payload);
      if (res is Map<String, dynamic> && res.containsKey('id')) {
        return ContactRequestModel.fromJson(res);
      }
    } catch (_) {}

    return ContactRequestModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      propertyId: propertyId,
      senderName: senderName,
      senderEmail: senderEmail,
      senderPhone: senderPhone,
      message: message,
      status: 'PENDING',
      createdAt: DateTime.now().toIso8601String(),
    );
  }

  Future<List<ContactRequestModel>> getReceivedRequests() async {
    try {
      final res = await _api.get('/contact-requests/received');
      if (res is List<dynamic>) {
        return res
            .map((item) => ContactRequestModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}
    return [];
  }

  Future<List<ContactRequestModel>> getSentRequests() async {
    try {
      final res = await _api.get('/contact-requests/sent');
      if (res is List<dynamic>) {
        return res
            .map((item) => ContactRequestModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}
    return [];
  }
}

