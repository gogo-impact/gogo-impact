// Shared utility functions for the Admin customization pages

/**
 * Parse a linear-gradient string into degree + two color stops.
 * Expects format: linear-gradient(180deg, <c1> 0%, <c2> 100%)
 */
export function parseGradient(input: string | null | undefined): {
  degree: number;
  color1: string;
  color2: string;
} {
  const fallback = { degree: 180, color1: '#5038a0', color2: '#121242' };
  if (!input) return fallback;
  const m = input.match(
    /linear-gradient\(\s*(\d+)\s*deg\s*,\s*(.+?)\s+0%\s*,\s*(.+?)\s+100%\s*\)/i
  );
  if (!m) return fallback;
  const degree = Math.max(1, Math.min(360, Number(m[1]) || 180));
  const color1 = m[2].trim();
  const color2 = m[3].trim();
  if (!color1 || !color2 || /undefined/i.test(color1) || /undefined/i.test(color2)) {
    return fallback;
  }
  return { degree, color1, color2 };
}

/**
 * Apply alpha to a color (hex, rgb, or rgba) and return rgba string.
 */
export function withAlpha(color: string, alpha: number): string {
  const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const a = clamp(alpha);
  const hex = color.trim();
  if (hex.startsWith('#')) {
    const raw = hex.slice(1);
    const expand = (s: string) =>
      s.length === 3
        ? s
            .split('')
            .map((c) => c + c)
            .join('')
        : s;
    const full = expand(raw);
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (hex.startsWith('rgb(')) {
    const nums = hex
      .replace(/rgb\(/i, '')
      .replace(/\)/, '')
      .split(',')
      .map((s) => s.trim());
    const [r, g, b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (hex.startsWith('rgba(')) {
    const nums = hex
      .replace(/rgba\(/i, '')
      .replace(/\)/, '')
      .split(',')
      .map((s) => s.trim());
    const [r, g, b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color; // fallback – leave as-is
}

/**
 * Compose a linear-gradient string with alpha applied to both color stops.
 */
export function composeGradient(
  degree: number,
  color1: string,
  color2: string,
  alpha: number
): string {
  const c1 = withAlpha(color1, alpha);
  const c2 = withAlpha(color2, alpha);
  return `linear-gradient(${degree}deg, ${c1} 0%, ${c2} 100%)`;
}

/**
 * Compose a simple linear-gradient string without alpha manipulation.
 */
export function composeSimpleGradient(degree: number, color1: string, color2: string): string {
  const safeDegree = Number.isFinite(degree) ? degree : 0;
  return `linear-gradient(${safeDegree}deg, ${color1}, ${color2})`;
}

/**
 * Validate that a color string is a valid hex, rgb, or rgba color.
 */
export function isValidColorStop(color: string | null | undefined): boolean {
  if (!color) return false;
  if (/undefined/i.test(color)) return false;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
  const rgba =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i;
  return hex.test(color) || rgb.test(color) || rgba.test(color);
}

/**
 * Convert any supported color string (hex/rgb/rgba) to 6-digit hex for <input type="color">.
 */
export function toHex(color: string): string {
  const c = color.trim();
  const hex3or6 = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
  const rgba =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i;

  if (hex3or6.test(c)) {
    if (c.length === 4) {
      // Expand #rgb -> #rrggbb
      const r = c[1];
      const g = c[2];
      const b = c[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return c.toLowerCase();
  }

  const mRgb = c.match(rgb);
  if (mRgb) {
    const r = Math.max(0, Math.min(255, parseInt(mRgb[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(mRgb[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(mRgb[3], 10)));
    const to2 = (n: number) => n.toString(16).padStart(2, '0');
    return `#${to2(r)}${to2(g)}${to2(b)}`.toLowerCase();
  }

  const mRgba = c.match(rgba);
  if (mRgba) {
    const r = Math.max(0, Math.min(255, parseInt(mRgba[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(mRgba[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(mRgba[3], 10)));
    const to2 = (n: number) => n.toString(16).padStart(2, '0');
    return `#${to2(r)}${to2(g)}${to2(b)}`.toLowerCase();
  }

  // Fallback
  return '#000000';
}

/**
 * Convert hex to RGB object.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = toHex(hex).replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

/**
 * Calculate relative luminance of a hex color.
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b]
    .map((v) => v / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  // Rec. 709 luminance
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Get a readable text color (white or dark) for a given background hex.
 */
export function getReadableTextColor(bgHex: string): string {
  const L = relativeLuminance(bgHex);
  return L > 0.4 ? '#0f1118' : '#ffffff';
}

/**
 * Apply alpha to a hex color and return rgba string.
 */
export function withAlphaHex(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Custom hook for debouncing a value.
 */
import React from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Normalize a URL to ensure it has a protocol.
 * Handles cases like "youtube.com" -> "https://youtube.com"
 */
export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // Already has a protocol
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Handle mailto, tel, and other special protocols
  if (/^(mailto:|tel:|javascript:|data:)/i.test(trimmed)) {
    return trimmed;
  }
  
  // Handle anchor links
  if (trimmed.startsWith('#')) {
    return trimmed;
  }
  
  // Add https:// if no protocol
  return `https://${trimmed}`;
}



