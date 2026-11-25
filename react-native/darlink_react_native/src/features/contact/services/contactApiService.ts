// ============================================================
// DARLINK — SERVICE DEMANDES DE CONTACT & NOTIFICATIONS (React Native)
// Intégrité référentielle Cloud Firestore & notifications propriétaire
// ============================================================

import { firestoreEngine } from '../../../core/firebase/firestoreEngine';
import { authService } from '../../auth/services/authService';
import { AppNotification } from '../../properties/domain/models/relationships';

export interface ContactRequest {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  propertyOwnerId?: string;
  senderId?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  status: 'PENDING' | 'CONTACTED' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED';
  createdAt: string;
}

export interface CreateContactRequestPayload {
  propertyId: string | number;
  propertyTitle?: string;
  propertyOwnerId?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  senderId?: string;
}

class ContactApiService {
  private static instance: ContactApiService;

  private constructor() {}

  public static getInstance(): ContactApiService {
    if (!ContactApiService.instance) {
      ContactApiService.instance = new ContactApiService();
    }
    return ContactApiService.instance;
  }

  public async sendContactRequest(payload: CreateContactRequestPayload): Promise<ContactRequest> {
    const cleanEmail = payload.senderEmail.trim();
    const cleanMessage = payload.message.trim();
    if (!cleanMessage || !/^.+@.+\..+$/.test(cleanEmail)) {
      throw new Error('E-mail et message obligatoires pour envoyer une demande.');
    }

    const user = authService.getCurrentUser();
    const docId = `cr_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const requestData: ContactRequest = {
      id: docId,
      propertyId: String(payload.propertyId),
      propertyTitle: payload.propertyTitle,
      propertyOwnerId: payload.propertyOwnerId,
      senderId: user?.id || payload.senderId,
      senderName: payload.senderName.trim(),
      senderEmail: cleanEmail,
      senderPhone: payload.senderPhone?.trim(),
      message: cleanMessage,
      status: 'PENDING',
      createdAt: nowIso,
    };

    const firestorePayload: Record<string, unknown> = {
      id: docId,
      propertyId: requestData.propertyId,
      senderName: requestData.senderName,
      senderEmail: requestData.senderEmail,
      message: requestData.message,
      status: 'PENDING',
      createdAt: nowIso,
    };
    if (requestData.propertyTitle) firestorePayload.propertyTitle = requestData.propertyTitle;
    if (requestData.propertyOwnerId) firestorePayload.propertyOwnerId = requestData.propertyOwnerId;
    if (requestData.senderId) firestorePayload.senderId = requestData.senderId;
    if (requestData.senderPhone) firestorePayload.senderPhone = requestData.senderPhone;

    const ok = await firestoreEngine.setDocument('contact_requests', docId, firestorePayload);
    if (!ok) {
      throw new Error('Demande refusée : vérifiez que le bien existe et que les champs sont valides.');
    }

    if (user && payload.propertyOwnerId) {
      const notifId = `notif_${Date.now()}`;
      await firestoreEngine.setDocument('notifications', notifId, {
        id: notifId,
        recipientUid: payload.propertyOwnerId,
        senderUid: user.id,
        title: 'Nouvelle demande de visite',
        body: `${requestData.senderName} souhaite des informations sur ${payload.propertyTitle || 'votre bien'}.`,
        type: 'CONTACT_REQUEST',
        relatedEntityId: docId,
        read: false,
        createdAt: nowIso,
      });
    }

    return requestData;
  }

  public async getReceivedRequests(): Promise<ContactRequest[]> {
    const user = authService.getCurrentUser();
    if (!user) return [];
    return firestoreEngine.runStructuredQuery<ContactRequest>({
      collectionId: 'contact_requests',
      whereFilters: [
        {
          field: { fieldPath: 'propertyOwnerId' },
          op: 'EQUAL',
          value: { stringValue: user.id },
        },
      ],
      limit: 50,
    });
  }

  public async getSentRequests(): Promise<ContactRequest[]> {
    const user = authService.getCurrentUser();
    if (!user) return [];
    return firestoreEngine.runStructuredQuery<ContactRequest>({
      collectionId: 'contact_requests',
      whereFilters: [
        {
          field: { fieldPath: 'senderId' },
          op: 'EQUAL',
          value: { stringValue: user.id },
        },
      ],
      limit: 50,
    });
  }

  public async updateStatus(
    id: string | number,
    status: ContactRequest['status']
  ): Promise<{ status: ContactRequest['status'] }> {
    const docId = String(id);
    await firestoreEngine.patchFields('contact_requests', docId, { status });
    return { status };
  }

  public async getMyNotifications(): Promise<AppNotification[]> {
    const user = authService.getCurrentUser();
    if (!user) return [];
    return firestoreEngine.runStructuredQuery<AppNotification>({
      collectionId: 'notifications',
      whereFilters: [
        {
          field: { fieldPath: 'recipientUid' },
          op: 'EQUAL',
          value: { stringValue: user.id },
        },
      ],
      limit: 40,
    });
  }

  public async markNotificationRead(id: string): Promise<void> {
    await firestoreEngine.patchFields('notifications', id, { read: true });
  }
}

export const contactApiService = ContactApiService.getInstance();
