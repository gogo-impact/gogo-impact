import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
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
import kickSample from '../assets/audio/heroPads/kick.wav';
import snareSample from '../assets/audio/heroPads/snare.wav';
import clapSample from '../assets/audio/heroPads/clap.wav';
import hatSample from '../assets/audio/heroPads/hat.wav';

const PAD_IDS = ['kick', 'snare', 'clap', 'hat'] as const;

type PadId = (typeof PAD_IDS)[number];

type PadConfig = {
  id: PadId;
  label: string;
  color: string;
  sample: string;
  spread: number;
  intensity: number;
};

type PadBurst = {
  id: string;
  padId: PadId;
  start: number;
  duration: number;
  center: number;
  radius: number;
  amplitude: number;
  color: string;
};

type PadSparkInstance = {
  id: number;
  left: number;
  padId: PadId;
  color: string;
  size: number;
};

type SequencerPattern = Record<PadId, boolean[]>;

const createPadRecord = <T,>(value: T): Record<PadId, T> =>
  PAD_IDS.reduce((acc, id) => {
    acc[id] = value;
    return acc;
  }, {} as Record<PadId, T>);

const PAD_BURST_DURATION = 520;
const MAX_PAD_BURSTS = 6;
const PAD_TRIGGER_COOLDOWN_MS = 90;
const TOTAL_STEPS = 16;
const TEMPO_BPM = 76;
const STEP_DURATION_MS = 60000 / (TEMPO_BPM * 4);

const createEmptyPattern = (): SequencerPattern =>
  PAD_IDS.reduce((acc, padId) => {
    acc[padId] = Array(TOTAL_STEPS).fill(false);
    return acc;
  }, {} as SequencerPattern);

const DEFAULT_PATTERN: SequencerPattern = createEmptyPattern();

const stepDomId = (padId: PadId, stepIndex: number) =>
  `hero-step-${padId}-${stepIndex}`;

const MELODY_SEQUENCE = [
  72,
  null,
  75,
  79,
  68,
  null,
  72,
  75,
  65,
  null,
  68,
  72,
  67,
  null,
  71,
  74,
] as const;

const BASS_SEQUENCE = [
  48,
  null,
  null,
  null,
  44,
  null,
  null,
  null,
  41,
  null,
  null,
  null,
  43,
  null,
  null,
  null,
] as const;

const PAD_CONFIG: PadConfig[] = [
  {
    id: 'kick',
    label: 'Kick',
    color: 'hsl(26, 36%, 58%)',
    sample: kickSample,
    spread: 0.2,
    intensity: 0.55,
  },
  {
    id: 'snare',
    label: 'Snare',
    color: 'hsl(8, 34%, 62%)',
    sample: snareSample,
    spread: 0.3,
    intensity: 0.4,
  },
  {
    id: 'clap',
    label: 'Clap',
    color: 'hsl(35, 20%, 65%)',
    sample: clapSample,
    spread: 0.28,
    intensity: 0.38,
  },
  {
    id: 'hat',
    label: 'Hat',
    color: 'hsl(60, 22%, 70%)',
    sample: hatSample,
    spread: 0.32,
    intensity: 0.3,
  },
];

const HSL_REGEX =
  /hsl\\(\\s*([-\\d.]+)\\s*,\\s*([-\\d.]+)%\\s*,\\s*([-\\d.]+)%\\s*\\)/i;

const parseHsl = (value: string): [number, number, number] | null => {
  const match = value.match(HSL_REGEX);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const mixHslColors = (base: string, accent: string, ratio: number): string => {
  const baseHsl = parseHsl(base);
  const accentHsl = parseHsl(accent);
  if (!baseHsl || !accentHsl) return base;
  const clampRatio = Math.max(0, Math.min(1, ratio));
  const mix = (a: number, b: number) => a + (b - a) * clampRatio;
  return `hsl(${Math.round(mix(baseHsl[0], accentHsl[0]))}, ${Math.round(
    mix(baseHsl[1], accentHsl[1]),
  )}%, ${Math.round(mix(baseHsl[2], accentHsl[2]))}%)`;
};

const midiToFrequency = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

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
  pointer-events: auto;
`;

// Left side content container
const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  pointer-events: auto;
`;

const HeroTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
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

const sparkleRise = keyframes`
  0% {
    transform: translateY(12px) scale(0.85);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translateY(-42px) scale(1.2);
    opacity: 0;
  }
`;

const tipPulse = keyframes`
  0% {
    opacity: 0.75;
    transform: translate(-4px, -18px) scale(0.96);
  }
  50% {
    opacity: 1;
    transform: translate(-4px, -24px) scale(1.04);
  }
  100% {
    opacity: 0.75;
    transform: translate(-4px, -18px) scale(0.96);
  }
`;

const SequencerWrapper = styled.div`
  padding: 0.85rem 1.65rem 1rem;
  border-radius: 22px;
  width: min(520px, 92vw);
  background: rgba(10, 12, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.45);
  pointer-events: auto;
  position: relative;
  overflow: visible;
  backdrop-filter: blur(18px);
`;

const SequencerFloat = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: clamp(1rem, 4vw, 80px);
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  pointer-events: none;
  z-index: 20;
`;

const SequencerToggle = styled.button`
  pointer-events: auto;
  border: none;
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.75);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.45);
    outline-offset: 3px;
  }
`;

const SequencerTip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  transform: translate(-4px, -18px);
  pointer-events: none;
  background: linear-gradient(130deg, #ffe78c, #ff9f5c);
  color: #1a1a1a;
  padding: 0.35rem 0.85rem 0.55rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.35);
  animation: ${tipPulse} 2.2s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 30%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid #ff9f5c;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
  }
`;

const SequencerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
`;

const TransportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.16);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.45);
    outline-offset: 3px;
  }
`;

const TransportMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  cursor: pointer;
  padding: 0.2rem;

  &:hover {
    color: white;
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.45);
    outline-offset: 3px;
  }
`;

const TransportSwitchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  position: relative;
`;

const TransportSwitch = styled.button<{ $active: boolean }>`
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: ${(p) =>
    p.$active ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.22);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.45);
    outline-offset: 3px;
  }
`;

const TransportButtonWrapper = styled.div`
  position: relative;
  display: inline-flex;
  overflow: visible;
`;

const FloatingTooltip = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translate(-50%, -100%);
  background: linear-gradient(130deg, #ffe78c, #ff9f5c);
  color: #1a1a1a;
  padding: 0.3rem 0.8rem 0.4rem;
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
  animation: ${tipPulse} 2.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 20;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 8px solid #ff9f5c;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
  }
`;

const TrackStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  position: relative;
`;

const TrackRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const TrackLabel = styled.div`
  min-width: 72px;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  color: rgba(255, 255, 255, 0.7);

  span {
    font-size: 0.82rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }

  small {
    font-size: 0.62rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const StepGrid = styled.div`
  display: flex;
  flex: 1;
  gap: 0.5rem;
`;

const BeatGroup = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.25rem;
  padding-right: 0.4rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-right: none;
    padding-right: 0;
  }
`;

const StepButton = styled.button<{
  $active: boolean;
  $current: boolean;
}>`
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: ${(p) =>
    p.$active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'};
  opacity: ${(p) => (p.$current ? 1 : 0.7)};
  box-shadow: ${(p) =>
    p.$current
      ? '0 0 8px rgba(255, 255, 255, 0.35)'
      : '0 1px 4px rgba(0, 0, 0, 0.4)'};
  transform: ${(p) => (p.$current ? 'translateY(-1px)' : 'none')};
  transition: background 0.15s ease, transform 0.15s ease,
    box-shadow 0.15s ease, opacity 0.15s ease, border-color 0.15s ease;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 3px;
  }
`;

const PadSparkLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const PadSpark = styled.div<{ $left: number; $color: string; $size: number }>`
  position: absolute;
  bottom: 0;
  left: ${(p) => `${p.$left}%`};
  width: ${(p) => `${p.$size}px`};
  height: ${(p) => `${p.$size}px`};
  border-radius: 999px;
  background: ${(p) => p.$color};
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  opacity: 0.85;
  animation: ${sparkleRise} 900ms ease-out forwards;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
function HeroSection(props: { previewMode?: boolean; heroOverride?: Partial<HeroContent> } = {}): JSX.Element {
  const { previewMode = false, heroOverride } = props;
  // In preview mode, keep the static visuals (including waveform) but skip heavy JS/audio animation
  const disableAnimations = previewMode;
  const [hero, setHero] = useState<HeroContent | null>(null);
  const padConfigMap = useMemo(
    () =>
      PAD_CONFIG.reduce((acc, pad) => {
        acc[pad.id] = pad;
        return acc;
      }, {} as Record<PadId, PadConfig>),
    [],
  );

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const padBuffersRef = useRef<Record<PadId, AudioBuffer | null>>(
    createPadRecord<AudioBuffer | null>(null),
  );
  const padBurstsRef = useRef<PadBurst[]>([]);
  const padTriggerTimesRef = useRef<Record<PadId, number>>(
    createPadRecord(0),
  );
  const sparkTimeoutsRef = useRef<number[]>([]);
  const [padSparks, setPadSparks] = useState<PadSparkInstance[]>([]);
  const [sequencerPattern, setSequencerPattern] =
    useState<SequencerPattern>(DEFAULT_PATTERN);
  const patternRef = useRef<SequencerPattern>(DEFAULT_PATTERN);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [playheadStep, setPlayheadStep] = useState(0);
  const playheadRef = useRef(0);
  const sequencerProgressRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [srMessage, setSrMessage] = useState('');
  const [sequencerOpen, setSequencerOpen] = useState(false);
  const [hasOpenedSequencer, setHasOpenedSequencer] = useState(false);
  const [hasPlayedGroove, setHasPlayedGroove] = useState(false);
  const [melodyEnabled, setMelodyEnabled] = useState(true);
  const [bassEnabled, setBassEnabled] = useState(true);
  const melodyEnabledRef = useRef(true);
  const bassEnabledRef = useRef(true);
  const [tooltipStage, setTooltipStage] = useState<'play' | 'toggles' | 'grid' | 'done'>('play');

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

  useEffect(() => {
    patternRef.current = sequencerPattern;
  }, [sequencerPattern]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    melodyEnabledRef.current = melodyEnabled;
  }, [melodyEnabled]);

  useEffect(() => {
    bassEnabledRef.current = bassEnabled;
  }, [bassEnabled]);

  useEffect(() => {
    if (!srMessage) return undefined;
    if (typeof window === 'undefined') return undefined;
    const timeout = window.setTimeout(() => {
      setSrMessage('');
    }, 900);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [srMessage]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = (matches: boolean) => {
      setPrefersReducedMotion(matches);
      if (matches) {
        setIsPlaying(false);
      }
    };
    applyPreference(mql.matches);
    const listener = (event: MediaQueryListEvent) => {
      applyPreference(event.matches);
    };
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', listener);
      return () => {
        mql.removeEventListener('change', listener);
      };
    }
    mql.addListener(listener);
    return () => {
      mql.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      sequencerProgressRef.current = 0;
    }
  }, [isPlaying]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const withWebkit = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextCtor = window.AudioContext || withWebkit.webkitAudioContext;
    if (!AudioContextCtor) {
      console.error('[hero] audio context unavailable');
      return;
    }
    const audioCtx = new AudioContextCtor();
    audioContextRef.current = audioCtx;
    let cancelled = false;

    const loadSamples = async () => {
      try {
        await Promise.all(
          PAD_CONFIG.map(async (pad) => {
            const response = await fetch(pad.sample);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await audioCtx.decodeAudioData(arrayBuffer);
            padBuffersRef.current[pad.id] = buffer;
          }),
        );
      } catch (error) {
        console.error('[hero] pad audio failed to load', error);
      }
    };

    loadSamples();

    return () => {
      cancelled = true;
      Object.keys(padBuffersRef.current).forEach((key) => {
        padBuffersRef.current[key as PadId] = null;
      });
      if (typeof audioCtx.close === 'function') {
        audioCtx.close();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      sparkTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      sparkTimeoutsRef.current = [];
    };
  }, []);

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

  const triggerPad = useCallback(
    async (pad: PadConfig, velocity = 1) => {
      const now = performance.now();
      const lastTrigger = padTriggerTimesRef.current[pad.id];
      if (lastTrigger && now - lastTrigger < PAD_TRIGGER_COOLDOWN_MS) {
        return;
      }
      padTriggerTimesRef.current[pad.id] = now;

      const ctx = audioContextRef.current;
      const buffer = padBuffersRef.current[pad.id];
      if (ctx && buffer) {
        if (ctx.state === 'suspended') {
          try {
            await ctx.resume();
          } catch (error) {
            console.warn('[hero] audio resume failed', error);
          }
        }
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.85;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNode).connect(ctx.destination);
        source.start();
      }

      const burst: PadBurst = {
        id: `${pad.id}-${now}`,
        padId: pad.id,
        start: now,
        duration: PAD_BURST_DURATION,
        center: 0.12 + Math.random() * 0.76,
        radius: pad.spread,
        amplitude: pad.intensity * velocity + Math.random() * 0.35,
        color: pad.color,
      };
      padBurstsRef.current = [
        ...padBurstsRef.current.slice(-(MAX_PAD_BURSTS - 1)),
        burst,
      ];

      const spark: PadSparkInstance = {
        id: now + Math.random(),
        left: 15 + Math.random() * 70,
        padId: pad.id,
        color: pad.color,
        size: 6 + Math.random() * 8,
      };
      setPadSparks((prev) => [...prev.slice(-5), spark]);
      if (typeof window !== 'undefined') {
        const timeoutId = window.setTimeout(() => {
          setPadSparks((prev) => prev.filter((s) => s.id !== spark.id));
          sparkTimeoutsRef.current = sparkTimeoutsRef.current.filter(
            (existingId) => existingId !== timeoutId,
          );
        }, 900);
        sparkTimeoutsRef.current.push(timeoutId);
      }
    },
    [],
  );

  const triggerSynthVoice = useCallback((kind: 'melody' | 'bass', midi: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch((err) => {
        console.warn('[hero] synth resume failed', err);
      });
    }
    const frequency = midiToFrequency(midi);
    const now = ctx.currentTime;
    const duration = kind === 'melody' ? 0.25 : 0.6;
    const peak = kind === 'melody' ? 0.18 : 0.32;

    const mainOsc = ctx.createOscillator();
    mainOsc.type = kind === 'melody' ? 'triangle' : 'sine';
    mainOsc.frequency.value = frequency;

    let subOsc: OscillatorNode | null = null;
    let subGain: GainNode | null = null;
    if (kind === 'bass') {
      subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.value = frequency / 2;
      subGain = ctx.createGain();
      subGain.gain.value = 0.45;
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = kind === 'melody' ? 'lowpass' : 'lowshelf';
    if (kind === 'melody') {
      filter.frequency.setValueAtTime(1800, now);
    } else {
      filter.frequency?.setValueAtTime(150, now);
      filter.gain?.setValueAtTime(5, now);
      filter.Q?.setValueAtTime(0.7, now);
    }

    mainOsc.connect(gain);
    if (subOsc && subGain) {
      subOsc.connect(subGain).connect(gain);
    }
    gain.connect(filter).connect(ctx.destination);

    mainOsc.start(now);
    mainOsc.stop(now + duration + 0.1);
    if (subOsc) {
      subOsc.start(now);
      subOsc.stop(now + duration + 0.1);
    }

    mainOsc.onended = () => {
      gain.disconnect();
      filter.disconnect();
      if (subGain) {
        subGain.disconnect();
      }
    };
  },
    [],
  );

  const focusStepButton = useCallback((padId: PadId, index: number) => {
    if (typeof document === 'undefined') return;
    const element = document.getElementById(stepDomId(padId, index));
    if (element instanceof HTMLButtonElement) {
      element.focus();
    }
  }, []);

  const handleStepToggle = useCallback(
    (padId: PadId, stepIndex: number) => {
      setSequencerPattern((prev) => {
        const nextRow = [...prev[padId]];
        nextRow[stepIndex] = !nextRow[stepIndex];
        const nextPattern = { ...prev, [padId]: nextRow };
        const track = padConfigMap[padId];
        if (track) {
          setSrMessage(
            `${track.label} step ${stepIndex + 1} ${nextRow[stepIndex] ? 'enabled' : 'muted'
            }`,
          );
        }
        return nextPattern;
      });
      setTooltipStage((stage) => (stage === 'grid' ? 'done' : stage));
    },
    [padConfigMap],
  );

  const handleStepKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLButtonElement>,
      padId: PadId,
      stepIndex: number,
    ) => {
      const trackIndex = PAD_CONFIG.findIndex((pad) => pad.id === padId);
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const nextStep = (stepIndex + delta + TOTAL_STEPS) % TOTAL_STEPS;
        focusStepButton(padId, nextStep);
        return;
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const nextTrackIndex =
          (trackIndex + delta + PAD_CONFIG.length) % PAD_CONFIG.length;
        focusStepButton(PAD_CONFIG[nextTrackIndex].id, stepIndex);
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        handleStepToggle(padId, stepIndex);
      }
    },
    [focusStepButton, handleStepToggle],
  );

  const handleClearPattern = useCallback(() => {
    setSequencerPattern(createEmptyPattern());
    setSrMessage('Pattern cleared');
  }, []);

  const handleMelodyToggle = useCallback(() => {
    setMelodyEnabled((prev) => !prev);
    setTooltipStage((stage) => (stage === 'toggles' ? 'grid' : stage));
  }, []);

  const handleBassToggle = useCallback(() => {
    setBassEnabled((prev) => !prev);
    setTooltipStage((stage) => (stage === 'toggles' ? 'grid' : stage));
  }, []);

  const handleTransportToggle = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        setHasPlayedGroove(true);
        setTooltipStage((stage) => (stage === 'play' ? 'toggles' : stage));
      }
      return next;
    });
  }, []);

  const handleToggleSequencer = useCallback(() => {
    setSequencerOpen((prev) => {
      const next = !prev;
      if (next && !hasOpenedSequencer) {
        setHasOpenedSequencer(true);
      }
      return next;
    });
  }, [hasOpenedSequencer]);

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
      padBurstsRef.current = padBurstsRef.current.filter(
        (burst) => now - burst.start < burst.duration,
      );
      const activeBursts = padBurstsRef.current;

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
          let burstInfluence = 0;
          let burstColor: string | null = null;
          activeBursts.forEach((burst) => {
            const elapsed = now - burst.start;
            if (elapsed < 0 || elapsed > burst.duration) return;
            const progress = elapsed / burst.duration;
            const distance = Math.abs(position - burst.center);
            if (distance > burst.radius) return;
            const spatial = 1 - distance / burst.radius;
            const energy =
              spatial * spatial * (1 - progress) ** 1.4 * burst.amplitude;
            if (energy > burstInfluence) {
              burstInfluence = energy;
              burstColor = burst.color;
            }
          });
          const amplitude = utils.clamp(
            base + pointerInfluence * 0.6 + burstInfluence,
            0,
            1,
          );
          const height = baseMin + amplitude * (baseMax - baseMin);
          const scaleY = height / BASE_WAVE_HEIGHT;

          // Transform-only updates (no layout): scaleY and opacity
          animatable
            .scaleY(scaleY, 80, 'linear')
            .opacity(0.18 + amplitude * 0.65, 120, 'linear');

          // Update color directly for richer palettes
          const elem = el as HTMLElement;
          const baseColor = getWaveBarColor(
            index,
            waveAnimatablesRef.current.length,
          );
          elem.style.backgroundColor =
            burstColor && burstInfluence > 0
              ? mixHslColors(
                baseColor,
                burstColor,
                Math.min(1, burstInfluence * 1.3),
              )
              : baseColor;
        },
      );

      animationFrameRef.current = requestAnimationFrame(tick);
    };
    if (animationFrameRef.current == null) {
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [getWaveBarColor, valueNoise1D]);

  useEffect(() => {
    if (disableAnimations) return undefined;
    let rafId: number | null = null;
    let lastTime = performance.now();

    const stepLoop = (now: number) => {
      if (!isVisibleRef.current) {
        lastTime = now;
        rafId = requestAnimationFrame(stepLoop);
        return;
      }
      const delta = now - lastTime;
      lastTime = now;
      if (isPlayingRef.current) {
        sequencerProgressRef.current += delta;
        while (sequencerProgressRef.current >= STEP_DURATION_MS) {
          sequencerProgressRef.current -= STEP_DURATION_MS;
          playheadRef.current = (playheadRef.current + 1) % TOTAL_STEPS;
          setPlayheadStep(playheadRef.current);
          PAD_CONFIG.forEach((pad) => {
            const row = patternRef.current[pad.id];
            if (row && row[playheadRef.current]) {
              void triggerPad(pad, 1);
            }
          });
          const melodyNote = MELODY_SEQUENCE[playheadRef.current];
          if (
            melodyEnabledRef.current &&
            typeof melodyNote === 'number'
          ) {
            triggerSynthVoice('melody', melodyNote);
          }
          const bassNote = BASS_SEQUENCE[playheadRef.current];
          if (
            bassEnabledRef.current &&
            typeof bassNote === 'number'
          ) {
            triggerSynthVoice('bass', bassNote);
          }
        }
      }
      rafId = requestAnimationFrame(stepLoop);
    };

    rafId = requestAnimationFrame(stepLoop);
    return () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [disableAnimations, triggerPad, triggerSynthVoice]);

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
    if (!hero) return;

    // If animations are disabled, ensure all elements are visible immediately
    if (disableAnimations) {
      if (titleRef.current) {
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'none';
      }
      if (underlineRef.current) {
        underlineRef.current.style.opacity = '1';
        underlineRef.current.style.transform = 'scaleX(1)';
      }
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = '1';
        subtitleRef.current.style.transform = 'none';
      }
      if (yearRef.current) {
        yearRef.current.style.opacity = '1';
        yearRef.current.style.transform = 'none';
      }
      if (taglineRef.current) {
        taglineRef.current.style.opacity = '1';
        taglineRef.current.style.transform = 'none';
      }
      const buttons = [primaryButtonRef.current, secondaryButtonRef.current].filter(
        (b): b is HTMLButtonElement => b !== null,
      );
      buttons.forEach((btn) => {
        btn.style.opacity = '1';
        btn.style.transform = 'none';
      });
      if (waveBackgroundRef.current) {
        waveBackgroundRef.current.style.opacity = '0.7';
      }
      return;
    }

    if (hasEntranceAnimatedRef.current) return;

    // Use a small timeout to ensure refs are available after render
    let timeoutId: number | undefined;
    let retryTimeoutId: number | undefined;

    timeoutId = window.setTimeout(() => {
      if (titleRef.current) {
        animate(titleRef.current, {
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 1000,
          easing: 'easeOutExpo',
        });
        hasEntranceAnimatedRef.current = true;
      } else if (hero.title) {
        // Fallback: if title exists but ref isn't ready, try again
        retryTimeoutId = window.setTimeout(() => {
          if (titleRef.current) {
            titleRef.current.style.opacity = '1';
            titleRef.current.style.transform = 'none';
          }
        }, 500);
      }
    }, 100);

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

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
    };
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
  const ariaLabel = (hero as any)?.ariaLabel as string | undefined;
  const titleColor = (hero as any)?.titleColor as string | undefined;
  const subtitleColor = (hero as any)?.subtitleColor as string | undefined;
  const yearColor = (hero as any)?.yearColor as string | undefined;
  const taglineColor = (hero as any)?.taglineColor as string | undefined;
  const primaryCtaColor = (hero as any)?.primaryCtaColor as string | undefined;
  const secondaryCtaColor = (hero as any)?.secondaryCtaColor as string | undefined;
  const showPlayTooltip =
    sequencerOpen && tooltipStage === 'play' && !hasPlayedGroove;
  const showToggleTooltip = sequencerOpen && tooltipStage === 'toggles';
  const showGridTooltip = sequencerOpen && tooltipStage === 'grid';

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
    <HeroContainer
      $background={composedBackground}
      aria-label={ariaLabel && ariaLabel.trim().length > 0 ? ariaLabel : undefined}
    >
      {/* If grayscale requested, render the image as a separate layer with filter */}
      {backgroundImage && backgroundImageGrayscale && (
        <>
          <BackdropImage $image={backgroundImage} $grayscale />
          {gradientOk && <GradientOverlay $background={background as string} />}
        </>
      )}
      {/* Music waveform visualization */}
      <WaveBackground ref={waveBackgroundRef}>
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
          <HeroTextBlock>
            {title && title.trim() && (
              <MainTitle
                ref={titleRef}
                style={{
                  opacity: disableAnimations ? 1 : undefined,
                  transform: disableAnimations ? 'none' : undefined,
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
          </HeroTextBlock>
        </LeftContent>
      </ContentWrapper>
      <SequencerFloat>
        {!hasOpenedSequencer && (
          <SequencerTip>Make your own sound</SequencerTip>
        )}
        <SequencerToggle
          type="button"
          aria-pressed={sequencerOpen}
          aria-expanded={sequencerOpen}
          onClick={handleToggleSequencer}
        >
          {sequencerOpen ? 'Hide groove' : 'Open groove'}
        </SequencerToggle>
        {sequencerOpen && (
          <SequencerWrapper>
            <SequencerHeader>
              <TransportButtonWrapper>
                <TransportButton type="button" onClick={handleTransportToggle}>
                  {isPlaying ? 'Pause groove' : 'Play groove'}
                </TransportButton>
                {showPlayTooltip && (
                  <FloatingTooltip style={{ top: '-12px', left: '50%', transform: 'translate(-50%, -110%)' }}>
                    Click play
                  </FloatingTooltip>
                )}
              </TransportButtonWrapper>
              <TransportMeta>
                <TransportSwitchGroup>
                  {showToggleTooltip && (
                    <FloatingTooltip style={{ top: '-10px', left: '50%', transform: 'translate(-50%, -120%)' }}>
                      Toggle melody & bass
                    </FloatingTooltip>
                  )}
                  <TransportSwitch
                    type="button"
                    aria-pressed={melodyEnabled}
                    $active={melodyEnabled}
                    onClick={handleMelodyToggle}
                  >
                    Melody
                  </TransportSwitch>
                  <TransportSwitch
                    type="button"
                    aria-pressed={bassEnabled}
                    $active={bassEnabled}
                    onClick={handleBassToggle}
                  >
                    Bass
                  </TransportSwitch>
                </TransportSwitchGroup>
                <ControlButton type="button" onClick={handleClearPattern}>
                  Clear
                </ControlButton>
              </TransportMeta>
            </SequencerHeader>
            <TrackStack>
              {showGridTooltip && (
                <FloatingTooltip
                  style={{
                    top: '-10px',
                    right: '12px',
                    left: 'auto',
                    transform: 'translateY(-100%)',
                  }}
                >
                  Fill the grid with your beat
                </FloatingTooltip>
              )}
              {PAD_CONFIG.map((pad) => (
                <TrackRow key={pad.id}>
                  <TrackLabel>{pad.label}</TrackLabel>
                  <StepGrid>
                    {Array.from({ length: 4 }).map((_, beatIdx) => {
                      const start = beatIdx * 4;
                      return (
                        <BeatGroup key={beatIdx}>
                          {Array.from({ length: 4 }).map((__, offset) => {
                            const stepIdx = start + offset;
                            const isActive =
                              sequencerPattern[pad.id]?.[stepIdx] ?? false;
                            const isCurrent = playheadStep === stepIdx;
                            const ariaState = isActive ? 'enabled' : 'muted';
                            return (
                              <StepButton
                                key={stepIdx}
                                id={stepDomId(pad.id, stepIdx)}
                                type="button"
                                $active={isActive}
                                $current={isCurrent}
                                aria-pressed={isActive}
                                aria-label={`${pad.label} step ${stepIdx + 1
                                  } ${ariaState}`}
                                onClick={() =>
                                  handleStepToggle(pad.id, stepIdx)
                                }
                                onKeyDown={(event) =>
                                  handleStepKeyDown(event, pad.id, stepIdx)
                                }
                              />
                            );
                          })}
                        </BeatGroup>
                      );
                    })}
                  </StepGrid>
                </TrackRow>
              ))}
            </TrackStack>
            <PadSparkLayer aria-hidden="true">
              {padSparks.map((spark) => (
                <PadSpark
                  key={spark.id}
                  $left={spark.left}
                  $color={spark.color}
                  $size={spark.size}
                />
              ))}
            </PadSparkLayer>
            <VisuallyHidden aria-live="polite">{srMessage}</VisuallyHidden>
          </SequencerWrapper>
        )}
      </SequencerFloat>
    </HeroContainer>
  );
}

export default HeroSection;
