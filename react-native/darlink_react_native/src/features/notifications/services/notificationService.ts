// ============================================================
// DARLINK — SERVICE NOTIFICATIONS CLOUD FIRESTORE (React Native)
// Gestion complète des notifications in-app connectées à Firebase :
// lecture, état lu/non-lu, suppression, compteurs et création.
// ============================================================

import { firestoreEngine } from '../../../core/firebase/firestoreEngine';
import { authService } from '../../auth/services/authService';
import { AppNotification, NotificationType } from '../../properties/domain/models/relationships';

export interface CreateNotificationPayload {
  recipientUid: string;
  senderUid?: string;
  title: string;
  body: string;
  type: NotificationType;
  relatedEntityId?: string;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Récupère les notifications adressées à l'utilisateur connecté.
   * Filtre Cloud Firestore strict par recipientUid et tri décroissant.
   */
  public async getMyNotifications(): Promise<AppNotification[]> {
    const user = authService.getCurrentUser();
    if (!user || !user.id) return [];

    try {
      const docs = await firestoreEngine.runStructuredQuery<AppNotification>({
        collectionId: 'notifications',
        whereFilters: [
          {
            field: { fieldPath: 'recipientUid' },
            op: 'EQUAL',
            value: { stringValue: user.id },
          },
        ],
        limit: 50,
      });

      // Tri décroissant chronologique côté client pour robustesse
      return docs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } catch (e) {
      console.warn('[NotificationService] Erreur lors du chargement des notifications :', e);
      return [];
    }
  }

  /**
   * Retourne le nombre de notifications non lues.
   */
  public async getUnreadCount(): Promise<number> {
    const list = await this.getMyNotifications();
    return list.filter((n) => !n.read).length;
  }

  /**
   * Marque une notification spécifique comme lue.
   */
  public async markAsRead(id: string): Promise<boolean> {
    try {
      return await firestoreEngine.patchFields('notifications', id, { read: true });
    } catch (e) {
      console.warn(`[NotificationService] Échec du marquage lu pour ${id} :`, e);
      return false;
    }
  }

  /**
   * Marque toutes les notifications non lues de l'utilisateur comme lues.
   */
  public async markAllAsRead(): Promise<number> {
    const list = await this.getMyNotifications();
    const unread = list.filter((n) => !n.read);
    let count = 0;
    for (const notif of unread) {
      const ok = await this.markAsRead(notif.id);
      if (ok) count++;
    }
    return count;
  }

  /**
   * Supprime définitivement une notification de Cloud Firestore.
   */
  public async deleteNotification(id: string): Promise<boolean> {
    try {
      return await firestoreEngine.deleteDocument('notifications', id);
    } catch (e) {
      console.warn(`[NotificationService] Échec de la suppression de ${id} :`, e);
      return false;
    }
  }

  /**
   * Crée et envoie une nouvelle notification in-app dans Cloud Firestore.
   */
  public async createNotification(payload: CreateNotificationPayload): Promise<AppNotification | null> {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const notifData: AppNotification = {
      id: notifId,
      recipientUid: payload.recipientUid,
      senderUid: payload.senderUid,
      title: payload.title.trim(),
      body: payload.body.trim(),
      type: payload.type,
      relatedEntityId: payload.relatedEntityId,
      read: false,
      createdAt: nowIso,
    };

    const docPayload: Record<string, unknown> = {
      id: notifData.id,
      recipientUid: notifData.recipientUid,
      title: notifData.title,
      body: notifData.body,
      type: notifData.type,
      read: false,
      createdAt: nowIso,
    };

    if (payload.senderUid) docPayload.senderUid = payload.senderUid;
    if (payload.relatedEntityId) docPayload.relatedEntityId = payload.relatedEntityId;

    const ok = await firestoreEngine.setDocument('notifications', notifId, docPayload);
    return ok ? notifData : null;
  }
}

export const notificationService = NotificationService.getInstance();
