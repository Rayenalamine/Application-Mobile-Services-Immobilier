// ============================================================
// DARLINK — ÉCRAN DE DÉTAILS DU BIEN (Flutter)
// Galerie, localisation carte directe, attribution source, signalement,
// appel & demande de visite Cloud Firestore.
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/firebase/firestore_client.dart';
import '../../../../core/localization/app_locale.dart';
import '../../domain/models/property.dart';
import '../../data/property_api_service.dart';
import '../../presentation/screens/add_property_screen.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../favorites/data/favorites_api_service.dart';
import '../../../contact/data/contact_api_service.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';

class EcranDetails extends StatefulWidget {
  final Propriete propriete;

  const EcranDetails({super.key, required this.propriete});

  @override
  State<EcranDetails> createState() => _EcranDetailsState();
}

class _EcranDetailsState extends State<EcranDetails> {
  late String _imageAffichee;
  late bool _isFavorite;
  int _indexImage = 0;

  @override
  void initState() {
    super.initState();
    _imageAffichee = _toutesLesImages.isNotEmpty ? _toutesLesImages.first : '';
    _isFavorite = FavoritesApiService.instance.isFavorite(widget.propriete.id);
  }

  List<String> get _toutesLesImages {
    final list = <String>[];
    if (widget.propriete.imageUrl.isNotEmpty) list.add(widget.propriete.imageUrl);
    list.addAll(widget.propriete.imagesGalerie.where((u) => u.isNotEmpty));
    return list;
  }

  void _basculerFavori() {
    FavoritesApiService.instance.toggleFavorite(widget.propriete.id);
    setState(() => _isFavorite = !_isFavorite);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isFavorite
              ? AppLocale.instance.tr('added_to_favorites')
              : AppLocale.instance.tr('removed_from_favorites'),
        ),
        duration: const Duration(seconds: 1),
        backgroundColor: _isFavorite ? AppColors.accentBlue : AppColors.accentRed,
      ),
    );
  }

  Future<void> _appelerProprietaire(String? phone) async {
    if (phone == null || phone.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocale.instance.tr('phone_unavailable')),
          backgroundColor: AppColors.accentRed,
        ),
      );
      return;
    }
    final cleanPhone = phone.trim().replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched && mounted) {
        await launchUrl(uri);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${AppLocale.instance.tr('call_error')} $cleanPhone'),
            backgroundColor: AppColors.accentRed,
          ),
        );
      }
    }
  }

  void _ouvrirModalContact(BuildContext context) {
    final user = AuthService.instance.state.currentUser;
    final nomCtrl = TextEditingController(text: user?.fullName ?? '');
    final emailCtrl = TextEditingController(text: user?.email ?? '');
    final telCtrl = TextEditingController(text: user?.phone ?? '+216 ');
    final msgCtrl = TextEditingController(
      text: 'Bonjour, je souhaite obtenir des informations sur ce bien (${widget.propriete.titre}).',
    );
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF13141C) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Contacter l\'agent / Propriétaire',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : const Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Votre message sera transmis pour ${widget.propriete.titre}.',
                style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[400] : Colors.grey[600]),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: nomCtrl,
                decoration: InputDecoration(
                  labelText: 'Votre nom complet',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailCtrl,
                decoration: InputDecoration(
                  labelText: 'Votre adresse e-mail',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: telCtrl,
                decoration: InputDecoration(
                  labelText: 'Numéro de téléphone',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: msgCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Votre message',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () async {
                    final cleanMsg = msgCtrl.text.trim();
                    if (cleanMsg.isEmpty) return;
                    final curUser = AuthState.instance.currentUser;
                    final senderName = nomCtrl.text.trim().isNotEmpty
                        ? nomCtrl.text.trim()
                        : (curUser != null && curUser.fullName.isNotEmpty ? curUser.fullName : 'Visiteur DarLink');
                    final senderEmail = emailCtrl.text.trim().isNotEmpty
                        ? emailCtrl.text.trim()
                        : (curUser != null && curUser.email.isNotEmpty ? curUser.email : 'visiteur@darlink.tn');

                    Navigator.pop(ctx);
                    await ContactApiService.instance.sendContactRequest(
                      propertyId: widget.propriete.id,
                      propertyTitle: widget.propriete.titre,
                      propertyOwnerId: widget.propriete.proprietaireId,
                      senderName: senderName,
                      senderEmail: senderEmail,
                      senderPhone: telCtrl.text.trim(),
                      message: cleanMsg,
                    );
                    if (!mounted || !context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Demande de visite transmise et enregistrée dans Cloud Firestore !'),
                        backgroundColor: AppColors.accentGreen,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Envoyer la demande', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _ouvrirSignalement() {
    final user = AuthState.instance.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connectez-vous pour signaler une annonce.')),
      );
      return;
    }
    final reasonCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Signaler cette annonce'),
        content: TextField(
          controller: reasonCtrl,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Motif (annonce expirée, prix erroné...)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              if (reasonCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              await FirestoreClient.instance.setDocument('reports', 'rep_${DateTime.now().millisecondsSinceEpoch}', {
                'propertyId': widget.propriete.id,
                'reporterUid': user.effectiveUid,
                'reason': reasonCtrl.text.trim(),
                'status': 'OPEN',
                'createdAt': DateTime.now().toIso8601String(),
              });
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Signalement enregistré. Merci.')),
                );
              }
            },
            child: const Text('Envoyer'),
          ),
        ],
      ),
    );
  }

  void _confirmerSuppression(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer ce bien ?'),
        content: Text('Êtes-vous certain de vouloir supprimer "${widget.propriete.titre}" ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRed, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              await PropertyApiService.instance.deleteProperty(widget.propriete.id);
              if (!mounted || !context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Bien immobilier supprimé de Cloud Firestore.'),
                  backgroundColor: AppColors.accentRed,
                ),
              );
              Navigator.pop(context);
            },
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.propriete;
    final images = _toutesLesImages;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final bottomDockBg = isDark ? const Color(0xE60F1015) : const Color(0xF2FFFFFF);
    final bottomDockBorder = isDark ? const Color(0x1FFFFFFF) : const Color(0x18000000);

    final currentUser = AuthState.instance.currentUser;
    final isOwner = currentUser != null &&
        (currentUser.effectiveUid == p.proprietaireId ||
            currentUser.id.toString() == p.proprietaireId);

    return Scaffold(
      backgroundColor: bgColor,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0,
        centerTitle: true,
        title: Text(
          'Détails du bien',
          style: TextStyle(color: isDark ? Colors.white : const Color(0xFF111827), fontWeight: FontWeight.w700, fontSize: 18),
        ),
        leading: Padding(
          padding: const EdgeInsets.only(left: 12),
          child: Center(
            child: _GlassCircleButton(
              icon: Icons.arrow_back_ios_new_rounded,
              isDark: isDark,
              onTap: () => Navigator.pop(context),
            ),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _GlassCircleButton(
                  icon: _isFavorite ? Icons.favorite : Icons.favorite_border,
                  iconColor: _isFavorite ? AppColors.accentRed : null,
                  isDark: isDark,
                  onTap: _basculerFavori,
                ),
                if (isOwner) ...[
                  const SizedBox(width: 8),
                  _GlassCircleButton(
                    icon: Icons.edit_note_rounded,
                    iconColor: AppColors.accentBlue,
                    isDark: isDark,
                    onTap: () async {
                      final res = await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => EcranDepotAnnonce(proprieteAEditer: widget.propriete)),
                      );
                      if (mounted && res == true) Navigator.pop(context);
                    },
                  ),
                  const SizedBox(width: 8),
                  _GlassCircleButton(
                    icon: Icons.delete_outline_rounded,
                    iconColor: AppColors.accentRed,
                    isDark: isDark,
                    onTap: () => _confirmerSuppression(context),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    Container(
                      height: 340,
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
                      ),
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
                        child: _imageAffichee.isNotEmpty
                            ? Image.network(
                                _imageAffichee,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _heroPlaceholder(isDark, textSec, p),
                              )
                            : _heroPlaceholder(isDark, textSec, p),
                      ),
                    ),
                    if (images.isNotEmpty)
                      Positioned(
                        bottom: 18,
                        right: 18,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(color: const Color(0xCC181920), borderRadius: BorderRadius.circular(18)),
                          child: Row(
                            children: [
                              const Icon(Icons.photo_library_outlined, size: 14, color: Colors.white),
                              const SizedBox(width: 6),
                              Text(
                                '${_indexImage + 1}/${images.length}',
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),

                if (images.length > 1) ...[
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SizedBox(
                      height: 68,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: images.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (context, index) {
                          final isSel = _indexImage == index;
                          return GestureDetector(
                            onTap: () => setState(() {
                              _imageAffichee = images[index];
                              _indexImage = index;
                            }),
                            child: Container(
                              width: 84,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: isSel ? AppColors.accentBlue : borderColor, width: isSel ? 2.5 : 1),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(images[index], fit: BoxFit.cover),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 18),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: const Color(0x1F10B981), borderRadius: BorderRadius.circular(20)),
                        child: Text(
                          p.estLocation ? 'À Louer' : 'À Vendre',
                          style: const TextStyle(color: AppColors.accentGreen, fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      ),
                      TextButton.icon(
                        onPressed: _ouvrirSignalement,
                        icon: Icon(Icons.flag_outlined, size: 15, color: textSec),
                        label: Text('Signaler', style: TextStyle(color: textSec, fontSize: 12)),
                      ),
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.prixAffiche,
                        style: TextStyle(color: textPrim, fontSize: 30, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 6),
                      Text(p.titre, style: TextStyle(color: textPrim, fontSize: 20, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.location_on_rounded, color: AppColors.accentBlue, size: 16),
                          const SizedBox(width: 4),
                          Expanded(child: Text(p.localisation, style: TextStyle(color: textSec, fontSize: 13.5))),
                          OutlinedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => EcranCarteInteractive(initialProperty: p)),
                              );
                            },
                            icon: const Icon(Icons.map_outlined, size: 15),
                            label: const Text('Voir sur carte', style: TextStyle(fontSize: 12)),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.accentBlue,
                              side: const BorderSide(color: AppColors.accentBlue),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Expanded(child: _BoxCarac(icone: Icons.bed_outlined, titre: AppLocale.instance.tr('bedrooms'), valeur: '${p.nombreChambres}', isDark: isDark)),
                      const SizedBox(width: 10),
                      Expanded(child: _BoxCarac(icone: Icons.bathtub_outlined, titre: AppLocale.instance.tr('bathrooms'), valeur: '${p.nombreSallesDeBain}', isDark: isDark)),
                      const SizedBox(width: 10),
                      Expanded(child: _BoxCarac(icone: Icons.crop_square_rounded, titre: AppLocale.instance.tr('surface'), valeur: '${p.surfaceM2} m²', isDark: isDark)),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(20), border: Border.all(color: borderColor)),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: AppColors.accentBlue.withValues(alpha: 0.14),
                          child: Text(
                            p.agentNom.isNotEmpty ? p.agentNom.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join() : 'D',
                            style: const TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p.agentNom, style: TextStyle(color: textPrim, fontWeight: FontWeight.w700, fontSize: 14)),
                              Text(
                                p.sourceName != null && p.sourceName!.isNotEmpty ? 'Source : ${p.sourceName}' : AppLocale.instance.tr('owner_role'),
                                style: TextStyle(color: textSec, fontSize: 12),
                              ),
                              if (p.agentTel.isNotEmpty)
                                InkWell(
                                  key: const Key('details_phone_link'),
                                  onTap: () => _appelerProprietaire(p.agentTel),
                                  child: Text(
                                    p.agentTel,
                                    style: const TextStyle(color: AppColors.accentBlue, fontSize: 12, fontWeight: FontWeight.w600, decoration: TextDecoration.underline),
                                  ),
                                ),
                              if (p.sourceUrl != null && p.sourceUrl!.isNotEmpty)
                                InkWell(
                                  onTap: () => launchUrl(Uri.parse(p.sourceUrl!), mode: LaunchMode.externalApplication),
                                  child: const Padding(
                                    padding: EdgeInsets.only(top: 4),
                                    child: Text(
                                      'Consulter le portail officiel',
                                      style: TextStyle(color: AppColors.accentBlue, fontSize: 12, fontWeight: FontWeight.w600, decoration: TextDecoration.underline),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (p.agentTel.isNotEmpty)
                          IconButton(
                            key: const Key('details_call_button'),
                            icon: const Icon(Icons.phone_in_talk_rounded, color: AppColors.accentGreen),
                            onPressed: () => _appelerProprietaire(p.agentTel),
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(AppLocale.instance.tr('description'), style: TextStyle(color: textPrim, fontSize: 17, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 8),
                      Text(p.description, style: TextStyle(color: textSec, fontSize: 14, height: 1.6)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: ClipRRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                  decoration: BoxDecoration(color: bottomDockBg, border: Border(top: BorderSide(color: bottomDockBorder))),
                  child: Row(
                    children: [
                      OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: borderColor),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                        child: Text(AppLocale.instance.tr('btn_back'), style: TextStyle(color: textPrim, fontWeight: FontWeight.w600)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _ouvrirModalContact(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? Colors.white : AppColors.accentBlue,
                            foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: 0,
                          ),
                          child: Text(AppLocale.instance.tr('btn_schedule_visit'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _heroPlaceholder(bool isDark, Color textSec, Propriete p) {
    return Container(
      color: isDark ? const Color(0xFF181B24) : const Color(0xFFEEF2F7),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.apartment_rounded, size: 54, color: AppColors.accentBlue.withValues(alpha: 0.7)),
            const SizedBox(height: 8),
            Text(
              p.imageAttribution ?? 'Aucune photographie fournie',
              style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _BoxCarac extends StatelessWidget {
  final IconData icone;
  final String titre;
  final String valeur;
  final bool isDark;

  const _BoxCarac({required this.icone, required this.titre, required this.valeur, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceOf(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderOf(context)),
      ),
      child: Column(
        children: [
          Icon(icone, color: AppColors.accentBlue, size: 22),
          const SizedBox(height: 6),
          Text(valeur, style: TextStyle(color: AppColors.textPrimaryOf(context), fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 2),
          Text(titre, style: TextStyle(color: AppColors.textSecondaryOf(context), fontSize: 11)),
        ],
      ),
    );
  }
}

class _GlassCircleButton extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final bool isDark;
  final VoidCallback onTap;

  const _GlassCircleButton({required this.icon, this.iconColor, required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isDark ? const Color(0x99181920) : const Color(0xCCFFFFFF),
          shape: BoxShape.circle,
          border: Border.all(color: isDark ? const Color(0x33FFFFFF) : const Color(0x18000000)),
        ),
        child: Icon(icon, color: iconColor ?? (isDark ? Colors.white : const Color(0xFF111827)), size: 18),
      ),
    );
  }
}
