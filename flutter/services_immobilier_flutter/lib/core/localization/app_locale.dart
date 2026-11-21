// ============================================================
// DARLINK — SERVICE DE LOCALISATION ET MULTILINGUISME (V3 / V13)
// Support complet Français, Arabe (RTL) et Anglais avec dictionnaire réactif
// ============================================================

import 'package:flutter/material.dart';

class AppLocale extends ChangeNotifier {
  static final AppLocale instance = AppLocale._internal();
  AppLocale._internal();

  String _currentLang = 'fr';

  String get currentLang => _currentLang;
  bool get isRtl => _currentLang == 'ar';

  TextDirection get textDirection => isRtl ? TextDirection.rtl : TextDirection.ltr;

  void setLanguage(String langCode) {
    if (_translations.containsKey(langCode) && _currentLang != langCode) {
      _currentLang = langCode;
      notifyListeners();
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
    // Fallback vers le français
    return _translations['fr']?[key] ?? key;
  }

  static const Map<String, Map<String, String>> _translations = {
    'fr': {
      // Navigation
      'nav_home': 'Accueil',
      'nav_search': 'Recherche',
      'nav_favorites': 'Favoris',
      'nav_profile': 'Profil',
      'nav_map': 'Carte',
      // Actions
      'btn_back': 'Retour',
      'btn_home': 'Accueil',
      'btn_save': 'Enregistrer',
      'btn_delete': 'Supprimer',
      'btn_cancel': 'Annuler',
      'btn_publish': 'Publier',
      'btn_filter': 'Filtrer',
      'btn_details': 'Voir détails',
      'btn_schedule_visit': 'Demander une visite',
      'btn_contact': 'Contacter',
      // Header
      'greeting': 'Bonjour ! 👋',
      'welcome_guest': 'Bienvenue !',
      'guest': 'Invité',
      'search_placeholder': 'Tunis, Sousse, Djerba, Hammamet...',
      // Filters
      'filter_all': 'Tous',
      'filter_price': 'Prix',
      'filter_apartment': 'Appartement',
      'filter_villa': 'Villa',
      'filter_house': 'Maison',
      'filter_bedrooms': 'Chambres',
      'for_sale': 'À Vendre',
      'for_rent': 'À Louer',
      // Property Details
      'property_details': 'Détails du bien',
      'characteristics': 'Caractéristiques',
      'bedrooms': 'Chambres',
      'bathrooms': 'Salles de bain',
      'surface': 'Surface',
      'standing': 'Standing',
      'amenities': 'Atouts & Commodités',
      'description': 'Description du bien',
      'contact_person': 'Contact de l\'annonce',
      'no_photo': 'Aucune photo fournie par le propriétaire',
      // Map
      'map_title': 'Cartographie OpenStreetMap',
      'my_location': 'Ma position',
      'all_cities': 'Toutes',
      // Favorites
      'favorites_title': 'Mes Favoris',
      'no_favorites': 'Aucun bien favori enregistré.',
      // Profile & Settings
      'settings_title': 'Paramètres de l\'application',
      'dark_mode': 'Mode sombre',
      'language': 'Langue',
      'edit_profile': 'Modifier profil',
      'change_password': 'Mot de passe',
      'my_properties': 'Mes annonces publiées',
      'publish_new_property': 'Publier une nouvelle annonce',
      'logout': 'Se déconnecter',
      'login': 'Se connecter',
      'register': 'Créer un compte',
      'empty_my_properties': 'Vous n\'avez publié aucune annonce pour le moment.',
    },
    'ar': {
      // Navigation
      'nav_home': 'الرئيسية',
      'nav_search': 'بحث',
      'nav_favorites': 'المفضلة',
      'nav_profile': 'حسابي',
      'nav_map': 'الخريطة',
      // Actions
      'btn_back': 'رجوع',
      'btn_home': 'الرئيسية',
      'btn_save': 'حفظ',
      'btn_delete': 'حذف',
      'btn_cancel': 'إلغاء',
      'btn_publish': 'نشر',
      'btn_filter': 'تصفية',
      'btn_details': 'تفاصيل العقار',
      'btn_schedule_visit': 'طلب موعد معاينة',
      'btn_contact': 'اتصال بالمعلن',
      // Header
      'greeting': 'مرحباً بك ! 👋',
      'welcome_guest': 'أهلاً بك !',
      'guest': 'زائر',
      'search_placeholder': 'تونس، سوسة، جربة، الحمامات...',
      // Filters
      'filter_all': 'الكل',
      'filter_price': 'السعر',
      'filter_apartment': 'شقة',
      'filter_villa': 'فيلا',
      'filter_house': 'منزل',
      'filter_bedrooms': 'الغرف',
      'for_sale': 'للبيع',
      'for_rent': 'للإيجار',
      // Property Details
      'property_details': 'تفاصيل العقار',
      'characteristics': 'المواصفات الأساسية',
      'bedrooms': 'غرف النوم',
      'bathrooms': 'الحمامات',
      'surface': 'المساحة',
      'standing': 'المستوى',
      'amenities': 'المزايا والتجهيزات',
      'description': 'وصف العقار',
      'contact_person': 'صاحب الإعلان',
      'no_photo': 'لم يتم إرفاق صور من قبل صاحب العقار',
      // Map
      'map_title': 'خريطة OpenStreetMap التفاعلية',
      'my_location': 'موقعي الحالي',
      'all_cities': 'كافة المدن',
      // Favorites
      'favorites_title': 'العقارات المفضلة',
      'no_favorites': 'لا توجد عقارات في قائمة المفضلة حالياً.',
      // Profile & Settings
      'settings_title': 'إعدادات التطبيق',
      'dark_mode': 'الوضع الليلي',
      'language': 'اللغة (العربية)',
      'edit_profile': 'تعديل البيانات',
      'change_password': 'تغيير كلمة المرور',
      'my_properties': 'إعلاناتي العقارية',
      'publish_new_property': 'نشر إعلان عقاري جديد',
      'logout': 'تسجيل الخروج',
      'login': 'تسجيل الدخول',
      'register': 'إنشاء حساب جديد',
      'empty_my_properties': 'لم تقم بنشر أي عقار حتى الآن.',
    },
    'en': {
      // Navigation
      'nav_home': 'Home',
      'nav_search': 'Search',
      'nav_favorites': 'Favorites',
      'nav_profile': 'Profile',
      'nav_map': 'Map',
      // Actions
      'btn_back': 'Back',
      'btn_home': 'Home',
      'btn_save': 'Save',
      'btn_delete': 'Delete',
      'btn_cancel': 'Cancel',
      'btn_publish': 'Publish',
      'btn_filter': 'Filter',
      'btn_details': 'View Details',
      'btn_schedule_visit': 'Request Visit',
      'btn_contact': 'Contact Owner',
      // Header
      'greeting': 'Hello ! 👋',
      'welcome_guest': 'Welcome !',
      'guest': 'Guest',
      'search_placeholder': 'Tunis, Sousse, Djerba, Hammamet...',
      // Filters
      'filter_all': 'All',
      'filter_price': 'Price',
      'filter_apartment': 'Apartment',
      'filter_villa': 'Villa',
      'filter_house': 'House',
      'filter_bedrooms': 'Bedrooms',
      'for_sale': 'For Sale',
      'for_rent': 'For Rent',
      // Property Details
      'property_details': 'Property Details',
      'characteristics': 'Features',
      'bedrooms': 'Bedrooms',
      'bathrooms': 'Bathrooms',
      'surface': 'Area',
      'standing': 'Standing',
      'amenities': 'Amenities & Facilities',
      'description': 'Property Description',
      'contact_person': 'Listing Contact',
      'no_photo': 'No photo provided by owner',
      // Map
      'map_title': 'OpenStreetMap Interactive Map',
      'my_location': 'My Location',
      'all_cities': 'All Cities',
      // Favorites
      'favorites_title': 'My Favorites',
      'no_favorites': 'No favorite properties saved yet.',
      // Profile & Settings
      'settings_title': 'Application Settings',
      'dark_mode': 'Dark Mode',
      'language': 'Language',
      'edit_profile': 'Edit Profile',
      'change_password': 'Change Password',
      'my_properties': 'My Listings',
      'publish_new_property': 'Publish New Property',
      'logout': 'Log Out',
      'login': 'Log In',
      'register': 'Create Account',
      'empty_my_properties': 'You have not published any properties yet.',
    },
  };
}
