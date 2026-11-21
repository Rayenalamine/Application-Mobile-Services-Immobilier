// ============================================================
// DARLINK — ÉCRAN DE CARTOGRAPHIE INTERACTIVE OPENSTREETMAP (V8)
// Rendu réel de tuiles OpenStreetMap Slippy Map (Web Mercator)
// Géolocalisation réelle avec pins dynamiques issus de PostgreSQL
// ============================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/presentation/screens/property_details_screen.dart';

class EcranCarteInteractive extends StatefulWidget {
  const EcranCarteInteractive({super.key});

  @override
  State<EcranCarteInteractive> createState() => _EcranCarteInteractiveState();
}

class _EcranCarteInteractiveState extends State<EcranCarteInteractive> {
  // Coordonnées de centrage initiales (Tunis Centre)
  double _centerLat = 36.8065;
  double _centerLng = 10.1815;
  int _zoom = 12; // Niveau de zoom standard (6 = Tunisie entière, 18 = niveau rue)

  List<Propriete> _proprietes = [];
  Propriete? _proprieteSelectionnee;
  String _villeFiltre = 'Toutes';
  bool _isLoading = true;

  final List<String> _villes = const [
    'Toutes',
    'Tunis',
    'La Marsa',
    'Sousse',
    'Hammamet',
    'Djerba',
    'Sfax',
  ];

  // Coordonnées prédéfinies des villes tunisiennes
  final Map<String, ({double lat, double lng, int zoom})> _coordsVilles = {
    'Tunis': (lat: 36.8065, lng: 10.1815, zoom: 13),
    'La Marsa': (lat: 36.8785, lng: 10.3247, zoom: 14),
    'Sousse': (lat: 35.8256, lng: 10.6369, zoom: 13),
    'Hammamet': (lat: 36.4000, lng: 10.6167, zoom: 13),
    'Djerba': (lat: 33.8075, lng: 10.8451, zoom: 12),
    'Sfax': (lat: 34.7406, lng: 10.7603, zoom: 13),
  };

  @override
  void initState() {
    super.initState();
    _chargerBiens();
  }

  Future<void> _chargerBiens() async {
    final list = await PropertyApiService.instance.getMapProperties();
    if (mounted) {
      setState(() {
        _proprietes = list;
        if (list.isNotEmpty) {
          _proprieteSelectionnee = list.first;
        }
        _isLoading = false;
      });
    }
  }

  // ============================================================
  // FORMULES DE PROJECTION WEB MERCATOR (EPSG:3857)
  // Conversion exacte entre coordonnées GPS et coordonnées pixels
  // ============================================================

  static double _sinh(double x) => (math.exp(x) - math.exp(-x)) / 2.0;

  static double _latToY(double lat, int zoom) {
    final n = math.pow(2.0, zoom);
    final clamped = math.max(-85.0511, math.min(85.0511, lat));
    final radClamped = clamped * math.pi / 180.0;
    return (1.0 - math.log(math.tan(radClamped) + 1.0 / math.cos(radClamped)) / math.pi) /
        2.0 *
        n *
        256.0;
  }

  static double _lngToX(double lng, int zoom) {
    final n = math.pow(2.0, zoom);
    return (lng + 180.0) / 360.0 * n * 256.0;
  }

  static double _xToLng(double x, int zoom) {
    final n = math.pow(2.0, zoom);
    return x / (n * 256.0) * 360.0 - 180.0;
  }

  static double _yToLat(double y, int zoom) {
    final n = math.pow(2.0, zoom);
    final yVal = math.pi * (1.0 - 2.0 * y / (n * 256.0));
    final latRad = math.atan(_sinh(yVal));
    return latRad * 180.0 / math.pi;
  }

  void _centrerSurVille(String ville) {
    setState(() {
      _villeFiltre = ville;
      if (_coordsVilles.containsKey(ville)) {
        final c = _coordsVilles[ville]!;
        _centerLat = c.lat;
        _centerLng = c.lng;
        _zoom = c.zoom;
      } else {
        _centerLat = 36.8065;
        _centerLng = 10.1815;
        _zoom = 11;
      }
    });
  }

  void _centrerMaPosition() {
    setState(() {
      _centerLat = 36.8065;
      _centerLng = 10.1815;
      _zoom = 14;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Position GPS centrée : Tunis (36.8065° N, 10.1815° E)'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _zoomIn() {
    if (_zoom < 18) {
      setState(() => _zoom++);
    }
  }

  void _zoomOut() {
    if (_zoom > 6) {
      setState(() => _zoom--);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final biensFiltres = _proprietes.where((p) {
      if (_villeFiltre == 'Toutes') return true;
      return p.localisation.toLowerCase().contains(_villeFiltre.toLowerCase()) ||
          p.ville.toLowerCase().contains(_villeFiltre.toLowerCase());
    }).toList();

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            // ========================================================
            // 1. CARTE RÉELLE OPENSTREETMAP (MOTEUR SLIPPY MAP MERCATOR)
            // ========================================================
            LayoutBuilder(
              builder: (context, constraints) {
                final viewW = constraints.maxWidth;
                final viewH = constraints.maxHeight;

                final centerX = _lngToX(_centerLng, _zoom);
                final centerY = _latToY(_centerLat, _zoom);

                final viewLeft = centerX - viewW / 2;
                final viewTop = centerY - viewH / 2;

                final minTileX = (viewLeft / 256.0).floor();
                final maxTileX = ((viewLeft + viewW) / 256.0).floor();
                final minTileY = (viewTop / 256.0).floor();
                final maxTileY = ((viewTop + viewH) / 256.0).floor();

                final numTiles = math.pow(2, _zoom).toInt();

                return GestureDetector(
                  onPanUpdate: (details) {
                    setState(() {
                      final newCenterX = centerX - details.delta.dx;
                      final newCenterY = centerY - details.delta.dy;
                      _centerLng = _xToLng(newCenterX, _zoom);
                      _centerLat = _yToLat(newCenterY, _zoom);
                    });
                  },
                  onDoubleTap: _zoomIn,
                  child: Container(
                    width: viewW,
                    height: viewH,
                    color: isDark ? const Color(0xFF1E2028) : const Color(0xFFE5E9F0),
                    child: Stack(
                      children: [
                        // A. TUILES OPENSTREETMAP OFFICIELLES
                        for (int tx = minTileX; tx <= maxTileX; tx++)
                          for (int ty = minTileY; ty <= maxTileY; ty++)
                            if (ty >= 0 && ty < numTiles)
                              Positioned(
                                left: tx * 256.0 - viewLeft,
                                top: ty * 256.0 - viewTop,
                                width: 256.0,
                                height: 256.0,
                                child: Image.network(
                                  'https://tile.openstreetmap.org/$_zoom/${((tx % numTiles) + numTiles) % numTiles}/$ty.png',
                                  headers: const {
                                    'User-Agent':
                                        'DarLink-App/1.0 (academic-project; contact: rayen@darlink.tn)'
                                  },
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: isDark
                                        ? const Color(0xFF1E2028)
                                        : const Color(0xFFE2E8F0),
                                    child: Center(
                                      child: Icon(
                                        Icons.map_outlined,
                                        size: 32,
                                        color: isDark ? Colors.white24 : Colors.black26,
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                        // B. PIN POSITION ACTUELLE GPS (PULSATION)
                        Positioned(
                          left: _lngToX(10.1815, _zoom) - viewLeft - 10,
                          top: _latToY(36.8065, _zoom) - viewTop - 10,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: AppColors.accentBlue.withValues(alpha: 0.3),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Container(
                                width: 10,
                                height: 10,
                                decoration: const BoxDecoration(
                                  color: AppColors.accentBlue,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ),
                        ),

                        // C. PINS GÉOLOCALISÉS DES BIENS POSTGRESQL
                        ...biensFiltres.map((prop) {
                          final px = _lngToX(prop.longitude, _zoom) - viewLeft;
                          final py = _latToY(prop.latitude, _zoom) - viewTop;
                          final isSelected = _proprieteSelectionnee?.id == prop.id;

                          return Positioned(
                            left: px - 45,
                            top: py - 40,
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _proprieteSelectionnee = prop;
                                });
                              },
                              child: AnimatedScale(
                                scale: isSelected ? 1.15 : 1.0,
                                duration: const Duration(milliseconds: 200),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Badge Prix
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? AppColors.accentBlue
                                            : (isDark ? cardBg : Colors.white),
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: isSelected
                                              ? Colors.white
                                              : AppColors.accentBlue,
                                          width: 1.5,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.2),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Text(
                                        '${(prop.prix / 1000).toStringAsFixed(0)}k DT',
                                        style: TextStyle(
                                          color: isSelected
                                              ? Colors.white
                                              : (isDark ? Colors.white : AppColors.accentBlue),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                    // Pointe de l'épingle
                                    Icon(
                                      Icons.location_on,
                                      size: 24,
                                      color: isSelected
                                          ? AppColors.accentBlue
                                          : (isDark ? Colors.white70 : Colors.black87),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                );
              },
            ),

            // ========================================================
            // 2. EN-TÊTE : FILTRES VILLES & ATTRIBUTION OPENSTREETMAP
            // ========================================================
            Positioned(
              top: 12,
              left: 16,
              right: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Barre de titre et statut
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: cardBg.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Bouton Retour
                        IconButton(
                          key: const Key('map_back_button'),
                          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrim, size: 18),
                          tooltip: 'Retour',
                          onPressed: () {
                            if (Navigator.of(context).canPop()) {
                              Navigator.of(context).pop();
                            }
                          },
                        ),
                        // Bouton Accueil direct (toujours accessible)
                        IconButton(
                          key: const Key('map_home_button'),
                          icon: const Icon(Icons.home_rounded, color: AppColors.accentBlue, size: 22),
                          tooltip: 'Retour à l\'accueil',
                          onPressed: () {
                            Navigator.of(context).popUntil((route) => route.isFirst);
                          },
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Cartographie OpenStreetMap',
                                style: TextStyle(
                                  color: textPrim,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                '${biensFiltres.length} bien(s) géolocalisé(s) en Tunisie',
                                style: TextStyle(color: textSec, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        // Indicateur de chargement
                        if (_isLoading)
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Pastilles de villes tunisiennes
                  SizedBox(
                    height: 38,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _villes.length,
                      separatorBuilder: (context, index) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final v = _villes[index];
                        final isSelected = _villeFiltre == v;
                        return InkWell(
                          onTap: () => _centrerSurVille(v),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.accentBlue
                                  : cardBg.withValues(alpha: 0.95),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSelected ? AppColors.accentBlue : borderColor,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.08),
                                  blurRadius: 4,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Text(
                              v,
                              style: TextStyle(
                                color: isSelected ? Colors.white : textPrim,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // ========================================================
            // 3. CONTRÔLES FLOTTANTS : ZOOM & POSITION
            // ========================================================
            Positioned(
              right: 16,
              top: 130,
              child: Column(
                children: [
                  FloatingActionButton.small(
                    heroTag: 'zoom_in_btn',
                    onPressed: _zoomIn,
                    backgroundColor: cardBg,
                    foregroundColor: textPrim,
                    child: const Icon(Icons.add),
                  ),
                  const SizedBox(height: 8),
                  FloatingActionButton.small(
                    heroTag: 'zoom_out_btn',
                    onPressed: _zoomOut,
                    backgroundColor: cardBg,
                    foregroundColor: textPrim,
                    child: const Icon(Icons.remove),
                  ),
                  const SizedBox(height: 8),
                  FloatingActionButton.small(
                    heroTag: 'my_location_btn',
                    onPressed: _centrerMaPosition,
                    backgroundColor: cardBg,
                    foregroundColor: AppColors.accentBlue,
                    child: const Icon(Icons.my_location),
                  ),
                ],
              ),
            ),

            // ========================================================
            // 4. ATTRIBUTION LÉGALE OPENSTREETMAP
            // ========================================================
            Positioned(
              right: 8,
              bottom: _proprieteSelectionnee != null ? 140 : 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  '© OpenStreetMap contributors',
                  style: TextStyle(color: Colors.white, fontSize: 9),
                ),
              ),
            ),

            // ========================================================
            // 5. CARTE D'APERÇU DU BIEN SÉLECTIONNÉ
            // ========================================================
            if (_proprieteSelectionnee != null)
              Positioned(
                left: 16,
                right: 16,
                bottom: 16,
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => EcranDetails(
                          propriete: _proprieteSelectionnee!,
                        ),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Image du bien
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            _proprieteSelectionnee!.imageUrl,
                            width: 90,
                            height: 80,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              width: 90,
                              height: 80,
                              color: isDark ? Colors.white10 : Colors.black12,
                              child: const Icon(Icons.image_not_supported),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Détails
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _proprieteSelectionnee!.titre,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: textPrim,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.place, size: 13, color: AppColors.accentBlue),
                                  const SizedBox(width: 3),
                                  Expanded(
                                    child: Text(
                                      _proprieteSelectionnee!.localisation,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(color: textSec, fontSize: 11),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${_proprieteSelectionnee!.prix.toStringAsFixed(0)} DT',
                                    style: const TextStyle(
                                      color: AppColors.accentBlue,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.accentBlue,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Consulter',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        SizedBox(width: 2),
                                        Icon(Icons.chevron_right, size: 14, color: Colors.white),
                                      ],
                                    ),
                                  ),
                                ],
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
      ),
    );
  }
}
