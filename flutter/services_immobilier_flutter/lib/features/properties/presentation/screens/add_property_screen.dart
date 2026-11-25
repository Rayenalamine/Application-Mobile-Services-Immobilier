// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT D'ANNONCE (Flutter)
// 24 Gouvernorats, statut d'annonce, validation HTTPS photo (aucun stock preset fictif).
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/tunisia_locations.dart';
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
  String _statutSelectionne = 'PUBLISHED';
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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrim, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.proprieteAEditer != null ? 'Modifier l\'annonce' : 'Déposer une annonce',
          style: TextStyle(color: textPrim, fontWeight: FontWeight.w800, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 40),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildLabel('URL Photo réelle du bien (HTTPS, optionnel)', textPrim),
                TextFormField(
                  controller: _imageUrlCtrl,
                  style: TextStyle(color: textPrim, fontSize: 13),
                  decoration: _inputDeco('https://firebasestorage.googleapis.com/...', cardBg, borderColor, textSec),
                ),

                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('À Vendre'),
                        selected: !_isLocation,
                        onSelected: (_) => setState(() => _isLocation = false),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('À Louer'),
                        selected: _isLocation,
                        onSelected: (_) => setState(() => _isLocation = true),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: DropdownButton<String>(
                        value: _statutSelectionne,
                        isExpanded: true,
                        items: const [
                          DropdownMenuItem(value: 'PUBLISHED', child: Text('Publié')),
                          DropdownMenuItem(value: 'DRAFT', child: Text('Brouillon')),
                        ],
                        onChanged: (v) => setState(() => _statutSelectionne = v!),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),
                _buildLabel('Titre de l\'annonce *', textPrim),
                TextFormField(
                  controller: _titreCtrl,
                  style: TextStyle(color: textPrim),
                  decoration: _inputDeco('ex: Appartement S+3 lumineux', cardBg, borderColor, textSec),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Veuillez saisir un titre' : null,
                ),

                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Type de bien', textPrim),
                          DropdownButtonFormField<String>(
                            initialValue: _typeSelectionne,
                            items: _types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                            onChanged: (val) => setState(() => _typeSelectionne = val!),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Gouvernorat', textPrim),
                          DropdownButtonFormField<String>(
                            initialValue: _gouvernoratSelectionne,
                            items: tunisiaGovernorates
                                .map((g) => DropdownMenuItem(value: g.nameFr, child: Text(g.nameFr)))
                                .toList(),
                            onChanged: (val) => setState(() => _gouvernoratSelectionne = val!),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),
                _buildLabel('Délégation / Quartier', textPrim),
                TextFormField(
                  controller: _quartierCtrl,
                  style: TextStyle(color: textPrim),
                  decoration: _inputDeco('ex: Ennasr 2, Sahloul, Houmt Souk', cardBg, borderColor, textSec),
                ),

                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel(_isLocation ? 'Loyer (DT/mois) *' : 'Prix (DT) *', textPrim),
                          TextFormField(
                            controller: _prixCtrl,
                            keyboardType: TextInputType.number,
                            style: TextStyle(color: textPrim),
                            decoration: _inputDeco('ex: 250000', cardBg, borderColor, textSec),
                            validator: (val) => val == null || val.trim().isEmpty ? 'Prix requis' : null,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Surface (m²) *', textPrim),
                          TextFormField(
                            controller: _surfaceCtrl,
                            keyboardType: TextInputType.number,
                            style: TextStyle(color: textPrim),
                            decoration: _inputDeco('ex: 135', cardBg, borderColor, textSec),
                            validator: (val) => val == null || val.trim().isEmpty ? 'Surface requise' : null,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Chambres : $_nbChambres', style: TextStyle(color: textPrim, fontWeight: FontWeight.w700)),
                    Row(
                      children: [
                        IconButton(onPressed: () => setState(() => _nbChambres = _nbChambres > 0 ? _nbChambres - 1 : 0), icon: const Icon(Icons.remove_circle_outline)),
                        IconButton(onPressed: () => setState(() => _nbChambres++), icon: const Icon(Icons.add_circle_outline, color: AppColors.accentBlue)),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 12),
                _buildLabel('Atouts & Commodités', textPrim),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _commoditesDisponibles.map((item) {
                    final isSel = _commoditesChoisies.contains(item);
                    return FilterChip(
                      label: Text(item),
                      selected: isSel,
                      onSelected: (s) => setState(() {
                        if (s) {
                          _commoditesChoisies.add(item);
                        } else {
                          _commoditesChoisies.remove(item);
                        }
                      }),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 16),
                _buildLabel('Description du bien', textPrim),
                TextFormField(
                  controller: _descCtrl,
                  maxLines: 3,
                  style: TextStyle(color: textPrim),
                  decoration: _inputDeco('Description détaillée...', cardBg, borderColor, textSec),
                ),

                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _soumettreAnnonce,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? Colors.white : AppColors.accentBlue,
                      foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    child: _isSubmitting
                        ? const CircularProgressIndicator()
                        : Text(
                            widget.proprieteAEditer != null ? 'Enregistrer les modifications' : 'Publier l\'annonce sur DarLink',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, Color color) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
      );

  InputDecoration _inputDeco(String hint, Color bg, Color border, Color hintColor) => InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: hintColor, fontSize: 13),
        filled: true,
        fillColor: bg,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: border)),
      );
}
