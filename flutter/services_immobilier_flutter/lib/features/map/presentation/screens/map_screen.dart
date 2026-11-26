// ============================================================
// DARLINK — APPLE LIQUID GLASS INTERACTIVE MAP (Flutter)
// CARTO Voyager / Dark Matter OSM tiles, privacy circles,
// frosted floating overlays, obsidian/champagne markers & preview.
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/tunisia_locations.dart';
import '../../../../core/design_system/liquid_glass.dart';
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
      if (list.isNotEmpty) {
        if (_proprieteSelectionnee == null || !list.any((p) => p.id == _proprieteSelectionnee!.id)) {
          _proprieteSelectionnee = list.first;
        }
      } else {
        _proprieteSelectionnee = null;
      }
      _isLoading = false;
    });
  }

  void _centrerSurGouvernorat(String gov) {
    HapticFeedback.selectionClick();
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.my_location_rounded, color: AppColors.accentChampagne, size: 22),
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
              backgroundColor: AppColors.primaryActionBgOf(ctx),
              foregroundColor: AppColors.primaryActionFgOf(ctx),
              shape: const StadiumBorder(),
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
    final isDark = AppColors.isDark(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final activeBg = AppColors.primaryActionBgOf(context);
    final activeFg = AppColors.primaryActionFgOf(context);

    final quickGovernorates = const ['Tous', 'Tunis', 'Ariana', 'Ben Arous', 'Nabeul', 'Bizerte', 'Sousse', 'Sfax', 'Médenine', 'Kairouan'];

    const maptilerKey = String.fromEnvironment('MAPTILER_API_KEY', defaultValue: '5y3oKTTSOXa9eD0KObiE');
    final tileUrl = isDark
        ? 'https://api.maptiler.com/maps/streets-v2-dark/256/{z}/{x}/{y}.png?key=$maptilerKey'
        : 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=$maptilerKey';

    return Scaffold(
      body: Stack(
        children: [
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
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'tn.darlink.app',
                maxZoom: 19,
              ),
              CircleLayer(
                circles: _proprietes
                    .where((p) => p.coordinatePrecision != 'VERIFIED')
                    .map(
                      (p) => CircleMarker(
                        point: LatLng(p.latitude, p.longitude),
                        radius: 1100,
                        useRadiusInMeter: true,
                        color: AppColors.accentChampagne.withValues(alpha: 0.12),
                        borderColor: AppColors.accentChampagne.withValues(alpha: 0.45),
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
                      width: 114,
                      height: 54,
                      child: GestureDetector(
                        onTap: () {
                          HapticFeedback.selectionClick();
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
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: isSelected ? activeBg : cardBg,
                                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                border: Border.all(
                                  color: isSelected ? AppColors.accentChampagne : borderColor,
                                  width: isSelected ? 1.5 : 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.16),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Text(
                                priceLabel,
                                style: TextStyle(
                                  color: isSelected ? activeFg : textPrim,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 10.5,
                                ),
                              ),
                            ),
                            Icon(
                              Icons.location_on_rounded,
                              size: 20,
                              color: isSelected ? AppColors.accentChampagne : textPrim,
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

          // Top Frosted Header + Governorate Pills
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  LiquidGlassSurface(
                    borderRadius: 24,
                    blurSigma: 22,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    child: Row(
                      children: [
                        GlassOrbButton(
                          key: const Key('map_back_button'),
                          icon: Icons.arrow_back_ios_new_rounded,
                          size: 38,
                          iconSize: 17,
                          tooltip: 'Retour',
                          onTap: () {
                            if (Navigator.of(context).canPop()) Navigator.of(context).pop();
                          },
                        ),
                        const SizedBox(width: 6),
                        GlassOrbButton(
                          key: const Key('map_home_button'),
                          icon: Icons.home_outlined,
                          size: 38,
                          iconSize: 18,
                          tooltip: 'Accueil',
                          onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('Carte Immobilière Tunisie', style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14.5)),
                              Text('${_proprietes.length} bien(s) • $_gouvernoratFiltre', style: AppTypography.caption(textSec).copyWith(fontSize: 11.5)),
                            ],
                          ),
                        ),
                        if (_isLoading)
                          const Padding(
                            padding: EdgeInsets.only(right: 6),
                            child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: quickGovernorates.length,
                      separatorBuilder: (_, _) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final g = quickGovernorates[index];
                        final isSelected = _gouvernoratFiltre == g;
                        return GestureDetector(
                          onTap: () => _centrerSurGouvernorat(g),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isSelected ? activeBg : cardBg.withValues(alpha: 0.92),
                              borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                              border: Border.all(color: isSelected ? Colors.transparent : borderColor),
                            ),
                            child: Text(
                              g,
                              style: TextStyle(
                                color: isSelected ? activeFg : textPrim,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
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
          ),

          // Right Floating Liquid Glass Controls Capsule (Zoom + GPS)
          Positioned(
            right: 16,
            top: 148,
            child: LiquidGlassSurface(
              borderRadius: 24,
              blurSigma: 20,
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 5),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(onPressed: _zoomIn, icon: Icon(Icons.add, color: textPrim, size: 20)),
                  Divider(height: 1, thickness: 0.8, color: borderColor),
                  IconButton(onPressed: _zoomOut, icon: Icon(Icons.remove, color: textPrim, size: 20)),
                  Divider(height: 1, thickness: 0.8, color: borderColor),
                  IconButton(
                    onPressed: _locatingUser ? null : _demanderEtCentrerPosition,
                    icon: _locatingUser
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.my_location, color: AppColors.accentChampagne, size: 20),
                  ),
                ],
              ),
            ),
          ),

          // CARTO / OSM Attribution
          Positioned(
            right: 12,
            bottom: _proprieteSelectionnee != null ? 154 : 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.62),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '© MapTiler © OpenStreetMap contributors',
                style: TextStyle(color: Colors.white, fontSize: 9.5),
              ),
            ),
          ),

          // Bottom Liquid Glass Property Preview Card
          if (_proprieteSelectionnee != null)
            Positioned(
              left: 16,
              right: 16,
              bottom: 18,
              child: SafeArea(
                top: false,
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => EcranDetails(propriete: _proprieteSelectionnee!)),
                    );
                  },
                  child: LiquidGlassSurface(
                    borderRadius: 24,
                    blurSigma: 24,
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: _proprieteSelectionnee!.imageUrl.isNotEmpty
                              ? Image.network(
                                  _proprieteSelectionnee!.imageUrl,
                                  width: 84,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => _emptyThumb(isDark),
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
                                style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14),
                              ),
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 13, color: AppColors.accentChampagne),
                                  const SizedBox(width: 3),
                                  Expanded(
                                    child: Text(
                                      _proprieteSelectionnee!.localisation,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: AppTypography.caption(textSec).copyWith(fontSize: 11.5),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _precisionLabel(_proprieteSelectionnee!.coordinatePrecision),
                                style: AppTypography.micro(textSec).copyWith(fontSize: 10),
                              ),
                              const SizedBox(height: 7),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _proprieteSelectionnee!.prixAffiche,
                                    style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: activeBg,
                                      borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Consulter',
                                          style: TextStyle(color: activeFg, fontSize: 11, fontWeight: FontWeight.w600),
                                        ),
                                        const SizedBox(width: 2),
                                        Icon(Icons.chevron_right_rounded, size: 14, color: activeFg),
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
            ),
        ],
      ),
    );
  }

  Widget _emptyThumb(bool isDark) {
    return Container(
      width: 84,
      height: 80,
      color: isDark ? const Color(0xFF1A1D24) : const Color(0xFFEFECE5),
      child: const Icon(Icons.apartment_rounded, color: AppColors.accentChampagne, size: 28),
    );
  }
}
