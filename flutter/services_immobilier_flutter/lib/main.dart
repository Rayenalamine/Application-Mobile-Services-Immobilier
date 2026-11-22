// ============================================================
// DARLINK — POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION (V2-T02 & V2-T04)
// Configure MaterialApp avec NavigationBar Material 3 et thèmes dynamiques
// ============================================================

import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/app_locale.dart';
import 'features/navigation/presentation/screens/main_navigation_screen.dart';

/// Point d'entrée standard de l'application Flutter DarLink.
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppLocale.instance.init();
  runApp(const ServicesImmobilierApp());
}

/// Widget racine configurant MaterialApp, le titre global, la localisation bilingue et le thème réactif Material 3.
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
