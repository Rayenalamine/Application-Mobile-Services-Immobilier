// ============================================================
// DARLINK — TRUSTED CLOUD FUNCTIONS (Notifications & FCM Push)
// Server-side Firestore triggers:
//   1. onContactRequestCreated -> creates recipient notification
//   2. onPropertyStatusUpdated -> notifies owner on moderation/status change
//   3. onNotificationCreated   -> delivers FCM push & cleans invalid tokens
// ============================================================

const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 1. Create a trusted notification when a contact request is submitted.
 * Deterministic doc ID (`notif_cr_${requestId}`) prevents duplicate notifications.
 */
exports.onContactRequestCreated = onDocumentCreated('contact_requests/{requestId}', async (event) => {
  const data = event.data?.data();
  if (!data || !data.propertyId) return;

  const propSnap = await db.doc(`properties/${data.propertyId}`).get();
  if (!propSnap.exists) return;

  const propData = propSnap.data() || {};
  const recipientUid = propData.ownerId;
  if (!recipientUid || recipientUid === data.senderId) return;

  const notifId = `notif_cr_${event.params.requestId}`;
  const notifRef = db.doc(`notifications/${notifId}`);
  const existing = await notifRef.get();
  if (existing.exists) return;

  await notifRef.set({
    id: notifId,
    recipientUid,
    senderUid: data.senderId || '',
    type: 'CONTACT_REQUEST',
    title: 'Nouvelle demande de visite',
    body: `${data.senderName || 'Un visiteur'} s'intéresse à ${propData.title || 'votre bien'}.`,
    relatedEntityId: data.propertyId,
    deepLink: `/properties/${data.propertyId}`,
    read: false,
    createdAt: new Date().toISOString(),
  });
});

/**
 * 2. Notify listing owner when moderation or availability status changes.
 */
exports.onPropertyStatusUpdated = onDocumentUpdated('properties/{propertyId}', async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;

  if (before.listingStatus === after.listingStatus) return;
  if (!after.ownerId) return;

  const statusLabels = {
    PUBLISHED: 'Votre annonce a été approuvée et publiée',
    REJECTED: 'Votre annonce nécessite des corrections',
    SOLD: 'Annonce marquée comme vendue',
    RENTED: 'Annonce marquée comme louée',
    EXPIRED: 'Votre annonce a expiré',
  };

  const title = statusLabels[after.listingStatus] || 'Mise à jour de votre annonce';
  const notifId = `notif_status_${event.params.propertyId}_${after.listingStatus}_${Date.now()}`;

  await db.doc(`notifications/${notifId}`).set({
    id: notifId,
    recipientUid: after.ownerId,
    type: 'LISTING_STATUS',
    title,
    body: `${after.title || 'Votre bien'} est désormais au statut ${after.listingStatus}.`,
    relatedEntityId: event.params.propertyId,
    deepLink: `/properties/${event.params.propertyId}`,
    read: false,
    createdAt: new Date().toISOString(),
  });
});

/**
 * 3. Deliver FCM push notification whenever a notification document is created,
 *    supporting multiple devices per user and automatic stale-token cleanup.
 */
exports.onNotificationCreated = onDocumentCreated('notifications/{notificationId}', async (event) => {
  const data = event.data?.data();
  if (!data || !data.recipientUid) return;

  const recipientUid = data.recipientUid;
  const tokensSnap = await db.collection(`users/${recipientUid}/fcmTokens`).get();
  if (tokensSnap.empty) {
    console.log(`[FCM] No registered device tokens for user ${recipientUid}`);
    return;
  }

  const tokens = tokensSnap.docs
    .map((d) => d.data()?.token || d.id)
    .filter((t) => typeof t === 'string' && t.length > 0);

  if (tokens.length === 0) return;

  const message = {
    notification: {
      title: data.title || 'DarLink',
      body: data.body || '',
    },
    data: {
      notificationId: event.params.notificationId,
      type: data.type || 'SYSTEM',
      relatedEntityId: data.relatedEntityId || '',
      deepLink: data.deepLink || '',
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'darlink_alerts',
        sound: 'default',
        color: '#2563EB',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  console.log(
    `[FCM] Sent to ${recipientUid}: success=${response.successCount}, failure=${response.failureCount}`
  );

  if (response.failureCount > 0) {
    const staleDeletes = [];
    response.responses.forEach((resp, idx) => {
      const code = resp.error?.code;
      if (
        !resp.success &&
        (code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token')
      ) {
        staleDeletes.push(db.doc(`users/${recipientUid}/fcmTokens/${tokens[idx]}`).delete());
      }
    });
    await Promise.all(staleDeletes);
  }
});

