# DARLINK — ARCHITECTURE DES NOTIFICATIONS PUSH FIREBASE (FCM) & IN-APP

Ce document formalise l'architecture complète, la sécurité, et les étapes de déploiement du système de notifications push et in-app pour DarLink sur **Flutter** (Android/iOS/Web) et **React Native** (Expo).

---

## 1. Vue d'ensemble de l'architecture

Le système repose sur un modèle hybride :
1. **Notifications In-App (Cloud Firestore) :** Collection `/notifications/{notificationId}` accessible en lecture/écriture sécurisée par le destinataire (`recipientUid`).
2. **Notifications Push Natives (Firebase Cloud Messaging - FCM HTTP v1) :** Déclenchées automatiquement par Cloud Functions dès l'insertion d'un document dans `/notifications`.

```
                    ┌────────────────────────┐
                    │ Application DarLink    │
                    │ (Flutter / Expo RN)    │
                    └───────────┬────────────┘
                                │ 1. Inscription / Login :
                                │    Enregistrement du FCM Token
                                ▼
                    ┌────────────────────────┐
                    │  Firestore:            │
                    │  /users/{uid}/tokens   │
                    └────────────────────────┘

[Événement Métier] 
(Demande de visite, validation d'annonce, baisse de prix)
        │
        ▼
┌────────────────────────┐
│ Firestore :            │
│ /notifications/{id}    │ ◄─── Lu en direct par l'interface in-app
└───────────┬────────────┘
            │ 2. Déclenchement automatique (Trigger onWrite / onCreate)
            ▼
┌────────────────────────┐
│ Cloud Function Node.js │
│ (Firebase Admin SDK)   │
└───────────┬────────────┘
            │ 3. Récupération des tokens du destinataire (recipientUid)
            │    et envoi push FCM HTTP v1
            ▼
┌────────────────────────┐
│ Firebase Cloud         │
│ Messaging (FCM)        │
└─────┬────────────┬─────┘
      │            │
      ▼            ▼
 [Android]       [iOS]
```

---

## 2. Modèle de données Firestore

### Document `/notifications/{notificationId}`

| Champ | Type | Description |
|---|---|---|
| `id` | `string` | Identifiant unique (`notif_<timestamp>_<random>`) |
| `recipientUid` | `string` | UID Firebase du destinataire (obligatoire, sécurisé par Firestore Rules) |
| `senderUid` | `string` (optionnel) | UID de l'expéditeur (ex: visiteur ou modérateur) |
| `title` | `string` | Titre court de la notification (ex: *Nouvelle demande de visite*) |
| `body` | `string` | Corps descriptif (ex: *Mohamed s'intéresse à votre villa à La Marsa.*) |
| `type` | `string` | Catégorie : `CONTACT_REQUEST`, `LISTING_STATUS`, `PROPERTY_UPDATE`, `SAVED_SEARCH`, `ACCOUNT_SECURITY`, `SYSTEM` |
| `relatedEntityId` | `string` (optionnel) | ID de la ressource liée (ex: ID du bien ou ID de la demande) |
| `read` | `boolean` | `false` par défaut, `true` après lecture |
| `createdAt` | `string` (ISO 8601) | Horodatage de création |

### Sous-collection `/users/{userId}/fcmTokens/{tokenId}`

| Champ | Type | Description |
|---|---|---|
| `token` | `string` | Jeton d'enregistrement FCM fourni par le SDK client |
| `platform` | `string` | `android`, `ios`, ou `web` |
| `updatedAt` | `timestamp` | Horodatage du dernier rafraîchissement |

---

## 3. Déclencheur Cloud Function (Firebase Admin SDK)

Fichier de déploiement recommandé (`functions/index.js`) :

```javascript
const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.onNotificationCreated = functions.firestore.onDocumentCreated(
  'notifications/{notificationId}',
  async (event) => {
    const data = event.data?.data();
    if (!data || !data.recipientUid) return;

    const recipientUid = data.recipientUid;
    const tokensSnapshot = await admin.firestore()
      .collection(`users/${recipientUid}/fcmTokens`)
      .get();

    if (tokensSnapshot.empty) {
      console.log(`Aucun token FCM enregistré pour l'utilisateur ${recipientUid}`);
      return;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    const message = {
      notification: {
        title: data.title,
        body: data.body,
      },
      data: {
        notificationId: event.params.notificationId,
        type: data.type || 'SYSTEM',
        relatedEntityId: data.relatedEntityId || '',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'darlink_alerts',
          icon: 'ic_notification',
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
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Notifications push envoyées : ${response.successCount} succès, ${response.failureCount} échecs`);

    // Nettoyage automatique des jetons expirés (UNREGISTERED)
    if (response.failureCount > 0) {
      const tokensToRemove = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          tokensToRemove.push(tokens[idx]);
        }
      });
      await Promise.all(tokensToRemove.map(token => 
        admin.firestore().doc(`users/${recipientUid}/fcmTokens/${token}`).delete()
      ));
    }
  }
);
```

---

## 4. Configuration Client : Flutter

### 1. Dépendances (`pubspec.yaml`)
```yaml
dependencies:
  firebase_core: ^3.12.1
  firebase_messaging: ^15.2.4
  flutter_local_notifications: ^18.0.1
```

### 2. Initialisation & Enregistrement du Token
```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> setupFCM(String userUid) async {
  final messaging = FirebaseMessaging.instance;

  // Demande de permission (iOS / Android 13+)
  final settings = await messaging.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  if (settings.authorizationStatus == AuthorizationStatus.authorized) {
    final token = await messaging.getToken();
    if (token != null) {
      await FirestoreClient.instance.setDocument(
        'users/$userUid/fcmTokens',
        token,
        {'token': token, 'platform': 'android', 'updatedAt': DateTime.now().toIso8601String()},
      );
    }
  }

  // Écoute des notifications en premier plan
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    NotificationService.instance.refreshUnreadCount();
  });
}
```

---

## 5. Configuration Client : React Native (Expo)

### 1. Dépendances (`package.json`)
```bash
npx expo install expo-notifications expo-device
```

### 2. Obtention du token push Expo / FCM
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { firestoreEngine } from './src/core/firebase/firestoreEngine';

export async function registerForPushNotificationsAsync(userId: string) {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  const pushToken = (await Notifications.getDevicePushTokenAsync()).data;

  // Persistance dans Firestore
  await firestoreEngine.setDocument(`users/${userId}/fcmTokens`, String(pushToken), {
    token: pushToken,
    platform: Platform.OS,
    updatedAt: new Date().toISOString(),
  });
}
```

---

## 6. Routage & Deep-Linking

Lorsqu'un utilisateur tape sur une notification reçue :
- Si `type == 'CONTACT_REQUEST'` ou `relatedEntityId` est un ID de bien :
  - L'application navigue directement vers `PropertyDetailsScreen` (React Native) ou `EcranDetails` (Flutter) en chargeant le bien ciblé.
- Si `type == 'ACCOUNT_SECURITY'` :
  - L'application navigue vers l'écran de profil / sécurité.
- Dans tous les cas :
  - Le document correspondant dans `/notifications/{id}` passe à `read = true`.
  - Le badge numérique de l'icône cloche s'actualise instantanément.
