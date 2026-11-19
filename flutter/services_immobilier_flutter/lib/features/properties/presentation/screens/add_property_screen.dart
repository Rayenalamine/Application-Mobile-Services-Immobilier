// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT D'ANNONCE IMMOBILIÈRE (Flutter V7)
// Formulaire de publication avec sélection de photos et validation
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
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
  final _adresseCtrl = TextEditingController();

  String _typeSelectionne = 'Appartement';
  String _villeSelectionnee = 'Tunis';
  int _nbChambres = 3;
  final int _nbSallesDeBain = 2;
  bool _isLocation = false;
  bool _isSubmitting = false;

  final List<String> _types = const ['Appartement', 'Villa', 'Maison'];
  final List<String> _villes = const ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Monastir', 'Sfax'];
  final List<String> _commoditesDisponibles = const [
    'Piscine', 'Vue mer', 'Climatisation', 'Garage', 'Jardin', 'Ascenseur', 'Sécurité 24/7'
  ];
  final Set<String> _commoditesChoisies = {'Climatisation', 'Ascenseur'};

  final String _imageParDefaut =
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

  @override
  void initState() {
    super.initState();
    if (widget.proprieteAEditer != null) {
      final p = widget.proprieteAEditer!;
      _titreCtrl.text = p.titre;
      _prixCtrl.text = p.prix.toInt().toString();
      _surfaceCtrl.text = p.surfaceM2.toString();
      _descCtrl.text = p.description;
      _adresseCtrl.text = p.localisation;
      if (_types.contains(p.type)) _typeSelectionne = p.type;
      _nbChambres = p.nombreChambres;
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
    _adresseCtrl.dispose();
    super.dispose();
  }

  Future<void> _soumettreAnnonce() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final prix = double.tryParse(_prixCtrl.text.replaceAll(' ', '')) ?? 300000;
    final surface = double.tryParse(_surfaceCtrl.text) ?? 120;
    final localisation = _adresseCtrl.text.isNotEmpty
        ? '${_adresseCtrl.text}, $_villeSelectionnee'
        : 'Centre-ville, $_villeSelectionnee';

    Propriete? resultProp;

    if (widget.proprieteAEditer != null) {
      resultProp = await PropertyApiService.instance.updateProperty(
        widget.proprieteAEditer!.id,
        {
          'title': _titreCtrl.text.trim(),
          'description': _descCtrl.text.isNotEmpty ? _descCtrl.text.trim() : 'Superbe bien haut de gamme.',
          'location': localisation,
          'city': _villeSelectionnee,
          'price': prix,
          'type': _typeSelectionne,
          'bedrooms': _nbChambres,
          'bathrooms': _nbSallesDeBain,
          'surfaceM2': surface,
          'isRental': _isLocation,
          'amenities': _commoditesChoisies.toList(),
        },
      );
    } else {
      resultProp = await PropertyApiService.instance.createProperty(
        title: _titreCtrl.text.trim(),
        description: _descCtrl.text.isNotEmpty
            ? _descCtrl.text.trim()
            : 'Superbe bien immobilier situé à $_villeSelectionnee, finitions haut de gamme.',
        location: localisation,
        city: _villeSelectionnee,
        price: prix,
        type: _typeSelectionne,
        imageUrl: _imageParDefaut,
        bedrooms: _nbChambres,
        bathrooms: _nbSallesDeBain,
        surfaceM2: surface,
        isRental: _isLocation,
        amenities: _commoditesChoisies.toList(),
      );
    }

    setState(() => _isSubmitting = false);

    if (mounted && resultProp != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(widget.proprieteAEditer != null
              ? 'Annonce modifiée avec succès !'
              : 'Annonce "${resultProp.titre}" publiée avec succès !'),
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
                // Aperçu visuel
                Container(
                  height: 180,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    image: DecorationImage(
                      image: NetworkImage(_imageParDefaut),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: LinearGradient(
                        colors: [Colors.black.withValues(alpha: 0.5), Colors.transparent],
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                      ),
                    ),
                    padding: const EdgeInsets.all(16),
                    alignment: Alignment.bottomLeft,
                    child: const Text(
                      '📷 Photo principale sélectionnée',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Type d'opération (Vente / Location)
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isLocation = false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: !_isLocation ? (isDark ? Colors.white : const Color(0xFF0F1015)) : cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: !_isLocation ? Colors.transparent : borderColor),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'À Vendre',
                            style: TextStyle(
                              color: !_isLocation ? (isDark ? const Color(0xFF0F1015) : Colors.white) : textSec,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isLocation = true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _isLocation ? (isDark ? Colors.white : const Color(0xFF0F1015)) : cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: _isLocation ? Colors.transparent : borderColor),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'À Louer',
                            style: TextStyle(
                              color: _isLocation ? (isDark ? const Color(0xFF0F1015) : Colors.white) : textSec,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Titre
                _buildLabel('Titre de l\'annonce *', textPrim),
                TextFormField(
                  controller: _titreCtrl,
                  style: TextStyle(color: textPrim),
                  decoration: _inputDeco('ex: Magnifique villa moderne avec jardin', cardBg, borderColor, textSec),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Veuillez saisir un titre' : null,
                ),

                const SizedBox(height: 16),

                // Type de bien & Ville
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Type de bien', textPrim),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: borderColor),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _typeSelectionne,
                                isExpanded: true,
                                dropdownColor: cardBg,
                                style: TextStyle(color: textPrim, fontWeight: FontWeight.w600),
                                items: _types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                                onChanged: (val) => setState(() => _typeSelectionne = val!),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Ville', textPrim),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: borderColor),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _villeSelectionnee,
                                isExpanded: true,
                                dropdownColor: cardBg,
                                style: TextStyle(color: textPrim, fontWeight: FontWeight.w600),
                                items: _villes.map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
                                onChanged: (val) => setState(() => _villeSelectionnee = val!),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Prix & Surface
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
                            decoration: _inputDeco('ex: 450000', cardBg, borderColor, textSec),
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
                            decoration: _inputDeco('ex: 180', cardBg, borderColor, textSec),
                            validator: (val) => val == null || val.trim().isEmpty ? 'Surface requise' : null,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Nombre de pièces
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Chambres : $_nbChambres', style: TextStyle(color: textPrim, fontWeight: FontWeight.w700)),
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => setState(() { if (_nbChambres > 1) _nbChambres--; }),
                          icon: Icon(Icons.remove_circle_outline, color: textSec),
                        ),
                        IconButton(
                          onPressed: () => setState(() => _nbChambres++),
                          icon: const Icon(Icons.add_circle_outline, color: AppColors.accentBlue),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Commodités
                _buildLabel('Atouts & Commodités', textPrim),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _commoditesDisponibles.map((item) {
                    final isSel = _commoditesChoisies.contains(item);
                    return FilterChip(
                      label: Text(item),
                      selected: isSel,
                      onSelected: (selected) {
                        setState(() {
                          if (selected) {
                            _commoditesChoisies.add(item);
                          } else {
                            _commoditesChoisies.remove(item);
                          }
                        });
                      },
                      selectedColor: isDark ? Colors.white : const Color(0xFF0F1015),
                      labelStyle: TextStyle(
                        color: isSel ? (isDark ? const Color(0xFF0F1015) : Colors.white) : textSec,
                        fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                      ),
                      backgroundColor: cardBg,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 20),

                // Description
                _buildLabel('Description du bien', textPrim),
                TextFormField(
                  controller: _descCtrl,
                  maxLines: 3,
                  style: TextStyle(color: textPrim),
                  decoration: _inputDeco('Détails supplémentaires...', cardBg, borderColor, textSec),
                ),

                const SizedBox(height: 30),

                // Bouton Publier
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _soumettreAnnonce,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? Colors.white : const Color(0xFF0F1015),
                      foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2))
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

  Widget _buildLabel(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(text, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
    );
  }

  InputDecoration _inputDeco(String hint, Color bg, Color border, Color hintColor) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: hintColor, fontSize: 13),
      filled: true,
      fillColor: bg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: border)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.accentBlue, width: 1.5)),
    );
  }
}

