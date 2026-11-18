# GUIDE D'EXÉCUTION DES SOUS-SYSTÈMES (RUNNING PROJECT)

---

## 1. EXÉCUTION DE L'APPLICATION FLUTTER

Depuis la racine du projet :

```bash
# 1. Se positionner dans le répertoire officiel Flutter
cd flutter/services_immobilier_flutter

# 2. Lancer sur Chrome (Interactif)
flutter run -d chrome

# 3. Ou lancer en serveur Web accessible sur le réseau local Wi-Fi (port 8085)
flutter run -d web-server --web-hostname 0.0.0.0 --web-port 8085
```

Sur un smartphone connecté au même Wi-Fi, ouvrir : `http://172.16.160.138:8085`.

---

## 2. EXÉCUTION DE L'APPLICATION REACT NATIVE (VERSION 2)

Dès l'initialisation de `react-native/darlink_react_native/` :

```bash
# 1. Se positionner dans le répertoire React Native
cd react-native/darlink_react_native

# 2. Démarrer le serveur de développement Metro / Expo
npx expo start
```
- Scanner le QR Code avec **Expo Go** sur votre smartphone, ou taper `w` pour ouvrir dans le navigateur.

---

## 3. EXÉCUTION DU BACKEND SPRING BOOT (VERSION 3)

Dès l'initialisation de `backend/darlink-backend/` :

```bash
# 1. Vérifier que PostgreSQL est démarré
Get-Service postgresql-x64-18

# 2. Se positionner dans le répertoire backend
cd backend/darlink-backend

# 3. Lancer l'application Spring Boot
mvn spring-boot:run
```
- Endpoint de santé : `http://localhost:8080/api/v1/health`
- Swagger UI : `http://localhost:8080/swagger-ui.html`

---

## 4. TABLE DE RÉSOLUTION D'ADRESSE RÉSEAU POUR LES MOBILES

| Environnement client mobile | Adresse cible pour contacter l'API Spring Boot (Port 8080) |
|---|---|
| Navigateur Web (Chrome/Edge sur PC) | `http://localhost:8080/api/v1` |
| Émulateur Android officiel (AVD) | `http://10.0.2.2:8080/api/v1` |
| Smartphone physique (Expo Go ou Web via Wi-Fi) | `http://172.16.160.138:8080/api/v1` |

