import React, { useEffect, useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import {
  animate,
  stagger,
  createTimeline,
  createAnimatable,
  utils,
} from 'animejs';
import COLORS from '../../assets/colors';
import heroBackdrop from '../../assets/images/image.png';
import { fetchHeroContent, type HeroContent } from '../services/impact.api';

// Main container with Spotify-like gradient background
const HeroContainer = styled.section<{ $background?: string }>`
  width: 100%;
  min-height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: ${(props) => props.$background ?? 'transparent'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  padding: 0;
  /* Ensure this container receives all mouse events */
  cursor: default;
`;

// Waveform container that spans the entire width of the page as a background element
const WaveBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Spread bars across full width */
  gap: 3px; /* Larger gap for fewer bars */
  z-index: 2; /* Above gradient overlay, below content */
  opacity: 0;
  padding: 0 1%; /* Small padding to prevent edge cutoff */
  pointer-events: none; /* Don't catch events directly - parent will handle them */
  background: transparent;
`;

// Backdrop image behind everything
const BackdropImage = styled.div<{ $image?: string; $grayscale?: boolean }>`
  position: absolute;
  inset: 0;
  background-image: ${(props) =>
    props.$image ? `url(${props.$image})` : `url(${heroBackdrop})`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  pointer-events: none;
  filter: ${(props) => (props.$grayscale ? 'grayscale(1)' : 'none')};
`;

// Gradient overlay sits above image, below waves/content
const GradientOverlay = styled.div<{ $background?: string }>`
  position: absolute;
  inset: 0;
  background: ${(p) => p.$background ?? 'transparent'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  pointer-events: none;
`;

// Individual wave bar styled for a music waveform
const WaveBar = styled.div`
  width: 6px; /* Thicker bars to allow fewer of them */
  height: 4px; /* Default minimal height */
  border-radius: 2px;
  transform-origin: center;
  opacity: 0.6;
  pointer-events: none;
  will-change: transform, height, opacity; /* Better performance with transform */
  transform: translateZ(0); /* Hardware acceleration */
`;

// Content wrapper with better Spotify-like spacing
const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  padding: 0 5%;
  position: relative;
  margin-top: 0;
  z-index: 3; /* Content above waves and gradient overlay */
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 2rem;
  justify-items: center;
  pointer-events: none; /* Let events pass through to the container */
`;

// Left side content container
const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none; /* Let events pass through */
`;

// Main title - "IMPACT REPORT"
const MainTitle = styled.h1`
  font-family: 'Airwaves', sans-serif;
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 800;
  color: white;
  margin: 0;
  text-align: center;
  line-height: 0.9;
  letter-spacing: -0.02em;
  opacity: 0; /* Start hidden for animation */
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none; /* Let events pass through */
  letter-spacing: 0.05em;
`;

// Subtitle - "GUITARS OVER GUNS"
const SubtitleText = styled.h2`
  font-family: 'Airwaves', sans-serif;
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 700;
  color: rgba(119, 221, 171, 0.8);
  margin: 0;
  text-align: center;
  opacity: 0;
  position: relative;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: none; /* Let events pass through */
  letter-spacing: 0.05em;
`;

// Green underline
const TitleUnderline = styled.div`
  width: 100px;
  height: 4px;
  background-color: rgba(119, 221, 171, 0.8);
  margin: 1.5rem 0;
  transform: scaleX(0);
  transform-origin: left;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: none; /* Let events pass through */
`;

// Report year text
const ReportYear = styled.div`
  font-size: 2.2rem;
  color: var(--spotify-orange, #e9bb4d);
  font-family: 'Century Gothic-Bold', 'Arial', sans-serif;
  font-weight: 500;
  margin-top: 1rem;
  margin-bottom: 3rem;
  opacity: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: none; /* Let events pass through */
  letter-spacing: 0.02em;
`;

// Button container
const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  pointer-events: auto; /* Re-enable pointer events for buttons */
  justify-content: center;
`;

// Primary button styling (more Spotify-like)
const PrimaryButton = styled.button`
  background: var(--spotify-blue, #1946f5);
  border: none;
  border-radius: 500px;
  color: white;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1rem;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  opacity: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto; /* Ensure buttons catch events */
  letter-spacing: 0.02em;

  &:hover {
    background: var(--spotify-purple, #68369a);
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
`;

// Secondary button styling (more Spotify-like)
const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 500px;
  color: white;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1rem;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  opacity: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: auto; /* Ensure buttons catch events */
  letter-spacing: 0.02em;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
`;

// Tagline – brand: "choose your sound"
const Tagline = styled.div`
  margin-top: 0.75rem;
  font-family: 'Airwaves', sans-serif;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: clamp(0.9rem, 1.6vw, 1.1rem);
  color: ${COLORS.gogo_green};
  opacity: 0; /* for entrance animation */
  pointer-events: none;
`;

// City chips – Miami, Chicago, Los Angeles, New York
const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
  pointer-events: none;
`;

const Chip = styled.span`
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
  }
`;
function HeroSection(props: { previewMode?: boolean; heroOverride?: Partial<HeroContent> } = {}): JSX.Element {
  const { previewMode = false, heroOverride } = props;
  const disableAnimations = previewMode;
  const [hero, setHero] = useState<HeroContent | null>(null);

  // Create refs for animations
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const secondaryButtonRef = useRef<HTMLButtonElement>(null);
  const waveBackgroundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Animation control refs - no state usage
  const isAnimatingRef = useRef<boolean>(false);
  const lastMoveTimeRef = useRef<number>(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const waveAnimatablesRef = useRef<any[]>([]);
  const containerBoundsRef = useRef<DOMRect | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const hasEntranceAnimatedRef = useRef<boolean>(false);

  // Real-time animation loop state
  const timeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const pointerStateRef = useRef({ x: 0.5, y: 0.5, isOver: false });

  // Color function: dynamic HSL cycling with ripple hue offsets
  const getWaveBarColor = useCallback((index: number, total: number) => {
    const position = index / Math.max(1, total - 1);
    const t = timeRef.current * 0.001;
    const hue = (position * 220 + t * 20) % 360; // slow, continuous hue drift
    const saturation = 55 + Math.sin(position * Math.PI * 2 + t) * 10; // subtle
    const lightness = 40 + Math.cos(position * Math.PI * 2 + t * 0.8) * 8; // subtle
    return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(
      lightness,
    )}%)`;
  }, []);

  // Lightweight value noise (1D over position, evolving over time)
  const smoothstep = useCallback((t: number) => t * t * (3 - 2 * t), []);
  const hash = useCallback((x: number) => {
    const s = Math.sin(x * 127.1) * 43758.5453;
    return s - Math.floor(s);
  }, []);
  const valueNoise1D = useCallback(
    (x: number) => {
      const i = Math.floor(x);
      const f = x - i;
      const a = hash(i);
      const b = hash(i + 1);
      return a + (b - a) * smoothstep(f);
    },
    [hash, smoothstep],
  );

  // Initialize wave animatables - using createAnimatable for better performance
  const initializeWaveAnimatables = useCallback(() => {
    const waveBars = document.querySelectorAll('.wave-bar');
    if (!waveBars.length) return;

    // Clear previous animatables
    waveAnimatablesRef.current = [];

    // Create animatable for each bar
    waveBars.forEach((bar, index) => {
      const animatable = createAnimatable(bar, {
        opacity: 0.7,
        scale: 1,
        scaleY: 0.05,
        ease: 'out(4)',
      });

      waveAnimatablesRef.current.push({
        el: bar as HTMLElement,
        animatable,
        index,
        position: index / waveBars.length,
      });

      // ensure no CSS keyframe animation fights our JS loop
      const el = bar as HTMLElement;
      el.style.animation = 'none';
    });
  }, []);

  // Mouse move: update pointer position directly (no inertia)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    if (!containerBoundsRef.current) {
      containerBoundsRef.current = container.getBoundingClientRect();
    }
    const rect = containerBoundsRef.current;
    const px = utils.clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const py = utils.clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const ps = pointerStateRef.current;
    ps.x = px;
    ps.y = py;
    ps.isOver = true;
  }, []);

  // Clicks intentionally ignored to keep a calm, continuous waveform

  // Define handler for mouseleave with detailed logging
  const mouseLeaveHandler = useCallback(() => {
    pointerStateRef.current.isOver = false;
  }, []);

  // Animation loop: quiet baseline + parabolic pointer bulb
  const startAnimationLoop = useCallback(() => {
    const tick = () => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = null;
        return;
      }
      const now = performance.now();
      const dt = Math.min(64, now - lastFrameTimeRef.current);
      lastFrameTimeRef.current = now;
      timeRef.current += dt;

      const ps = pointerStateRef.current;

      // Frequencies
      const tSec = timeRef.current / 1000;
      const noiseSpeed = 0.35; // seconds
      const noiseFreq = 1.6; // smoother spatial
      const baseMin = 4;
      const baseMax = 150;
      const BASE_WAVE_HEIGHT = 160; // fixed element height to enable transform-only scaling

      waveAnimatablesRef.current.forEach(
        ({ animatable, el, position, index }) => {
          // Base: faint continuous motion (quiet song)
          const slowSine = Math.sin(position * Math.PI * 2 * 1.2 + tSec * 1.6);
          const n = valueNoise1D(position * noiseFreq + tSec * noiseSpeed);
          const base = utils.clamp(0.1 + 0.1 * slowSine + 0.12 * n, 0, 0.35);

          // Pointer influence: smooth parabolic bulb
          let pointerInfluence = 0;
          if (ps.isOver) {
            const dx = Math.abs(position - ps.x);
            const radius = 0.16;
            const parabola = Math.max(0, 1 - (dx / radius) ** 2);
            const yIntensity = 0.5 + (1 - Math.abs(ps.y - 0.5) * 2) * 0.5;
            pointerInfluence = parabola ** 2 * yIntensity * 0.95;
          }
          const amplitude = utils.clamp(base + pointerInfluence, 0, 1);
          const height = baseMin + amplitude * (baseMax - baseMin);
          const scaleY = height / BASE_WAVE_HEIGHT;

          // Transform-only updates (no layout): scaleY and opacity
          animatable
            .scaleY(scaleY, 80, 'linear')
            .opacity(0.18 + amplitude * 0.65, 120, 'linear');

          // Update color directly for richer palettes
          const elem = el as HTMLElement;
          elem.style.backgroundColor = getWaveBarColor(
            index,
            waveAnimatablesRef.current.length,
          );
        },
      );

      animationFrameRef.current = requestAnimationFrame(tick);
    };
    if (animationFrameRef.current == null) {
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [getWaveBarColor, valueNoise1D]);

  // Set up everything on mount and handle cleanup
  useEffect(() => {
    // Load hero content unless disabled (admin preview can pass data instead)
    if (!previewMode) {
      fetchHeroContent().then((data) => setHero(data));
    } else if (heroOverride) {
      setHero((prev) => ({ ...(prev ?? ({} as HeroContent)), ...(heroOverride as HeroContent) }));
    }

    // Initialize animations for text elements using direct AnimeJS calls
    if (!disableAnimations && titleRef.current) {
      animate(titleRef.current, {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1000,
        easing: 'easeOutExpo',
      });
    }
    
    if (!disableAnimations && underlineRef.current) {
      animate(underlineRef.current, {
        scaleX: [0, 1],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo',
        delay: 200,
      });
    }
    
    if (!disableAnimations && subtitleRef.current) {
      animate(subtitleRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
        delay: 400,
      });
    }
    
    if (!disableAnimations && yearRef.current) {
      animate(yearRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
        delay: 600,
      });
    }
    
    if (!disableAnimations && taglineRef.current) {
      animate(taglineRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        easing: 'easeOutExpo',
        delay: 700,
      });
    }

    // Animate buttons
    const buttons = [
      primaryButtonRef.current,
      secondaryButtonRef.current,
    ].filter((button): button is HTMLButtonElement => button !== null);

    if (!disableAnimations && buttons.length > 0) {
      animate(buttons, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
        delay: stagger(200, { start: 800 }),
      });
    }

    // Animate wave background
    if (!disableAnimations && waveBackgroundRef.current) {
      animate(waveBackgroundRef.current, {
        opacity: [0, 0.7],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 1000,
      });
    }

    // Set container ref for events
    const heroContainer = waveBackgroundRef.current?.parentElement;
    if (heroContainer) {
      containerRef.current = heroContainer;
      containerBoundsRef.current = heroContainer.getBoundingClientRect();
    }

    // Initialize wave animatables and start animation loop
    setTimeout(() => {
      if (!disableAnimations) {
        initializeWaveAnimatables();
      }
      // Respect reduced motion preference
      const prefersReduced =
        typeof window !== 'undefined' &&
        typeof window.matchMedia !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!disableAnimations && !prefersReduced) {
        startAnimationLoop();
      }
    }, 100);

    // Set up visibility observer to pause/resume loop when offscreen
    let visibilityObserver: IntersectionObserver | null = null;
    if (containerRef.current) {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          const prefersReduced =
            typeof window !== 'undefined' &&
            typeof window.matchMedia !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (entry.isIntersecting) {
            isVisibleRef.current = true;
            if (!disableAnimations && !prefersReduced) {
              startAnimationLoop();
            }
          } else {
            isVisibleRef.current = false;
            if (animationFrameRef.current != null) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          }
        },
        { threshold: 0.1 },
      );
      visibilityObserver.observe(containerRef.current);
    }

    // Handle window resize to update container bounds
    const handleResize = () => {
      if (containerRef.current) {
        containerBoundsRef.current =
          containerRef.current.getBoundingClientRect();
      }
    };

    // Set up event listeners with better event handling
    if (heroContainer) {
      // Use explicit event listeners without throttling in the listener itself
      // The throttling is handled inside the function
      heroContainer.addEventListener('mousemove', handleMouseMove);
      // Simple mouseleave handler
      heroContainer.addEventListener('mouseleave', mouseLeaveHandler);

      // Add resize listener
      window.addEventListener('resize', handleResize);
    }

    // Cleanup function
    return () => {
      if (heroContainer) {
        heroContainer.removeEventListener('mousemove', handleMouseMove);
        heroContainer.removeEventListener('mouseleave', mouseLeaveHandler);
      }

      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // no pending ripple timeout to clear
      if (visibilityObserver) {
        visibilityObserver.disconnect();
      }
    };
  }, [
    initializeWaveAnimatables,
    handleMouseMove,
    mouseLeaveHandler,
    startAnimationLoop,
    previewMode,
    heroOverride,
  ]);

  // Ensure entrance animations run once when hero content becomes available
  useEffect(() => {
    if (!hero || hasEntranceAnimatedRef.current || disableAnimations) return;

    if (titleRef.current) {
      animate(titleRef.current, {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1000,
        easing: 'easeOutExpo',
      });
    }
    if (underlineRef.current) {
      animate(underlineRef.current, {
        scaleX: [0, 1],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo',
        delay: 200,
      });
    }
    if (subtitleRef.current) {
      animate(subtitleRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
        delay: 400,
      });
    }
    if (yearRef.current) {
      animate(yearRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
        delay: 600,
      });
    }
    if (taglineRef.current) {
      animate(taglineRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        easing: 'easeOutExpo',
        delay: 700,
      });
    }
    const buttons = [primaryButtonRef.current, secondaryButtonRef.current].filter(
      (b): b is HTMLButtonElement => b != null,
    );
    if (buttons.length > 0) {
      animate(buttons, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
        delay: stagger(200, { start: 800 }),
      });
    }

    if (waveBackgroundRef.current) {
      animate(waveBackgroundRef.current, {
        opacity: [0, 0.7],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 1000,
      });
    }

    hasEntranceAnimatedRef.current = true;
  }, [hero, disableAnimations]);

  // Reduced number of wave bars for better performance
  const numWaveBars = 120;
  const BASE_WAVE_HEIGHT = 160;

  const title = hero?.title;
  const subtitle = hero?.subtitle;
  const year = hero?.year;
  const tagline = hero?.tagline;
  const bubbles = hero?.bubbles;
  const primaryCta = hero?.primaryCta;
  const secondaryCta = hero?.secondaryCta;
  const background = hero?.backgroundColor;
  const backgroundImage = hero?.backgroundImage;
  const backgroundImageGrayscale = (hero as any)?.backgroundImageGrayscale === true;
  const titleColor = (hero as any)?.titleColor as string | undefined;
  const subtitleColor = (hero as any)?.subtitleColor as string | undefined;
  const yearColor = (hero as any)?.yearColor as string | undefined;
  const taglineColor = (hero as any)?.taglineColor as string | undefined;
  const primaryCtaColor = (hero as any)?.primaryCtaColor as string | undefined;
  const secondaryCtaColor = (hero as any)?.secondaryCtaColor as string | undefined;

  const isValidGradient = (s?: string) => {
    if (!s) return false;
    if (/undefined/i.test(s)) return false;
    return /linear-gradient\(/i.test(s);
  };

  const gradientOk = isValidGradient(background || undefined);
  const composedBackground = (() => {
    if (backgroundImageGrayscale) {
      return undefined; // draw gradient via overlay to keep it above the image
    }
    if (backgroundImage) {
      return `${gradientOk ? background : ''}${gradientOk ? ', ' : ''}url(${backgroundImage})`;
    }
    return gradientOk ? (background as string) : undefined;
  })();

  return (
    <HeroContainer $background={composedBackground}>
      {/* If grayscale requested, render the image as a separate layer with filter */}
      {backgroundImage && backgroundImageGrayscale && (
        <>
          <BackdropImage $image={backgroundImage} $grayscale />
          {gradientOk && <GradientOverlay $background={background as string} />}
        </>
      )}
      {/* Music waveform visualization */}
      <WaveBackground ref={waveBackgroundRef} style={disableAnimations ? { opacity: 0 } : undefined}>
        {Array.from({ length: numWaveBars }).map((_, i) => {
          const uniqueId = `wave-bar-${i}`;
          const position = i / numWaveBars;
          const initialHeight = 5 + Math.abs(position - 0.5) * 15;
          const initialScale = initialHeight / BASE_WAVE_HEIGHT;

          return (
            <WaveBar
              key={uniqueId}
              className="wave-bar"
              style={{
                backgroundColor: getWaveBarColor(i, numWaveBars),
                height: `${BASE_WAVE_HEIGHT}px`,
                opacity: 0.7,
                transform: `scaleY(${initialScale}) translateZ(0)`,
              }}
            />
          );
        })}
      </WaveBackground>

      <ContentWrapper>
        <LeftContent>
          {title && (
            <MainTitle
              ref={titleRef}
              style={{
                ...(disableAnimations ? { opacity: 1, transform: 'none' } : {}),
                ...(titleColor ? { color: titleColor } : {}),
              }}
            >
              {title}
            </MainTitle>
          )}
          <TitleUnderline ref={underlineRef} />
          {subtitle && (
            <SubtitleText
              ref={subtitleRef}
              style={{
                ...(disableAnimations ? { opacity: 1, transform: 'none' } : {}),
                ...(subtitleColor ? { color: subtitleColor } : {}),
              }}
            >
              {subtitle}
            </SubtitleText>
          )}
          {year && (
            <ReportYear
              ref={yearRef}
              style={{
                ...(disableAnimations ? { opacity: 1, transform: 'none' } : {}),
                ...(yearColor ? { color: yearColor } : {}),
              }}
            >
              {year}
            </ReportYear>
          )}
          {tagline && (
            <Tagline
              ref={taglineRef}
              style={{
                ...(disableAnimations ? { opacity: 1, transform: 'none' } : {}),
                ...(taglineColor ? { color: taglineColor } : {}),
              }}
            >
              {tagline}
            </Tagline>
          )}

          {bubbles && bubbles.length > 0 && (
            <ChipsRow>
              {bubbles.map((city) => (
                <Chip key={city}>{city}</Chip>
              ))}
            </ChipsRow>
          )}

          <ButtonContainer>
            {primaryCta?.href && primaryCta?.label && (
              <a
                href={primaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <PrimaryButton
                  ref={primaryButtonRef}
                  style={{
                    ...(disableAnimations ? { opacity: 1, transform: 'none' } : {}),
                    ...(primaryCtaColor ? { color: primaryCtaColor } : {}),
                  }}
                >
                  <span>▶</span>
                  <span>{primaryCta.label}</span>
                </PrimaryButton>
              </a>
            )}
            {secondaryCta?.href && secondaryCta?.label && (
              <a
                href={secondaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <SecondaryButton
                  ref={secondaryButtonRef}
                  style={{
                    ...(disableAnimations ? { opacity: 1, transform: 'none' } : {}),
                    ...(secondaryCtaColor ? { color: secondaryCtaColor } : {}),
                  }}
                >
                  <span>{secondaryCta.label}</span>
                </SecondaryButton>
              </a>
            )}
          </ButtonContainer>
        </LeftContent>
      </ContentWrapper>
    </HeroContainer>
  );
}

export default HeroSection;
