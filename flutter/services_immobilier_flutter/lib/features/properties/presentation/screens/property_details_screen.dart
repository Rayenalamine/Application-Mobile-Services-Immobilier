// ============================================================
// DARLINK — ÉCRAN DE DÉTAILS DU BIEN LUXE (Screen 2)
// Galerie de pièces, atouts du bien, agent dédié et dock CTA adaptatif
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/property.dart';
import '../../data/property_api_service.dart';
import '../../presentation/screens/add_property_screen.dart';
import '../../../favorites/data/favorites_api_service.dart';
import '../../../contact/data/contact_api_service.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';

/// Écran affichant la fiche détaillée d'un bien immobilier (Screen 2).
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
    _imageAffichee = widget.propriete.imageUrl;
    _isFavorite = FavoritesApiService.instance.isFavorite(widget.propriete.id);
  }

  void _basculerFavori() {
    FavoritesApiService.instance.toggleFavorite(widget.propriete.id);
    setState(() {
      _isFavorite = !_isFavorite;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isFavorite ? 'Ajouté à vos favoris' : 'Retiré de vos favoris'),
        duration: const Duration(seconds: 1),
        backgroundColor: _isFavorite ? AppColors.accentBlue : AppColors.accentRed,
      ),
    );
  }

  void _ouvrirModalContact(BuildContext context) {
    final nomCtrl = TextEditingController(text: AuthService.instance.state.currentUser?.fullName ?? 'Rayen Lamine');
    final emailCtrl = TextEditingController(text: AuthService.instance.state.currentUser?.email ?? 'rayen@darlink.tn');
    final telCtrl = TextEditingController(text: '+216 ');
    final msgCtrl = TextEditingController(text: 'Bonjour, je souhaite visiter ce bien (${widget.propriete.titre}).');
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
                    if (nomCtrl.text.isEmpty || emailCtrl.text.isEmpty) return;
                    Navigator.pop(ctx);
                    await ContactApiService.instance.sendContactRequest(
                      propertyId: widget.propriete.id,
                      senderName: nomCtrl.text.trim(),
                      senderEmail: emailCtrl.text.trim(),
                      senderPhone: telCtrl.text.trim(),
                      message: msgCtrl.text.trim(),
                    );
                    if (!mounted || !context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Demande de visite transmise et enregistrée dans PostgreSQL !'),
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

  void _confirmerSuppression(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer ce bien ?'),
        content: Text('Êtes-vous certain de vouloir supprimer "${widget.propriete.titre}" ? Cette action est irréversible.'),
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
                  content: Text('Bien immobilier supprimé de la base de données.'),
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

  List<String> get _toutesLesImages {
    final list = [widget.propriete.imageUrl];
    list.addAll(widget.propriete.imagesGalerie);
    return list;
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

    final currentUserId = AuthState.instance.currentUser?.id;
    final isOwner = currentUserId != null && currentUserId.toString() == widget.propriete.proprietaireId;

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
          style: TextStyle(
            color: isDark ? Colors.white : const Color(0xFF111827),
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
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
                        MaterialPageRoute(
                          builder: (_) => EcranDepotAnnonce(proprieteAEditer: widget.propriete),
                        ),
                      );
                      if (!mounted || !context.mounted) return;
                      if (res == true) {
                        Navigator.pop(context);
                      }
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
          // ------------------------------------------------------------
          // CORPS DÉROULANT DU CONTENU
          // ------------------------------------------------------------
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. HERO IMAGE IMMERSIVE AVEC ANGLES ARRONDIS INFÉRIEURS
                Stack(
                  children: [
                    Container(
                      height: 380,
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(36),
                          bottomRight: Radius.circular(36),
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(36),
                          bottomRight: Radius.circular(36),
                        ),
                        child: _imageAffichee.isNotEmpty
                            ? Image.network(
                                _imageAffichee,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  color: isDark ? const Color(0xFF1E1F26) : const Color(0xFFF1F3F6),
                                  child: const Center(
                                    child: Icon(Icons.broken_image, size: 48, color: Colors.grey),
                                  ),
                                ),
                              )
                            : Container(
                                color: isDark ? const Color(0xFF1E1F26) : const Color(0xFFF1F3F6),
                                child: Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.home_work_outlined, size: 56, color: textSec.withValues(alpha: 0.5)),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Aucune photo fournie par le propriétaire',
                                        style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                      ),
                    ),

                    // Bouton 360 / Visite virtuelle en bas à gauche
                    Positioned(
                      bottom: 20,
                      left: 20,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0x99181920) : const Color(0xCCFFFFFF),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isDark ? const Color(0x33FFFFFF) : const Color(0x18000000),
                              ),
                            ),
                            child: Icon(
                              Icons.play_arrow_rounded,
                              color: isDark ? Colors.white : const Color(0xFF111827),
                              size: 20,
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Compteur de photos en bas à droite (ex: 1/4)
                    Positioned(
                      bottom: 20,
                      right: 20,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0x99181920) : const Color(0xCCFFFFFF),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isDark ? const Color(0x33FFFFFF) : const Color(0x18000000),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.photo_library_outlined,
                                  size: 14,
                                  color: isDark ? Colors.white : const Color(0xFF111827),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${_indexImage + 1}/${images.length}',
                                  style: TextStyle(
                                    color: isDark ? Colors.white : const Color(0xFF111827),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
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

                const SizedBox(height: 16),

                // 2. BANDE DE MINIATURES DE PIÈCES (SALON, CHAMBRE, CUISINE)
                if (images.length > 1)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SizedBox(
                      height: 72,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: images.length,
                        separatorBuilder: (context, _) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final isSelected = _indexImage == index;
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _imageAffichee = images[index];
                                _indexImage = index;
                              });
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              width: 88,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSelected ? AppColors.accentBlue : borderColor,
                                  width: isSelected ? 2.5 : 1,
                                ),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: Image.network(
                                  images[index],
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: isDark ? const Color(0xFF1E1F26) : const Color(0xFFF1F3F6),
                                    child: const Center(
                                      child: Icon(Icons.image_outlined, size: 24, color: Colors.grey),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                const SizedBox(height: 20),

                // 3. STATUT ET BADGE D'ESTIMATION
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0x1F10B981),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0x4D10B981)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.accentGreen,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              p.estLocation ? 'À Louer' : 'À Vendre',
                              style: const TextStyle(
                                color: AppColors.accentGreen,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0x22FFFFFF) : const Color(0x0C000000),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: borderColor),
                        ),
                        child: Text(
                          p.estLocation ? 'Bail 1 an renouvelable' : '${p.prixParM2} DT / m²',
                          style: TextStyle(
                            color: textSec,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // 4. PRIX MONUMENTAL ET TITRE COMPLET
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            p.prixAffiche,
                            style: TextStyle(
                              color: textPrim,
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(width: 10),
                          // Mention sémantique pour validation test
                          Text(
                            'Prix : ${p.prixFormate} TND',
                            style: TextStyle(
                              color: textSec,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        p.titre,
                        style: TextStyle(
                          color: textPrim,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.location_on_rounded, color: textSec, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            p.localisation,
                            style: TextStyle(
                              color: textSec,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // 5. CARACTÉRISTIQUES (Chambres, Salles de bain, Surface)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Caractéristiques',
                        style: TextStyle(
                          color: textPrim,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _BoxCarac(
                              icone: Icons.bed_outlined,
                              titre: 'Chambres',
                              valeur: '${p.nombreChambres} Bed',
                              isDark: isDark,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _BoxCarac(
                              icone: Icons.bathtub_outlined,
                              titre: 'Salles de bain',
                              valeur: '${p.nombreSallesDeBain} Bath',
                              isDark: isDark,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _BoxCarac(
                              icone: Icons.crop_square_rounded,
                              titre: 'Surface',
                              valeur: '${p.surfaceM2} m²',
                              isDark: isDark,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // 6. CARTE SPÉCIFICATIONS TECHNIQUES
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0x1AFFFFFF) : const Color(0x0C000000),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(Icons.home_work_outlined, color: textPrim, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Type de bien', style: TextStyle(color: textSec, fontSize: 11)),
                                    Text(p.type, style: TextStyle(color: textPrim, fontWeight: FontWeight.w700, fontSize: 13)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(width: 1, height: 36, color: borderColor),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0x1AFFFFFF) : const Color(0x0C000000),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(Icons.verified_outlined, color: textPrim, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Année / Standing', style: TextStyle(color: textSec, fontSize: 11)),
                                    Text('${p.anneeConstruction} • ${p.standing}', style: TextStyle(color: textPrim, fontWeight: FontWeight.w700, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // 7. SECTION ATOUTS & COMMODITÉS DU BIEN
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Atouts & Commodités',
                        style: TextStyle(
                          color: textPrim,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: p.commodites.map((item) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: borderColor),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.check_circle_rounded, size: 16, color: AppColors.accentGreen),
                                const SizedBox(width: 6),
                                Text(
                                  item,
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600,
                                    color: textPrim,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // 8. CARTE AGENT IMMOBILIER DÉDIÉ
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: AppColors.accentBlue.withValues(alpha: 0.15),
                          child: Text(
                            p.agentNom.isNotEmpty
                                ? p.agentNom.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join()
                                : 'P',
                            style: const TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p.agentNom, style: TextStyle(color: textPrim, fontWeight: FontWeight.w700, fontSize: 14)),
                              const SizedBox(height: 2),
                              Text('Propriétaire / Annonceur', style: TextStyle(color: textSec, fontSize: 12)),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.phone_in_talk_rounded, color: AppColors.accentGreen),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Appel de ${p.agentNom} (${p.agentTel})')),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // 9. DESCRIPTION
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Description',
                        style: TextStyle(
                          color: textPrim,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        p.description,
                        style: TextStyle(
                          color: textSec,
                          fontSize: 14,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ------------------------------------------------------------
          // DOCK FLOTTANT INFÉRIEUR (CTA : CONTACTER / RÉSERVER)
          // ------------------------------------------------------------
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: ClipRRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                  decoration: BoxDecoration(
                    color: bottomDockBg,
                    border: Border(
                      top: BorderSide(color: bottomDockBorder, width: 1),
                    ),
                  ),
                  child: Row(
                    children: [
                      // Bouton retour stylisé (OutlinedButton pour test)
                      OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: borderColor),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                        child: Text(
                          'Retour à la liste',
                          style: TextStyle(
                            color: textPrim,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Bouton d'action principal blanc éclatant (Contacter le propriétaire / Visite)
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _ouvrirModalContact(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? Colors.white : AppColors.accentBlue,
                            foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: isDark ? 0 : 3,
                          ),
                          child: const Text(
                            'Planifier une visite',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
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
}

class _BoxCarac extends StatelessWidget {
  final IconData icone;
  final String titre;
  final String valeur;
  final bool isDark;

  const _BoxCarac({
    required this.icone,
    required this.titre,
    required this.valeur,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icone, color: textSec, size: 22),
          const SizedBox(height: 6),
          Text(
            valeur,
            style: TextStyle(
              color: textPrim,
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            titre,
            style: TextStyle(
              color: textSec,
              fontSize: 11,
            ),
          ),
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

  const _GlassCircleButton({
    required this.icon,
    this.iconColor,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isDark ? const Color(0x99181920) : const Color(0xCCFFFFFF),
              shape: BoxShape.circle,
              border: Border.all(
                color: isDark ? const Color(0x33FFFFFF) : const Color(0x18000000),
                width: 1,
              ),
            ),
            child: Icon(
              icon,
              color: iconColor ?? (isDark ? Colors.white : const Color(0xFF111827)),
              size: 18,
            ),
          ),
        ),
      ),
    );
  }
}
