/**
 * Scroll Animation Utilities
 * Core hooks and components for scroll-based animations
 */

// Hooks
export {
  useScrollProgress,
  useGlobalScrollProgress,
  type ScrollProgressOptions,
  type ScrollProgressResult,
} from './useScrollProgress';

export {
  useParallax,
  calculateParallaxOffset,
  type ParallaxOptions,
  type ParallaxResult,
} from './useParallax';

export {
  useTextReveal,
  type TextRevealOptions,
  type RevealedItem,
  type TextRevealResult,
  type RevealMode,
  type RevealEffect,
} from './useTextReveal';

// Components
export {
  ParallaxLayer,
  ParallaxContainer,
  ParallaxBackground,
  type ParallaxLayerProps,
  type ParallaxContainerProps,
  type ParallaxBackgroundProps,
} from './ParallaxLayer';

export {
  StickyStack,
  StickyStackItem,
  StickyCard,
  type StickyStackProps,
  type StickyStackItemProps,
  type StickyCardProps,
} from './StickyStack';




