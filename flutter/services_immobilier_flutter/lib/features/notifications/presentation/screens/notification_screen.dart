// ============================================================
// DARLINK — APPLE-STYLE NOTIFICATIONS CENTER (Flutter)
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/domain/models/relationships.dart';
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

  final List<String> _categories = const ['Toutes', 'Demandes', 'Biens', 'Sécurité'];

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
      setState(() => _notifications.removeWhere((n) => n.id == id));
    }
  }

  Future<void> _surTapNotification(AppNotificationModel notif) async {
    if (!notif.read) await _marquerCommeLu(notif);
    if (notif.relatedEntityId != null && notif.relatedEntityId!.isNotEmpty) {
      try {
        final prop = await PropertyApiService.instance.getPropertyById(notif.relatedEntityId!);
        if (prop != null && mounted) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => EcranDetails(propriete: prop)));
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
        return Icons.apartment_rounded;
      case 'ACCOUNT_SECURITY':
        return Icons.shield_outlined;
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
        return AppColors.accentChampagne;
      case 'ACCOUNT_SECURITY':
        return AppColors.accentRed;
      default:
        return AppColors.accentGreen;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final filtered = _notificationsFiltrees;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top bar
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 10),
              child: Row(
                children: [
                  GlassOrbButton(
                    icon: Icons.arrow_back_ios_new_rounded,
                    size: 40,
                    iconSize: 18,
                    onTap: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('ACTIVITÉ', style: AppTypography.micro(AppColors.accentChampagne)),
                        Text('Notifications', style: AppTypography.pageTitle(textPrim).copyWith(fontSize: 22)),
                      ],
                    ),
                  ),
                  if (_notifications.any((n) => !n.read))
                    GlassOrbButton(
                      icon: Icons.done_all_rounded,
                      size: 40,
                      tooltip: 'Tout marquer comme lu',
                      onTap: _toutMarquerCommeLu,
                    ),
                ],
              ),
            ),

            // Category pills
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                itemCount: _categories.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (_, idx) {
                  final cat = _categories[idx];
                  final active = _categorieActive == cat;
                  return GestureDetector(
                    onTap: () => setState(() => _categorieActive = cat),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 15),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: active ? AppColors.primaryActionBgOf(context) : cardBg,
                        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                        border: Border.all(color: active ? Colors.transparent : borderColor, width: 0.9),
                      ),
                      child: Text(
                        cat,
                        style: TextStyle(
                          color: active ? AppColors.primaryActionFgOf(context) : textSec,
                          fontSize: 12.5,
                          fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : filtered.isEmpty
                      ? const LuxuryEmptyState(
                          icon: Icons.notifications_none_rounded,
                          title: 'Tout est à jour',
                          message: 'Vos alertes de visites, validations et comptes apparaîtront ici.',
                        )
                      : RefreshIndicator(
                          onRefresh: _chargerNotifications,
                          child: ListView.separated(
                            padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
                            itemCount: filtered.length,
                            separatorBuilder: (_, _) => const SizedBox(height: 10),
                            itemBuilder: (_, idx) {
                              final notif = filtered[idx];
                              final accent = _getColorForType(notif.type);
                              return GestureDetector(
                                onTap: () => _surTapNotification(notif),
                                child: Container(
                                  padding: const EdgeInsets.all(15),
                                  decoration: BoxDecoration(
                                    color: cardBg,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: notif.read ? borderColor : accent.withValues(alpha: 0.45),
                                      width: notif.read ? 0.9 : 1.2,
                                    ),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 40,
                                        height: 40,
                                        decoration: BoxDecoration(
                                          color: accent.withValues(alpha: 0.12),
                                          borderRadius: BorderRadius.circular(14),
                                        ),
                                        child: Icon(_getIconForType(notif.type), size: 20, color: accent),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    notif.title,
                                                    style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14.5),
                                                  ),
                                                ),
                                                if (!notif.read)
                                                  Container(
                                                    width: 8,
                                                    height: 8,
                                                    decoration: BoxDecoration(color: accent, shape: BoxShape.circle),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(notif.body, style: AppTypography.body(textSec).copyWith(fontSize: 13.5)),
                                          ],
                                        ),
                                      ),
                                      IconButton(
                                        icon: Icon(Icons.close_rounded, size: 17, color: textSec),
                                        onPressed: () => _supprimerNotification(notif.id),
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
      ),
    );
  }
}
