// ============================================================
// DARLINK — SERVICE API DEMANDES DE CONTACT (React Native)
// ============================================================

import { api } from '../../../core/network/apiClient';

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
    try {
      const res = await api.post<ContactRequest>('/contact-requests', {
        ...payload,
        propertyId: Number(payload.propertyId),
      });
      return res;
    } catch {
      // Fallback local
      return {
        id: String(Date.now()),
        propertyId: String(payload.propertyId),
        senderName: payload.senderName,
        senderEmail: payload.senderEmail,
        senderPhone: payload.senderPhone,
        message: payload.message,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
    }
  }

  public async getReceivedRequests(): Promise<ContactRequest[]> {
    try {
      const res = await api.get<ContactRequest[]>('/contact-requests/received');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  public async getSentRequests(): Promise<ContactRequest[]> {
    try {
      const res = await api.get<ContactRequest[]>('/contact-requests/sent');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }
}

export const contactApiService = ContactApiService.getInstance();

