// ============================================================
// DARLINK — SERVICE NOTIFICATIONS CLOUD FIRESTORE (Flutter)
// Gestion complète des notifications in-app connectées à Firebase :
// lecture, filtres, statut lu/non-lu, suppression, création.
// ============================================================

import 'package:flutter/foundation.dart';
import '../../../core/firebase/firestore_client.dart';
import '../../auth/domain/models/auth_state.dart';
import '../../properties/domain/models/relationships.dart';

class NotificationService extends ChangeNotifier {
  static final NotificationService instance = NotificationService._internal();
  NotificationService._internal();

  final FirestoreClient _firestore = FirestoreClient.instance;

  int _unreadCount = 0;
  int get unreadCount => _unreadCount;

  /// Charge les notifications de l'utilisateur connecté depuis Cloud Firestore.
  Future<List<AppNotificationModel>> getNotifications() async {
    final user = AuthState.instance.currentUser;
    if (user == null) {
      _unreadCount = 0;
      notifyListeners();
      return [];
    }

    try {
      final docs = await _firestore.runStructuredQuery(
        collectionId: 'notifications',
        whereFilters: [
          {
            'field': {'fieldPath': 'recipientUid'},
            'op': 'EQUAL',
            'value': {'stringValue': user.effectiveUid},
          }
        ],
        limit: 50,
      );

      final list = docs.map((doc) => AppNotificationModel.fromJson(doc)).toList();

      // Tri chronologique décroissant
      list.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      _unreadCount = list.where((n) => !n.read).length;
      notifyListeners();
      return list;
    } catch (e) {
      debugPrint('[NotificationService] Erreur lors du chargement des notifications : $e');
      return [];
    }
  }

  /// Actualise le compteur de notifications non lues.
  Future<int> refreshUnreadCount() async {
    await getNotifications();
    return _unreadCount;
  }

  /// Marque une notification comme lue dans Cloud Firestore.
  Future<bool> markAsRead(String id) async {
    try {
      final ok = await _firestore.patchFields('notifications', id, {'read': true});
      if (ok && _unreadCount > 0) {
        _unreadCount--;
        notifyListeners();
      }
      return ok;
    } catch (e) {
      debugPrint('[NotificationService] Échec du marquage lu pour $id : $e');
      return false;
    }
  }

  /// Marque toutes les notifications non lues de l'utilisateur comme lues.
  Future<int> markAllAsRead(List<AppNotificationModel> list) async {
    int updated = 0;
    for (final notif in list) {
      if (!notif.read) {
        final ok = await _firestore.patchFields('notifications', notif.id, {'read': true});
        if (ok) updated++;
      }
    }
    _unreadCount = 0;
    notifyListeners();
    return updated;
  }

  /// Supprime définitivement une notification de Cloud Firestore.
  Future<bool> deleteNotification(String id) async {
    try {
      final ok = await _firestore.deleteDocument('notifications', id);
      if (ok) {
        await refreshUnreadCount();
      }
      return ok;
    } catch (e) {
      debugPrint('[NotificationService] Échec de la suppression de $id : $e');
      return false;
    }
  }

  /// Crée et envoie une nouvelle notification in-app dans Cloud Firestore.
  Future<AppNotificationModel?> createNotification({
    required String recipientUid,
    String? senderUid,
    required String title,
    required String body,
    required String type,
    String? relatedEntityId,
  }) async {
    final notifId = 'notif_${DateTime.now().millisecondsSinceEpoch}';
    final nowIso = DateTime.now().toIso8601String();

    final data = {
      'id': notifId,
      'recipientUid': recipientUid,
      if (senderUid != null && senderUid.isNotEmpty) 'senderUid': senderUid,
      'title': title.trim(),
      'body': body.trim(),
      'type': type,
      if (relatedEntityId != null && relatedEntityId.isNotEmpty) 'relatedEntityId': relatedEntityId,
      'read': false,
      'createdAt': nowIso,
    };

    final ok = await _firestore.setDocument('notifications', notifId, data);
    if (ok) {
      return AppNotificationModel.fromJson(data);
    }
    return null;
  }
}

