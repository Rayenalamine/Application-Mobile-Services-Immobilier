// ============================================================
// DARLINK — ÉCRAN CENTRE DE NOTIFICATIONS (Flutter)
// Chargement Cloud Firestore, synchronisation temps réel / actualisation,
// marquage lu/non-lu, suppression, filtres, zéro emoji.
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../properties/domain/models/relationships.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/presentation/screens/property_details_screen.dart';
import '../../data/notification_service.dart';

class EcranNotifications extends StatefulWidget {
  const EcranNotifications({super.key});

  @override
  State<EcranNotifications> createState() => _EcranNotificationsState();
}

class _EcranNotificationsState extends State<EcranNotifications> {
  final NotificationService _service = NotificationService.instance;
  List<AppNotificationModel> _notifications = [];
  bool _isLoading = true;
  String _categorieActive = 'Toutes';

  final List<String> _categories = const [
    'Toutes',
    'Demandes',
    'Biens',
    'Sécurité',
  ];

  @override
  void initState() {
    super.initState();
    _chargerNotifications();
  }

  Future<void> _chargerNotifications() async {
    setState(() => _isLoading = true);
    final list = await _service.getNotifications();
    if (mounted) {
      setState(() {
        _notifications = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _marquerCommeLu(AppNotificationModel notif) async {
    await _service.markAsRead(notif.id);
    if (mounted) {
      setState(() {
        final idx = _notifications.indexWhere((n) => n.id == notif.id);
        if (idx != -1) {
          _notifications[idx] = AppNotificationModel(
            id: notif.id,
            recipientUid: notif.recipientUid,
            senderUid: notif.senderUid,
            title: notif.title,
            body: notif.body,
            type: notif.type,
            relatedEntityId: notif.relatedEntityId,
            read: true,
            createdAt: notif.createdAt,
          );
        }
      });
    }
  }

  Future<void> _toutMarquerCommeLu() async {
    await _service.markAllAsRead(_notifications);
    if (mounted) {
      setState(() {
        _notifications = _notifications.map((n) {
          return AppNotificationModel(
            id: n.id,
            recipientUid: n.recipientUid,
            senderUid: n.senderUid,
            title: n.title,
            body: n.body,
            type: n.type,
            relatedEntityId: n.relatedEntityId,
            read: true,
            createdAt: n.createdAt,
          );
        }).toList();
      });
    }
  }

  Future<void> _supprimerNotification(String id) async {
    await _service.deleteNotification(id);
    if (mounted) {
      setState(() {
        _notifications.removeWhere((n) => n.id == id);
      });
    }
  }

  Future<void> _surTapNotification(AppNotificationModel notif) async {
    if (!notif.read) {
      await _marquerCommeLu(notif);
    }

    if (notif.relatedEntityId != null && notif.relatedEntityId!.isNotEmpty) {
      try {
        final prop = await PropertyApiService.instance.getPropertyById(notif.relatedEntityId!);
        if (prop != null && mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => EcranDetails(propriete: prop)),
          );
        }
      } catch (_) {}
    }
  }

  List<AppNotificationModel> get _notificationsFiltrees {
    return _notifications.where((n) {
      if (_categorieActive == 'Toutes') return true;
      if (_categorieActive == 'Demandes') return n.type == 'CONTACT_REQUEST';
      if (_categorieActive == 'Biens') return n.type == 'LISTING_STATUS' || n.type == 'PROPERTY_UPDATE';
      if (_categorieActive == 'Sécurité') return n.type == 'ACCOUNT_SECURITY' || n.type == 'SYSTEM';
      return true;
    }).toList();
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'CONTACT_REQUEST':
        return Icons.mail_outline_rounded;
      case 'LISTING_STATUS':
      case 'PROPERTY_UPDATE':
        return Icons.home_work_outlined;
      case 'ACCOUNT_SECURITY':
        return Icons.shield_outlined;
      case 'SAVED_SEARCH':
        return Icons.search_rounded;
      default:
        return Icons.notifications_none_rounded;
    }
  }

  Color _getColorForType(String type) {
    switch (type) {
      case 'CONTACT_REQUEST':
        return AppColors.accentBlue;
      case 'LISTING_STATUS':
      case 'PROPERTY_UPDATE':
        return const Color(0xFFD97706);
      case 'ACCOUNT_SECURITY':
        return Colors.redAccent;
      case 'SAVED_SEARCH':
        return AppColors.accentGreen;
      default:
        return Colors.grey;
    }
  }

  String _formaterDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final jour = date.day.toString().padLeft(2, '0');
      final mois = date.month.toString().padLeft(2, '0');
      final heure = date.hour.toString().padLeft(2, '0');
      final minute = date.minute.toString().padLeft(2, '0');
      return '$jour/$mois à $heure:$minute';
    } catch (_) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0F1015) : const Color(0xFFF8F9FA);
    final cardBg = isDark ? const Color(0xFF161820) : Colors.white;
    final textPrim = isDark ? Colors.white : const Color(0xFF0F1015);
    final textSec = isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280);
    final borderColor = isDark ? const Color(0xFF22242D) : const Color(0xFFE5E7EB);

    final unreadTotal = _notifications.where((n) => !n.read).length;
    final listeFiltree = _notificationsFiltrees;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Notifications',
              style: TextStyle(color: textPrim, fontWeight: FontWeight.w700, fontSize: 18),
            ),
            if (unreadTotal > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.accentBlue,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$unreadTotal',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (unreadTotal > 0)
            IconButton(
              icon: const Icon(Icons.done_all_rounded, color: AppColors.accentBlue),
              tooltip: 'Tout marquer comme lu',
              onPressed: _toutMarquerCommeLu,
            ),
        ],
      ),
      body: Column(
        children: [
          // Sélecteur de catégories
          Container(
            height: 48,
            margin: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final cat = _categories[idx];
                final isSel = _categorieActive == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSel,
                  selectedColor: isDark ? Colors.white : const Color(0xFF0F1015),
                  backgroundColor: cardBg,
                  labelStyle: TextStyle(
                    color: isSel ? (isDark ? const Color(0xFF0F1015) : Colors.white) : textSec,
                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 13,
                  ),
                  side: BorderSide(color: isSel ? Colors.transparent : borderColor),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  onSelected: (val) {
                    if (val) setState(() => _categorieActive = cat);
                  },
                );
              },
            ),
          ),

          // Liste ou état vide
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.accentBlue))
                : listeFiltree.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1C1E26) : const Color(0xFFEEF2F6),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(Icons.notifications_none_rounded, size: 32, color: textSec),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Aucune notification',
                              style: TextStyle(color: textPrim, fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Vous êtes à jour ! Vos alertes apparaîtront ici.',
                              style: TextStyle(color: textSec, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _chargerNotifications,
                        color: AppColors.accentBlue,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: listeFiltree.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final notif = listeFiltree[index];
                            final colorIcon = _getColorForType(notif.type);

                            return InkWell(
                              onTap: () => _surTapNotification(notif),
                              borderRadius: BorderRadius.circular(16),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: cardBg,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: notif.read ? borderColor : AppColors.accentBlue,
                                    width: notif.read ? 1 : 1.5,
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: colorIcon.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(_getIconForType(notif.type), size: 20, color: colorIcon),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  notif.title,
                                                  style: TextStyle(
                                                    color: textPrim,
                                                    fontSize: 14,
                                                    fontWeight: notif.read ? FontWeight.w600 : FontWeight.w800,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              if (!notif.read)
                                                Container(
                                                  width: 8,
                                                  height: 8,
                                                  decoration: const BoxDecoration(
                                                    color: AppColors.accentBlue,
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            notif.body,
                                            style: TextStyle(color: textSec, fontSize: 13, height: 1.3),
                                            maxLines: 3,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 8),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                _formaterDate(notif.createdAt),
                                                style: TextStyle(color: textSec.withOpacity(0.8), fontSize: 11),
                                              ),
                                              IconButton(
                                                icon: Icon(Icons.delete_outline_rounded, size: 18, color: textSec),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _supprimerNotification(notif.id),
                                                tooltip: 'Supprimer',
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
