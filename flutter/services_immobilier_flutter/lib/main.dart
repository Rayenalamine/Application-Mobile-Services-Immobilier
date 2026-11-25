// ============================================================
// DARLINK — POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION (Flutter)
// ============================================================

import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/app_locale.dart';
import 'core/firebase/firebase_sdk.dart';
import 'core/firebase/firestore_client.dart';
import 'features/auth/data/auth_service.dart';
import 'features/navigation/presentation/screens/main_navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppLocale.instance.init();
  await FirebaseSdk.instance.ensureInitialized();
  await FirestoreClient.instance.init();
  await AuthService.instance.init();
  runApp(const ServicesImmobilierApp());
}

class ServicesImmobilierApp extends StatelessWidget {
  const ServicesImmobilierApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppLocale.instance,
      builder: (context, _) {
        return ValueListenableBuilder<ThemeMode>(
          valueListenable: AppTheme.themeModeNotifier,
          builder: (context, mode, child) {
            return MaterialApp(
              title: 'DarLink Immobilier',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              darkTheme: AppTheme.darkTheme,
              themeMode: mode,
              builder: (context, child) {
                return Directionality(
                  textDirection: AppLocale.instance.textDirection,
                  child: child!,
                );
              },
              home: const EcranNavigationPrincipale(),
            );
          },
        );
      },
    );
  }
}
