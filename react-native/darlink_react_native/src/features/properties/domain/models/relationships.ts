// ============================================================
// DARLINK — MODÈLES RELATIONNELS CLOUD FIRESTORE (React Native)
// Agences, Notifications et Signalements de modération
// ============================================================

export interface Agency {
  readonly id: string;
  readonly name: string;
  readonly licenseNumber?: string;
  readonly governorate: string;
  readonly city: string;
  readonly phone?: string;
  readonly email?: string;
  readonly verified: boolean;
  readonly ownerUid: string;
  readonly agentUids?: string[];
  readonly createdAt: string;
}

export type NotificationType =
  | 'CONTACT_REQUEST'
  | 'LISTING_STATUS'
  | 'PROPERTY_UPDATE'
  | 'SAVED_SEARCH'
  | 'ACCOUNT_SECURITY'
  | 'SYSTEM';

export interface AppNotification {
  readonly id: string;
  readonly recipientUid: string;
  readonly senderUid?: string;
  readonly title: string;
  readonly body: string;
  readonly type: NotificationType;
  readonly relatedEntityId?: string;
  readonly read: boolean;
  readonly createdAt: string;
}

export interface ModerationReport {
  readonly id: string;
  readonly propertyId: string;
  readonly reporterUid: string;
  readonly reason: string;
  readonly details?: string;
  readonly status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  readonly createdAt: string;
}

