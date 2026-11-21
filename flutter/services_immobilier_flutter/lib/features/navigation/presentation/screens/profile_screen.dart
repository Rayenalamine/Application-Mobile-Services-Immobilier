// ============================================================
// DARLINK — ÉCRAN DE PROFIL ET GESTION DE COMPTE (Flutter V4)
// Authentification JWT réelle, modification profil, mot de passe,
// visites programmées, annonces publiées et thèmes
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../../properties/presentation/screens/add_property_screen.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/data/property_api_service.dart';

class EcranProfil extends StatefulWidget {
  const EcranProfil({super.key});

  @override
  State<EcranProfil> createState() => _EcranProfilState();
}

class _EcranProfilState extends State<EcranProfil> {
  // Contrôleurs pour l'authentification
  final _emailCtrl = TextEditingController(text: 'mohamed@darlink.tn');
  final _passCtrl = TextEditingController(text: 'P@ssword2026!');
  final _nameCtrl = TextEditingController(text: 'Mohamed Ben Ali');
  final _phoneCtrl = TextEditingController(text: '+216 98 111 222');

  bool _isRegisterMode = false;
  bool _isLoading = false;
  String? _authError;

  List<Propriete> _myProperties = [];
  bool _loadingMyProperties = false;

  @override
  void initState() {
    super.initState();
    AuthState.instance.addListener(_onAuthChanged);
    if (AuthState.instance.isAuthenticated) {
      _loadMyProperties();
    }
  }

  @override
  void dispose() {
    AuthState.instance.removeListener(_onAuthChanged);
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _onAuthChanged() {
    if (mounted) {
      setState(() {});
      if (AuthState.instance.isAuthenticated) {
        _loadMyProperties();
      }
    }
  }

  Future<void> _loadMyProperties() async {
    setState(() => _loadingMyProperties = true);
    final list = await PropertyApiService.instance.getMyProperties();
    if (mounted) {
      setState(() {
        _myProperties = list;
        _loadingMyProperties = false;
      });
    }
  }

  Future<void> _handleAuthSubmit() async {
    setState(() {
      _isLoading = true;
      _authError = null;
    });

    String? error;
    if (_isRegisterMode) {
      if (_nameCtrl.text.trim().isEmpty || _emailCtrl.text.trim().isEmpty || _passCtrl.text.isEmpty) {
        setState(() {
          _isLoading = false;
          _authError = 'Veuillez remplir tous les champs obligatoires.';
        });
        return;
      }
      error = await AuthService.instance.register(
        fullName: _nameCtrl.text,
        email: _emailCtrl.text,
        password: _passCtrl.text,
        phone: _phoneCtrl.text,
      );
    } else {
      if (_emailCtrl.text.trim().isEmpty || _passCtrl.text.isEmpty) {
        setState(() {
          _isLoading = false;
          _authError = 'Veuillez renseigner votre email et mot de passe.';
        });
        return;
      }
      error = await AuthService.instance.login(
        email: _emailCtrl.text,
        password: _passCtrl.text,
      );
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
        _authError = error;
      });
    }
  }

  void _showEditProfileDialog() {
    final user = AuthState.instance.currentUser;
    if (user == null) return;

    final nameController = TextEditingController(text: user.fullName);
    final phoneController = TextEditingController(text: user.phone ?? '');

    showDialog(
      context: context,
      builder: (ctx) {
        final cardBg = AppColors.surfaceOf(ctx);
        final textPrim = AppColors.textPrimaryOf(ctx);
        final borderColor = AppColors.borderOf(ctx);

        return AlertDialog(
          backgroundColor: cardBg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: borderColor),
          ),
          title: Text('Modifier mon profil', style: TextStyle(color: textPrim, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: 'Nom complet',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneController,
                decoration: InputDecoration(
                  labelText: 'Téléphone',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentBlue,
                foregroundColor: Colors.white,
              ),
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final success = await AuthService.instance.updateProfile(
                  fullName: nameController.text,
                  phone: phoneController.text,
                );
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(success ? 'Profil mis à jour avec succès.' : 'Erreur de mise à jour.'),
                    ),
                  );
                }
              },
              child: const Text('Enregistrer'),
            ),
          ],
        );
      },
    );
  }

  void _showChangePasswordDialog() {
    final currentPassController = TextEditingController();
    final newPassController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        final cardBg = AppColors.surfaceOf(ctx);
        final textPrim = AppColors.textPrimaryOf(ctx);

        return AlertDialog(
          backgroundColor: cardBg,
          title: Text('Changer mon mot de passe', style: TextStyle(color: textPrim, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: currentPassController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Mot de passe actuel',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: newPassController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Nouveau mot de passe (min 6 car.)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentBlue,
                foregroundColor: Colors.white,
              ),
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final err = await AuthService.instance.changePassword(
                  currentPassword: currentPassController.text,
                  newPassword: newPassController.text,
                );
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(err ?? 'Mot de passe modifié avec succès !'),
                      backgroundColor: err != null ? Colors.red : Colors.green,
                    ),
                  );
                }
              },
              child: const Text('Valider'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final isAuthenticated = AuthState.instance.isAuthenticated;
    final user = AuthState.instance.currentUser;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ========================================================
              // VUE 1 : NON AUTHENTIFIÉ (FORMULAIRE DE CONNEXION / INSCRIPTION)
              // ========================================================
              if (!isAuthenticated) ...[
                const SizedBox(height: 16),
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppColors.accentBlue.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.accentBlue.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.lock_outline, size: 36, color: AppColors.accentBlue),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Bienvenue sur DarLink',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: textPrim,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Connectez-vous pour gérer vos annonces, favoris et visites immobilières.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: textSec, fontSize: 13),
                ),
                const SizedBox(height: 24),

                // Sélecteur Onglet Connexion / Inscription
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E2028) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isRegisterMode = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: !_isRegisterMode ? AppColors.accentBlue : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Se connecter',
                              style: TextStyle(
                                color: !_isRegisterMode ? Colors.white : textSec,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isRegisterMode = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: _isRegisterMode ? AppColors.accentBlue : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Créer un compte',
                              style: TextStyle(
                                color: _isRegisterMode ? Colors.white : textSec,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Bannière d'erreur
                if (_authError != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Colors.red, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _authError!,
                            style: const TextStyle(color: Colors.red, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Formulaire
                if (_isRegisterMode) ...[
                  TextField(
                    controller: _nameCtrl,
                    style: TextStyle(color: textPrim),
                    decoration: InputDecoration(
                      labelText: 'Nom et prénom',
                      prefixIcon: const Icon(Icons.person_outline),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _phoneCtrl,
                    style: TextStyle(color: textPrim),
                    decoration: InputDecoration(
                      labelText: 'Numéro de téléphone (+216)',
                      prefixIcon: const Icon(Icons.phone_outlined),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                TextField(
                  controller: _emailCtrl,
                  style: TextStyle(color: textPrim),
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: 'Adresse email',
                    prefixIcon: const Icon(Icons.email_outlined),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _passCtrl,
                  style: TextStyle(color: textPrim),
                  obscureText: true,
                  decoration: InputDecoration(
                    labelText: 'Mot de passe',
                    prefixIcon: const Icon(Icons.lock_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 20),

                // Bouton d'action principal
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleAuthSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          _isRegisterMode ? 'Créer mon compte' : 'Se connecter',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                ),
                const SizedBox(height: 16),

                // Bouton de remplissage rapide démo
                TextButton(
                  onPressed: () {
                    setState(() {
                      _isRegisterMode = false;
                      _emailCtrl.text = 'mohamed@darlink.tn';
                      _passCtrl.text = 'P@ssword2026!';
                    });
                  },
                  child: const Text('Remplir avec le compte test (Mohamed Ben Ali)'),
                ),
              ],

              // ========================================================
              // VUE 2 : AUTHENTIFIÉ (PROFIL COMPLET ET GESTION)
              // ========================================================
              if (isAuthenticated && user != null) ...[
                // Carte En-tête Profil
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: borderColor),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Avatar avec Initiales
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: AppColors.accentBlue,
                        child: Text(
                          user.fullName.isNotEmpty
                              ? user.fullName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join()
                              : 'U',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      // Infos
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    user.fullName,
                                    style: TextStyle(
                                      color: textPrim,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.accentBlue.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: AppColors.accentBlue.withValues(alpha: 0.3)),
                                  ),
                                  child: Text(
                                    user.role,
                                    style: const TextStyle(
                                      color: AppColors.accentBlue,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(user.email, style: TextStyle(color: textSec, fontSize: 12)),
                            if (user.phone != null && user.phone!.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(user.phone!, style: TextStyle(color: textSec, fontSize: 12)),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Actions rapides Profil
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.edit, size: 16),
                        label: const Text('Modifier profil'),
                        onPressed: _showEditProfileDialog,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.accentBlue,
                          side: const BorderSide(color: AppColors.accentBlue),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.lock_reset, size: 16),
                        label: const Text('Mot de passe'),
                        onPressed: _showChangePasswordDialog,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: textPrim,
                          side: BorderSide(color: borderColor),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Bouton Déposer une annonce
                ElevatedButton.icon(
                  icon: const Icon(Icons.add_home_work, color: Colors.white),
                  label: const Text('Publier une nouvelle annonce immobilière'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const EcranDepotAnnonce()),
                    );
                    _loadMyProperties();
                  },
                ),
                const SizedBox(height: 24),

                // Mes annonces publiées
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Mes annonces publiées (${_myProperties.length})',
                      style: TextStyle(
                        color: textPrim,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh, size: 20),
                      onPressed: _loadMyProperties,
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                if (_loadingMyProperties)
                  const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
                else if (_myProperties.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: borderColor),
                    ),
                    child: Center(
                      child: Text(
                        'Vous n\'avez publié aucune annonce pour le moment.',
                        style: TextStyle(color: textSec, fontSize: 13),
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _myProperties.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (ctx, idx) {
                      final prop = _myProperties[idx];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: borderColor),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                prop.imageUrl,
                                width: 70,
                                height: 60,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  width: 70,
                                  height: 60,
                                  color: Colors.grey.withValues(alpha: 0.2),
                                  child: const Icon(Icons.image_not_supported),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    prop.titre,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(color: textPrim, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    '${prop.prix.toStringAsFixed(0)} DT • ${prop.ville}',
                                    style: const TextStyle(color: AppColors.accentBlue, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                              onPressed: () async {
                                final confirm = await showDialog<bool>(
                                  context: context,
                                  builder: (dCtx) => AlertDialog(
                                    title: const Text('Confirmer la suppression'),
                                    content: Text('Voulez-vous supprimer l\'annonce "${prop.titre}" ?'),
                                    actions: [
                                      TextButton(onPressed: () => Navigator.pop(dCtx, false), child: const Text('Annuler')),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                                        onPressed: () => Navigator.pop(dCtx, true),
                                        child: const Text('Supprimer'),
                                      ),
                                    ],
                                  ),
                                );
                                if (confirm == true) {
                                  await PropertyApiService.instance.deleteProperty(prop.id);
                                  _loadMyProperties();
                                }
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                const SizedBox(height: 24),
              ],

              // ========================================================
              // PRÉFÉRENCES : THÈMES ET LANGUES (DISPONIBLE POUR TOUS)
              // ========================================================
              Text(
                'Paramètres de l\'application',
                style: TextStyle(color: textPrim, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 10),

              // Thème Clair / Sombre
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(isDark ? Icons.dark_mode : Icons.light_mode, color: AppColors.accentBlue),
                        const SizedBox(width: 12),
                        Text('Mode sombre', style: TextStyle(color: textPrim, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Switch(
                      value: isDark,
                      activeTrackColor: AppColors.accentBlue,
                      onChanged: (val) {
                        AppTheme.basculerTheme();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),

              // Sélecteur de langue Français / Arabe (RTL)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.language, color: AppColors.accentBlue),
                        const SizedBox(width: 12),
                        Text('Langue (Français / العربية)', style: TextStyle(color: textPrim, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accentBlue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('FR / AR', style: TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
              ),

              // Bouton Déconnexion
              if (isAuthenticated) ...[
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  icon: const Icon(Icons.logout, color: Colors.red),
                  label: const Text('Se déconnecter', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.red),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    AuthService.instance.logout();
                  },
                ),
              ],
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
