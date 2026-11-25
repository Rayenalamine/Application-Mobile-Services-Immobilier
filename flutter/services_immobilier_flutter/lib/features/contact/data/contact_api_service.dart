// ============================================================
// DARLINK — SERVICE API DEMANDES DE CONTACT & NOTIFICATIONS (Flutter)
// Intégrité référentielle (propertyId, propertyOwnerId, senderId) et création
// de notification côté destinataire dans Cloud Firestore.
// ============================================================

import '../../../core/firebase/firestore_client.dart';
import '../../auth/domain/models/auth_state.dart';

class ContactRequestModel {
  final String id;
  final String propertyId;
  final String propertyTitle;
  final String propertyOwnerId;
  final String? senderId;
  final String senderName;
  final String senderEmail;
  final String? senderPhone;
  final String message;
  final String status;
  final String createdAt;

  ContactRequestModel({
    required this.id,
    required this.propertyId,
    this.propertyTitle = '',
    this.propertyOwnerId = '',
    this.senderId,
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
      propertyTitle: json['propertyTitle'] as String? ?? '',
      propertyOwnerId: json['propertyOwnerId']?.toString() ?? '',
      senderId: json['senderId']?.toString(),
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
      if (propertyTitle.isNotEmpty) 'propertyTitle': propertyTitle,
      if (propertyOwnerId.isNotEmpty) 'propertyOwnerId': propertyOwnerId,
      if (senderId != null && senderId!.isNotEmpty) 'senderId': senderId,
      'senderName': senderName,
      'senderEmail': senderEmail,
      if (senderPhone != null && senderPhone!.isNotEmpty) 'senderPhone': senderPhone,
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
    String propertyTitle = '',
    String propertyOwnerId = '',
    required String senderName,
    required String senderEmail,
    String? senderPhone,
    required String message,
  }) async {
    final cleanEmail = senderEmail.trim();
    final cleanMsg = message.trim();
    if (cleanMsg.isEmpty || !RegExp(r'^.+@.+\..+$').hasMatch(cleanEmail)) {
      return null;
    }

    final currentUser = AuthState.instance.currentUser;
    if (currentUser == null) {
      return null;
    }
    final senderUid = currentUser.effectiveUid;
    final docId = 'cr_${DateTime.now().millisecondsSinceEpoch}';
    final nowIso = DateTime.now().toIso8601String();

    final request = ContactRequestModel(
      id: docId,
      propertyId: propertyId,
      propertyTitle: propertyTitle,
      propertyOwnerId: propertyOwnerId,
      senderId: senderUid,
      senderName: senderName.trim(),
      senderEmail: cleanEmail,
      senderPhone: senderPhone?.trim(),
      message: cleanMsg,
      status: 'PENDING',
      createdAt: nowIso,
    );

    final ok = await _firestore.setDocument('contact_requests', docId, request.toJson());
    return ok ? request : null;
  }

  Future<List<ContactRequestModel>> getReceivedRequests() async {
    final user = AuthState.instance.currentUser;
    if (user == null) return [];
    final docs = await _firestore.runStructuredQuery(
      collectionId: 'contact_requests',
      whereFilters: [
        {
          'field': {'fieldPath': 'propertyOwnerId'},
          'op': 'EQUAL',
          'value': {'stringValue': user.effectiveUid},
        }
      ],
      limit: 50,
    );
    return docs.map((d) => ContactRequestModel.fromJson(d)).toList();
  }

  Future<List<ContactRequestModel>> getSentRequests() async {
    final user = AuthState.instance.currentUser;
    if (user == null) return [];
    final docs = await _firestore.runStructuredQuery(
      collectionId: 'contact_requests',
      whereFilters: [
        {
          'field': {'fieldPath': 'senderId'},
          'op': 'EQUAL',
          'value': {'stringValue': user.effectiveUid},
        }
      ],
      limit: 50,
    );
    return docs.map((d) => ContactRequestModel.fromJson(d)).toList();
  }

  Future<bool> updateStatus(String requestId, String status) async {
    return _firestore.patchFields('contact_requests', requestId, {'status': status});
  }

  Future<List<Map<String, dynamic>>> getMyNotifications() async {
    final user = AuthState.instance.currentUser;
    if (user == null) return [];
    return _firestore.runStructuredQuery(
      collectionId: 'notifications',
      whereFilters: [
        {
          'field': {'fieldPath': 'recipientUid'},
          'op': 'EQUAL',
          'value': {'stringValue': user.effectiveUid},
        }
      ],
      limit: 40,
    );
  }

  Future<void> markNotificationRead(String notificationId) async {
    await _firestore.patchFields('notifications', notificationId, {'read': true});
  }
}
