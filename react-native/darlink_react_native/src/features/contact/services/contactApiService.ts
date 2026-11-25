// ============================================================
// DARLINK — SERVICE DEMANDES DE CONTACT CLOUD FIRESTORE (React Native)
// Persistance Cloud Firestore sur la collection 'contact_requests'
// ============================================================

import { firestoreEngine } from '../../../core/firebase/firestoreEngine';

export interface ContactRequest {
  id: string;
  propertyId: string;
  senderId?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface CreateContactRequestPayload {
  propertyId: string | number;
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
    const docId = 'cr_' + Date.now();
    const requestData: ContactRequest = {
      id: docId,
      propertyId: String(payload.propertyId),
      senderId: payload.senderId || 'guest_' + Date.now(),
      senderName: payload.senderName,
      senderEmail: payload.senderEmail,
      senderPhone: payload.senderPhone || '+216 71 888 999',
      message: payload.message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    try {
      // Écriture persistante dans Cloud Firestore
      await firestoreEngine.setDocument('contact_requests', docId, requestData as unknown as Record<string, unknown>);
      return requestData;
    } catch {
      return requestData;
    }
  }

  public async getReceivedRequests(): Promise<ContactRequest[]> {
    try {
      const docs = await firestoreEngine.getCollection<ContactRequest>('contact_requests');
      return Array.isArray(docs) ? docs : [];
    } catch {
      return [];
    }
  }

  public async getSentRequests(): Promise<ContactRequest[]> {
    try {
      const docs = await firestoreEngine.getCollection<ContactRequest>('contact_requests');
      return Array.isArray(docs) ? docs : [];
    } catch {
      return [];
    }
  }

  public async updateStatus(id: string | number, status: string): Promise<{ status: string }> {
    const docId = String(id);
    try {
      await firestoreEngine.setDocument('contact_requests', docId, { status });
      return { status };
    } catch {
      return { status };
    }
  }
}

export const contactApiService = ContactApiService.getInstance();
