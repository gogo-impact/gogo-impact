import React, { useEffect, useRef, useState, PropsWithChildren } from 'react';
import { animate, stagger } from 'animejs';

type RevealVariant =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in'
  | 'stagger-up';

interface RevealProps {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  distance?: number; // px
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  /** Optional CSS selector to stagger children within this container */
  staggerSelector?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined')
    return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const defaultDuration = 600;

export const Reveal: React.FC<PropsWithChildren<RevealProps>> = ({
  as: ElementTag = 'div',
  className,
  children,
  variant = 'fade-up',
  delay = 0,
  duration = defaultDuration,
  distance = 20,
  once = true,
  threshold = 0.2,
  rootMargin = '0px',
  staggerSelector,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    // Initial hidden state via inline styles to avoid layout shift
    const initialStyles: Partial<CSSStyleDeclaration> = { opacity: '0' };
    switch (variant) {
      case 'fade-up':
        initialStyles.transform = `translateY(${distance}px)`;
        break;
      case 'fade-down':
        initialStyles.transform = `translateY(-${distance}px)`;
        break;
      case 'fade-left':
        initialStyles.transform = `translateX(-${distance}px)`;
        break;
      case 'fade-right':
        initialStyles.transform = `translateX(${distance}px)`;
        break;
      case 'scale-in':
        initialStyles.transform = 'scale(0.96)';
        break;
      case 'stagger-up':
      case 'fade':
      default:
        break;
    }

    Object.assign(element.style, initialStyles);

    if (prefersReducedMotion()) {
      // Instantly reveal without motion
      Object.assign(element.style, { opacity: '1', transform: 'none' });
      setHasRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate container
            const base: any = {
              opacity: [0, 1],
              duration,
              delay,
              easing: 'easeOutCubic',
            };
            switch (variant) {
              case 'fade-up':
                base.translateY = [distance, 0];
                break;
              case 'fade-down':
                base.translateY = [-distance, 0];
                break;
              case 'fade-left':
                base.translateX = [-distance, 0];
                break;
              case 'fade-right':
                base.translateX = [distance, 0];
                break;
              case 'scale-in':
                base.scale = [0.96, 1];
                break;
              case 'stagger-up':
                // Will be handled below with children stagger
                break;
              case 'fade':
              default:
                break;
            }

            if (variant !== 'stagger-up') {
              animate(element, base);
            }

            if (variant === 'stagger-up') {
              const targets = staggerSelector
                ? Array.from(element.querySelectorAll(staggerSelector))
                : Array.from(element.children);
              if (targets.length > 0) {
                // Ensure container is visible when animating children
                element.style.opacity = '1';
                animate(targets as Element[], {
                  opacity: [0, 1],
                  translateY: [distance, 0],
                  duration,
                  delay: stagger(80, { start: delay }),
                  easing: 'easeOutCubic',
                });
              } else {
                // Fallback to container
                animate(element, {
                  opacity: [0, 1],
                  translateY: [distance, 0],
                  duration,
                  delay,
                  easing: 'easeOutCubic',
                });
              }
            }

            setHasRevealed(true);
            if (once) observer.unobserve(element);
          } else if (!once && hasRevealed) {
            // Optionally reset when leaving viewport
            Object.assign(element.style, initialStyles);
            setHasRevealed(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [
    variant,
    delay,
    duration,
    distance,
    once,
    threshold,
    rootMargin,
    staggerSelector,
    hasRevealed,
  ]);

  return (
    // @ts-expect-error dynamic element type
    <ElementTag ref={containerRef} className={className}>
      {children}
    </ElementTag>
  );
};

export default Reveal;
