# DARLINK — GUIDE MAÎTRE DE TESTS & DE VALIDATION REPRODUCTIBLE (QA)
## Commandes Officielles d'Exécution sur Windows PowerShell

Ce guide fournit à tout membre de l'équipe ou jury académique les commandes exactes et reproductibles pour tester l'intégralité du système DarLink de bout en bout.

---

### 1. PRÉ-REQUIS & SERVICES DU SYSTÈME

| Service | Port | Commande de Démarrage | Vérification de Santé |
| :--- | :---: | :--- | :--- |
| **PostgreSQL 18** | `5432` | `& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Program Files\PostgreSQL\18\data"` (ou `docker compose up -d`) | `Test-NetConnection -Port 5432` |
| **Backend Spring Boot**| `8085` | `cd backend/darlink-backend ; java -jar target/darlink-backend-2.0.0.jar` | `Invoke-RestMethod http://localhost:8085/api/v1/health` |
| **Metro Bundler (RN)** | `8081` | `cd react-native/darlink_react_native ; npx expo start --lan -c` | `Invoke-WebRequest http://localhost:8081` |
| **Flutter Web Server** | `3000` | `python -m http.server 3000 --directory "flutter/services_immobilier_flutter/build/web"` | `Invoke-WebRequest http://localhost:3000` |

---

### 2. COMMANDE MAÎTRESSE UNIQUE (HARNAIS COMPLET 8 PORTES)

Pour exécuter l'ensemble des 8 portes de qualité en une seule commande automatisée :
```powershell
cd Application-Mobile-Services-Immobilier
pwsh -File ./scripts/run_master_qa.ps1
```
Ce script exécute successivement :
1. Test de connectivité PostgreSQL 18 sur le port 5432.
2. Vérification de santé du backend Spring Boot 3.3.5 sur le port 8085.
3. Suite de tests Maven JUnit 5 du backend (`mvn test` : 13/13 validés).
4. Analyse statique Flutter Dart (`flutter analyze` : 0 erreur, 0 avertissement).
5. Suite complète de tests Flutter (`flutter test` : 30/30 validés).
6. Vérification strict TypeScript React Native (`npx tsc --noEmit` : 0 erreur).
7. Suite complète de tests React Native (`npm test` : 22/22 validés).
8. Exécution des 10 Parcours Utilisateur End-to-End réels contre PostgreSQL 18.

---

### 3. EXÉCUTION INDIVIDUELLE DES SUITES DE TESTS

#### A. Tests d'Intégration Backend (Spring Boot & JUnit 5)
```powershell
cd Application-Mobile-Services-Immobilier/backend/darlink-backend
mvn test
# Résultat attendu : BUILD SUCCESS (13 tests passés, 0 échec, 0 skipped)
```

#### B. Tests Statiques et Analyse Flutter (Dart)
```powershell
cd Application-Mobile-Services-Immobilier/flutter/services_immobilier_flutter
flutter analyze
# Résultat attendu : No issues found! (0 erreur, 0 avertissement)
```

#### C. Tests d'Interface et d'Intégration Flutter
```powershell
cd Application-Mobile-Services-Immobilier/flutter/services_immobilier_flutter
flutter test
# Résultat attendu : All tests passed! (30 tests passés, 0 échec)
```

#### D. Validation TypeScript Stricte React Native
```powershell
cd Application-Mobile-Services-Immobilier/react-native/darlink_react_native
npx tsc --noEmit
# Résultat attendu : Code de sortie 0 (Zéro erreur de typage sur l'ensemble du projet)
```

#### E. Tests Automatisés Métiers & Services React Native
```powershell
cd Application-Mobile-Services-Immobilier/react-native/darlink_react_native
npm test
# Résultat attendu : RÉSULTAT GLOBAL : 22/22 tests réussis (0 échecs)
```

#### F. Exécution des 10 Parcours Utilisateurs Complets (Journeys 1 à 10)
```powershell
cd Application-Mobile-Services-Immobilier
pwsh -File ./scripts/e2e_journeys_1_to_10.ps1
# Résultat attendu : LES 10 PARCOURS UTILISATEUR END-TO-END SONT VALIDÉS AVEC SUCCÈS À 100% !
```
