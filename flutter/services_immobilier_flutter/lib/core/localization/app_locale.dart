// ============================================================
// DARLINK — SERVICE DE LOCALISATION & TRILINGUISME COMPLET
// Support intégral Français, Arabe (العربية RTL) et Anglais (English LTR)
// Persistance SharedPreferences, dictionnaire exhaustif et formateurs
// ============================================================

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppLocale extends ChangeNotifier {
  static final AppLocale instance = AppLocale._internal();
  AppLocale._internal();

  String _currentLang = 'fr';

  String get currentLang => _currentLang;
  bool get isRtl => _currentLang == 'ar';
  TextDirection get textDirection => isRtl ? TextDirection.rtl : TextDirection.ltr;

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString('darlink_app_lang');
      if (saved != null && _translations.containsKey(saved)) {
        _currentLang = saved;
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
    },
  };
}
