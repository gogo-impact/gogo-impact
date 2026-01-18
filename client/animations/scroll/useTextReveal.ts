/**
 * useTextReveal - Hook for scroll-driven text reveal animations
 * Reveals text word-by-word or line-by-line based on scroll position
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export type RevealMode = 'word' | 'line' | 'character';
export type RevealEffect = 'fade' | 'slide' | 'highlight' | 'mask';

export interface TextRevealOptions {
  /** How to split the text: by word, line, or character */
  mode?: RevealMode;
  /** Visual effect to apply */
  effect?: RevealEffect;
  /** Stagger delay between items (in scroll progress, 0-1) */
  stagger?: number;
  /** When to start revealing (0-1 of element visibility) */
  startThreshold?: number;
  /** When to complete revealing (0-1 of element visibility) */
  endThreshold?: number;
  /** Color for highlight effect */
  highlightColor?: string;
  /** Whether reveal is enabled */
  enabled?: boolean;
}

export interface RevealedItem {
  /** The text content */
  text: string;
  /** Index of this item */
  index: number;
  /** Whether this item is revealed (opacity 1) */
  isRevealed: boolean;
  /** Progress of reveal for this item (0-1) */
  progress: number;
  /** CSS styles for this item */
  style: React.CSSProperties;
}

export interface TextRevealResult {
  /** Array of items with their reveal state */
  items: RevealedItem[];
  /** Overall progress of the reveal (0-1) */
  progress: number;
  /** Whether all items are revealed */
  isComplete: boolean;
  /** Whether the element is in view */
  isInView: boolean;
}

/**
 * Split text into segments based on mode
 */
function splitText(text: string, mode: RevealMode): string[] {
  switch (mode) {
    case 'character':
      return text.split('');
    case 'line':
      return text.split('\n').filter((line) => line.trim().length > 0);
    case 'word':
    default:
      return text.split(/\s+/).filter((word) => word.length > 0);
  }
}

/**
 * Hook to create scroll-driven text reveal animation
 */
export function useTextReveal(
  text: string,
  options: TextRevealOptions = {}
): [React.RefObject<HTMLDivElement>, TextRevealResult] {
  const {
    mode = 'word',
    effect = 'fade',
    stagger = 0.05,
    startThreshold = 0.2,
    endThreshold = 0.8,
    highlightColor = 'rgba(141, 221, 166, 0.3)',
    enabled = true,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<TextRevealResult>({
    items: [],
    progress: 0,
    isComplete: false,
    isInView: false,
  });

  const rafRef = useRef<number | null>(null);

  // Split text into segments
  const segments = useMemo(() => splitText(text, mode), [text, mode]);

  // Generate styles for an item based on effect and progress
  const getItemStyle = useCallback(
    (itemProgress: number): React.CSSProperties => {
      const clampedProgress = Math.max(0, Math.min(1, itemProgress));

      switch (effect) {
        case 'slide':
          return {
            opacity: clampedProgress,
            transform: `translateY(${(1 - clampedProgress) * 20}px)`,
            transition: 'none',
          };
        case 'highlight':
          return {
            opacity: 1,
            background:
              clampedProgress > 0.5
                ? highlightColor
                : `linear-gradient(90deg, ${highlightColor} ${clampedProgress * 200}%, transparent ${clampedProgress * 200}%)`,
            transition: 'none',
          };
        case 'mask':
          return {
            opacity: 1,
            clipPath: `inset(0 ${(1 - clampedProgress) * 100}% 0 0)`,
            transition: 'none',
          };
        case 'fade':
        default:
          return {
            opacity: clampedProgress,
            transition: 'none',
          };
      }
    },
    [effect, highlightColor]
  );

  const updateReveal = useCallback(() => {
    if (!containerRef.current || !enabled) {
      const items = segments.map((text, index) => ({
        text,
        index,
        isRevealed: !enabled,
        progress: enabled ? 0 : 1,
        style: enabled ? { opacity: 0 } : { opacity: 1 },
      }));
      setResult({
        items,
        progress: enabled ? 0 : 1,
        isComplete: !enabled,
        isInView: false,
      });
      return;
    }

    const element = containerRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if in view
    const isInView = rect.top < windowHeight && rect.bottom > 0;

    if (!isInView) {
      setResult((prev) => ({ ...prev, isInView: false }));
      return;
    }

    // Calculate overall progress based on element position
    const startPoint = windowHeight * (1 - startThreshold);
    const endPoint = windowHeight * (1 - endThreshold);
    const scrollRange = startPoint - endPoint;

    const overallProgress = Math.max(0, Math.min(1, (startPoint - rect.top) / scrollRange));

    // Calculate individual item progress with stagger
    const items: RevealedItem[] = segments.map((text, index) => {
      const itemStart = index * stagger;
      const itemEnd = itemStart + (1 - (segments.length - 1) * stagger);
      const itemProgress =
        overallProgress <= itemStart
          ? 0
          : overallProgress >= itemEnd
            ? 1
            : (overallProgress - itemStart) / (itemEnd - itemStart);

      return {
        text,
        index,
        isRevealed: itemProgress >= 1,
        progress: itemProgress,
        style: getItemStyle(itemProgress),
      };
    });

    const isComplete = items.every((item) => item.isRevealed);

    setResult({
      items,
      progress: overallProgress,
      isComplete,
      isInView,
    });
  }, [segments, stagger, startThreshold, endThreshold, enabled, getItemStyle]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !enabled) {
      const items = segments.map((text, index) => ({
        text,
        index,
        isRevealed: true,
        progress: 1,
        style: { opacity: 1 } as React.CSSProperties,
      }));
      setResult({
        items,
        progress: 1,
        isComplete: true,
        isInView: true,
      });
      return;
    }

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateReveal);
    };

    // Initial calculation
    updateReveal();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateReveal, enabled, segments]);

  return [containerRef, result];
}

export default useTextReveal;




