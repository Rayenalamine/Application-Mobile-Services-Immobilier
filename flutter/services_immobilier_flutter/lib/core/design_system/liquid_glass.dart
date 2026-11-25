// ============================================================
// DARLINK — APPLE LIQUID GLASS DESIGN SYSTEM COMPONENTS (Flutter)
// Reusable frosted glass panels, tactile orbs, pill buttons,
// editorial headers, and adaptive empty/loading states.
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';

/// Frosted Liquid Glass surface with realistic backdrop blur, specular
/// top-rim highlight, hairline border, and restrained depth shadow.
class LiquidGlassSurface extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final double blurSigma;
  final Color? tintColor;
  final bool elevatedShadow;

  const LiquidGlassSurface({
    super.key,
    required this.child,
    this.borderRadius = AppSpacing.radiusLG,
    this.padding,
    this.blurSigma = 22,
    this.tintColor,
    this.elevatedShadow = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final fill = tintColor ?? (isDark ? const Color(0xB8181A20) : const Color(0xCCFFFFFF));
    final border = isDark ? const Color(0x28FFFFFF) : const Color(0x161D1D1F);
    final specularTop = isDark ? const Color(0x22FFFFFF) : const Color(0x88FFFFFF);
    final specularBottom = isDark ? const Color(0x05FFFFFF) : const Color(0x14FFFFFF);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: elevatedShadow
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.36 : 0.06),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: fill,
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(color: border, width: 0.9),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [specularTop, fill, specularBottom],
                stops: const [0.0, 0.35, 1.0],
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Tactile circular glass button with spring-like scale animation,
/// subtle haptic feedback, and optional notification badge.
class GlassOrbButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onTap;
  final String? tooltip;
  final double size;
  final double iconSize;
  final Color? iconColor;
  final int badgeCount;

  const GlassOrbButton({
    super.key,
    required this.icon,
    required this.onTap,
    this.tooltip,
    this.size = 42,
    this.iconSize = 19,
    this.iconColor,
    this.badgeCount = 0,
  });

  @override
  State<GlassOrbButton> createState() => _GlassOrbButtonState();
}

class _GlassOrbButtonState extends State<GlassOrbButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final textPrim = widget.iconColor ?? AppColors.textPrimaryOf(context);
    final isDark = AppColors.isDark(context);

    final button = GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapCancel: () => setState(() => _pressed = false),
      onTapUp: (_) => setState(() => _pressed = false),
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
      child: AnimatedScale(
        scale: _pressed ? 0.92 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            LiquidGlassSurface(
              borderRadius: widget.size / 2,
              blurSigma: 18,
              elevatedShadow: false,
              tintColor: isDark ? const Color(0x991E2128) : const Color(0xD9FFFFFF),
              child: SizedBox(
                width: widget.size,
                height: widget.size,
                child: Icon(widget.icon, size: widget.iconSize, color: textPrim),
              ),
            ),
            if (widget.badgeCount > 0)
              Positioned(
                top: -2,
                right: -2,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: AppColors.accentRed,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.backgroundOf(context), width: 1.5),
                  ),
                  child: Text(
                    widget.badgeCount > 9 ? '9+' : '${widget.badgeCount}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );

    if (widget.tooltip != null) {
      return Tooltip(message: widget.tooltip!, child: button);
    }
    return button;
  }
}

/// Editorial section header with clean title, optional subtitle, and trailing badge/action.
class EditorialSectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;

  const EditorialSectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTypography.sectionTitle(textPrim)),
              if (subtitle != null && subtitle!.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(subtitle!, style: AppTypography.caption(textSec)),
              ],
            ],
          ),
        ),
        ?trailing,
      ],
    );
  }
}

/// Luxury pill primary CTA button with restrained obsidian/alabaster contrast.
class LuxuryPillButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool isSecondary;
  final Color? backgroundColor;
  final Color? foregroundColor;

  const LuxuryPillButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isSecondary = false,
    this.backgroundColor,
    this.foregroundColor,
  });

  @override
  State<LuxuryPillButton> createState() => _LuxuryPillButtonState();
}

class _LuxuryPillButtonState extends State<LuxuryPillButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final bg = widget.backgroundColor ??
        (widget.isSecondary
            ? AppColors.surfaceElevatedOf(context)
            : AppColors.primaryActionBgOf(context));
    final fg = widget.foregroundColor ??
        (widget.isSecondary
            ? AppColors.textPrimaryOf(context)
            : AppColors.primaryActionFgOf(context));

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapCancel: () => setState(() => _pressed = false),
      onTapUp: (_) => setState(() => _pressed = false),
      onTap: widget.isLoading || widget.onPressed == null
          ? null
          : () {
              HapticFeedback.lightImpact();
              widget.onPressed!();
            },
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          height: 50,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: widget.onPressed == null ? bg.withValues(alpha: 0.45) : bg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
            border: widget.isSecondary
                ? Border.all(color: AppColors.borderOf(context), width: 0.9)
                : null,
          ),
          child: Center(
            child: widget.isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: fg),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(widget.icon, size: 17, color: fg),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        widget.label,
                        style: TextStyle(
                          color: fg,
                          fontSize: 14.5,
                          fontWeight: FontWeight.w600,
                          letterSpacing: -0.15,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

/// Apple-style empty state with frosted circular emblem and optional CTA.
class LuxuryEmptyState extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  const LuxuryEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.iconColor,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            LiquidGlassSurface(
              borderRadius: 42,
              blurSigma: 18,
              child: SizedBox(
                width: 84,
                height: 84,
                child: Icon(
                  icon,
                  size: 36,
                  color: iconColor ?? AppColors.accentChampagne,
                ),
              ),
            ),
            const SizedBox(height: 22),
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTypography.pageTitle(textPrim).copyWith(fontSize: 21),
            ),
            const SizedBox(height: 8),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 300),
              child: Text(
                message,
                textAlign: TextAlign.center,
                style: AppTypography.body(textSec),
              ),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 22),
              LuxuryPillButton(label: actionLabel!, onPressed: onAction),
            ],
          ],
        ),
      ),
    );
  }
}
