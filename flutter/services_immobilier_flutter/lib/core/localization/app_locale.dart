// ============================================================
// DARLINK — SERVICE DE LOCALISATION & TRILINGUISME COMPLET
// Support intégral Français, Arabe (العربية RTL) et Anglais (English LTR)
// Persistance SharedPreferences, dictionnaire exhaustif et formateurs
// ============================================================

import 'dart:ui' show PlatformDispatcher;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppLocale extends ChangeNotifier {
  static final AppLocale instance = AppLocale._internal();
  AppLocale._internal();

  String _currentLang = 'fr';

  String get currentLang => _currentLang;
  bool get isRtl => _currentLang == 'ar';
  TextDirection get textDirection => isRtl ? TextDirection.rtl : TextDirection.ltr;
  Locale get locale => Locale(_currentLang);

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString('darlink_app_lang');
      if (saved != null && _translations.containsKey(saved)) {
        _currentLang = saved;
        notifyListeners();
        return;
      }
      final deviceLang = PlatformDispatcher.instance.locale.languageCode.toLowerCase();
      if (_translations.containsKey(deviceLang)) {
        _currentLang = deviceLang;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> setLanguage(String langCode) async {
    if (_translations.containsKey(langCode) && _currentLang != langCode) {
      _currentLang = langCode;
      notifyListeners();
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('darlink_app_lang', langCode);
      } catch (_) {}
    }
  }

  void toggleLanguage() {
    if (_currentLang == 'fr') {
      setLanguage('ar');
    } else if (_currentLang == 'ar') {
      setLanguage('en');
    } else {
      setLanguage('fr');
    }
  }

  String tr(String key) {
    final langMap = _translations[_currentLang];
    if (langMap != null && langMap.containsKey(key)) {
      return langMap[key]!;
    }
    return _translations['fr']?[key] ?? key;
  }

  String trParams(String key, Map<String, Object> params) {
    var result = tr(key);
    params.forEach((k, v) {
      result = result.replaceAll('{$k}', v.toString());
    });
    return result;
  }

  String translatePropertyType(String type) {
    switch (type.toLowerCase().trim()) {
      case 'tous':
      case 'all':
        return tr('filter_all');
      case 'appartement':
      case 'apartment':
        return tr('filter_apartment');
      case 'villa':
        return tr('filter_villa');
      case 'maison':
      case 'house':
        return tr('filter_house');
      case 'studio':
        return tr('filter_studio');
      case 'terrain':
      case 'land':
        return tr('filter_land');
      case 'commercial':
        return tr('filter_commercial');
      default:
        return type;
    }
  }

  String translateListingStatus(String status) {
    switch (status.toUpperCase().trim()) {
      case 'DRAFT':
        return tr('status_draft');
      case 'PENDING_REVIEW':
        return tr('status_pending');
      case 'PUBLISHED':
        return tr('status_published');
      case 'REJECTED':
        return tr('status_rejected');
      case 'SOLD':
        return tr('status_sold');
      case 'RENTED':
        return tr('status_rented');
      case 'ARCHIVED':
        return tr('status_archived');
      default:
        return status;
    }
  }

  String formatCurrency(num price, {bool isRental = false}) {
    final formatted = price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]} ',
    );

    if (_currentLang == 'ar') {
      return isRental ? '$formatted د.ت/شهر' : '$formatted د.ت';
    } else if (_currentLang == 'en') {
      return isRental ? '$formatted TND/mo' : '$formatted TND';
    } else {
      return isRental ? '$formatted DT/mois' : '$formatted DT';
    }
  }

  String translateAmenity(String amenity) {
    final clean = amenity.trim();
    final lower = clean.toLowerCase();

    if (_currentLang == 'ar') {
      if (lower.contains('clim')) return 'تكييف';
      if (lower.contains('piscine') || lower.contains('pool')) return 'مسبح';
      if (lower.contains('mer') || lower.contains('sea')) return 'إطلالة بحرية';
      if (lower.contains('jardin') || lower.contains('garden')) return 'حديقة';
      if (lower.contains('park') || lower.contains('garage')) return 'موقف سيارات';
      if (lower.contains('ascenseur') || lower.contains('elevator')) return 'مصعد';
      if (lower.contains('secu') || lower.contains('guard')) return 'حراسة';
      if (lower.contains('balcon') || lower.contains('balcony')) return 'شرفة';
      if (lower.contains('chauff') || lower.contains('heat')) return 'تدفئة';
      if (lower.contains('terrasse') || lower.contains('terrace')) return 'تراس';
      if (lower.contains('standing')) return 'تشطيب فاخر';
    } else if (_currentLang == 'en') {
      if (lower.contains('clim')) return 'Air conditioning';
      if (lower.contains('piscine') || lower.contains('pool')) return 'Swimming pool';
      if (lower.contains('mer') || lower.contains('sea')) return 'Sea view';
      if (lower.contains('jardin') || lower.contains('garden')) return 'Garden';
      if (lower.contains('park') || lower.contains('garage')) return 'Parking';
      if (lower.contains('ascenseur') || lower.contains('elevator')) return 'Elevator';
      if (lower.contains('secu') || lower.contains('guard')) return 'Security';
      if (lower.contains('balcon') || lower.contains('balcony')) return 'Balcony';
      if (lower.contains('chauff') || lower.contains('heat')) return 'Heating';
      if (lower.contains('terrasse') || lower.contains('terrace')) return 'Terrace';
      if (lower.contains('standing')) return 'Luxury standing';
    }
    return clean;
  }

  static const Map<String, Map<String, String>> _translations = {
    // ========================================================
    // FRANÇAIS
    // ========================================================
    'fr': {
      // Navigation
      'nav_home': 'Accueil',
      'nav_search': 'Recherche',
      'nav_favorites': 'Favoris',
      'nav_profile': 'Profil',
      'nav_map': 'Carte',
      'nav_settings': 'Paramètres',

      // Actions & Boutons
      'btn_back': 'Retour',
      'btn_home': 'Accueil',
      'btn_save': 'Enregistrer',
      'btn_delete': 'Supprimer',
      'btn_cancel': 'Annuler',
      'btn_publish': 'Publier l\'annonce',
      'btn_filter': 'Filtrer',
      'btn_apply_filters': 'Appliquer les filtres',
      'btn_reset': 'Réinitialiser',
      'btn_details': 'Voir détails',
      'btn_call': 'Appeler',
      'btn_schedule_visit': 'Planifier une visite',
      'btn_contact': 'Contacter',
      'btn_edit': 'Modifier',
      'btn_edit_property': 'Modifier ce bien',
      'btn_delete_property': 'Supprimer ce bien',
      'btn_login': 'Se connecter',
      'btn_register': 'Créer un compte',
      'btn_logout': 'Déconnexion',
      'btn_remove_photo': 'Retirer la photo',
      'btn_confirm': 'Confirmer',
      'btn_refresh': 'Actualiser',

      // En-têtes & Bannières
      'greeting': 'Bonjour !',
      'welcome_banner_title': 'Bienvenue sur Services Immobilier',
      'welcome_banner_sub': 'Trouvez le bien immobilier de vos rêves en Tunisie.',
      'welcome_guest': 'Bienvenue !',
      'guest': 'Invité',
      'our_properties': 'Nos biens immobiliers',
      'search_placeholder': 'Rechercher ville, quartier, mot-clé...',

      // Filtres & Catégories
      'filter_all': 'Tous',
      'filter_price': 'Prix',
      'filter_apartment': 'Appartement',
      'filter_villa': 'Villa',
      'filter_house': 'Maison',
      'filter_bedrooms': 'Chambres',
      'for_sale': 'À Vendre',
      'for_rent': 'À Louer',
      'segment_buy': 'Acheter',
      'segment_rent': 'Louer',
      'city_all': 'Toutes',
      'popular_cities': 'Villes populaires en Tunisie',
      'property_type': 'Type de bien',
      'budget_max': 'Budget maximum',
      'empty_search': 'Aucun bien immobilier ne correspond à vos critères.',

      // Détails du bien
      'property_details': 'Détails du bien',
      'characteristics': 'Caractéristiques',
      'bedrooms': 'Chambres',
      'bathrooms': 'Salles de bain',
      'surface': 'Surface',
      'standing': 'Standing',
      'year_built': 'Année',
      'amenities': 'Atouts & Commodités',
      'description': 'Description',
      'contact_agent': 'Propriétaire / Annonceur',
      'owner_role': 'Propriétaire / Annonceur',
      'no_photo': 'Aucune photo fournie',
      'phone_unavailable': 'Numéro de téléphone non disponible.',
      'call_error': 'Impossible de composer le numéro :',
      'delete_confirm_title': 'Supprimer ce bien ?',
      'delete_confirm_msg': 'Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?',

      // Formulaire annonce
      'add_title': 'Déposer une annonce',
      'edit_title': 'Modifier l\'annonce',
      'field_title': 'Titre de l\'annonce',
      'field_title_hint': 'ex: Villa d\'architecte vue mer',
      'field_city': 'Ville',
      'field_location': 'Localisation exacte',
      'field_location_hint': 'ex: La Marsa, Tunis',
      'field_price': 'Prix (TND)',
      'field_price_hint': 'ex: 450000',
      'field_surface': 'Surface (m²)',
      'field_bedrooms': 'Nombre de chambres',
      'field_bathrooms': 'Nombre de salles de bain',
      'field_description': 'Description de votre annonce',
      'field_description_hint': 'Description détaillée de votre bien (facultatif)...',
      'field_photo_url': 'URL de l\'image (optionnel)',
      'field_photo_url_hint': 'https://exemple.com/image.jpg',
      'validation_title': 'Veuillez saisir un titre valide',
      'validation_city': 'Veuillez sélectionner une ville',
      'validation_price': 'Veuillez saisir un prix strictement positif',
      'validation_surface': 'Veuillez saisir une surface valide',
      'publish_success': 'Annonce publiée avec succès !',

      // Favoris
      'favorites_title': 'Mes Favoris',
      'empty_favorites_title': 'Aucun favori enregistré',
      'empty_favorites_sub': 'Vos favoris sont sauvegardés et synchronisés',
      'empty_favorites_hint': 'Retrouvez ici les annonces que vous aurez ajoutées à vos favoris en appuyant sur le cœur de la fiche détaillée.',
      'added_to_favorites': 'Ajouté à vos favoris',
      'removed_from_favorites': 'Retiré de vos favoris',

      // Profil & Authentification
      'profile_title': 'Mon Profil',
      'profile_tag': 'Espace Client Privé',
      'tab_login': 'Connexion',
      'tab_register': 'Inscription',
      'field_full_name': 'Nom complet',
      'field_email': 'Adresse email',
      'field_phone': 'Numéro de téléphone',
      'field_password': 'Mot de passe',
      'field_new_password': 'Nouveau mot de passe',
      'field_current_password': 'Mot de passe actuel',
      'account_settings': 'Paramètres du compte',
      'appearance': 'Apparence & Affichage',
      'dark_mode': 'Mode sombre',
      'language': 'Langue de l\'application',
      'change_language': 'Changer de langue',
      'my_listings': 'Mes Annonces Publiées',
      'no_listings': 'Vous n\'avez publié aucune annonce.',
      'edit_profile_dialog': 'Modifier mon profil',
      'profile_update_success': 'Profil mis à jour avec succès !',
      'auth_required': 'Veuillez vous connecter pour accéder à cette fonctionnalité.',

      // Carte
      'map_title': 'Cartographie OpenStreetMap',
      'map_center': 'Centrer sur ma position',
      'map_back': 'Retour',
      'map_home': 'Accueil',

      // App & Badges
      'app_title': 'DarLink Immobilier',
      'splash_tagline': 'Immobilier d’exception • Tunisie',
      'filter_land': 'Terrain',
      'filter_studio': 'Studio',
      'filter_commercial': 'Commercial',
      'status_draft': 'Brouillon',
      'status_pending': 'En attente de validation',
      'status_published': 'Publié',
      'status_rejected': 'Refusé',
      'status_sold': 'Vendu',
      'status_rented': 'Loué',
      'status_archived': 'Archivé',
      'price_on_request': 'Prix sur demande',
      'institutional_ref': 'Référence programme',
      'official_portal_visuals': 'Visuels disponibles sur portail officiel',
      'tunisia': 'Tunisie',
      'section_exclusive': 'Sélection Exclusive',
      'section_nearby': 'Biens en vedette',
      'view_all': 'Tout voir',
      'btn_close': 'Fermer',
      'btn_ok': 'OK',

      // Photos & Publication
      'add_photos': 'Photos du bien',
      'pick_from_gallery': 'Galerie photos',
      'take_photo': 'Appareil photo',
      'photos_selected': '{count} photo(s) sélectionnée(s)',
      'cover_photo': 'Couverture',
      'set_as_cover': 'Définir en couverture',
      'uploading_photos': 'Envoi des photos ({current}/{total})...',
      'upload_failed': 'Échec de l’envoi de la photo',
      'photo_limit_hint': 'JPEG, PNG ou WebP • Max 5 Mo par photo (jusqu’à 8 photos)',
      'transaction_and_status': 'Transaction & Statut',
      'submit_for_review': 'Soumettre pour validation',
      'save_as_draft': 'Enregistrer en brouillon',
      'governorate': 'Gouvernorat',
      'neighborhood_label': 'Quartier / Délégation',
      'neighborhood_hint': 'ex: La Marsa, Les Berges du Lac',
      'preview_listing': 'Aperçu de l’annonce',
      'publish_error': 'Impossible d’enregistrer l’annonce. Vérifiez votre connexion.',
      'publish_saved_status': 'Annonce "{title}" enregistrée ({status}).',
      'validation_neighborhood': 'Veuillez saisir un quartier ou une délégation',
      'validation_photo_required': 'Veuillez ajouter au moins une photo du bien',

      // Notifications
      'notifications_title': 'Notifications',
      'mark_all_read': 'Tout marquer lu',
      'no_notifications': 'Aucune notification',
      'no_notifications_sub': 'Vos alertes de visite, messages et validations apparaîtront ici.',

      // Carte
      'map_properties_count': '{count} bien(s) sur la carte',
      'map_approx_zone': 'Zone approximative',
      'map_open_maps': 'Itinéraire',

      // Recherche
      'search_title': 'Recherche avancée',
      'sort_by': 'Trier par',
      'sort_newest': 'Plus récents',
      'sort_price_asc': 'Prix croissant',
      'sort_price_desc': 'Prix décroissant',
      'min_area': 'Surface min (m²)',
      'max_area': 'Surface max (m²)',
      'results_count': '{count} résultat(s)',

      // Profil & Compte
      'forgot_password': 'Mot de passe oublié ?',
      'reset_password_sent': 'Un e-mail de réinitialisation a été envoyé.',
      'verify_email': 'Vérifier mon e-mail',
      'verify_email_sent': 'E-mail de vérification envoyé.',
      'email_verified': 'E-mail vérifié',
      'email_unverified': 'E-mail non vérifié',
      'change_password': 'Changer le mot de passe',
      'change_email': 'Changer l’e-mail',
      'delete_account': 'Supprimer mon compte',
      'delete_account_confirm': 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est définitive.',
      'contact_requests_received': 'Demandes reçues',
      'contact_requests_sent': 'Demandes envoyées',
      'no_contact_requests': 'Aucune demande de contact pour le moment.',
      'about_darlink': 'À propos de DarLink',
      'version_label': 'Version 1.0.0 • Cloud Firestore',
      'avatar_updated': 'Photo de profil mise à jour.',

      // Détails & Contact
      'share_property': 'Partager',
      'share_copied': 'Informations du bien copiées.',
      'contact_message_hint': 'Bonjour, je souhaite obtenir plus d’informations ou planifier une visite...',
      'contact_success': 'Votre demande a été envoyée au propriétaire.',
      'contact_error': 'Impossible d’envoyer la demande.',
      'gallery_photo_of': '{current} / {total}',
      'bedrooms_short': 'ch.',
      'bathrooms_short': 'sdb.',
      'area_unit': 'm²',
      'edit_property_btn': 'Modifier',
      'delete_property_btn': 'Supprimer',
      'exploration_tag': 'EXPLORATION',
      'governorates_24': 'Gouvernorats de Tunisie (24)',
      'budget_dt': 'Budget (TND)',
      'rooms_and_baths': 'Chambres & Salles de bain',
      'load_more': 'Charger plus',
      'gps_dialog_title': 'Accès à votre position GPS',
      'gps_dialog_body': 'DarLink utilise votre position uniquement pour centrer la carte autour de vous.',
      'gps_later': 'Plus tard',
      'gps_allow': 'Autoriser',
      'gps_disabled': 'Les services de localisation sont désactivés sur votre appareil.',
      'gps_denied': 'Permission GPS refusée. Navigation libre par gouvernorat active.',
      'gps_unavailable': 'Position GPS indisponible pour le moment.',
      'role_user': 'Particulier',
      'role_owner': 'Propriétaire',
      'role_agency': 'Agence immobilière',
      'preferences_tag': 'PRÉFÉRENCES',
      'btn_send': 'Envoyer',
      'btn_resend': 'Renvoyer',
      'btn_verify': 'Vérifier',
      'dashboard_title': 'Tableau de bord',
    },

    // ========================================================
    // ARABE (العربية)
    // ========================================================
    'ar': {
      // Navigation
      'nav_home': 'الرئيسية',
      'nav_search': 'بحث',
      'nav_favorites': 'المفضلة',
      'nav_profile': 'حسابي',
      'nav_map': 'الخريطة',
      'nav_settings': 'الإعدادات',

      // Actions & Boutons
      'btn_back': 'رجوع',
      'btn_home': 'الرئيسية',
      'btn_save': 'حفظ',
      'btn_delete': 'حذف',
      'btn_cancel': 'إلغاء',
      'btn_publish': 'نشر الإعلان',
      'btn_filter': 'تصفية',
      'btn_apply_filters': 'تطبيق الفلاتر',
      'btn_reset': 'إعادة ضبط',
      'btn_details': 'عرض التفاصيل',
      'btn_call': 'اتصال',
      'btn_schedule_visit': 'طلب زيارة',
      'btn_contact': 'تواصل',
      'btn_edit': 'تعديل',
      'btn_edit_property': 'تعديل هذا العقار',
      'btn_delete_property': 'حذف هذا العقار',
      'btn_login': 'تسجيل الدخول',
      'btn_register': 'إنشاء حساب',
      'btn_logout': 'تسجيل الخروج',
      'btn_remove_photo': 'حذف الصورة',
      'btn_confirm': 'تأكيد',
      'btn_refresh': 'تحديث',

      // En-têtes & Bannières
      'greeting': 'مرحباً بك !',
      'welcome_banner_title': 'مرحباً بكم في دار اللينك للعقارات',
      'welcome_banner_sub': 'اعثر على عقار أحلامك في تونس بأسهل الطرق.',
      'welcome_guest': 'أهلاً وسهلاً !',
      'guest': 'زائر',
      'our_properties': 'عقاراتنا المتوفرة',
      'search_placeholder': 'ابحث عن مدينة، حي، كلمة مفتاحية...',

      // Filtres & Catégories
      'filter_all': 'الكل',
      'filter_price': 'السعر',
      'filter_apartment': 'شقة',
      'filter_villa': 'فيلا',
      'filter_house': 'منزل',
      'filter_bedrooms': 'الغرف',
      'for_sale': 'للبيع',
      'for_rent': 'للكراء',
      'segment_buy': 'شراء',
      'segment_rent': 'كراء',
      'city_all': 'كل المدن',
      'popular_cities': 'المدن الأكثر طلباً في تونس',
      'property_type': 'نوع العقار',
      'budget_max': 'الميزانية القصوى',
      'empty_search': 'لم يتم العثور على أي عقار يطابق معاييرك.',

      // Détails du bien
      'property_details': 'تفاصيل العقار',
      'characteristics': 'المواصفات الأساسية',
      'bedrooms': 'غرف النوم',
      'bathrooms': 'الحمامات',
      'surface': 'المساحة',
      'standing': 'مستوى التشطيب',
      'year_built': 'سنة البناء',
      'amenities': 'المميزات والخدمات',
      'description': 'الوصف الكامل',
      'contact_agent': 'المالك / المعلن',
      'owner_role': 'المالك / المعلن',
      'no_photo': 'لا توجد صورة متوفرة',
      'phone_unavailable': 'رقم الهاتف غير متوفر حالياً.',
      'call_error': 'تعذر إجراء الاتصال بالرقم :',
      'delete_confirm_title': 'هل تريد حذف هذا العقار؟',
      'delete_confirm_msg': 'هذا الإجراء نهائي ولا يمكن التراجع عنه. هل أنت متأكد من حذف هذا الإعلان نهائياً؟',

      // Formulaire annonce
      'add_title': 'نشر إعلان جديد',
      'edit_title': 'تعديل الإعلان',
      'field_title': 'عنوان الإعلان',
      'field_title_hint': 'مثال: فيلا عصرية فاخرة مطلة على البحر',
      'field_city': 'المدينة',
      'field_location': 'الموقع بالتحديد',
      'field_location_hint': 'مثال: المرسى، تونس',
      'field_price': 'السعر (د.ت)',
      'field_price_hint': 'مثال: 450000',
      'field_surface': 'المساحة (م²)',
      'field_bedrooms': 'عدد غرف النوم',
      'field_bathrooms': 'عدد الحمامات',
      'field_description': 'وصف الإعلان',
      'field_description_hint': 'اكتب وصفاً مفصلاً لأهم مميزات عقارك...',
      'field_photo_url': 'رابط الصورة (اختياري)',
      'field_photo_url_hint': 'https://example.com/image.jpg',
      'validation_title': 'الرجاء إدخال عنوان صالح للإعلان',
      'validation_city': 'الرجاء اختيار المدينة',
      'validation_price': 'الرجاء إدخال سعر صحيح أكبر من الصفر',
      'validation_surface': 'الرجاء إدخال مساحة صالحة',
      'publish_success': 'تم نشر إعلانك بنجاح !',

      // Favoris
      'favorites_title': 'عقاراتي المفضلة',
      'empty_favorites_title': 'لا توجد عقارات في المفضلة',
      'empty_favorites_sub': 'عقاراتك المفضلة محفوظة ومتزامنة تلقائياً',
      'empty_favorites_hint': 'ستجد هنا الإعلانات التي أضفتها إلى المفضلة بالضغط على أيقونة القلب.',
      'added_to_favorites': 'تمت الإضافة إلى المفضلة',
      'removed_from_favorites': 'تم الحذف من المفضلة',

      // Profil & Authentification
      'profile_title': 'ملفي الشخصي',
      'profile_tag': 'فضاء الحريف الخاص',
      'tab_login': 'تسجيل الدخول',
      'tab_register': 'إنشاء حساب',
      'field_full_name': 'الاسم الكامل',
      'field_email': 'البريد الإلكتروني',
      'field_phone': 'رقم الهاتف',
      'field_password': 'كلمة المرور',
      'field_new_password': 'كلمة المرور الجديدة',
      'field_current_password': 'كلمة المرور الحالية',
      'account_settings': 'إعدادات الحساب',
      'appearance': 'المظهر والعرض',
      'dark_mode': 'الوضع الداكن',
      'language': 'لغة التطبيق',
      'change_language': 'تغيير اللغة',
      'my_listings': 'إعلاناتي المنشورة',
      'no_listings': 'لم تقم بنشر أي إعلان حتى الآن.',
      'edit_profile_dialog': 'تعديل الملف الشخصي',
      'profile_update_success': 'تم تحديث الملف الشخصي بنجاح !',
      'auth_required': 'يرجى تسجيل الدخول للوصول إلى هذه الميزة.',

      // Carte
      'map_title': 'خريطة OpenStreetMap التفاعلية',
      'map_center': 'تحديد موقعي',
      'map_back': 'رجوع',
      'map_home': 'الرئيسية',

      // App & Badges
      'app_title': 'دار لينك العقارية',
      'splash_tagline': 'عقارات استثنائية • تونس',
      'filter_land': 'أرض',
      'filter_studio': 'ستوديو',
      'filter_commercial': 'تجاري',
      'status_draft': 'مسودة',
      'status_pending': 'قيد المراجعة',
      'status_published': 'منشور',
      'status_rejected': 'مرفوض',
      'status_sold': 'تم البيع',
      'status_rented': 'تم الإيجار',
      'status_archived': 'مؤرشف',
      'price_on_request': 'السعر عند الطلب',
      'institutional_ref': 'مرجع المشروع',
      'official_portal_visuals': 'الصور متوفرة على البوابة الرسمية',
      'tunisia': 'تونس',
      'section_exclusive': 'مختارات حصرية',
      'section_nearby': 'عقارات مميزة',
      'view_all': 'عرض الكل',
      'btn_close': 'إغلاق',
      'btn_ok': 'حسناً',

      // Photos & Publication
      'add_photos': 'صور العقار',
      'pick_from_gallery': 'معرض الصور',
      'take_photo': 'الكاميرا',
      'photos_selected': 'تم اختيار {count} صورة',
      'cover_photo': 'الغلاف',
      'set_as_cover': 'تعيين كغلاف',
      'uploading_photos': 'جاري رفع الصور ({current}/{total})...',
      'upload_failed': 'فشل رفع الصورة',
      'photo_limit_hint': 'JPEG أو PNG أو WebP • الحد الأقصى 5 ميغابايت للصورة (حتى 8 صور)',
      'transaction_and_status': 'نوع المعاملة والحالة',
      'submit_for_review': 'إرسال للمراجعة',
      'save_as_draft': 'حفظ كمسودة',
      'governorate': 'الولاية',
      'neighborhood_label': 'الحي / المعتمدية',
      'neighborhood_hint': 'مثال: المرسى، ضفاف البحيرة',
      'preview_listing': 'معاينة الإعلان',
      'publish_error': 'تعذر حفظ الإعلان. يرجى التحقق من الاتصال.',
      'publish_saved_status': 'تم حفظ الإعلان "{title}" ({status}).',
      'validation_neighborhood': 'يرجى إدخال الحي أو المعتمدية',
      'validation_photo_required': 'يرجى إضافة صورة واحدة على الأقل للعقار',

      // Notifications
      'notifications_title': 'الإشعارات',
      'mark_all_read': 'تحديد الكل كمقروء',
      'no_notifications': 'لا توجد إشعارات',
      'no_notifications_sub': 'ستظهر هنا تنبيهات الزيارات والرسائل وحالة الإعلانات.',

      // Carte
      'map_properties_count': '{count} عقار على الخريطة',
      'map_approx_zone': 'منطقة تقريبية',
      'map_open_maps': 'الاتجاهات',

      // Recherche
      'search_title': 'بحث متقدم',
      'sort_by': 'ترتيب حسب',
      'sort_newest': 'الأحدث',
      'sort_price_asc': 'السعر: من الأقل',
      'sort_price_desc': 'السعر: من الأعلى',
      'min_area': 'المساحة الأدنى (م²)',
      'max_area': 'المساحة القصوى (م²)',
      'results_count': '{count} نتيجة',

      // Profil & Compte
      'forgot_password': 'نسيت كلمة المرور؟',
      'reset_password_sent': 'تم إرسال رابط إعادة تعيين كلمة المرور.',
      'verify_email': 'تأكيد البريد الإلكتروني',
      'verify_email_sent': 'تم إرسال رسالة التأكيد.',
      'email_verified': 'البريد مؤكد',
      'email_unverified': 'البريد غير مؤكد',
      'change_password': 'تغيير كلمة المرور',
      'change_email': 'تغيير البريد الإلكتروني',
      'delete_account': 'حذف حسابي',
      'delete_account_confirm': 'هل أنت متأكد من حذف حسابك؟ هذا الإجراء نهائي لا يمكن التراجع عنه.',
      'contact_requests_received': 'الطلبات المستلمة',
      'contact_requests_sent': 'الطلبات المرسلة',
      'no_contact_requests': 'لا توجد طلبات تواصل حالياً.',
      'about_darlink': 'حول دار لينك',
      'version_label': 'الإصدار 1.0.0 • Cloud Firestore',
      'avatar_updated': 'تم تحديث صورة الملف الشخصي.',

      // Détails & Contact
      'share_property': 'مشاركة',
      'share_copied': 'تم نسخ تفاصيل العقار.',
      'contact_message_hint': 'مرحباً، أرغب في معرفة المزيد من التفاصيل أو حجز موعد للمعاينة...',
      'contact_success': 'تم إرسال طلبك إلى المالك بنجاح.',
      'contact_error': 'تعذر إرسال الطلب.',
      'gallery_photo_of': '{current} / {total}',
      'bedrooms_short': 'غرف',
      'bathrooms_short': 'حمام',
      'area_unit': 'م²',
      'edit_property_btn': 'تعديل',
      'delete_property_btn': 'حذف',
      'exploration_tag': 'استكشاف',
      'governorates_24': 'ولايات تونس (24)',
      'budget_dt': 'الميزانية (د.ت)',
      'rooms_and_baths': 'الغرف والحمامات',
      'load_more': 'تحميل المزيد',
      'gps_dialog_title': 'الوصول إلى موقعك الجغرافي',
      'gps_dialog_body': 'يستخدم دار لينك موقعك فقط لتوسيط الخريطة حولك.',
      'gps_later': 'لاحقاً',
      'gps_allow': 'سماح',
      'gps_disabled': 'خدمات الموقع معطلة على جهازك.',
      'gps_denied': 'تم رفض إذن الموقع. التصفح الحر حسب الولاية متاح.',
      'gps_unavailable': 'الموقع غير متوفر حالياً.',
      'role_user': 'فرد',
      'role_owner': 'مالك عقار',
      'role_agency': 'وكالة عقارية',
      'preferences_tag': 'التفضيلات',
      'btn_send': 'إرسال',
      'btn_resend': 'إعادة الإرسال',
      'btn_verify': 'تحقق',
      'dashboard_title': 'لوحة التحكم',
    },

    // ========================================================
    // ANGLAIS (English)
    // ========================================================
    'en': {
      // Navigation
      'nav_home': 'Home',
      'nav_search': 'Search',
      'nav_favorites': 'Favorites',
      'nav_profile': 'Profile',
      'nav_map': 'Map',
      'nav_settings': 'Settings',

      // Actions & Buttons
      'btn_back': 'Back',
      'btn_home': 'Home',
      'btn_save': 'Save',
      'btn_delete': 'Delete',
      'btn_cancel': 'Cancel',
      'btn_publish': 'Publish Listing',
      'btn_filter': 'Filter',
      'btn_apply_filters': 'Apply Filters',
      'btn_reset': 'Reset',
      'btn_details': 'View Details',
      'btn_call': 'Call',
      'btn_schedule_visit': 'Request a Visit',
      'btn_contact': 'Contact',
      'btn_edit': 'Edit',
      'btn_edit_property': 'Edit Listing',
      'btn_delete_property': 'Delete Listing',
      'btn_login': 'Log In',
      'btn_register': 'Create Account',
      'btn_logout': 'Log Out',
      'btn_remove_photo': 'Remove Photo',
      'btn_confirm': 'Confirm',
      'btn_refresh': 'Refresh',

      // En-têtes & Bannières
      'greeting': 'Hello!',
      'welcome_banner_title': 'Welcome to Real Estate Services',
      'welcome_banner_sub': 'Find your dream property in Tunisia with ease.',
      'welcome_guest': 'Welcome !',
      'guest': 'Guest',
      'our_properties': 'Our Properties',
      'search_placeholder': 'Search city, district, keyword...',

      // Filtres & Catégories
      'filter_all': 'All',
      'filter_price': 'Price',
      'filter_apartment': 'Apartment',
      'filter_villa': 'Villa',
      'filter_house': 'House',
      'filter_bedrooms': 'Bedrooms',
      'for_sale': 'For Sale',
      'for_rent': 'For Rent',
      'segment_buy': 'Buy',
      'segment_rent': 'Rent',
      'city_all': 'All Cities',
      'popular_cities': 'Popular Cities in Tunisia',
      'property_type': 'Property Type',
      'budget_max': 'Maximum Budget',
      'empty_search': 'No properties match your search criteria.',

      // Détails du bien
      'property_details': 'Property Details',
      'characteristics': 'Specifications',
      'bedrooms': 'Bedrooms',
      'bathrooms': 'Bathrooms',
      'surface': 'Area',
      'standing': 'Standing',
      'year_built': 'Year Built',
      'amenities': 'Amenities & Features',
      'description': 'Description',
      'contact_agent': 'Owner / Advertiser',
      'owner_role': 'Owner / Advertiser',
      'no_photo': 'No photo provided',
      'phone_unavailable': 'Phone number is not available.',
      'call_error': 'Unable to launch call to:',
      'delete_confirm_title': 'Delete this property?',
      'delete_confirm_msg': 'This action is irreversible. Are you sure you want to permanently delete this listing?',

      // Formulaire annonce
      'add_title': 'Post a New Listing',
      'edit_title': 'Edit Listing',
      'field_title': 'Listing Title',
      'field_title_hint': 'e.g. Architect Luxury Villa Sea View',
      'field_city': 'City',
      'field_location': 'Exact Location',
      'field_location_hint': 'e.g. La Marsa, Tunis',
      'field_price': 'Price (TND)',
      'field_price_hint': 'e.g. 450000',
      'field_surface': 'Area (m²)',
      'field_bedrooms': 'Number of Bedrooms',
      'field_bathrooms': 'Number of Bathrooms',
      'field_description': 'Listing Description',
      'field_description_hint': 'Detailed description of your property...',
      'field_photo_url': 'Image URL (optional)',
      'field_photo_url_hint': 'https://example.com/image.jpg',
      'validation_title': 'Please enter a valid title',
      'validation_city': 'Please select a city',
      'validation_price': 'Please enter a valid positive price',
      'validation_surface': 'Please enter a valid area',
      'publish_success': 'Listing published successfully !',

      // Favoris
      'favorites_title': 'My Favorites',
      'empty_favorites_title': 'No Favorites Saved',
      'empty_favorites_sub': 'Your favorites are saved and synced automatically',
      'empty_favorites_hint': 'Find here the properties you have added to your favorites by tapping the heart icon.',
      'added_to_favorites': 'Added to Favorites',
      'removed_from_favorites': 'Removed from Favorites',

      // Profil & Authentification
      'profile_title': 'My Profile',
      'profile_tag': 'Private Client Area',
      'tab_login': 'Log In',
      'tab_register': 'Sign Up',
      'field_full_name': 'Full Name',
      'field_email': 'Email Address',
      'field_phone': 'Phone Number',
      'field_password': 'Password',
      'field_new_password': 'New Password',
      'field_current_password': 'Current Password',
      'account_settings': 'Account Settings',
      'appearance': 'Appearance & Display',
      'dark_mode': 'Dark Mode',
      'language': 'App Language',
      'change_language': 'Change Language',
      'my_listings': 'My Published Listings',
      'no_listings': 'You have not published any listings yet.',
      'edit_profile_dialog': 'Edit My Profile',
      'profile_update_success': 'Profile updated successfully !',
      'auth_required': 'Please log in to access this feature.',

      // Carte
      'map_title': 'OpenStreetMap Interactive Map',
      'map_center': 'Center on My Location',
      'map_back': 'Back',
      'map_home': 'Home',

      // App & Badges
      'app_title': 'DarLink Real Estate',
      'splash_tagline': 'Luxury Real Estate • Tunisia',
      'filter_land': 'Land',
      'filter_studio': 'Studio',
      'filter_commercial': 'Commercial',
      'status_draft': 'Draft',
      'status_pending': 'Pending Review',
      'status_published': 'Published',
      'status_rejected': 'Rejected',
      'status_sold': 'Sold',
      'status_rented': 'Rented',
      'status_archived': 'Archived',
      'price_on_request': 'Price on request',
      'institutional_ref': 'Program Reference',
      'official_portal_visuals': 'Visuals available on official portal',
      'tunisia': 'Tunisia',
      'section_exclusive': 'Exclusive Selection',
      'section_nearby': 'Featured Properties',
      'view_all': 'View all',
      'btn_close': 'Close',
      'btn_ok': 'OK',

      // Photos & Publication
      'add_photos': 'Property Photos',
      'pick_from_gallery': 'Photo Gallery',
      'take_photo': 'Camera',
      'photos_selected': '{count} photo(s) selected',
      'cover_photo': 'Cover',
      'set_as_cover': 'Set as cover',
      'uploading_photos': 'Uploading photos ({current}/{total})...',
      'upload_failed': 'Photo upload failed',
      'photo_limit_hint': 'JPEG, PNG or WebP • Max 5 MB per photo (up to 8 photos)',
      'transaction_and_status': 'Transaction & Status',
      'submit_for_review': 'Submit for Review',
      'save_as_draft': 'Save as Draft',
      'governorate': 'Governorate',
      'neighborhood_label': 'Neighborhood / Delegation',
      'neighborhood_hint': 'e.g. La Marsa, Les Berges du Lac',
      'preview_listing': 'Listing Preview',
      'publish_error': 'Unable to save listing. Check your connection.',
      'publish_saved_status': 'Listing "{title}" saved ({status}).',
      'validation_neighborhood': 'Please enter a neighborhood or delegation',
      'validation_photo_required': 'Please add at least one property photo',

      // Notifications
      'notifications_title': 'Notifications',
      'mark_all_read': 'Mark all read',
      'no_notifications': 'No Notifications',
      'no_notifications_sub': 'Visit requests, messages, and listing updates will appear here.',

      // Carte
      'map_properties_count': '{count} properties on map',
      'map_approx_zone': 'Approximate area',
      'map_open_maps': 'Directions',

      // Recherche
      'search_title': 'Advanced Search',
      'sort_by': 'Sort by',
      'sort_newest': 'Newest',
      'sort_price_asc': 'Price: Low to High',
      'sort_price_desc': 'Price: High to Low',
      'min_area': 'Min area (m²)',
      'max_area': 'Max area (m²)',
      'results_count': '{count} result(s)',

      // Profil & Compte
      'forgot_password': 'Forgot password?',
      'reset_password_sent': 'Password reset email sent.',
      'verify_email': 'Verify Email',
      'verify_email_sent': 'Verification email sent.',
      'email_verified': 'Email verified',
      'email_unverified': 'Email not verified',
      'change_password': 'Change Password',
      'change_email': 'Change Email',
      'delete_account': 'Delete My Account',
      'delete_account_confirm': 'Are you sure you want to delete your account? This action is permanent.',
      'contact_requests_received': 'Received Requests',
      'contact_requests_sent': 'Sent Requests',
      'no_contact_requests': 'No contact requests yet.',
      'about_darlink': 'About DarLink',
      'version_label': 'Version 1.0.0 • Cloud Firestore',
      'avatar_updated': 'Profile photo updated.',

      // Détails & Contact
      'share_property': 'Share',
      'share_copied': 'Property details copied.',
      'contact_message_hint': 'Hello, I would like more information or to schedule a visit...',
      'contact_success': 'Your request was sent to the owner.',
      'contact_error': 'Unable to send request.',
      'gallery_photo_of': '{current} / {total}',
      'bedrooms_short': 'bd.',
      'bathrooms_short': 'ba.',
      'area_unit': 'm²',
      'edit_property_btn': 'Edit',
      'delete_property_btn': 'Delete',
      'exploration_tag': 'EXPLORE',
      'governorates_24': 'Tunisia Governorates (24)',
      'budget_dt': 'Budget (TND)',
      'rooms_and_baths': 'Bedrooms & Bathrooms',
      'load_more': 'Load more',
      'gps_dialog_title': 'GPS Location Access',
      'gps_dialog_body': 'DarLink uses your location only to center the map around you.',
      'gps_later': 'Later',
      'gps_allow': 'Allow',
      'gps_disabled': 'Location services are disabled on your device.',
      'gps_denied': 'GPS permission denied. Free browsing by governorate is active.',
      'gps_unavailable': 'GPS location is currently unavailable.',
      'role_user': 'Individual',
      'role_owner': 'Owner',
      'role_agency': 'Real Estate Agency',
      'preferences_tag': 'PREFERENCES',
      'btn_send': 'Send',
      'btn_resend': 'Resend',
      'btn_verify': 'Verify',
      'dashboard_title': 'Dashboard',
    },
  };
}
