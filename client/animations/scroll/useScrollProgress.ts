/**
 * useScrollProgress - Hook to track scroll progress for elements
 * Returns a value from 0-1 representing how far an element has scrolled through the viewport
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export interface ScrollProgressOptions {
  /** Offset from top of viewport to start tracking (0-1, default 0) */
  startOffset?: number;
  /** Offset from top of viewport to end tracking (0-1, default 1) */
  endOffset?: number;
  /** Whether to clamp progress between 0 and 1 (default true) */
  clamp?: boolean;
  /** Throttle updates to every N ms (default uses rAF) */
  throttleMs?: number;
}

export interface ScrollProgressResult {
  /** Progress value from 0-1 (or beyond if clamp is false) */
  progress: number;
  /** Whether element is currently in viewport */
  isInView: boolean;
  /** Whether element has entered viewport at least once */
  hasEntered: boolean;
  /** Raw scroll position in pixels */
  scrollY: number;
  /** Element's position relative to viewport top */
  elementTop: number;
}

/**
 * Hook to track scroll progress of an element through the viewport
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  options: ScrollProgressOptions = {}
): [React.RefObject<T>, ScrollProgressResult] {
  const { startOffset = 0, endOffset = 1, clamp = true } = options;

  const elementRef = useRef<T>(null);
  const [result, setResult] = useState<ScrollProgressResult>({
    progress: 0,
    isInView: false,
    hasEntered: false,
    scrollY: 0,
    elementTop: 0,
  });

  const hasEnteredRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Calculate the scroll range
    const startTrigger = windowHeight * (1 - startOffset);
    const endTrigger = windowHeight * (1 - endOffset);
    const scrollRange = startTrigger - endTrigger;

    // Calculate progress based on element position
    const elementTop = rect.top;
    const rawProgress = (startTrigger - elementTop) / scrollRange;

    // Clamp if needed
    const progress = clamp ? Math.max(0, Math.min(1, rawProgress)) : rawProgress;

    // Determine if in view
    const isInView = rect.top < windowHeight && rect.bottom > 0;

    // Track if has entered
    if (isInView && !hasEnteredRef.current) {
      hasEnteredRef.current = true;
    }

    setResult({
      progress,
      isInView,
      hasEntered: hasEnteredRef.current,
      scrollY,
      elementTop,
    });
  }, [startOffset, endOffset, clamp]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Still track but don't animate
      setResult(prev => ({ ...prev, progress: 1, hasEntered: true }));
      return;
    }

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    // Initial calculation
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateProgress]);

  return [elementRef, result];
}

/**
 * Hook to track global scroll position and update CSS custom property
 * Updates --scroll-y CSS variable on :root
 */
export function useGlobalScrollProgress(): number {
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const updateScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;

      // Update CSS custom property for use in stylesheets
      document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
      document.documentElement.style.setProperty('--scroll-progress', `${progress}`);

      setScrollProgress(progress);
    };

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateScroll);
    };

    // Initial update
    updateScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return scrollProgress;
}

export default useScrollProgress;




