// ============================================================
// DARLINK — IMMERSIVE PROPERTY DETAILS SCREEN (Flutter)
// Swipeable full-bleed gallery, overlapping surface sheet,
// Liquid Glass controls, floating glass bottom contact bar.
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/firebase/firestore_client.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../../contact/data/contact_api_service.dart';
import '../../../favorites/data/favorites_api_service.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../data/property_api_service.dart';
import '../../domain/models/property.dart';
import 'add_property_screen.dart';

class EcranDetails extends StatefulWidget {
  final Propriete propriete;

  const EcranDetails({super.key, required this.propriete});

  @override
  State<EcranDetails> createState() => _EcranDetailsState();
}

class _EcranDetailsState extends State<EcranDetails> {
  late bool _isFavorite;
  int _indexImage = 0;

  @override
  void initState() {
    super.initState();
    _isFavorite = FavoritesApiService.instance.isFavorite(widget.propriete.id);
  }

  List<String> get _toutesLesImages {
    final list = <String>[];
    if (widget.propriete.imageUrl.isNotEmpty) list.add(widget.propriete.imageUrl);
    list.addAll(widget.propriete.imagesGalerie.where((u) => u.isNotEmpty));
    return list;
  }

  void _basculerFavori() {
    HapticFeedback.lightImpact();
    FavoritesApiService.instance.toggleFavorite(widget.propriete.id);
    setState(() => _isFavorite = !_isFavorite);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        content: Text(
          _isFavorite
              ? AppLocale.instance.tr('added_to_favorites')
              : AppLocale.instance.tr('removed_from_favorites'),
        ),
        duration: const Duration(seconds: 1),
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
    final isDark = AppColors.isDark(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
            child: Container(
              padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(ctx).viewInsets.bottom + 28),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xEC15171C) : const Color(0xF5FFFFFF),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                border: Border(
                  top: BorderSide(color: AppColors.borderOf(context), width: 0.9),
                ),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: textSec.withValues(alpha: 0.35),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text('Contacter l\'agent / Propriétaire', style: AppTypography.pageTitle(textPrim).copyWith(fontSize: 20)),
                    const SizedBox(height: 4),
                    Text(
                      'Votre demande sera transmise pour ${widget.propriete.titre}.',
                      style: AppTypography.body(textSec).copyWith(fontSize: 13.5),
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      controller: nomCtrl,
                      decoration: InputDecoration(
                        labelText: 'Votre nom complet',
                        filled: true,
                        fillColor: AppColors.surfaceElevatedOf(context),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: emailCtrl,
                      decoration: InputDecoration(
                        labelText: 'Votre adresse e-mail',
                        filled: true,
                        fillColor: AppColors.surfaceElevatedOf(context),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: telCtrl,
                      decoration: InputDecoration(
                        labelText: 'Numéro de téléphone',
                        filled: true,
                        fillColor: AppColors.surfaceElevatedOf(context),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: msgCtrl,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Votre message',
                        filled: true,
                        fillColor: AppColors.surfaceElevatedOf(context),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
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
                          backgroundColor: AppColors.primaryActionBgOf(context),
                          foregroundColor: AppColors.primaryActionFgOf(context),
                          elevation: 0,
                          minimumSize: const Size(double.infinity, 52),
                          shape: const StadiumBorder(),
                        ),
                        child: const Text(
                          'Envoyer la demande',
                          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
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
    final isDark = AppColors.isDark(context);
    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final currentUser = AuthState.instance.currentUser;
    final isOwner = currentUser != null &&
        (currentUser.effectiveUid == p.proprietaireId ||
            currentUser.id.toString() == p.proprietaireId);

    final priceDisplay = p.priceOnRequest || p.prix <= 0
        ? 'Prix sur demande'
        : AppLocale.instance.formatCurrency(p.prix, isRental: p.estLocation);

    return Scaffold(
      backgroundColor: bgColor,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0,
        centerTitle: true,
        title: LiquidGlassSurface(
          borderRadius: AppSpacing.radiusPill,
          blurSigma: 18,
          elevatedShadow: false,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Text(
            'Détails du bien',
            style: TextStyle(color: textPrim, fontWeight: FontWeight.w600, fontSize: 13.5),
          ),
        ),
        leading: Padding(
          padding: const EdgeInsets.only(left: 14),
          child: Center(
            child: GlassOrbButton(
              icon: Icons.arrow_back_ios_new_rounded,
              size: 40,
              iconSize: 18,
              onTap: () => Navigator.pop(context),
            ),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GlassOrbButton(
                  icon: _isFavorite ? Icons.favorite : Icons.favorite_border,
                  size: 40,
                  iconSize: 19,
                  iconColor: _isFavorite ? AppColors.accentRed : textPrim,
                  onTap: _basculerFavori,
                ),
                if (isOwner) ...[
                  const SizedBox(width: 8),
                  GlassOrbButton(
                    icon: Icons.edit_note_rounded,
                    size: 40,
                    iconSize: 20,
                    iconColor: AppColors.accentBlue,
                    onTap: () async {
                      final res = await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => EcranDepotAnnonce(proprieteAEditer: widget.propriete)),
                      );
                      if (res != null && mounted && context.mounted) {
                        Navigator.pop(context);
                      }
                    },
                  ),
                  const SizedBox(width: 8),
                  GlassOrbButton(
                    icon: Icons.delete_outline_rounded,
                    size: 40,
                    iconSize: 19,
                    iconColor: AppColors.accentRed,
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
          CustomScrollView(
            slivers: [
              // 1. Immersive Full-Bleed Swipeable Gallery
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 380,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (images.isNotEmpty)
                        PageView.builder(
                          itemCount: images.length,
                          onPageChanged: (idx) => setState(() => _indexImage = idx),
                          itemBuilder: (_, idx) => Image.network(
                            images[idx],
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => _GalleryFallback(propriete: p),
                          ),
                        )
                      else
                        _GalleryFallback(propriete: p),
                      if (images.length > 1)
                        Positioned(
                          right: 16,
                          bottom: 38,
                          child: LiquidGlassSurface(
                            borderRadius: AppSpacing.radiusPill,
                            blurSigma: 14,
                            elevatedShadow: false,
                            padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                            child: Text(
                              '${_indexImage + 1} / ${images.length}',
                              style: AppTypography.micro(textPrim),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              // 2. Overlapping Luxury Content Sheet
              SliverToBoxAdapter(
                child: Transform.translate(
                  offset: const Offset(0, -24),
                  child: Container(
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                    ),
                    padding: const EdgeInsets.fromLTRB(20, 22, 20, 130),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Status + Provenance + Report row
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5.5),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceElevatedOf(context),
                                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                border: Border.all(color: borderColor, width: 0.8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 7,
                                    height: 7,
                                    decoration: BoxDecoration(
                                      color: p.isInstitutionalReference
                                          ? AppColors.accentChampagne
                                          : AppColors.accentGreen,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    p.estLocation ? 'À Louer' : 'À Vendre',
                                    style: AppTypography.micro(textPrim),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (p.isInstitutionalReference)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5.5),
                                decoration: BoxDecoration(
                                  color: AppColors.accentChampagne.withValues(alpha: 0.14),
                                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                ),
                                child: Text(
                                  'Référence programme',
                                  style: AppTypography.micro(AppColors.accentChampagne),
                                ),
                              ),
                            const Spacer(),
                            GestureDetector(
                              onTap: _ouvrirSignalement,
                              child: Row(
                                children: [
                                  Icon(Icons.flag_outlined, size: 15, color: textSec),
                                  const SizedBox(width: 4),
                                  Text('Signaler', style: AppTypography.caption(textSec)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Price + Price/m²
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              priceDisplay,
                              style: AppTypography.heroDisplay(textPrim).copyWith(fontSize: 29),
                            ),
                            if (p.prixParM2 > 0) ...[
                              const SizedBox(width: 10),
                              Text(
                                '${p.prixParM2} DT/m²',
                                style: AppTypography.caption(textSec),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Property Headline
                        Text(p.titre, style: AppTypography.pageTitle(textPrim)),
                        const SizedBox(height: 10),

                        // Interactive Location Row -> Opens Map
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => EcranCarteInteractive(initialProperty: p)),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: borderColor, width: 0.9),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.location_on_outlined, size: 18, color: AppColors.accentChampagne),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(p.localisation, style: AppTypography.body(textPrim)),
                                ),
                                Text(
                                  'Carte',
                                  style: AppTypography.caption(AppColors.accentChampagne),
                                ),
                                const SizedBox(width: 2),
                                const Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.accentChampagne),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // 4-Metric Spec Grid
                        Row(
                          children: [
                            Expanded(child: _DetailStatTile(icon: Icons.bed_outlined, value: '${p.nombreChambres}', label: 'Chambres')),
                            const SizedBox(width: 10),
                            Expanded(child: _DetailStatTile(icon: Icons.bathtub_outlined, value: '${p.nombreSallesDeBain}', label: 'SDB')),
                            const SizedBox(width: 10),
                            Expanded(child: _DetailStatTile(icon: Icons.square_foot_rounded, value: '${p.surfaceM2} m²', label: 'Surface')),
                            const SizedBox(width: 10),
                            Expanded(child: _DetailStatTile(icon: Icons.calendar_today_outlined, value: '${p.anneeConstruction}', label: 'Année')),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Description
                        EditorialSectionHeader(title: AppLocale.instance.tr('description')),
                        const SizedBox(height: 10),
                        Text(p.description, style: AppTypography.body(textSec).copyWith(height: 1.55)),
                        const SizedBox(height: 24),

                        // Amenities
                        if (p.commodites.isNotEmpty) ...[
                          EditorialSectionHeader(title: AppLocale.instance.tr('amenities')),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: p.commodites.map((c) {
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
                                decoration: BoxDecoration(
                                  color: cardBg,
                                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                  border: Border.all(color: borderColor, width: 0.9),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.check_rounded, size: 14, color: AppColors.accentGreen),
                                    const SizedBox(width: 6),
                                    Text(
                                      AppLocale.instance.translateAmenity(c),
                                      style: AppTypography.caption(textPrim),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 24),
                        ],

                        // Owner / Source Card
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: borderColor, width: 0.9),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 46,
                                height: 46,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.surfaceElevatedOf(context),
                                ),
                                child: Center(
                                  child: Text(
                                    p.agentNom.isNotEmpty ? p.agentNom[0].toUpperCase() : 'D',
                                    style: AppTypography.cardTitle(textPrim),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(p.agentNom, style: AppTypography.cardTitle(textPrim)),
                                    const SizedBox(height: 2),
                                    Text(
                                      p.sourceName != null && p.sourceName!.isNotEmpty
                                          ? 'Source : ${p.sourceName}'
                                          : AppLocale.instance.tr('owner_role'),
                                      style: AppTypography.caption(textSec),
                                    ),
                                    if (p.agentTel.isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 3),
                                        child: GestureDetector(
                                          key: const Key('details_phone_link'),
                                          onTap: () => _appelerProprietaire(p.agentTel),
                                          child: Text(
                                            p.agentTel,
                                            style: AppTypography.caption(AppColors.accentChampagne).copyWith(
                                              decoration: TextDecoration.underline,
                                            ),
                                          ),
                                        ),
                                      ),
                                    if (p.sourceUrl != null && p.sourceUrl!.isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: GestureDetector(
                                          onTap: () => launchUrl(Uri.parse(p.sourceUrl!), mode: LaunchMode.externalApplication),
                                          child: Text(
                                            'Portail officiel →',
                                            style: AppTypography.caption(AppColors.accentChampagne),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              if (p.agentTel.isNotEmpty)
                                GlassOrbButton(
                                  key: const Key('details_call_button'),
                                  icon: Icons.phone_outlined,
                                  onTap: () => _appelerProprietaire(p.agentTel),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          // 3. Floating Liquid Glass Bottom Contact Bar
          Positioned(
            left: 18,
            right: 18,
            bottom: 16,
            child: SafeArea(
              top: false,
              child: LiquidGlassSurface(
                borderRadius: 30,
                blurSigma: 24,
                padding: const EdgeInsets.all(10),
                child: Row(
                  children: [
                    GlassOrbButton(
                      icon: Icons.phone_outlined,
                      size: 48,
                      iconSize: 20,
                      tooltip: 'Appeler',
                      onTap: () => _appelerProprietaire(p.agentTel),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _ouvrirModalContact(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isDark ? Colors.white : AppColors.accentObsidian,
                          foregroundColor: isDark ? AppColors.accentObsidian : Colors.white,
                          elevation: 0,
                          minimumSize: const Size(double.infinity, 48),
                          shape: const StadiumBorder(),
                        ),
                        child: const Text(
                          'Planifier une visite',
                          style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailStatTile extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _DetailStatTile({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceOf(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderOf(context), width: 0.9),
      ),
      child: Column(
        children: [
          Icon(icon, size: 19, color: AppColors.accentChampagne),
          const SizedBox(height: 6),
          Text(value, style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 15), maxLines: 1),
          const SizedBox(height: 2),
          Text(label, style: AppTypography.micro(textSec).copyWith(fontSize: 10.5), maxLines: 1),
        ],
      ),
    );
  }
}

class _GalleryFallback extends StatelessWidget {
  final Propriete propriete;

  const _GalleryFallback({required this.propriete});

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? const [Color(0xFF171A21), Color(0xFF0E1015)]
              : const [Color(0xFFF3F1EC), Color(0xFFE7E2D8)],
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.apartment_rounded, size: 48, color: AppColors.accentChampagne),
              const SizedBox(height: 12),
              Text(
                propriete.imageAttribution ?? 'Visuels non hébergés sur DarLink',
                textAlign: TextAlign.center,
                style: AppTypography.caption(AppColors.textSecondaryOf(context)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
