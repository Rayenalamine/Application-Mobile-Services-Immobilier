// ============================================================
// DARLINK — MODÈLES RELATIONNELS CLOUD FIRESTORE (Flutter)
// Agences, Notifications et Signalements de modération
// ============================================================

class AgencyModel {
  final String id;
  final String name;
  final String? licenseNumber;
  final String governorate;
  final String city;
  final String? phone;
  final String? email;
  final bool verified;
  final String ownerUid;
  final List<String> agentUids;
  final String createdAt;

  const AgencyModel({
    required this.id,
    required this.name,
    this.licenseNumber,
    required this.governorate,
    required this.city,
    this.phone,
    this.email,
    this.verified = false,
    required this.ownerUid,
    this.agentUids = const [],
    required this.createdAt,
  });

  factory AgencyModel.fromJson(Map<String, dynamic> json) {
    return AgencyModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      licenseNumber: json['licenseNumber'] as String?,
      governorate: json['governorate'] as String? ?? 'Tunis',
      city: json['city'] as String? ?? 'Tunis',
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      verified: json['verified'] as bool? ?? false,
      ownerUid: json['ownerUid']?.toString() ?? '',
      agentUids: (json['agentUids'] as List<dynamic>? ?? []).map((e) => e.toString()).toList(),
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class AppNotificationModel {
  final String id;
  final String recipientUid;
  final String? senderUid;
  final String title;
  final String body;
  final String type;
  final String? relatedEntityId;
  final bool read;
  final String createdAt;

  const AppNotificationModel({
    required this.id,
    required this.recipientUid,
    this.senderUid,
    required this.title,
    required this.body,
    required this.type,
    this.relatedEntityId,
    this.read = false,
    required this.createdAt,
  });

  factory AppNotificationModel.fromJson(Map<String, dynamic> json) {
    return AppNotificationModel(
      id: json['id']?.toString() ?? '',
      recipientUid: json['recipientUid']?.toString() ?? '',
      senderUid: json['senderUid']?.toString(),
      title: json['title'] as String? ?? '',
      body: json['body'] as String? ?? '',
      type: json['type'] as String? ?? 'SYSTEM',
      relatedEntityId: json['relatedEntityId']?.toString(),
      read: json['read'] as bool? ?? false,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class ModerationReportModel {
  final String id;
  final String propertyId;
  final String reporterUid;
  final String reason;
  final String? details;
  final String status;
  final String createdAt;

  const ModerationReportModel({
    required this.id,
    required this.propertyId,
    required this.reporterUid,
    required this.reason,
    this.details,
    this.status = 'OPEN',
    required this.createdAt,
  });

  factory ModerationReportModel.fromJson(Map<String, dynamic> json) {
    return ModerationReportModel(
      id: json['id']?.toString() ?? '',
      propertyId: json['propertyId']?.toString() ?? '',
      reporterUid: json['reporterUid']?.toString() ?? '',
      reason: json['reason'] as String? ?? '',
      details: json['details'] as String?,
      status: json['status'] as String? ?? 'OPEN',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

