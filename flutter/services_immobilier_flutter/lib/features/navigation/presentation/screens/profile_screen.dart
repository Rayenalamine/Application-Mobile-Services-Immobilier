// ============================================================
// DARLINK — ÉCRAN COMPTE, PROFIL, DEMANDES, NOTIFICATIONS & PARAMÈTRES (Flutter)
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../../contact/data/contact_api_service.dart';
import '../../../properties/presentation/screens/add_property_screen.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/data/property_api_service.dart';

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
        title: const Text('Supprimer mon compte', style: TextStyle(color: Colors.red)),
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
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final isAuthenticated = AuthState.instance.isAuthenticated;
    final user = AuthState.instance.currentUser;
    final strength = AuthService.evaluatePasswordStrength(_passCtrl.text);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (!isAuthenticated) ...[
                const SizedBox(height: 12),
                Center(
                  child: Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(color: AppColors.accentBlue.withValues(alpha: 0.1), shape: BoxShape.circle),
                    child: const Icon(Icons.lock_outline, size: 32, color: AppColors.accentBlue),
                  ),
                ),
                const SizedBox(height: 14),
                Text('Bienvenue sur DarLink', textAlign: TextAlign.center, style: TextStyle(color: textPrim, fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Text('Authentification sécurisée Firebase pour gérer vos biens, favoris et demandes.', textAlign: TextAlign.center, style: TextStyle(color: textSec, fontSize: 13)),
                const SizedBox(height: 20),

                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: borderColor)),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() {
                            _isRegisterMode = false;
                            _authError = null;
                          }),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(color: !_isRegisterMode ? AppColors.accentBlue : Colors.transparent, borderRadius: BorderRadius.circular(10)),
                            alignment: Alignment.center,
                            child: Text('Se connecter', style: TextStyle(color: !_isRegisterMode ? Colors.white : textSec, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() {
                            _isRegisterMode = true;
                            _authError = null;
                          }),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(color: _isRegisterMode ? AppColors.accentBlue : Colors.transparent, borderRadius: BorderRadius.circular(10)),
                            alignment: Alignment.center,
                            child: Text('Créer un compte', style: TextStyle(color: _isRegisterMode ? Colors.white : textSec, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                if (_authError != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                    child: Text(_authError!, style: const TextStyle(color: Colors.red, fontSize: 12.5)),
                  ),

                if (_isRegisterMode) ...[
                  TextField(controller: _nameCtrl, style: TextStyle(color: textPrim), decoration: const InputDecoration(labelText: 'Nom complet', border: OutlineInputBorder())),
                  const SizedBox(height: 10),
                  TextField(controller: _phoneCtrl, style: TextStyle(color: textPrim), decoration: const InputDecoration(labelText: 'Téléphone (+216)', border: OutlineInputBorder())),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedRole,
                    decoration: const InputDecoration(labelText: 'Type de compte', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'USER', child: Text('Particulier')),
                      DropdownMenuItem(value: 'OWNER', child: Text('Propriétaire')),
                      DropdownMenuItem(value: 'AGENCY', child: Text('Agence immobilière')),
                    ],
                    onChanged: (v) => setState(() => _selectedRole = v ?? 'USER'),
                  ),
                  const SizedBox(height: 10),
                ],

                TextField(controller: _emailCtrl, style: TextStyle(color: textPrim), decoration: const InputDecoration(labelText: 'Adresse email', border: OutlineInputBorder())),
                const SizedBox(height: 10),
                TextField(controller: _passCtrl, obscureText: true, style: TextStyle(color: textPrim), decoration: const InputDecoration(labelText: 'Mot de passe', border: OutlineInputBorder())),

                if (_isRegisterMode) ...[
                  if (_passCtrl.text.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        'Robustesse : ${strength.label}${strength.issues.isNotEmpty ? " (${strength.issues.join(", ")})" : ""}',
                        style: TextStyle(fontSize: 11.5, color: strength.valid ? Colors.green : Colors.orange),
                      ),
                    ),
                  const SizedBox(height: 10),
                  TextField(controller: _confirmPassCtrl, obscureText: true, style: TextStyle(color: textPrim), decoration: const InputDecoration(labelText: 'Confirmer le mot de passe', border: OutlineInputBorder())),
                ],

                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleAuthSubmit,
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentBlue, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : Text(_isRegisterMode ? 'Créer mon compte' : 'Se connecter'),
                ),

                if (!_isRegisterMode)
                  TextButton(onPressed: _showForgotPasswordDialog, child: const Text('Mot de passe oublié ?')),
              ],

              if (isAuthenticated && user != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(18), border: Border.all(color: borderColor)),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: AppColors.accentBlue,
                        backgroundImage: (user.photoUrl != null && user.photoUrl!.isNotEmpty) ? NetworkImage(user.photoUrl!) : null,
                        child: (user.photoUrl == null || user.photoUrl!.isEmpty)
                            ? Text(
                                user.fullName.isNotEmpty ? user.fullName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase() : 'U',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              )
                            : null,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(child: Text(user.fullName, style: TextStyle(color: textPrim, fontWeight: FontWeight.bold, fontSize: 16))),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: AppColors.accentBlue.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(8)),
                                  child: Text(user.role, style: const TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.bold, fontSize: 10)),
                                ),
                              ],
                            ),
                            Text(user.email, style: TextStyle(color: textSec, fontSize: 12)),
                            if (user.phone != null && user.phone!.isNotEmpty) Text(user.phone!, style: TextStyle(color: textSec, fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: (user.emailVerified ? Colors.green : Colors.orange).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(user.emailVerified ? Icons.verified_user : Icons.mark_email_unread_outlined, size: 18, color: user.emailVerified ? Colors.green : Colors.orange),
                      const SizedBox(width: 8),
                      Expanded(child: Text(user.emailVerified ? 'E-mail vérifié' : 'E-mail non vérifié', style: TextStyle(color: textPrim, fontSize: 12.5, fontWeight: FontWeight.w600))),
                      if (!user.emailVerified) ...[
                        TextButton(
                          onPressed: () async {
                            final messenger = ScaffoldMessenger.of(context);
                            final ok = await AuthService.instance.resendVerificationEmail();
                            messenger.showSnackBar(SnackBar(content: Text(ok ? 'E-mail de vérification envoyé.' : 'Échec d’envoi.')));
                          },
                          child: const Text('Renvoyer', style: TextStyle(fontSize: 12)),
                        ),
                        TextButton(
                          onPressed: () async {
                            final messenger = ScaffoldMessenger.of(context);
                            final ok = await AuthService.instance.refreshVerificationStatus();
                            messenger.showSnackBar(SnackBar(content: Text(ok ? 'E-mail confirmé !' : 'Toujours en attente.')));
                          },
                          child: const Text('Vérifier', style: TextStyle(fontSize: 12)),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    OutlinedButton.icon(icon: const Icon(Icons.edit, size: 15), label: const Text('Modifier profil'), onPressed: _showEditProfileDialog),
                    OutlinedButton.icon(icon: const Icon(Icons.email_outlined, size: 15), label: const Text('Changer e-mail'), onPressed: _showChangeEmailDialog),
                    OutlinedButton.icon(icon: const Icon(Icons.lock_reset, size: 15), label: const Text('Mot de passe'), onPressed: _showChangePasswordDialog),
                  ],
                ),

                const SizedBox(height: 16),
                ElevatedButton.icon(
                  icon: const Icon(Icons.add_home_work),
                  label: const Text('Publier une annonce'),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentBlue, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14)),
                  onPressed: () async {
                    await Navigator.push(context, MaterialPageRoute(builder: (_) => const EcranDepotAnnonce()));
                    _loadDashboard();
                  },
                ),

                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Mes annonces (${_myProperties.length})', style: TextStyle(color: textPrim, fontWeight: FontWeight.bold, fontSize: 15)),
                    IconButton(icon: const Icon(Icons.refresh, size: 18), onPressed: _loadDashboard),
                  ],
                ),
                if (_loadingDashboard)
                  const Center(child: CircularProgressIndicator())
                else if (_myProperties.isEmpty)
                  Text('Aucune annonce publiée.', style: TextStyle(color: textSec, fontSize: 12.5))
                else
                  ..._myProperties.map((p) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(p.titre, style: TextStyle(color: textPrim, fontSize: 13.5, fontWeight: FontWeight.w600)),
                        subtitle: Text('${p.prixAffiche} • ${p.listingStatus.value}', style: const TextStyle(color: AppColors.accentBlue, fontSize: 12)),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.red),
                          onPressed: () async {
                            await PropertyApiService.instance.deleteProperty(p.id);
                            _loadDashboard();
                          },
                        ),
                      )),

                const SizedBox(height: 12),
                Text('Demandes reçues (${_receivedRequests.length}) & Notifications (${_notifications.length})',
                    style: TextStyle(color: textPrim, fontWeight: FontWeight.bold, fontSize: 14)),
                ..._receivedRequests.take(3).map((r) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.mail_outline, color: AppColors.accentBlue),
                      title: Text('${r.senderName} (${r.status})', style: TextStyle(color: textPrim, fontSize: 13)),
                      subtitle: Text(r.message, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: textSec, fontSize: 12)),
                    )),
                ..._notifications.take(3).map((n) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.notifications_none, color: AppColors.accentBlue),
                      title: Text(n['title']?.toString() ?? '', style: TextStyle(color: textPrim, fontSize: 13)),
                      subtitle: Text(n['body']?.toString() ?? '', style: TextStyle(color: textSec, fontSize: 12)),
                    )),
              ],

              const SizedBox(height: 20),
              Text('Paramètres', style: TextStyle(color: textPrim, fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: borderColor)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(isDark ? Icons.dark_mode : Icons.light_mode, color: AppColors.accentBlue),
                        const SizedBox(width: 10),
                        Text('Mode sombre', style: TextStyle(color: textPrim, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Switch(value: isDark, onChanged: (_) => AppTheme.basculerTheme()),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              InkWell(
                key: const Key('profile_language_selector'),
                onTap: () => AppLocale.instance.toggleLanguage(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: borderColor)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(children: [
                        const Icon(Icons.language, color: AppColors.accentBlue),
                        const SizedBox(width: 10),
                        Text('Langue (FR / AR / EN)', style: TextStyle(color: textPrim, fontWeight: FontWeight.w600)),
                      ]),
                      Text(AppLocale.instance.currentLang.toUpperCase(), style: const TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),

              if (isAuthenticated) ...[
                const SizedBox(height: 18),
                OutlinedButton.icon(
                  icon: const Icon(Icons.logout, color: Colors.red),
                  label: const Text('Se déconnecter', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red), padding: const EdgeInsets.symmetric(vertical: 14)),
                  onPressed: () => AuthService.instance.logout(),
                ),
                TextButton(
                  onPressed: _showDeleteAccountDialog,
                  child: const Text('Supprimer définitivement mon compte', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
