# DARLINK — INVENTAIRE GÉNÉRAL DES FONCTIONNALITÉS & ÉLÉMENTS INTERACTIFS (QA)
## Référentiel Exhaustif des Composants, Clés d'Automatisation et Comportements Attendus

---

### 1. TABLEAU DE BORD DES ÉCRANS DU PROJET

| Écran | Module | Route / Onglet | Nombre d'éléments interactifs | Statut QA |
| :--- | :--- | :--- | :---: | :---: |
| **Accueil (Feed)** | `properties` / `navigation` | Onglet 1 (Accueil) | 12 | **VERIFIED** |
| **Fiche Détails du Bien** | `properties` | Push depuis Carte | 11 | **VERIFIED** |
| **Modal Prise de Contact**| `contact` | Modal / Bottom Sheet | 6 | **VERIFIED** |
| **Recherche & Filtres** | `search` / `navigation` | Onglet 2 (Recherche) | 22 | **VERIFIED** |
| **Mes Favoris** | `favorites` / `navigation`| Onglet 3 (Favoris) | 4 | **VERIFIED** |
| **Profil Utilisateur** | `auth` / `navigation` | Onglet 4 (Profil) | 10 | **VERIFIED** |
| **Dépôt / Édition Annonce**| `properties` | Action TopBar / Profil | 16 | **VERIFIED** |
| **Carte Interactive GPS** | `map` | Action TopBar / Search | 8 | **VERIFIED** |

---

## 2. INVENTAIRE DÉTAILLÉ DE CHAQUE ÉLÉMENT INTERACTIF

| ID Élément | Écran | Type d'élément | Comportement Attendu | Dépendance Backend / DB | Test ID | Statut |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `home_search_bar` | Accueil | Champ / Bouton | Ouvre l'écran de recherche avancée avec focus | Aucun (Navigation) | `UI-HOME-01` | **VERIFIED** |
| `home_theme_toggle_btn` | Accueil | Bouton Icône | Bascule entre thème Clair (Défaut) et Sombre | Local / `ThemeContext` | `UI-HOME-02` | **VERIFIED** |
| `home_publish_btn` | Accueil | Bouton Action | Ouvre l'écran de dépôt de bien immobilier | Auth vérifiée | `UI-HOME-03` | **VERIFIED** |
| `home_map_btn` | Accueil | Bouton Icône | Ouvre la carte interactive des repères GPS | `GET /properties/map` | `UI-HOME-04` | **VERIFIED** |
| `home_category_all_chip`| Accueil | Filtre Chip | Affiche l'ensemble des biens du feed | `GET /properties` | `UI-HOME-05` | **VERIFIED** |
| `home_category_apt_chip`| Accueil | Filtre Chip | Filtre le feed sur le type "Appartement" | `GET /properties?type=Appartement` | `UI-HOME-06` | **VERIFIED** |
| `home_category_villa_chip`| Accueil | Filtre Chip | Filtre le feed sur le type "Villa" | `GET /properties?type=Villa` | `UI-HOME-07` | **VERIFIED** |
| `home_property_card` | Accueil | Carte interactive| Ouvre l'écran de détails avec les données | `GET /properties/{id}` | `UI-HOME-08` | **VERIFIED** |
| `home_card_fav_btn` | Accueil | Bouton Cœur | Ajoute ou retire le bien des favoris DB | `POST/DELETE /favorites/{id}` | `UI-HOME-09` | **VERIFIED** |
| `prop_details_back_btn` | Détails | Bouton Retour | Ferme la fiche et revient à l'écran appelant | Aucun (Navigation) | `UI-PROP-01` | **VERIFIED** |
| `prop_fav_toggle_btn` | Détails | Bouton Flottant| Alterne l'état favori et persiste en DB | `POST/DELETE /favorites/{id}` | `UI-PROP-02` | **VERIFIED** |
| `prop_call_agent_btn` | Détails | Bouton Action | Ouvre l'application d'appel avec le tel agent | `agent_phone` | `UI-PROP-03` | **VERIFIED** |
| `prop_contact_modal_btn`| Détails | Bouton Principal| Ouvre le formulaire de demande de visite | Auth requise | `UI-PROP-04` | **VERIFIED** |
| `prop_owner_edit_btn` | Détails | Bouton Icône | Ouvre le formulaire en mode édition (Owner) | `owner_id == user.id` | `UI-PROP-05` | **VERIFIED** |
| `prop_owner_delete_btn` | Détails | Bouton Icône | Boîte de dialogue confirmation et delete DB | `DELETE /properties/{id}` | `UI-PROP-06` | **VERIFIED** |
| `contact_name_input` | Modal Contact| Champ Texte | Saisie du nom du demandeur (pré-rempli) | Aucun | `UI-CONT-01` | **VERIFIED** |
| `contact_email_input` | Modal Contact| Champ Texte | Saisie de l'email de contact valide | Aucun | `UI-CONT-02` | **VERIFIED** |
| `contact_phone_input` | Modal Contact| Champ Texte | Saisie du numéro de téléphone | Aucun | `UI-CONT-03` | **VERIFIED** |
| `contact_message_input` | Modal Contact| Champ Multi-lignes| Saisie de la demande de visite ou question | Aucun | `UI-CONT-04` | **VERIFIED** |
| `contact_submit_btn` | Modal Contact| Bouton Action | Enregistre dans `contact_requests` (statut PENDING) | `POST /contact-requests` | `UI-CONT-05` | **VERIFIED** |
| `search_input` | Recherche | Champ Texte | Recherche en direct sur titre, ville, desc | `GET /properties?search=` | `UI-SRCH-01` | **VERIFIED** |
| `search_segment_buy` | Recherche | Segment Tab | Filtre sur les annonces de vente (`isRental=false`)| `isRental=false` | `UI-SRCH-02` | **VERIFIED** |
| `search_segment_rent` | Recherche | Segment Tab | Filtre sur les annonces de location (`isRental=true`)| `isRental=true` | `UI-SRCH-03` | **VERIFIED** |
| `search_city_chip` | Recherche | Filtre Chip | Filtre par ville (Tunis, Sousse, Djerba, etc.) | `GET /properties?city=` | `UI-SRCH-04` | **VERIFIED** |
| `search_type_chip` | Recherche | Filtre Chip | Filtre par type (Appartement, Villa, Maison) | `GET /properties?type=` | `UI-SRCH-05` | **VERIFIED** |
| `search_bedrooms_chip` | Recherche | Filtre Chip | Filtre par nombre minimum de chambres | `GET /properties?minBedrooms=` | `UI-SRCH-06` | **VERIFIED** |
| `search_min_price_input`| Recherche | Champ Numérique| Borne inférieure du prix en TND | `GET /properties?minPrice=` | `UI-SRCH-07` | **VERIFIED** |
| `search_max_price_input`| Recherche | Champ Numérique| Borne supérieure du prix en TND | `GET /properties?maxPrice=` | `UI-SRCH-08` | **VERIFIED** |
| `search_reset_btn` | Recherche | Bouton Texte | Réinitialise l'ensemble des critères | Aucun | `UI-SRCH-09` | **VERIFIED** |
| `fav_refresh_btn` | Favoris | Bouton Icône | Rafraîchit la liste depuis le backend | `GET /favorites` | `UI-FAV-01` | **VERIFIED** |
| `fav_card_click` | Favoris | Carte interactive| Ouvre les détails du bien sélectionné | `GET /properties/{id}` | `UI-FAV-02` | **VERIFIED** |
| `fav_empty_state_action`| Favoris | Bouton / Carte | Indique l'absence d'éléments et invite au feed | Local | `UI-FAV-03` | **VERIFIED** |
| `profile_edit_btn` | Profil | Bouton Action | Ouvre le modal de mise à jour des coordonnées | Auth requise | `UI-PROF-01` | **VERIFIED** |
| `profile_edit_name_in` | Profil | Champ Texte | Modification du nom complet | Aucun | `UI-PROF-02` | **VERIFIED** |
| `profile_edit_phone_in`| Profil | Champ Texte | Modification du numéro de téléphone | Aucun | `UI-PROF-03` | **VERIFIED** |
| `profile_edit_save_btn`| Profil | Bouton Action | Sauvegarde les modifications dans PostgreSQL | `PUT /users/me` | `UI-PROF-04` | **VERIFIED** |
| `profile_inquiries_btn`| Profil | Carte Action | Ouvre la liste des demandes de visite reçues | `GET /contact-requests/received` | `UI-PROF-05` | **VERIFIED** |
| `profile_inquiry_accept`| Profil | Bouton Action | Valide la demande de visite reçue | `PATCH /contact-requests/{id}/status` | `UI-PROF-06` | **VERIFIED** |
| `profile_logout_btn` | Profil | Bouton Rouge | Déconnecte l'utilisateur et purge le token JWT | Local `AuthState` | `UI-PROF-07` | **VERIFIED** |
| `add_title_input` | Dépôt Bien | Champ Texte | Saisie du titre de l'annonce | Validation obligatoire | `UI-ADD-01` | **VERIFIED** |
| `add_type_selector` | Dépôt Bien | Sélecteur Type| Choix du type de propriété | Validation obligatoire | `UI-ADD-02` | **VERIFIED** |
| `add_city_selector` | Dépôt Bien | Sélecteur Ville| Choix de la ville en Tunisie | Validation obligatoire | `UI-ADD-03` | **VERIFIED** |
| `add_price_input` | Dépôt Bien | Champ Numérique| Saisie du prix ou loyer en Dinars Tunisiens | Validation > 0 | `UI-ADD-04` | **VERIFIED** |
| `add_surface_input` | Dépôt Bien | Champ Numérique| Saisie de la superficie en m² | Validation > 0 | `UI-ADD-05` | **VERIFIED** |
| `add_bedrooms_counter` | Dépôt Bien | Boutons +/- | Ajustement du nombre de chambres | Valeur min = 1 | `UI-ADD-06` | **VERIFIED** |
| `add_bathrooms_counter`| Dépôt Bien | Boutons +/- | Ajustement du nombre de salles de bain | Valeur min = 1 | `UI-ADD-07` | **VERIFIED** |
| `add_desc_input` | Dépôt Bien | Champ Multi-lignes| Description détaillée du bien | Validation obligatoire | `UI-ADD-08` | **VERIFIED** |
| `add_submit_btn` | Dépôt Bien | Bouton Principal| Persistance du bien dans PostgreSQL | `POST /properties` (ou `PUT`) | `UI-ADD-09` | **VERIFIED** |
| `map_city_chip` | Carte GPS | Filtre Chip | Centre la vue cartographique sur la ville | Local | `UI-MAP-01` | **VERIFIED** |
| `map_property_pin` | Carte GPS | Repère Pin | Ouvre le volet aperçu flottant du bien | `GET /properties/map` | `UI-MAP-02` | **VERIFIED** |
| `map_preview_open_btn` | Carte GPS | Bouton Carte | Ouvre la fiche complète du bien ciblé | Navigation Détails | `UI-MAP-03` | **VERIFIED** |
