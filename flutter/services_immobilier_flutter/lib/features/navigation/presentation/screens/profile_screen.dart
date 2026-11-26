// ============================================================
// DARLINK — ÉCRAN COMPTE, PROFIL, DEMANDES & PARAMÈTRES (Flutter • Liquid Glass)
// Auth Firebase réelle, tableau de bord propriétaire & réglages regroupés style Apple.
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../../contact/data/contact_api_service.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/presentation/screens/add_property_screen.dart';

class EcranProfil extends StatefulWidget {
  const EcranProfil({super.key});

  @override
  State<EcranProfil> createState() => _EcranProfilState();
}

class _EcranProfilState extends State<EcranProfil> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  bool _isRegisterMode = false;
  String _selectedRole = 'USER';
  bool _isLoading = false;
  String? _authError;

  List<Propriete> _myProperties = [];
  List<ContactRequestModel> _receivedRequests = [];
  List<Map<String, dynamic>> _notifications = [];
  bool _loadingDashboard = false;

  @override
  void initState() {
    super.initState();
    AuthState.instance.addListener(_onAuthChanged);
    _passCtrl.addListener(() {
      if (_isRegisterMode && mounted) setState(() {});
    });
    if (AuthState.instance.isAuthenticated) {
      _loadDashboard();
    }
  }

  @override
  void dispose() {
    AuthState.instance.removeListener(_onAuthChanged);
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _onAuthChanged() {
    if (mounted) {
      setState(() {});
      if (AuthState.instance.isAuthenticated) {
        _loadDashboard();
      }
    }
  }

  Future<void> _loadDashboard() async {
    setState(() => _loadingDashboard = true);
    final props = await PropertyApiService.instance.getMyProperties();
    final reqs = await ContactApiService.instance.getReceivedRequests();
    final notifs = await ContactApiService.instance.getMyNotifications();
    if (mounted) {
      setState(() {
        _myProperties = props;
        _receivedRequests = reqs;
        _notifications = notifs;
        _loadingDashboard = false;
      });
    }
  }

  Future<void> _handleAuthSubmit() async {
    setState(() {
      _isLoading = true;
      _authError = null;
    });

    final String? error;
    if (_isRegisterMode) {
      error = await AuthService.instance.register(
        fullName: _nameCtrl.text,
        email: _emailCtrl.text,
        password: _passCtrl.text,
        confirmPassword: _confirmPassCtrl.text,
        phone: _phoneCtrl.text,
        requestedRole: _selectedRole,
      );
    } else {
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

  void _showForgotPasswordDialog() {
    final resetCtrl = TextEditingController(text: _emailCtrl.text);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Mot de passe oublié'),
        content: TextField(
          controller: resetCtrl,
          decoration: const InputDecoration(labelText: 'Adresse e-mail'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              final err = await AuthService.instance.sendPasswordResetEmail(resetCtrl.text);
              if (ctx.mounted) Navigator.pop(ctx);
              messenger.showSnackBar(
                SnackBar(content: Text(err ?? 'E-mail de réinitialisation envoyé.')),
              );
            },
            child: const Text('Envoyer'),
          ),
        ],
      ),
    );
  }

  void _showEditProfileDialog() {
    final user = AuthState.instance.currentUser;
    if (user == null) return;
    final nameCtrl = TextEditingController(text: user.fullName);
    final phoneCtrl = TextEditingController(text: user.phone ?? '');
    final photoCtrl = TextEditingController(text: user.photoUrl ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Modifier mon profil'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nom complet')),
            const SizedBox(height: 10),
            TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Téléphone')),
            const SizedBox(height: 10),
            TextField(controller: photoCtrl, decoration: const InputDecoration(labelText: 'URL Photo (HTTPS)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              final ok = await AuthService.instance.updateProfile(
                fullName: nameCtrl.text,
                phone: phoneCtrl.text,
                photoUrl: photoCtrl.text.trim().isNotEmpty ? photoCtrl.text.trim() : null,
              );
              if (ctx.mounted) Navigator.pop(ctx);
              messenger.showSnackBar(SnackBar(content: Text(ok ? 'Profil mis à jour.' : 'Erreur de mise à jour.')));
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog() {
    final curCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Changer mon mot de passe'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: curCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Mot de passe actuel')),
            const SizedBox(height: 10),
            TextField(controller: newCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Nouveau mot de passe (min 8 car.)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              final err = await AuthService.instance.changePassword(currentPassword: curCtrl.text, newPassword: newCtrl.text);
              if (ctx.mounted) Navigator.pop(ctx);
              messenger.showSnackBar(SnackBar(content: Text(err ?? 'Mot de passe modifié.')));
            },
            child: const Text('Valider'),
          ),
        ],
      ),
    );
  }

  void _showChangeEmailDialog() {
    final curCtrl = TextEditingController();
    final newEmailCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Changer mon e-mail'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: curCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Mot de passe actuel')),
            const SizedBox(height: 10),
            TextField(controller: newEmailCtrl, decoration: const InputDecoration(labelText: 'Nouvelle adresse e-mail')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              final err = await AuthService.instance.changeEmail(currentPassword: curCtrl.text, newEmail: newEmailCtrl.text);
              if (ctx.mounted) Navigator.pop(ctx);
              messenger.showSnackBar(SnackBar(content: Text(err ?? 'E-mail mis à jour. Vérifiez votre nouvelle boîte mail.')));
            },
            child: const Text('Valider'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    final passCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Supprimer mon compte', style: TextStyle(color: AppColors.accentRed)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Vos annonces seront archivées et vos favoris supprimés. Action irréversible.'),
            const SizedBox(height: 12),
            TextField(controller: passCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Mot de passe actuel')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRed, foregroundColor: Colors.white),
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              final err = await AuthService.instance.deleteAccount(currentPassword: passCtrl.text);
              if (ctx.mounted) Navigator.pop(ctx);
              messenger.showSnackBar(SnackBar(content: Text(err ?? 'Compte supprimé avec succès.')));
            },
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final bgColor = AppColors.backgroundOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final isAuthenticated = AuthState.instance.isAuthenticated;
    final user = AuthState.instance.currentUser;
    final strength = AuthService.evaluatePasswordStrength(_passCtrl.text);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Editorial header
              Text('ESPACE PERSONNEL', style: AppTypography.micro(AppColors.accentChampagne)),
              const SizedBox(height: 4),
              Text(
                isAuthenticated && user != null ? 'Tableau de bord' : 'Mon Profil',
                style: AppTypography.pageTitle(textPrim),
              ),
              const SizedBox(height: 18),

              // ============================================================
              // MODE NON AUTHENTIFIÉ : CONNEXION / INSCRIPTION LIQUID GLASS
              // ============================================================
              if (!isAuthenticated) ...[
                LiquidGlassSurface(
                  borderRadius: AppSpacing.radiusXL,
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 68,
                          height: 68,
                          decoration: BoxDecoration(
                            color: AppColors.accentChampagne.withValues(alpha: 0.14),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.accentChampagne.withValues(alpha: 0.35),
                            ),
                          ),
                          child: const Icon(Icons.lock_outline_rounded, size: 28, color: AppColors.accentChampagne),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Bienvenue sur DarLink',
                        textAlign: TextAlign.center,
                        style: AppTypography.pageTitle(textPrim),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Authentification sécurisée Firebase pour gérer vos biens, favoris et demandes.',
                        textAlign: TextAlign.center,
                        style: AppTypography.body(textSec).copyWith(fontSize: 13.5),
                      ),
                      const SizedBox(height: 20),

                      // Segmented control Connexion / Inscription
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1A1C22) : const Color(0xFFF2F2F7),
                          borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  HapticFeedback.selectionClick();
                                  setState(() {
                                    _isRegisterMode = false;
                                    _authError = null;
                                  });
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 180),
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                  decoration: BoxDecoration(
                                    color: !_isRegisterMode ? AppColors.primaryActionBgOf(context) : Colors.transparent,
                                    borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    'Se connecter',
                                    style: TextStyle(
                                      color: !_isRegisterMode ? AppColors.primaryActionFgOf(context) : textSec,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13.5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  HapticFeedback.selectionClick();
                                  setState(() {
                                    _isRegisterMode = true;
                                    _authError = null;
                                  });
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 180),
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                  decoration: BoxDecoration(
                                    color: _isRegisterMode ? AppColors.primaryActionBgOf(context) : Colors.transparent,
                                    borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    'Créer un compte',
                                    style: TextStyle(
                                      color: _isRegisterMode ? AppColors.primaryActionFgOf(context) : textSec,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13.5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      if (_authError != null)
                        Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.accentRed.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.accentRed.withValues(alpha: 0.3)),
                          ),
                          child: Text(_authError!, style: const TextStyle(color: AppColors.accentRed, fontSize: 12.5)),
                        ),

                      if (_isRegisterMode) ...[
                        TextField(
                          controller: _nameCtrl,
                          style: TextStyle(color: textPrim),
                          decoration: const InputDecoration(labelText: 'Nom complet'),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _phoneCtrl,
                          style: TextStyle(color: textPrim),
                          decoration: const InputDecoration(labelText: 'Téléphone (+216)'),
                        ),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedRole,
                          dropdownColor: AppColors.surfaceOf(context),
                          style: TextStyle(color: textPrim),
                          decoration: const InputDecoration(labelText: 'Type de compte'),
                          items: const [
                            DropdownMenuItem(value: 'USER', child: Text('Particulier')),
                            DropdownMenuItem(value: 'OWNER', child: Text('Propriétaire')),
                            DropdownMenuItem(value: 'AGENCY', child: Text('Agence immobilière')),
                          ],
                          onChanged: (v) => setState(() => _selectedRole = v ?? 'USER'),
                        ),
                        const SizedBox(height: 10),
                      ],

                      TextField(
                        controller: _emailCtrl,
                        style: TextStyle(color: textPrim),
                        decoration: const InputDecoration(labelText: 'Adresse email'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _passCtrl,
                        obscureText: true,
                        style: TextStyle(color: textPrim),
                        decoration: const InputDecoration(labelText: 'Mot de passe'),
                      ),

                      if (_isRegisterMode) ...[
                        if (_passCtrl.text.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              'Robustesse : ${strength.label}${strength.issues.isNotEmpty ? " (${strength.issues.join(", ")})" : ""}',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: strength.valid ? AppColors.accentGreen : AppColors.accentAmber,
                              ),
                            ),
                          ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _confirmPassCtrl,
                          obscureText: true,
                          style: TextStyle(color: textPrim),
                          decoration: const InputDecoration(labelText: 'Confirmer le mot de passe'),
                        ),
                      ],

                      const SizedBox(height: 18),
                      LuxuryPillButton(
                        label: _isRegisterMode ? 'Créer mon compte' : 'Se connecter',
                        isLoading: _isLoading,
                        onPressed: _isLoading ? null : _handleAuthSubmit,
                      ),

                      if (!_isRegisterMode) ...[
                        const SizedBox(height: 6),
                        TextButton(
                          onPressed: _showForgotPasswordDialog,
                          child: Text(
                            'Mot de passe oublié ?',
                            style: AppTypography.caption(AppColors.accentChampagne).copyWith(fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],

              // ============================================================
              // MODE AUTHENTIFIÉ : IDENTITÉ, ACTIONS & TABLEAU DE BORD
              // ============================================================
              if (isAuthenticated && user != null) ...[
                LiquidGlassSurface(
                  borderRadius: AppSpacing.radiusXL,
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(2.5),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.accentChampagne, width: 1.5),
                            ),
                            child: CircleAvatar(
                              radius: 28,
                              backgroundColor: AppColors.primaryActionBgOf(context),
                              backgroundImage: (user.photoUrl != null && user.photoUrl!.isNotEmpty)
                                  ? NetworkImage(user.photoUrl!)
                                  : null,
                              child: (user.photoUrl == null || user.photoUrl!.isEmpty)
                                  ? Text(
                                      user.fullName.isNotEmpty
                                          ? user.fullName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
                                          : 'U',
                                      style: TextStyle(
                                        color: AppColors.primaryActionFgOf(context),
                                        fontWeight: FontWeight.w700,
                                        fontSize: 17,
                                      ),
                                    )
                                  : null,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(user.fullName, style: AppTypography.sectionTitle(textPrim)),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.accentChampagne.withValues(alpha: 0.14),
                                        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                      ),
                                      child: Text(
                                        user.role,
                                        style: AppTypography.micro(AppColors.accentChampagne),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(user.email, style: AppTypography.caption(textSec)),
                                if (user.phone != null && user.phone!.isNotEmpty)
                                  Text(user.phone!, style: AppTypography.caption(textSec)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: (user.emailVerified ? AppColors.accentGreen : AppColors.accentAmber).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: (user.emailVerified ? AppColors.accentGreen : AppColors.accentAmber).withValues(alpha: 0.25),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              user.emailVerified ? Icons.verified_rounded : Icons.mark_email_unread_outlined,
                              size: 18,
                              color: user.emailVerified ? AppColors.accentGreen : AppColors.accentAmber,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                user.emailVerified ? 'E-mail vérifié' : 'E-mail non vérifié',
                                style: AppTypography.caption(textPrim).copyWith(fontWeight: FontWeight.w600),
                              ),
                            ),
                            if (!user.emailVerified) ...[
                              TextButton(
                                onPressed: () async {
                                  final messenger = ScaffoldMessenger.of(context);
                                  final ok = await AuthService.instance.resendVerificationEmail();
                                  messenger.showSnackBar(
                                    SnackBar(content: Text(ok ? 'E-mail de vérification envoyé.' : 'Échec d’envoi.')),
                                  );
                                },
                                child: const Text('Renvoyer', style: TextStyle(fontSize: 12)),
                              ),
                              TextButton(
                                onPressed: () async {
                                  final messenger = ScaffoldMessenger.of(context);
                                  final ok = await AuthService.instance.refreshVerificationStatus();
                                  messenger.showSnackBar(
                                    SnackBar(content: Text(ok ? 'E-mail confirmé !' : 'Toujours en attente.')),
                                  );
                                },
                                child: const Text('Vérifier', style: TextStyle(fontSize: 12)),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          OutlinedButton.icon(
                            icon: const Icon(Icons.edit_outlined, size: 15),
                            label: Text(AppLocale.instance.tr('edit_profile_dialog')),
                            onPressed: _showEditProfileDialog,
                          ),
                          OutlinedButton.icon(
                            icon: const Icon(Icons.mail_outline_rounded, size: 15),
                            label: Text(AppLocale.instance.tr('change_email')),
                            onPressed: _showChangeEmailDialog,
                          ),
                          OutlinedButton.icon(
                            icon: const Icon(Icons.lock_reset_rounded, size: 15),
                            label: Text(AppLocale.instance.tr('change_password')),
                            onPressed: _showChangePasswordDialog,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                LuxuryPillButton(
                  label: AppLocale.instance.tr('add_title'),
                  icon: Icons.add_home_work_outlined,
                  onPressed: () async {
                    await Navigator.push(context, MaterialPageRoute(builder: (_) => const EcranDepotAnnonce()));
                    _loadDashboard();
                  },
                ),

                const SizedBox(height: 24),
                EditorialSectionHeader(
                  title: '${AppLocale.instance.tr('my_listings')} (${_myProperties.length})',
                  trailing: GlassOrbButton(
                    icon: Icons.refresh_rounded,
                    size: 36,
                    iconSize: 17,
                    onTap: _loadDashboard,
                  ),
                ),
                const SizedBox(height: 12),

                if (_loadingDashboard)
                  const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
                else if (_myProperties.isEmpty)
                  LiquidGlassSurface(
                    borderRadius: AppSpacing.radiusMD,
                    padding: const EdgeInsets.all(16),
                    elevatedShadow: false,
                    child: Text(AppLocale.instance.tr('no_listings'), style: AppTypography.body(textSec)),
                  )
                else
                  ..._myProperties.map(
                    (p) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: LiquidGlassSurface(
                        borderRadius: AppSpacing.radiusMD,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        elevatedShadow: false,
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p.titre, style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14.5)),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${AppLocale.instance.formatCurrency(p.prix, isRental: p.estLocation)} • ${AppLocale.instance.translateListingStatus(p.listingStatus.value)}',
                                    style: AppTypography.caption(AppColors.accentChampagne).copyWith(fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.edit_outlined, color: AppColors.accentChampagne, size: 20),
                              onPressed: () async {
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => EcranDepotAnnonce(proprieteAEditer: p)),
                                );
                                _loadDashboard();
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.accentRed, size: 20),
                              onPressed: () async {
                                await PropertyApiService.instance.deleteProperty(p.id);
                                _loadDashboard();
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                const SizedBox(height: 16),
                EditorialSectionHeader(
                  title: AppLocale.instance.tr('contact_requests_received'),
                  subtitle: '${_receivedRequests.length} • ${_notifications.length}',
                ),
                const SizedBox(height: 10),
                if (_receivedRequests.isEmpty && _notifications.isEmpty)
                  LiquidGlassSurface(
                    borderRadius: AppSpacing.radiusMD,
                    padding: const EdgeInsets.all(16),
                    elevatedShadow: false,
                    child: Text(AppLocale.instance.tr('no_contact_requests'), style: AppTypography.body(textSec)),
                  )
                else
                  LiquidGlassSurface(
                    borderRadius: AppSpacing.radiusLG,
                    padding: const EdgeInsets.all(14),
                    elevatedShadow: false,
                    child: Column(
                      children: [
                        ..._receivedRequests.take(3).map(
                              (r) => ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.mail_outline_rounded, color: AppColors.accentChampagne),
                                title: Text('${r.senderName} (${r.status})', style: AppTypography.caption(textPrim).copyWith(fontWeight: FontWeight.w700)),
                                subtitle: Text(r.message, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppTypography.caption(textSec)),
                              ),
                            ),
                        ..._notifications.take(3).map(
                              (n) => ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.notifications_none_rounded, color: AppColors.accentChampagne),
                                title: Text(n['title']?.toString() ?? '', style: AppTypography.caption(textPrim).copyWith(fontWeight: FontWeight.w700)),
                                subtitle: Text(n['body']?.toString() ?? '', style: AppTypography.caption(textSec)),
                              ),
                            ),
                      ],
                    ),
                  ),
              ],

              // ============================================================
              // PRÉFÉRENCES & PARAMÈTRES GROUPÉS STYLE APPLE
              // ============================================================
              const SizedBox(height: 24),
              Text('PRÉFÉRENCES', style: AppTypography.micro(textSec)),
              const SizedBox(height: 10),
              LiquidGlassSurface(
                borderRadius: AppSpacing.radiusLG,
                padding: EdgeInsets.zero,
                elevatedShadow: false,
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: AppColors.accentChampagne.withValues(alpha: 0.14),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(
                                  isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                                  size: 18,
                                  color: AppColors.accentChampagne,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text('Mode sombre', style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 15)),
                            ],
                          ),
                          Switch(
                            value: isDark,
                            onChanged: (_) {
                              HapticFeedback.selectionClick();
                              AppTheme.basculerTheme();
                            },
                          ),
                        ],
                      ),
                    ),
                    Divider(height: 1, indent: 62, color: AppColors.borderSubtleOf(context)),
                    InkWell(
                      key: const Key('profile_language_selector'),
                      onTap: () {
                        HapticFeedback.selectionClick();
                        AppLocale.instance.toggleLanguage();
                      },
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(AppSpacing.radiusLG)),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 34,
                                  height: 34,
                                  decoration: BoxDecoration(
                                    color: AppColors.accentChampagne.withValues(alpha: 0.14),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(Icons.language_rounded, size: 18, color: AppColors.accentChampagne),
                                ),
                                const SizedBox(width: 12),
                                Text('Langue (FR / AR / EN)', style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 15)),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceElevatedOf(context),
                                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                              ),
                              child: Text(
                                AppLocale.instance.currentLang.toUpperCase(),
                                style: AppTypography.caption(textPrim).copyWith(fontWeight: FontWeight.w700),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              if (isAuthenticated) ...[
                const SizedBox(height: 18),
                LuxuryPillButton(
                  label: AppLocale.instance.tr('btn_logout'),
                  icon: Icons.logout_rounded,
                  isSecondary: true,
                  foregroundColor: AppColors.accentRed,
                  onPressed: () => AuthService.instance.logout(),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: _showDeleteAccountDialog,
                  child: Text(
                    AppLocale.instance.tr('delete_account'),
                    style: AppTypography.caption(textSec),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
