// ============================================================
// DARLINK — SERVICE API DEMANDES DE CONTACT CLOUD FIRESTORE (Flutter)
// ============================================================

import '../../../core/firebase/firestore_client.dart';

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

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyId': propertyId,
      'senderName': senderName,
      'senderEmail': senderEmail,
      'senderPhone': senderPhone,
      'message': message,
      'status': status,
      'createdAt': createdAt,
    };
  }
}

class ContactApiService {
  static final ContactApiService instance = ContactApiService._internal();
  ContactApiService._internal();

  final FirestoreClient _firestore = FirestoreClient.instance;

  Future<ContactRequestModel?> sendContactRequest({
    required String propertyId,
    required String senderName,
    required String senderEmail,
    String? senderPhone,
    required String message,
  }) async {
    final docId = 'cr_${DateTime.now().millisecondsSinceEpoch}';
    final request = ContactRequestModel(
      id: docId,
      propertyId: propertyId,
      senderName: senderName,
      senderEmail: senderEmail,
      senderPhone: senderPhone,
      message: message,
      status: 'PENDING',
      createdAt: DateTime.now().toIso8601String(),
    );

    try {
      await _firestore.setDocument('contact_requests', docId, request.toJson());
      return request;
    } catch (_) {}

    return request;
  }

  Future<List<ContactRequestModel>> getReceivedRequests() async {
    try {
      final docs = await _firestore.getCollection('contact_requests');
      return docs.map((doc) => ContactRequestModel.fromJson(doc)).toList();
    } catch (_) {}
    return [];
  }

  Future<List<ContactRequestModel>> getSentRequests() async {
    try {
      final docs = await _firestore.getCollection('contact_requests');
      return docs.map((doc) => ContactRequestModel.fromJson(doc)).toList();
    } catch (_) {}
    return [];
  }
}
