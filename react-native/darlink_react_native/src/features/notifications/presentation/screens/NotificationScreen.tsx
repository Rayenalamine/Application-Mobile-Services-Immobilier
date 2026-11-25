// ============================================================
// DARLINK — ÉCRAN CENTRE DE NOTIFICATIONS (React Native)
// Connecté à Cloud Firestore, temps réel / actualisation,
// marquage lu/non-lu, suppression, filtres de catégories, zéro emoji.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Home,
  Shield,
  Search,
  CheckCheck,
  Trash2,
  Clock,
} from 'lucide-react-native';
import { AppNotification, NotificationType } from '../../../properties/domain/models/relationships';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { Property } from '../../../properties/domain/models/property';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';

interface NotificationScreenProps {
  onBack: () => void;
  onOpenProperty?: (property: Property) => void;
}

type FilterCategory = 'ALL' | 'CONTACT' | 'LISTING' | 'ACCOUNT';

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack, onOpenProperty }) => {
  const { colors, isDark } = useTheme();
  const { t, language } = useTranslation();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getMyNotifications();
      setNotifications(list);
    } catch (e) {
      console.warn('[NotificationScreen] Erreur de chargement :', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationPress = async (item: AppNotification) => {
    if (!item.read) {
      await handleMarkAsRead(item.id);
    }

    // Si la notification cible un bien immobilier
    if (item.relatedEntityId && (item.type === 'LISTING_STATUS' || item.type === 'PROPERTY_UPDATE')) {
      try {
        const prop = await propertyApiService.getPropertyById(item.relatedEntityId);
        if (prop) {
          if (onOpenProperty) {
            onOpenProperty(prop);
          } else {
            setSelectedProperty(prop);
          }
        }
      } catch (e) {
        console.warn('Impossible de charger le bien associé :', e);
      }
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'CONTACT') return notif.type === 'CONTACT_REQUEST';
    if (selectedCategory === 'LISTING') {
      return notif.type === 'LISTING_STATUS' || notif.type === 'PROPERTY_UPDATE';
    }
    if (selectedCategory === 'ACCOUNT') {
      return notif.type === 'ACCOUNT_SECURITY' || notif.type === 'SYSTEM';
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'CONTACT_REQUEST':
        return <MessageSquare size={20} color="#2563EB" />;
      case 'LISTING_STATUS':
      case 'PROPERTY_UPDATE':
        return <Home size={20} color="#D97706" />;
      case 'ACCOUNT_SECURITY':
        return <Shield size={20} color="#DC2626" />;
      case 'SAVED_SEARCH':
        return <Search size={20} color="#059669" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (selectedProperty) {
    return (
      <PropertyDetailsScreen
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            accessibilityLabel="Tout marquer comme lu"
          >
            <CheckCheck size={18} color="#2563EB" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Catégories de filtres */}
      <View style={styles.filtersContainer}>
        {(
          [
            { key: 'ALL', label: 'Toutes' },
            { key: 'CONTACT', label: 'Demandes' },
            { key: 'LISTING', label: 'Biens' },
            { key: 'ACCOUNT', label: 'Compte' },
          ] as const
        ).map((cat) => {
          const active = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active
                    ? isDark
                      ? '#FFFFFF'
                      : '#0F1015'
                    : colors.surface,
                  borderColor: active ? 'transparent' : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: active
                      ? isDark
                        ? '#0F1015'
                        : '#FFFFFF'
                      : colors.textSecondary,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Liste des notifications */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <EmptyStateView
          title="Aucune notification"
          message="Vous êtes à jour. Les messages, mises à jour de biens et alertes apparaîtront ici."
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(item)}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: item.read ? colors.border : '#2563EB',
                    borderLeftWidth: item.read ? 1 : 4,
                  },
                ]}
              >
                <View style={styles.iconWrapper}>{renderIcon(item.type)}</View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        {
                          color: colors.textPrimary,
                          fontWeight: item.read ? '600' : '700',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text
                    style={[styles.notificationBody, { color: colors.textSecondary }]}
                    numberOfLines={3}
                  >
                    {item.body}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.timeRow}>
                      <Clock size={12} color={colors.textSecondary} />
                      <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteButton}
                      accessibilityLabel="Supprimer la notification"
                    >
                      <Trash2 size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  markAllButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notificationBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
  },
});

