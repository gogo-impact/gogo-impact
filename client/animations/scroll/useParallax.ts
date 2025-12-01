/**
 * useParallax - Hook for parallax transforms based on scroll position
 * Creates depth effects by moving elements at different speeds
 */
import { useEffect, useRef, useState, useCallback, CSSProperties } from 'react';

export interface ParallaxOptions {
  /** Speed multiplier: <1 = slower (background), >1 = faster (foreground), 1 = normal */
  speed?: number;
  /** Direction of parallax movement */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Whether to use element position or global scroll */
  useElementPosition?: boolean;
  /** Easing function name for smooth movement */
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  /** Maximum offset in pixels (prevents extreme movement) */
  maxOffset?: number;
  /** Whether parallax is enabled */
  enabled?: boolean;
}

export interface ParallaxResult {
  /** CSS transform style to apply */
  style: CSSProperties;
  /** Current offset values */
  offset: { x: number; y: number };
  /** Whether currently in view */
  isInView: boolean;
}

/**
 * Hook to create parallax effect on an element
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
): [React.RefObject<T>, ParallaxResult] {
  const {
    speed = 0.5,
    direction = 'vertical',
    useElementPosition = true,
    easing = 'linear',
    maxOffset = 200,
    enabled = true,
  } = options;

  const elementRef = useRef<T>(null);
  const [result, setResult] = useState<ParallaxResult>({
    style: {},
    offset: { x: 0, y: 0 },
    isInView: false,
  });

  const rafRef = useRef<number | null>(null);

  // Easing functions
  const applyEasing = useCallback(
    (value: number): number => {
      switch (easing) {
        case 'easeOut':
          return 1 - Math.pow(1 - Math.abs(value), 2) * Math.sign(value);
        case 'easeInOut':
          return value < 0
            ? -Math.pow(Math.abs(value) * 2, 2) / 2
            : Math.pow(value * 2, 2) / 2;
        default:
          return value;
      }
    },
    [easing]
  );

  const updateParallax = useCallback(() => {
    if (!elementRef.current || !enabled) {
      setResult({ style: {}, offset: { x: 0, y: 0 }, isInView: false });
      return;
    }

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Check if in view
    const isInView = rect.top < windowHeight && rect.bottom > 0;

    if (!isInView) {
      setResult((prev) => ({ ...prev, isInView: false }));
      return;
    }

    let offsetY = 0;
    let offsetX = 0;

    if (useElementPosition) {
      // Calculate offset based on element's position in viewport
      // Center of viewport = 0, top = negative, bottom = positive
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const normalizedPosition = (elementCenter - viewportCenter) / viewportCenter;

      if (direction === 'vertical' || direction === 'both') {
        offsetY = applyEasing(normalizedPosition) * (speed - 1) * 100;
        offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));
      }

      if (direction === 'horizontal' || direction === 'both') {
        const elementCenterX = rect.left + rect.width / 2;
        const viewportCenterX = windowWidth / 2;
        const normalizedX = (elementCenterX - viewportCenterX) / viewportCenterX;
        offsetX = applyEasing(normalizedX) * (speed - 1) * 50;
        offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
      }
    } else {
      // Use global scroll position
      const scrollY = window.scrollY;
      const scrollProgress = scrollY / (document.documentElement.scrollHeight - windowHeight);

      if (direction === 'vertical' || direction === 'both') {
        offsetY = scrollProgress * (speed - 1) * 200;
        offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));
      }
    }

    const transform =
      direction === 'both'
        ? `translate3d(${offsetX}px, ${offsetY}px, 0)`
        : direction === 'horizontal'
          ? `translate3d(${offsetX}px, 0, 0)`
          : `translate3d(0, ${offsetY}px, 0)`;

    setResult({
      style: {
        transform,
        willChange: 'transform',
      },
      offset: { x: offsetX, y: offsetY },
      isInView,
    });
  }, [speed, direction, useElementPosition, easing, maxOffset, enabled, applyEasing]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !enabled) {
      setResult({ style: {}, offset: { x: 0, y: 0 }, isInView: true });
      return;
    }

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateParallax);
    };

    // Initial calculation
    updateParallax();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateParallax, enabled]);

  return [elementRef, result];
}

/**
 * Calculate parallax offset for a given scroll position
 * Utility function for inline calculations
 */
export function calculateParallaxOffset(
  scrollY: number,
  speed: number,
  maxOffset: number = 200
): number {
  const offset = scrollY * (speed - 1);
  return Math.max(-maxOffset, Math.min(maxOffset, offset));
}

export default useParallax;

