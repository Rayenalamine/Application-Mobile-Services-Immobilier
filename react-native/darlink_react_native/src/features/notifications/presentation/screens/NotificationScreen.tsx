// ============================================================
// DARLINK — APPLE-STYLE NOTIFICATIONS CENTER (React Native)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  Home,
  MessageSquare,
  Shield,
  Search,
  CheckCheck,
  Trash2,
} from 'lucide-react-native';
import { AppNotification, NotificationType } from '../../../properties/domain/models/relationships';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { Property } from '../../../properties/domain/models/property';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';
import { GlassOrbButton } from '../../../../core/designSystem/LiquidGlass';
import { TypographyScale, RadiusScale } from '../../../../core/designSystem/tokens';

interface NotificationScreenProps {
  onBack: () => void;
  onOpenProperty?: (property: Property) => void;
}

type FilterCategory = 'ALL' | 'CONTACT' | 'LISTING' | 'ACCOUNT';

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack, onOpenProperty }) => {
  const { colors, isDark } = useTheme();
  const { language } = useTranslation();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getMyNotifications();
      setNotifications(list);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const ok = await notificationService.markAsRead(id);
    if (ok) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    const ok = await notificationService.deleteNotification(id);
    if (ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleNotificationPress = async (item: AppNotification) => {
    if (!item.read) await handleMarkAsRead(item.id);
    if (item.relatedEntityId) {
      try {
        const prop = await propertyApiService.getPropertyById(item.relatedEntityId);
        if (prop) {
          if (onOpenProperty) onOpenProperty(prop);
          else setSelectedProperty(prop);
        }
      } catch {
        // Ignore
      }
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'CONTACT') return notif.type === 'CONTACT_REQUEST';
    if (selectedCategory === 'LISTING') return notif.type === 'LISTING_STATUS' || notif.type === 'PROPERTY_UPDATE';
    if (selectedCategory === 'ACCOUNT') return notif.type === 'ACCOUNT_SECURITY' || notif.type === 'SYSTEM';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'CONTACT_REQUEST':
        return <MessageSquare size={18} color={colors.accentBlue} />;
      case 'LISTING_STATUS':
      case 'PROPERTY_UPDATE':
        return <Home size={18} color={colors.accentChampagne} />;
      case 'ACCOUNT_SECURITY':
        return <Shield size={18} color={colors.accentRed} />;
      case 'SAVED_SEARCH':
        return <Search size={18} color={colors.accentGreen} />;
      default:
        return <Bell size={18} color={colors.textSecondary} />;
    }
  };

  if (selectedProperty) {
    return <PropertyDetailsScreen property={selectedProperty} onBack={() => setSelectedProperty(null)} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <GlassOrbButton size={40} onPress={onBack} accessibilityLabel="Retour">
          <ArrowLeft size={19} color={colors.textPrimary} />
        </GlassOrbButton>
        <View style={{ flex: 1 }}>
          <Text style={[TypographyScale.micro, { color: colors.accentChampagne }]}>ACTIVITÉ</Text>
          <Text style={[TypographyScale.pageTitle, { color: colors.textPrimary, fontSize: 22 }]}>
            Notifications
          </Text>
        </View>
        {unreadCount > 0 ? (
          <GlassOrbButton size={40} onPress={handleMarkAllRead} accessibilityLabel="Tout marquer lu">
            <CheckCheck size={18} color={colors.accentChampagne} />
          </GlassOrbButton>
        ) : null}
      </View>

      <View style={styles.categoriesRow}>
        {(
          [
            { key: 'ALL', label: 'Toutes' },
            { key: 'CONTACT', label: 'Demandes' },
            { key: 'LISTING', label: 'Biens' },
            { key: 'ACCOUNT', label: 'Sécurité' },
          ] as { key: FilterCategory; label: string }[]
        ).map((cat) => {
          const active = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.catPill,
                {
                  backgroundColor: active
                    ? isDark
                      ? '#F5F5F7'
                      : '#1D1D1F'
                    : colors.surface,
                  borderColor: active ? 'transparent' : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? (isDark ? '#1D1D1F' : '#FFFFFF') : colors.textSecondary,
                  fontSize: 12.5,
                  fontWeight: active ? '600' : '500',
                }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accentChampagne} />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <EmptyStateView
          title="Tout est à jour"
          message="Les demandes de visite, mises à jour d'annonces et alertes apparaîtront ici."
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadNotifications();
              }}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(item)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: item.read ? colors.border : colors.accentChampagne,
                  borderWidth: item.read ? 0.9 : 1.2,
                },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated }]}>
                {renderIcon(item.type)}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 14.5, flex: 1 }]}>
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.accentChampagne }]} />
                  )}
                </View>
                <Text style={[TypographyScale.body, { color: colors.textSecondary, fontSize: 13.5, marginTop: 3 }]}>
                  {item.body}
                </Text>
                {item.createdAt ? (
                  <Text style={[TypographyScale.micro, { color: colors.textTertiary, marginTop: 6, fontSize: 10.5 }]}>
                    {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR')}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 4 }}>
                <Trash2 size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  catPill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: RadiusScale.pill,
    borderWidth: 0.9,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
    borderRadius: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
