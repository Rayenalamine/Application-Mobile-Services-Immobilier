// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT & ÉDITION D'ANNONCE (Flutter • Liquid Glass)
// Galerie multi-photos réelle (ImagePicker), upload Firebase Storage,
// prévisualisation & réorganisation, trilingue FR/AR/EN + RTL.
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/tunisia_locations.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/firebase/storage_service.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../domain/models/property.dart';
import '../../data/property_api_service.dart';

class _SelectedPhotoItem {
  final String? existingUrl;
  final Uint8List? bytes;
  final String fileName;
  final String mimeType;

  const _SelectedPhotoItem({
    this.existingUrl,
    this.bytes,
    required this.fileName,
    required this.mimeType,
  });

  bool get isRemote => existingUrl != null && existingUrl!.isNotEmpty;
}

class EcranDepotAnnonce extends StatefulWidget {
  final Propriete? proprieteAEditer;

  const EcranDepotAnnonce({super.key, this.proprieteAEditer});

  @override
  State<EcranDepotAnnonce> createState() => _EcranDepotAnnonceState();
}

class _EcranDepotAnnonceState extends State<EcranDepotAnnonce> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();

  final _titreCtrl = TextEditingController();
  final _prixCtrl = TextEditingController();
  final _surfaceCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _quartierCtrl = TextEditingController();

  String _typeSelectionne = 'Appartement';
  String _gouvernoratSelectionne = 'Tunis';
  String _statutSelectionne = 'PENDING_REVIEW';
  int _nbChambres = 3;
  int _nbSallesDeBain = 2;
  bool _isLocation = false;
  bool _isSubmitting = false;
  int _uploadCurrent = 0;
  int _uploadTotal = 0;

  final List<_SelectedPhotoItem> _photos = [];

  final List<String> _types = const [
    'Appartement',
    'Villa',
    'Maison',
    'Studio',
    'Terrain',
    'Commercial',
  ];
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
    AppLocale.instance.addListener(_onLocaleChange);
    if (widget.proprieteAEditer != null) {
      final p = widget.proprieteAEditer!;
      _titreCtrl.text = p.titre;
      _prixCtrl.text = p.prix > 0 ? p.prix.toInt().toString() : '';
      _surfaceCtrl.text = p.surfaceM2.toString();
      _descCtrl.text = p.description;
      _quartierCtrl.text = p.neighborhood.isNotEmpty ? p.neighborhood : p.ville;
      if (_types.contains(p.type)) _typeSelectionne = p.type;
      if (tunisiaGovernorates.any((g) => g.nameFr == p.governorate)) {
        _gouvernoratSelectionne = p.governorate;
      }
      _nbChambres = p.nombreChambres;
      _nbSallesDeBain = p.nombreSallesDeBain;
      _isLocation = p.estLocation;
      _statutSelectionne = p.listingStatus == ListingStatus.draft ? 'DRAFT' : 'PENDING_REVIEW';
      _commoditesChoisies.addAll(p.commodites);

      if (p.imageUrl.trim().isNotEmpty) {
        _photos.add(_SelectedPhotoItem(
          existingUrl: p.imageUrl.trim(),
          fileName: 'cover.jpg',
          mimeType: 'image/jpeg',
        ));
      }
      for (final url in p.imagesGalerie) {
        final clean = url.trim();
        if (clean.isNotEmpty && clean != p.imageUrl.trim()) {
          _photos.add(_SelectedPhotoItem(
            existingUrl: clean,
            fileName: 'gallery.jpg',
            mimeType: 'image/jpeg',
          ));
        }
      }
    }
  }

  void _onLocaleChange() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    AppLocale.instance.removeListener(_onLocaleChange);
    _titreCtrl.dispose();
    _prixCtrl.dispose();
    _surfaceCtrl.dispose();
    _descCtrl.dispose();
    _quartierCtrl.dispose();
    super.dispose();
  }

  String _inferMimeType(XFile file) {
    final mime = file.mimeType?.toLowerCase().trim();
    if (mime != null && StorageService.allowedMimeTypes.contains(mime)) {
      return mime;
    }
    final name = file.name.toLowerCase();
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }

  Future<void> _pickFromGallery() async {
    if (_isSubmitting) return;
    try {
      final picked = await _picker.pickMultiImage(
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (picked.isEmpty) return;

      for (final xfile in picked) {
        if (_photos.length >= 8) break;
        final bytes = await xfile.readAsBytes();
        final mime = _inferMimeType(xfile);
        final err = StorageService.validateImage(
          mimeType: mime,
          sizeBytes: bytes.lengthInBytes,
        );
        if (err != null) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err)));
          }
          continue;
        }
        _photos.add(_SelectedPhotoItem(
          bytes: bytes,
          fileName: xfile.name.isNotEmpty ? xfile.name : 'photo_${DateTime.now().millisecondsSinceEpoch}.jpg',
          mimeType: mime,
        ));
      }
      if (mounted) setState(() {});
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppLocale.instance.tr('upload_failed')}: $e')),
        );
      }
    }
  }

  Future<void> _pickFromCamera() async {
    if (_isSubmitting || _photos.length >= 8) return;
    try {
      final xfile = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (xfile == null) return;
      final bytes = await xfile.readAsBytes();
      final mime = _inferMimeType(xfile);
      final err = StorageService.validateImage(
        mimeType: mime,
        sizeBytes: bytes.lengthInBytes,
      );
      if (err != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err)));
        }
        return;
      }
      setState(() {
        _photos.add(_SelectedPhotoItem(
          bytes: bytes,
          fileName: xfile.name.isNotEmpty ? xfile.name : 'camera_${DateTime.now().millisecondsSinceEpoch}.jpg',
          mimeType: mime,
        ));
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppLocale.instance.tr('upload_failed')}: $e')),
        );
      }
    }
  }

  void _setAsCover(int index) {
    if (index <= 0 || index >= _photos.length) return;
    HapticFeedback.selectionClick();
    setState(() {
      final item = _photos.removeAt(index);
      _photos.insert(0, item);
    });
  }

  void _removePhoto(int index) {
    if (index < 0 || index >= _photos.length) return;
    HapticFeedback.lightImpact();
    setState(() => _photos.removeAt(index));
  }

  Future<void> _soumettreAnnonce() async {
    if (_isSubmitting) return;
    if (!_formKey.currentState!.validate()) return;

    final loc = AppLocale.instance;
    if (!AuthState.instance.isAuthenticated || AuthState.instance.currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(loc.tr('auth_required'))),
      );
      return;
    }

    if (_photos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(loc.tr('validation_photo_required'))),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
      _uploadCurrent = 0;
      _uploadTotal = _photos.where((p) => !p.isRemote).length;
    });

    try {
      await AuthService.instance.refreshSessionIfNeeded();
      final idToken = AuthState.instance.token ?? '';
      final uid = AuthState.instance.currentUser!.effectiveUid;
      if (idToken.isEmpty) {
        throw Exception(loc.tr('auth_required'));
      }

      final propertyIdForStorage = widget.proprieteAEditer?.id ?? 'prop_${DateTime.now().millisecondsSinceEpoch}';
      final uploadedUrls = <String>[];

      for (final photo in _photos) {
        if (photo.isRemote) {
          uploadedUrls.add(photo.existingUrl!);
        } else if (photo.bytes != null) {
          setState(() => _uploadCurrent += 1);
          final res = await StorageService.instance.uploadImage(
            idToken: idToken,
            userId: uid,
            propertyId: propertyIdForStorage,
            fileName: photo.fileName,
            mimeType: photo.mimeType,
            bytes: photo.bytes!,
          );
          final url = res['downloadUrl'] ?? '';
          if (url.isNotEmpty) {
            uploadedUrls.add(url);
          }
        }
      }

      if (uploadedUrls.isEmpty) {
        throw Exception(loc.tr('upload_failed'));
      }

      final coverUrl = uploadedUrls.first;
      final galleryUrls = uploadedUrls.length > 1 ? uploadedUrls.sublist(1) : <String>[];

      final prix = double.tryParse(_prixCtrl.text.replaceAll(' ', '')) ?? 0;
      final surface = double.tryParse(_surfaceCtrl.text.replaceAll(' ', '')) ?? 0;
      final quartier = _quartierCtrl.text.trim().isNotEmpty
          ? _quartierCtrl.text.trim()
          : _gouvernoratSelectionne;
      final localisation = '$quartier, $_gouvernoratSelectionne';
      final desc = _descCtrl.text.trim().isNotEmpty
          ? _descCtrl.text.trim()
          : '${loc.translatePropertyType(_typeSelectionne)} — $localisation';

      Propriete? resultProp;
      if (widget.proprieteAEditer != null) {
        resultProp = await PropertyApiService.instance.updateProperty(
          widget.proprieteAEditer!.id,
          {
            'title': _titreCtrl.text.trim(),
            'description': desc,
            'location': localisation,
            'governorate': _gouvernoratSelectionne,
            'city': quartier,
            'neighborhood': quartier,
            'price': prix,
            'type': _typeSelectionne,
            'imageUrl': coverUrl,
            'galleryUrls': galleryUrls,
            'imagePermissionStatus': 'OWNER_UPLOADED',
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
          description: desc,
          location: localisation,
          governorate: _gouvernoratSelectionne,
          city: quartier,
          neighborhood: quartier,
          price: prix,
          type: _typeSelectionne,
          imageUrl: coverUrl,
          galleryUrls: galleryUrls,
          bedrooms: _nbChambres,
          bathrooms: _nbSallesDeBain,
          surfaceM2: surface,
          isRental: _isLocation,
          listingStatus: _statutSelectionne,
          amenities: _commoditesChoisies.toList(),
        );
      }

      if (!mounted) return;
      setState(() => _isSubmitting = false);

      if (resultProp != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            content: Text(
              loc.trParams('publish_saved_status', {
                'title': resultProp.titre,
                'status': loc.translateListingStatus(resultProp.listingStatus.value),
              }),
            ),
            backgroundColor: AppColors.accentGreen,
          ),
        );
        Navigator.of(context).pop(true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            behavior: SnackBarBehavior.floating,
            backgroundColor: AppColors.accentRed,
            content: Text(loc.tr('publish_error')),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.accentRed,
          content: Text('${loc.tr('publish_error')} ($e)'),
        ),
      );
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
    final isDark = AppColors.isDark(context);

    return LiquidGlassSurface(
      borderRadius: AppSpacing.radiusMD,
      elevatedShadow: false,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: AppColors.accentChampagne.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 17, color: AppColors.accentChampagne),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label, style: AppTypography.body(textPrim).copyWith(fontWeight: FontWeight.w500)),
          ),
          _StepperButton(icon: Icons.remove_rounded, onTap: onDecrement, isDark: isDark),
          SizedBox(
            width: 34,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: AppTypography.cardTitle(textPrim),
            ),
          ),
          _StepperButton(icon: Icons.add_rounded, onTap: onIncrement, isDark: isDark),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocale.instance;
    final bgColor = AppColors.backgroundOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final border = AppColors.borderOf(context);
    final isDark = AppColors.isDark(context);
    final primaryBg = AppColors.primaryActionBgOf(context);
    final primaryFg = AppColors.primaryActionFgOf(context);
    final isEditing = widget.proprieteAEditer != null;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: [
                  GlassOrbButton(
                    icon: Icons.arrow_back_ios_new_rounded,
                    tooltip: loc.tr('btn_back'),
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      isEditing ? loc.tr('edit_title') : loc.tr('add_title'),
                      style: AppTypography.pageTitle(textPrim).copyWith(fontSize: 22),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
                  children: [
                    // ─── PHOTOS (GALERIE RÉELLE + CAMÉRA) ───
                    EditorialSectionHeader(
                      title: loc.tr('add_photos'),
                      subtitle: loc.trParams('photos_selected', {'count': _photos.length}),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isSubmitting ? null : _pickFromGallery,
                            icon: const Icon(Icons.photo_library_outlined, size: 18),
                            label: Text(loc.tr('pick_from_gallery')),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 13),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              side: BorderSide(color: border),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isSubmitting ? null : _pickFromCamera,
                            icon: const Icon(Icons.photo_camera_outlined, size: 18),
                            label: Text(loc.tr('take_photo')),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 13),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              side: BorderSide(color: border),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(loc.tr('photo_limit_hint'), style: AppTypography.caption(textSec)),
                    if (_photos.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 128,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _photos.length,
                          separatorBuilder: (_, _) => const SizedBox(width: 10),
                          itemBuilder: (context, index) {
                            final photo = _photos[index];
                            final isCover = index == 0;
                            return SizedBox(
                              width: 132,
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: photo.isRemote
                                        ? LuxuryNetworkImage(
                                            imageUrl: photo.existingUrl!,
                                            memCacheWidth: 400,
                                            fallbackBuilder: (_) => Container(
                                              color: AppColors.surfaceElevatedOf(context),
                                              child: Icon(Icons.broken_image_outlined, color: textSec),
                                            ),
                                          )
                                        : Image.memory(photo.bytes!, fit: BoxFit.cover),
                                  ),
                                  if (isCover)
                                    PositionedDirectional(
                                      bottom: 6,
                                      start: 6,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withValues(alpha: 0.72),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          loc.tr('cover_photo'),
                                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600),
                                        ),
                                      ),
                                    )
                                  else
                                    PositionedDirectional(
                                      bottom: 6,
                                      start: 6,
                                      child: GestureDetector(
                                        onTap: () => _setAsCover(index),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withValues(alpha: 0.65),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            loc.tr('set_as_cover'),
                                            style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w500),
                                          ),
                                        ),
                                      ),
                                    ),
                                  PositionedDirectional(
                                    top: 6,
                                    end: 6,
                                    child: GestureDetector(
                                      onTap: () => _removePhoto(index),
                                      child: Container(
                                        width: 26,
                                        height: 26,
                                        decoration: BoxDecoration(
                                          color: Colors.black.withValues(alpha: 0.7),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.close_rounded, size: 15, color: Colors.white),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                    const SizedBox(height: 22),

                    // ─── TRANSACTION & STATUT ───
                    EditorialSectionHeader(title: loc.tr('transaction_and_status')),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _SegmentChoice(
                            label: loc.tr('for_sale'),
                            selected: !_isLocation,
                            onTap: () => setState(() => _isLocation = false),
                            primaryBg: primaryBg,
                            primaryFg: primaryFg,
                            isDark: isDark,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SegmentChoice(
                            label: loc.tr('for_rent'),
                            selected: _isLocation,
                            onTap: () => setState(() => _isLocation = true),
                            primaryBg: primaryBg,
                            primaryFg: primaryFg,
                            isDark: isDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _SegmentChoice(
                            label: loc.tr('submit_for_review'),
                            selected: _statutSelectionne == 'PENDING_REVIEW',
                            onTap: () => setState(() => _statutSelectionne = 'PENDING_REVIEW'),
                            primaryBg: AppColors.accentChampagne,
                            primaryFg: Colors.white,
                            isDark: isDark,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SegmentChoice(
                            label: loc.tr('save_as_draft'),
                            selected: _statutSelectionne == 'DRAFT',
                            onTap: () => setState(() => _statutSelectionne = 'DRAFT'),
                            primaryBg: const Color(0xFF64748B),
                            primaryFg: Colors.white,
                            isDark: isDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 22),

                    // ─── TYPE DE BIEN ───
                    EditorialSectionHeader(title: loc.tr('property_type')),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _types.map((t) {
                        final active = _typeSelectionne == t;
                        return GestureDetector(
                          onTap: () {
                            HapticFeedback.selectionClick();
                            setState(() => _typeSelectionne = t);
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 160),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                            decoration: BoxDecoration(
                              color: active ? primaryBg : AppColors.surfaceElevatedOf(context),
                              borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                              border: Border.all(color: active ? primaryBg : border),
                            ),
                            child: Text(
                              loc.translatePropertyType(t),
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                                color: active ? primaryFg : textPrim,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 22),

                    // ─── CHAMPS TEXTE ───
                    TextFormField(
                      controller: _titreCtrl,
                      decoration: InputDecoration(
                        labelText: loc.tr('field_title'),
                        hintText: loc.tr('field_title_hint'),
                      ),
                      validator: (v) => (v == null || v.trim().length < 3)
                          ? loc.tr('validation_title')
                          : null,
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _prixCtrl,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: loc.tr('field_price'),
                              hintText: loc.tr('field_price_hint'),
                            ),
                            validator: (v) {
                              final p = double.tryParse((v ?? '').replaceAll(' ', ''));
                              return (p == null || p <= 0) ? loc.tr('validation_price') : null;
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _surfaceCtrl,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: loc.tr('field_surface'),
                              hintText: '140',
                            ),
                            validator: (v) {
                              final s = double.tryParse((v ?? '').replaceAll(' ', ''));
                              return (s == null || s <= 0) ? loc.tr('validation_surface') : null;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                      initialValue: _gouvernoratSelectionne,
                      decoration: InputDecoration(labelText: loc.tr('governorate')),
                      items: tunisiaGovernorates
                          .map((g) => DropdownMenuItem(value: g.nameFr, child: Text(g.nameFr)))
                          .toList(),
                      onChanged: (v) {
                        if (v != null) setState(() => _gouvernoratSelectionne = v);
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _quartierCtrl,
                      decoration: InputDecoration(
                        labelText: loc.tr('neighborhood_label'),
                        hintText: loc.tr('neighborhood_hint'),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? loc.tr('validation_neighborhood')
                          : null,
                    ),
                    const SizedBox(height: 16),

                    // ─── STEPPERS ───
                    _buildStepperTile(
                      label: loc.tr('bedrooms'),
                      icon: Icons.bed_outlined,
                      value: _nbChambres,
                      onDecrement: _nbChambres > 0 ? () => setState(() => _nbChambres--) : null,
                      onIncrement: () => setState(() => _nbChambres++),
                    ),
                    const SizedBox(height: 10),
                    _buildStepperTile(
                      label: loc.tr('bathrooms'),
                      icon: Icons.bathtub_outlined,
                      value: _nbSallesDeBain,
                      onDecrement: _nbSallesDeBain > 0 ? () => setState(() => _nbSallesDeBain--) : null,
                      onIncrement: () => setState(() => _nbSallesDeBain++),
                    ),
                    const SizedBox(height: 18),

                    // ─── COMMODITÉS ───
                    EditorialSectionHeader(title: loc.tr('amenities')),
                    const SizedBox(height: 10),
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
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: selected
                                  ? AppColors.accentChampagne.withValues(alpha: 0.16)
                                  : AppColors.surfaceElevatedOf(context),
                              borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                              border: Border.all(
                                color: selected ? AppColors.accentChampagne : border,
                              ),
                            ),
                            child: Text(
                              loc.translateAmenity(c),
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                                color: selected ? AppColors.accentChampagne : textPrim,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 18),

                    // ─── DESCRIPTION ───
                    TextFormField(
                      controller: _descCtrl,
                      maxLines: 4,
                      decoration: InputDecoration(
                        labelText: loc.tr('field_description'),
                        hintText: loc.tr('field_description_hint'),
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 24),

                    if (_isSubmitting && _uploadTotal > 0)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          loc.trParams('uploading_photos', {
                            'current': _uploadCurrent,
                            'total': _uploadTotal,
                          }),
                          textAlign: TextAlign.center,
                          style: AppTypography.caption(AppColors.accentChampagne),
                        ),
                      ),

                    LuxuryPillButton(
                      label: isEditing ? loc.tr('btn_save') : loc.tr('btn_publish'),
                      icon: isEditing ? Icons.check_rounded : Icons.publish_rounded,
                      isLoading: _isSubmitting,
                      onPressed: _isSubmitting ? null : _soumettreAnnonce,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StepperButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final bool isDark;

  const _StepperButton({
    required this.icon,
    required this.onTap,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final disabled = onTap == null;
    return GestureDetector(
      onTap: () {
        if (onTap != null) {
          HapticFeedback.selectionClick();
          onTap!();
        }
      },
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 17,
          color: disabled
              ? AppColors.textSecondaryOf(context).withValues(alpha: 0.35)
              : AppColors.textPrimaryOf(context),
        ),
      ),
    );
  }
}

class _SegmentChoice extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color primaryBg;
  final Color primaryFg;
  final bool isDark;

  const _SegmentChoice({
    required this.label,
    required this.selected,
    required this.onTap,
    required this.primaryBg,
    required this.primaryFg,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
        decoration: BoxDecoration(
          color: selected ? primaryBg : AppColors.surfaceElevatedOf(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? primaryBg : AppColors.borderOf(context),
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: selected ? primaryFg : AppColors.textPrimaryOf(context),
          ),
        ),
      ),
    );
  }
}
