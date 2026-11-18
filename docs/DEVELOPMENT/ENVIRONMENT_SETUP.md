# GUIDE DE CONFIGURATION DE L'ENVIRONNEMENT (ENVIRONMENT SETUP)

Ce guide détaille la mise en place et la vérification des outils sur une machine Windows 11 pour développer sur DarLink.

---

## 1. OUTILS DÉJÀ VÉRIFIÉS ET OPÉRATIONNELS

L'audit système réalisé le 18 novembre 2026 confirme la présence opérationnelle de :
- **Flutter SDK :** Version 3.47.5 (`C:\Users\DELL\develop\flutter`), Dart 3.13.4.
- **Node.js & npm :** Node v22.20.0, npm 10.9.3.
- **Java JDK :** Oracle JDK 21.0.8 LTS (`C:\Program Files\Java\jdk-21`).
- **Apache Maven :** Version 3.9.6.

---

## 2. CONFIGURATION ET DÉMARRAGE DE POSTGRESQL

Le binaire CLI `psql 18.1` est présent, mais le service Windows est par défaut à l'état `Stopped`.

### Procédure de démarrage sous PowerShell (Mode Administrateur) :
```powershell
# 1. Vérifier le statut du service
Get-Service *postgres*

# 2. Démarrer le service PostgreSQL
Start-Service postgresql-x64-18

# 3. Créer la base de données darlink_db
psql -U postgres -c "CREATE DATABASE darlink_db;"
```

---

## 3. RÉSOLUTION DE LA CHAÎNE D'OUTILS ANDROID (OPTIONNEL POUR NATIVE)

Actuellement, `flutter doctor -v` signale deux anomalies non bloquantes pour le Web mais nécessaires pour compiler un APK natif :
1. **Composant `cmdline-tools` manquant :**
   - Ouvrir **Android Studio** $\rightarrow$ *Settings* (ou *Preferences*) $\rightarrow$ *Appearance & Behavior* $\rightarrow$ *System Settings* $\rightarrow$ *Android SDK*.
   - Cliquer sur l'onglet **SDK Tools**.
   - Cocher **Android SDK Command-line Tools (latest)** et cliquer sur **Apply**.
2. **Licences non acceptées :**
   - Dans le terminal, exécuter :
     ```bash
     flutter doctor --android-licenses
     ```
   - Accepter les licences en tapant `y` à chaque invitation.

*(Tant que cette étape n'est pas effectuée, l'équipe valide les interfaces via Chrome/Edge Web et Expo Go sur mobile via Wi-Fi).*

