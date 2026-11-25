// ============================================================
// DARLINK — CARTOGRAPHIE INTERACTIVE PRODUCTION (Flutter Map + Geolocator)
// Tuiles haute disponibilité CARTO Voyager / Dark Matter (OSM)
// Zoom, panoramique, sélection de marqueurs, repli gouvernorat,
// cercles de confidentialité et gestion complète des permissions GPS.
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/tunisia_locations.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/presentation/screens/property_details_screen.dart';

class EcranCarteInteractive extends StatefulWidget {
  final Propriete? initialProperty;

  const EcranCarteInteractive({super.key, this.initialProperty});

  @override
  State<EcranCarteInteractive> createState() => _EcranCarteInteractiveState();
}

class _EcranCarteInteractiveState extends State<EcranCarteInteractive> {
  final MapController _mapController = MapController();

  LatLng _center = const LatLng(36.8065, 10.1815);
  double _zoom = 11.0;
  LatLng? _userGpsLocation;

  List<Propriete> _proprietes = [];
  Propriete? _proprieteSelectionnee;
  String _gouvernoratFiltre = 'Tous';
  bool _isLoading = true;
  bool _locatingUser = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialProperty != null) {
      final p = widget.initialProperty!;
      _center = LatLng(p.latitude, p.longitude);
      _zoom = p.coordinatePrecision == 'VERIFIED' ? 14.5 : 12.5;
      _proprieteSelectionnee = p;
    }
    _chargerBiens();
  }

  Future<void> _chargerBiens() async {
    setState(() => _isLoading = true);
    final list = await PropertyApiService.instance.getMapProperties(
      governorate: _gouvernoratFiltre == 'Tous' ? null : _gouvernoratFiltre,
    );
    if (!mounted) return;
    setState(() {
      _proprietes = list;
      if (_proprieteSelectionnee == null && list.isNotEmpty) {
        _proprieteSelectionnee = list.first;
      }
      _isLoading = false;
    });
  }

  void _centrerSurGouvernorat(String gov) {
    setState(() {
      _gouvernoratFiltre = gov;
      if (gov == 'Tous') {
        _center = const LatLng(35.8, 9.8);
        _zoom = 6.8;
      } else {
        final match = findGovernorate(gov);
        if (match != null) {
          _center = LatLng(match.latitude, match.longitude);
          _zoom = 11.8;
        }
      }
    });
    try {
      _mapController.move(_center, _zoom);
    } catch (_) {}
    _chargerBiens();
  }

  Future<void> _demanderEtCentrerPosition() async {
    final proceed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.my_location_rounded, color: AppColors.accentBlue, size: 22),
            SizedBox(width: 8),
            Expanded(child: Text('Accès à votre position GPS', style: TextStyle(fontSize: 16))),
          ],
        ),
        content: const Text(
          'DarLink utilise votre position uniquement pour centrer la carte autour de vous. '
          'Aucune donnée de localisation n’est stockée ni transmise à des tiers.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Plus tard'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accentBlue,
              foregroundColor: Colors.white,
            ),
            child: const Text('Autoriser'),
          ),
        ],
      ),
    );

    if (proceed != true || !mounted) return;
    setState(() => _locatingUser = true);

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          _afficherMessageCarte('Les services de localisation sont désactivés sur votre appareil.');
        }
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            _afficherMessageCarte('Permission GPS refusée. Vous pouvez parcourir les 24 gouvernorats librement.');
          }
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          _afficherMessageCarte(
            'Permission GPS bloquée définitivement. Activez la localisation dans les paramètres de votre appareil.',
          );
        }
        return;
      }

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 8),
        ),
      );
      if (!mounted) return;

      final target = LatLng(pos.latitude, pos.longitude);
      setState(() {
        _userGpsLocation = target;
        _center = target;
        _zoom = 13.5;
      });
      try {
        _mapController.move(target, _zoom);
      } catch (_) {}
    } catch (_) {
      if (mounted) {
        _afficherMessageCarte('Position GPS indisponible pour le moment. Affichage centré sur la Tunisie.');
      }
    } finally {
      if (mounted) setState(() => _locatingUser = false);
    }
  }

  void _afficherMessageCarte(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), duration: const Duration(seconds: 3)),
    );
  }

  void _zoomIn() {
    setState(() => _zoom = (_zoom + 1.0).clamp(5.0, 18.0));
    try {
      _mapController.move(_center, _zoom);
    } catch (_) {}
  }

  void _zoomOut() {
    setState(() => _zoom = (_zoom - 1.0).clamp(5.0, 18.0));
    try {
      _mapController.move(_center, _zoom);
    } catch (_) {}
  }

  String _precisionLabel(String precision) {
    switch (precision) {
      case 'VERIFIED':
        return 'Localisation vérifiée';
      case 'APPROXIMATE':
        return 'Zone approximative (confidentialité)';
      default:
        return 'Centre gouvernorat';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final quickGovernorates = ['Tous', 'Tunis', 'Ariana', 'Ben Arous', 'Nabeul', 'Bizerte', 'Sousse', 'Sfax', 'Médenine', 'Kairouan'];

    final tileUrl = isDark
        ? 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        : 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            // 1. MOTEUR FLUTTER_MAP INTERACTIF (WEB / ANDROID / IOS)
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _center,
                initialZoom: _zoom,
                minZoom: 5.0,
                maxZoom: 18.0,
                onPositionChanged: (camera, hasGesture) {
                  _center = camera.center;
                  _zoom = camera.zoom;
                },
              ),
              children: [
                TileLayer(
                  urlTemplate: tileUrl,
                  userAgentPackageName: 'tn.darlink.app',
                  maxZoom: 19,
                ),
                // Cercles de confidentialité pour adresses non exactes
                CircleLayer(
                  circles: _proprietes
                      .where((p) => p.coordinatePrecision != 'VERIFIED')
                      .map(
                        (p) => CircleMarker(
                          point: LatLng(p.latitude, p.longitude),
                          radius: 1100,
                          useRadiusInMeter: true,
                          color: AppColors.accentBlue.withValues(alpha: 0.12),
                          borderColor: AppColors.accentBlue.withValues(alpha: 0.45),
                          borderStrokeWidth: 1.5,
                        ),
                      )
                      .toList(),
                ),
                MarkerLayer(
                  markers: [
                    if (_userGpsLocation != null)
                      Marker(
                        point: _userGpsLocation!,
                        width: 24,
                        height: 24,
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.accentBlue.withValues(alpha: 0.25),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: AppColors.accentBlue,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ..._proprietes.map((prop) {
                      final isSelected = _proprieteSelectionnee?.id == prop.id;
                      final priceLabel = prop.priceOnRequest || prop.prix <= 0
                          ? 'Sur demande'
                          : '${(prop.prix / 1000).toStringAsFixed(0)}k DT';

                      return Marker(
                        point: LatLng(prop.latitude, prop.longitude),
                        width: 110,
                        height: 56,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _proprieteSelectionnee = prop;
                              _center = LatLng(prop.latitude, prop.longitude);
                            });
                            try {
                              _mapController.move(_center, _zoom < 12 ? 12.5 : _zoom);
                            } catch (_) {}
                          },
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.accentBlue
                                      : (isDark ? cardBg : Colors.white),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isSelected ? Colors.white : AppColors.accentBlue,
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
                                  priceLabel,
                                  style: TextStyle(
                                    color: isSelected
                                        ? Colors.white
                                        : (isDark ? Colors.white : AppColors.accentBlue),
                                    fontWeight: FontWeight.w700,
                                    fontSize: 10.5,
                                  ),
                                ),
                              ),
                              Icon(
                                Icons.location_on_rounded,
                                size: 22,
                                color: isSelected
                                    ? AppColors.accentBlue
                                    : (isDark ? Colors.white70 : const Color(0xFF1E293B)),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),

            // 2. EN-TÊTE : RETOUR, ACCUEIL & FILTRES GOUVERNORATS
            Positioned(
              top: 12,
              left: 16,
              right: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: cardBg.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          key: const Key('map_back_button'),
                          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrim, size: 18),
                          tooltip: 'Retour',
                          onPressed: () {
                            if (Navigator.of(context).canPop()) Navigator.of(context).pop();
                          },
                        ),
                        IconButton(
                          key: const Key('map_home_button'),
                          icon: const Icon(Icons.home_rounded, color: AppColors.accentBlue, size: 22),
                          tooltip: 'Accueil',
                          onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Carte Immobilière Tunisie',
                                style: TextStyle(
                                  color: textPrim,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                '${_proprietes.length} bien(s) actif(s) • $_gouvernoratFiltre',
                                style: TextStyle(color: textSec, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
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
                  SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: quickGovernorates.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final g = quickGovernorates[index];
                        final isSelected = _gouvernoratFiltre == g;
                        return InkWell(
                          onTap: () => _centrerSurGouvernorat(g),
                          borderRadius: BorderRadius.circular(18),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.accentBlue
                                  : cardBg.withValues(alpha: 0.95),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: isSelected ? AppColors.accentBlue : borderColor,
                              ),
                            ),
                            child: Text(
                              g,
                              style: TextStyle(
                                color: isSelected ? Colors.white : textPrim,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
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

            // 3. CONTRÔLES FLOTTANTS : ZOOM & GPS
            Positioned(
              right: 16,
              top: 132,
              child: Column(
                children: [
                  FloatingActionButton.small(
                    heroTag: 'map_zoom_in',
                    onPressed: _zoomIn,
                    backgroundColor: cardBg,
                    foregroundColor: textPrim,
                    child: const Icon(Icons.add),
                  ),
                  const SizedBox(height: 8),
                  FloatingActionButton.small(
                    heroTag: 'map_zoom_out',
                    onPressed: _zoomOut,
                    backgroundColor: cardBg,
                    foregroundColor: textPrim,
                    child: const Icon(Icons.remove),
                  ),
                  const SizedBox(height: 8),
                  FloatingActionButton.small(
                    heroTag: 'map_my_location',
                    onPressed: _locatingUser ? null : _demanderEtCentrerPosition,
                    backgroundColor: cardBg,
                    foregroundColor: AppColors.accentBlue,
                    child: _locatingUser
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.my_location),
                  ),
                ],
              ),
            ),

            // 4. ATTRIBUTION LÉGALE CARTO / OPENSTREETMAP
            Positioned(
              right: 10,
              bottom: _proprieteSelectionnee != null ? 142 : 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.65),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  '© OpenStreetMap contributors © CARTO',
                  style: TextStyle(color: Colors.white, fontSize: 9.5),
                ),
              ),
            ),

            // 5. APERÇU DU BIEN SÉLECTIONNÉ
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
                        builder: (_) => EcranDetails(propriete: _proprieteSelectionnee!),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.14),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: _proprieteSelectionnee!.imageUrl.isNotEmpty
                              ? Image.network(
                                  _proprieteSelectionnee!.imageUrl,
                                  width: 86,
                                  height: 78,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => _emptyThumb(isDark),
                                )
                              : _emptyThumb(isDark),
                        ),
                        const SizedBox(width: 12),
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
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13.5,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  const Icon(Icons.place_outlined, size: 13, color: AppColors.accentBlue),
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
                              const SizedBox(height: 2),
                              Text(
                                _precisionLabel(_proprieteSelectionnee!.coordinatePrecision),
                                style: TextStyle(color: textSec, fontSize: 10),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _proprieteSelectionnee!.prixAffiche,
                                    style: const TextStyle(
                                      color: AppColors.accentBlue,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 13.5,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: AppColors.accentBlue,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Consulter',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
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

  Widget _emptyThumb(bool isDark) {
    return Container(
      width: 86,
      height: 78,
      color: isDark ? const Color(0xFF1E222B) : const Color(0xFFF1F5F9),
      child: const Icon(Icons.apartment_rounded, color: AppColors.accentBlue, size: 28),
    );
  }
}
