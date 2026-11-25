// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT & ÉDITION D'ANNONCE (Flutter • Liquid Glass)
// 24 Gouvernorats, statut d'annonce, validation HTTPS photo (aucun stock preset fictif).
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/tunisia_locations.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/firebase/storage_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../domain/models/property.dart';
import '../../data/property_api_service.dart';

class EcranDepotAnnonce extends StatefulWidget {
  final Propriete? proprieteAEditer;

  const EcranDepotAnnonce({super.key, this.proprieteAEditer});

  @override
  State<EcranDepotAnnonce> createState() => _EcranDepotAnnonceState();
}

class _EcranDepotAnnonceState extends State<EcranDepotAnnonce> {
  final _formKey = GlobalKey<FormState>();

  final _titreCtrl = TextEditingController();
  final _prixCtrl = TextEditingController();
  final _surfaceCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _quartierCtrl = TextEditingController();
  final _imageUrlCtrl = TextEditingController();

  String _typeSelectionne = 'Appartement';
  String _gouvernoratSelectionne = 'Tunis';
  String _statutSelectionne = 'PENDING_REVIEW';
  int _nbChambres = 3;
  int _nbSallesDeBain = 2;
  bool _isLocation = false;
  bool _isSubmitting = false;

  final List<String> _types = const ['Appartement', 'Villa', 'Maison', 'Studio', 'Terrain', 'Commercial'];
  final List<String> _commoditesDisponibles = const [
    'Piscine',
    'Vue mer',
    'Climatisation',
    'Garage',
    'Jardin',
    'Ascenseur',
    'Sécurité 24/7',
  ];
  final Set<String> _commoditesChoisies = {'Climatisation'};

  @override
  void initState() {
    super.initState();
    _imageUrlCtrl.addListener(() {
      if (mounted) setState(() {});
    });
    if (widget.proprieteAEditer != null) {
      final p = widget.proprieteAEditer!;
      _titreCtrl.text = p.titre;
      _prixCtrl.text = p.prix > 0 ? p.prix.toInt().toString() : '';
      _surfaceCtrl.text = p.surfaceM2.toString();
      _descCtrl.text = p.description;
      _quartierCtrl.text = p.neighborhood.isNotEmpty ? p.neighborhood : p.ville;
      _imageUrlCtrl.text = p.imageUrl;
      if (_types.contains(p.type)) _typeSelectionne = p.type;
      if (tunisiaGovernorates.any((g) => g.nameFr == p.governorate)) {
        _gouvernoratSelectionne = p.governorate;
      }
      _nbChambres = p.nombreChambres;
      _nbSallesDeBain = p.nombreSallesDeBain;
      _isLocation = p.estLocation;
      _commoditesChoisies.addAll(p.commodites);
    }
  }

  @override
  void dispose() {
    _titreCtrl.dispose();
    _prixCtrl.dispose();
    _surfaceCtrl.dispose();
    _descCtrl.dispose();
    _quartierCtrl.dispose();
    _imageUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _soumettreAnnonce() async {
    if (!_formKey.currentState!.validate()) return;
    if (!AuthState.instance.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez vous connecter dans votre Profil avant de publier.')),
      );
      return;
    }

    final photo = _imageUrlCtrl.text.trim();
    if (photo.isNotEmpty && !StorageService.isValidImageUrl(photo)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('URL image invalide : utilisez un lien HTTPS sécurisé.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final prix = double.tryParse(_prixCtrl.text.replaceAll(' ', '')) ?? 0;
    final surface = double.tryParse(_surfaceCtrl.text.replaceAll(' ', '')) ?? 0;
    final quartier = _quartierCtrl.text.trim().isNotEmpty ? _quartierCtrl.text.trim() : _gouvernoratSelectionne;
    final localisation = '$quartier, $_gouvernoratSelectionne';

    Propriete? resultProp;
    if (widget.proprieteAEditer != null) {
      resultProp = await PropertyApiService.instance.updateProperty(
        widget.proprieteAEditer!.id,
        {
          'title': _titreCtrl.text.trim(),
          'description': _descCtrl.text.trim(),
          'location': localisation,
          'governorate': _gouvernoratSelectionne,
          'city': quartier,
          'neighborhood': quartier,
          'price': prix,
          'type': _typeSelectionne,
          'imageUrl': photo,
          'bedrooms': _nbChambres,
          'bathrooms': _nbSallesDeBain,
          'surfaceM2': surface,
          'isRental': _isLocation,
          'listingStatus': _statutSelectionne,
          'amenities': _commoditesChoisies.toList(),
        },
      );
    } else {
      resultProp = await PropertyApiService.instance.createProperty(
        title: _titreCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        location: localisation,
        governorate: _gouvernoratSelectionne,
        city: quartier,
        neighborhood: quartier,
        price: prix,
        type: _typeSelectionne,
        imageUrl: photo,
        bedrooms: _nbChambres,
        bathrooms: _nbSallesDeBain,
        surfaceM2: surface,
        isRental: _isLocation,
        listingStatus: _statutSelectionne,
        amenities: _commoditesChoisies.toList(),
      );
    }

    setState(() => _isSubmitting = false);
    if (mounted && resultProp != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Annonce "${resultProp.titre}" enregistrée dans Cloud Firestore !'),
          backgroundColor: AppColors.accentGreen,
        ),
      );
      Navigator.of(context).pop(true);
    }
  }

  Widget _buildStepperTile({
    required String label,
    required IconData icon,
    required int value,
    required VoidCallback? onDecrement,
    required VoidCallback onIncrement,
  }) {
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final isDark = AppColors.isDark(context);

    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A1C22) : const Color(0xFFF5F5F7),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.borderOf(context), width: 0.8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 15, color: AppColors.accentChampagne),
                const SizedBox(width: 6),
                Text(label, style: AppTypography.caption(textSec)),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: onDecrement == null
                      ? null
                      : () {
                          HapticFeedback.selectionClick();
                          onDecrement();
                        },
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceOf(context),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.borderOf(context)),
                    ),
                    child: Icon(
                      Icons.remove,
                      size: 16,
                      color: onDecrement == null ? AppColors.textTertiaryOf(context) : textPrim,
                    ),
                  ),
                ),
                Text('$value', style: AppTypography.sectionTitle(textPrim)),
                GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    onIncrement();
                  },
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppColors.primaryActionBgOf(context),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.add,
                      size: 16,
                      color: AppColors.primaryActionFgOf(context),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.proprieteAEditer != null;
    final bgColor = AppColors.backgroundOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final isDark = AppColors.isDark(context);
    final previewPhoto = _imageUrlCtrl.text.trim();
    final hasValidPhoto = previewPhoto.isNotEmpty && StorageService.isValidImageUrl(previewPhoto);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: LiquidGlassSurface(
                borderRadius: AppSpacing.radiusPill,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                child: Row(
                  children: [
                    GlassOrbButton(
                      icon: Icons.arrow_back_ios_new_rounded,
                      size: 38,
                      iconSize: 16,
                      onTap: () => Navigator.of(context).pop(),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isEditing ? 'Édition DarLink' : 'Nouvelle annonce',
                            style: AppTypography.micro(AppColors.accentChampagne),
                          ),
                          Text(
                            isEditing ? 'Modifier l’annonce' : 'Déposer une annonce',
                            style: AppTypography.cardTitle(textPrim),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 120),
                  children: [
                    // 1. Transaction & Statut
                    LiquidGlassSurface(
                      borderRadius: AppSpacing.radiusLG,
                      padding: const EdgeInsets.all(16),
                      elevatedShadow: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('TRANSACTION', style: AppTypography.micro(textSec)),
                          const SizedBox(height: 10),
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
                                      setState(() => _isLocation = false);
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 180),
                                      padding: const EdgeInsets.symmetric(vertical: 11),
                                      decoration: BoxDecoration(
                                        color: !_isLocation ? AppColors.primaryActionBgOf(context) : Colors.transparent,
                                        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        'À vendre',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w600,
                                          color: !_isLocation ? AppColors.primaryActionFgOf(context) : textSec,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () {
                                      HapticFeedback.selectionClick();
                                      setState(() => _isLocation = true);
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 180),
                                      padding: const EdgeInsets.symmetric(vertical: 11),
                                      decoration: BoxDecoration(
                                        color: _isLocation ? AppColors.primaryActionBgOf(context) : Colors.transparent,
                                        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        'À louer',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w600,
                                          color: _isLocation ? AppColors.primaryActionFgOf(context) : textSec,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              for (final opt in const [
                                ('PENDING_REVIEW', 'Soumettre en revue'),
                                ('DRAFT', 'Brouillon privé'),
                              ])
                                Expanded(
                                  child: Padding(
                                    padding: EdgeInsets.only(right: opt.$1 == 'PENDING_REVIEW' ? 8 : 0),
                                    child: GestureDetector(
                                      onTap: () {
                                        HapticFeedback.selectionClick();
                                        setState(() => _statutSelectionne = opt.$1);
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 10),
                                        decoration: BoxDecoration(
                                          color: _statutSelectionne == opt.$1
                                              ? AppColors.accentChampagne.withValues(alpha: 0.16)
                                              : Colors.transparent,
                                          borderRadius: BorderRadius.circular(14),
                                          border: Border.all(
                                            color: _statutSelectionne == opt.$1
                                                ? AppColors.accentChampagne
                                                : AppColors.borderOf(context),
                                          ),
                                        ),
                                        alignment: Alignment.center,
                                        child: Text(
                                          opt.$2,
                                          style: AppTypography.caption(
                                            _statutSelectionne == opt.$1 ? AppColors.accentChampagne : textSec,
                                          ).copyWith(fontWeight: FontWeight.w600),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 2. Informations principales (TextFormField.at(0..2) preserved in exact order)
                    LiquidGlassSurface(
                      borderRadius: AppSpacing.radiusLG,
                      padding: const EdgeInsets.all(16),
                      elevatedShadow: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ESSENTIELS DU BIEN', style: AppTypography.micro(textSec)),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _titreCtrl,
                            style: TextStyle(color: textPrim),
                            decoration: const InputDecoration(
                              labelText: 'Titre de l\'annonce *',
                              hintText: 'Ex: Villa moderne avec piscine à La Marsa',
                            ),
                            validator: (v) => (v == null || v.trim().isEmpty) ? 'Veuillez saisir un titre' : null,
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: _prixCtrl,
                                  keyboardType: TextInputType.number,
                                  style: TextStyle(color: textPrim),
                                  decoration: const InputDecoration(labelText: 'Prix (DT) *'),
                                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Prix requis' : null,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: TextFormField(
                                  controller: _surfaceCtrl,
                                  keyboardType: TextInputType.number,
                                  style: TextStyle(color: textPrim),
                                  decoration: const InputDecoration(labelText: 'Surface (m²) *'),
                                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Surface requise' : null,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          DropdownButtonFormField<String>(
                            initialValue: _typeSelectionne,
                            dropdownColor: AppColors.surfaceOf(context),
                            style: TextStyle(color: textPrim),
                            decoration: const InputDecoration(labelText: 'Type de bien'),
                            items: _types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                            onChanged: (v) => setState(() => _typeSelectionne = v!),
                          ),
                          const SizedBox(height: 12),
                          DropdownButtonFormField<String>(
                            initialValue: _gouvernoratSelectionne,
                            dropdownColor: AppColors.surfaceOf(context),
                            style: TextStyle(color: textPrim),
                            decoration: const InputDecoration(labelText: 'Gouvernorat'),
                            items: tunisiaGovernorates
                                .map((g) => DropdownMenuItem(value: g.nameFr, child: Text(g.nameFr)))
                                .toList(),
                            onChanged: (v) => setState(() => _gouvernoratSelectionne = v!),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _quartierCtrl,
                            style: TextStyle(color: textPrim),
                            decoration: const InputDecoration(
                              labelText: 'Quartier / Commune',
                              hintText: 'Ex: Les Berges du Lac 2, Gammarth...',
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 3. Distribution & Commodités
                    LiquidGlassSurface(
                      borderRadius: AppSpacing.radiusLG,
                      padding: const EdgeInsets.all(16),
                      elevatedShadow: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ESPACES & ÉQUIPEMENTS', style: AppTypography.micro(textSec)),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              _buildStepperTile(
                                label: 'Chambres',
                                icon: Icons.bed_outlined,
                                value: _nbChambres,
                                onDecrement: _nbChambres > 0 ? () => setState(() => _nbChambres--) : null,
                                onIncrement: () => setState(() => _nbChambres++),
                              ),
                              const SizedBox(width: 12),
                              _buildStepperTile(
                                label: 'Salles d’eau',
                                icon: Icons.bathtub_outlined,
                                value: _nbSallesDeBain,
                                onDecrement: _nbSallesDeBain > 1 ? () => setState(() => _nbSallesDeBain--) : null,
                                onIncrement: () => setState(() => _nbSallesDeBain++),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _commoditesDisponibles.map((c) {
                              final selected = _commoditesChoisies.contains(c);
                              return GestureDetector(
                                onTap: () {
                                  HapticFeedback.selectionClick();
                                  setState(() {
                                    if (selected) {
                                      _commoditesChoisies.remove(c);
                                    } else {
                                      _commoditesChoisies.add(c);
                                    }
                                  });
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 160),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                                  decoration: BoxDecoration(
                                    color: selected
                                        ? AppColors.primaryActionBgOf(context)
                                        : (isDark ? const Color(0xFF1A1C22) : const Color(0xFFF5F5F7)),
                                    borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                    border: Border.all(
                                      color: selected ? Colors.transparent : AppColors.borderOf(context),
                                    ),
                                  ),
                                  child: Text(
                                    c,
                                    style: AppTypography.caption(
                                      selected ? AppColors.primaryActionFgOf(context) : textPrim,
                                    ).copyWith(fontWeight: FontWeight.w600),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 4. Photographie & Description
                    LiquidGlassSurface(
                      borderRadius: AppSpacing.radiusLG,
                      padding: const EdgeInsets.all(16),
                      elevatedShadow: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('GALERIE & DESCRIPTION', style: AppTypography.micro(textSec)),
                          const SizedBox(height: 12),
                          if (hasValidPhoto) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Image.network(
                                previewPhoto,
                                height: 156,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (_, _, _) => Container(
                                  height: 92,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF1A1C22) : const Color(0xFFF2F2F7),
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                  child: Text('Aperçu indisponible', style: AppTypography.caption(textSec)),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                          ],
                          TextField(
                            controller: _imageUrlCtrl,
                            style: TextStyle(color: textPrim),
                            decoration: const InputDecoration(
                              labelText: 'URL Photo HTTPS (optionnel)',
                              hintText: 'https://...',
                              prefixIcon: Icon(Icons.photo_camera_outlined, size: 19),
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _descCtrl,
                            maxLines: 4,
                            style: TextStyle(color: textPrim),
                            decoration: const InputDecoration(
                              labelText: 'Description architecturale et atouts',
                              alignLabelWithHint: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 22),
        child: LiquidGlassSurface(
          borderRadius: AppSpacing.radiusPill,
          padding: const EdgeInsets.all(6),
          child: LuxuryPillButton(
            label: isEditing ? 'Enregistrer les modifications' : 'Publier l\'annonce sur DarLink',
            icon: isEditing ? Icons.check_rounded : Icons.cloud_upload_outlined,
            isLoading: _isSubmitting,
            onPressed: _isSubmitting ? null : _soumettreAnnonce,
          ),
        ),
      ),
    );
  }
}
