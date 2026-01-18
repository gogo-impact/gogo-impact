import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { animate, stagger } from 'animejs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import MicIcon from '@mui/icons-material/Mic';
import PianoIcon from '@mui/icons-material/Piano';
import BrushIcon from '@mui/icons-material/Brush';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ComputerIcon from '@mui/icons-material/Computer';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MissionStatement from '../components/MissionStatement';
import COLORS from '../../assets/colors';
import { fetchMissionContent, fetchNationalImpactContent, fetchHearOurImpactContent, type MissionContent, type NationalImpactContent, type HearOurImpactContent } from '../services/impact.api';
import EnhancedLeafletMap from '../components/map/EnhancedLeafletMap';
import { getImpactIconByKey } from '../components/IconSelector';

/**
 * Converts a regular Spotify URL to an embed URL.
 * Accepts both regular URLs (https://open.spotify.com/track/xxx) 
 * and embed URLs (https://open.spotify.com/embed/track/xxx).
 * Strips query params like ?si=xxx.
 */
function toSpotifyEmbedUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    
    // Already an embed URL - just return with path only (strips query params)
    if (parsed.pathname.startsWith('/embed/')) {
      return `https://open.spotify.com${parsed.pathname}`;
    }
    
    // Convert regular URL: /track/xxx → /embed/track/xxx
    return `https://open.spotify.com/embed${parsed.pathname}`;
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  musicNote: <MusicNoteIcon />,
  graphicEq: <GraphicEqIcon />,
  mic: <MicIcon />,
  piano: <PianoIcon />,
  brush: <BrushIcon />,
  theater: <TheaterComedyIcon />,
  queueMusic: <QueueMusicIcon />,
  libraryMusic: <LibraryMusicIcon />,
  audiotrack: <AudiotrackIcon />,
  equalizer: <EqualizerIcon />,
  computer: <ComputerIcon />,
  recordVoiceOver: <RecordVoiceOverIcon />,
  directionsRun: <DirectionsRunIcon />,
};

const getIconByKey = (key?: string | null): React.ReactNode => {
  if (!key) return null;
  // First check the local ICON_COMPONENTS for backwards compatibility
  if (ICON_COMPONENTS[key]) return ICON_COMPONENTS[key];
  // Then check the full IMPACT_ICON_LIBRARY
  const iconDef = getImpactIconByKey(key);
  if (iconDef) {
    const IconComponent = iconDef.Icon;
    return <IconComponent />;
  }
  return null;
};

// Animations
const pulseEqualizer = keyframes`
  0% {
    height: 20%;
  }
  50% {
    height: 100%;
  }
  100% {
    height: 20%;
  }
`;

const SectionContainer = styled.section<{
  $textAlign?: 'left' | 'center' | 'right';
  $overlayColor1?: string | null;
  $overlayColor2?: string | null;
  $overlayOpacity?: number | null;
  $underlineGradient?: string | null;
}>`
  position: relative;
  padding: 4rem 0; /* inner content controls side spacing */
  background: linear-gradient(180deg, #121212 0%, #0a0a0a 100%);
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 100%;
  max-width: 100%;
  text-align: ${(p) => p.$textAlign ?? 'center'};
  --section-underline: ${(p) => p.$underlineGradient || 'var(--spotify-green)'};

  @media (max-width: 768px) {
    padding: 1.5rem 0;
    margin: 1rem 0;
    border-radius: 8px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle at 30% 20%,
        ${(p) => p.$overlayColor1 ?? `${COLORS.gogo_blue}08`},
        transparent 40%
      ),
      radial-gradient(
        circle at 70% 80%,
        ${(p) => p.$overlayColor2 ?? `${COLORS.gogo_purple}08`},
        transparent 40%
      );
    opacity: ${(p) => p.$overlayOpacity ?? 1};
    z-index: 0;
  }

  &.fade-in {
    animation: fadeIn 1s ease-out forwards;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 32px);
  position: relative;
  z-index: 2;
`;

const SectionHeader = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  z-index: 1;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const SectionTitle = styled.h2<{
  $useGradient?: boolean;
  $titleGradient?: string | null;
  $titleColor?: string | null;
  $underlineGradient?: string | null;
}>`
  font-size: 3rem;
  font-weight: 900;
  color: ${(p) =>
    p.$useGradient ? 'transparent' : p.$titleColor ?? 'white'};
  background: ${(p) =>
    p.$useGradient
      ? p.$titleGradient ??
      'linear-gradient(to right, rgb(126, 154, 255), rgb(191, 175, 255), rgb(178, 255, 241))'
      : 'none'};
  background-size: 100% 100%;
  -webkit-background-clip: ${(p) => (p.$useGradient ? 'text' : 'initial')};
  -webkit-text-fill-color: ${(p) =>
    p.$useGradient ? 'transparent' : p.$titleColor ?? 'white'};
  margin: 0;
  position: relative;
  letter-spacing: 0.02em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 60px;
    height: 4px;
    background: ${(p) =>
    p.$underlineGradient ??
    'linear-gradient(to right, #5fa8d3, #7b7fd1)'};
    transition: width 0.3s ease;

    @media (max-width: 768px) {
      bottom: -6px;
      width: 40px;
      height: 3px;
    }
  }

  &:hover::after {
    width: 100%;
  }
`;

const SpotifyBadge = styled.div<{
  $bg?: string | null;
  $border?: string | null;
  $textColor?: string | null;
}>`
  display: flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background: ${(p) => p.$bg ?? 'rgba(0, 0, 0, 0.4)'};
  border-radius: 50px;
  border: 1px solid ${(p) => p.$border ?? 'rgba(255, 255, 255, 0.1)'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 0.35rem 0.75rem;
  }

  .badge-icon {
    margin-right: 0.8rem;
    font-size: 1.2rem;
    color: ${(p) => p.$textColor ?? '#7b7fd1'};

    @media (max-width: 768px) {
      margin-right: 0.4rem;
      font-size: 0.85rem;
    }
  }

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${(p) => p.$textColor ?? 'rgba(255, 255, 255, 0.8)'};

    @media (max-width: 768px) {
      font-size: 0.65rem;
    }
  }
`;

const StatsContainer = styled.div<{ $itemCount?: number }>`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin: 4rem 0 2rem;
  position: relative;
  z-index: 1;
  justify-content: center;

  /* At wide widths (>1000px): all items in one row
     At narrower widths: 2x2 grid via media queries */
  & > * {
    /* Base: allow items to grow and shrink, with a min-width that allows 4 to fit */
    flex: 1 1 200px;
    min-width: 200px;
    /* Max width prevents items from getting too wide when there are few items */
    max-width: ${(p) => p.$itemCount && p.$itemCount <= 4 ? `calc((100% - ${(p.$itemCount - 1) * 2}rem) / ${p.$itemCount})` : '300px'};
  }

  /* Intermediate breakpoint: force 2x2 grid when viewport is between 768px and 1000px */
  @media (max-width: 1000px) and (min-width: 769px) {
    & > * {
      /* Force 2 per row at intermediate widths - this prevents 3+1 layout */
      flex: 1 1 calc(50% - 1rem);
      min-width: calc(50% - 1rem);
      max-width: calc(50% - 1rem);
    }
  }

  @media (max-width: 768px) {
    gap: 0.75rem;
    margin: 1.5rem 0 1rem;
    
    & > * {
      /* On mobile, always 2 per row */
      flex: 1 1 calc(50% - 0.375rem);
      min-width: calc(50% - 0.375rem);
      max-width: calc(50% - 0.375rem);
    }
  }
`;

const AtGlanceLabel = styled.div<{ $color?: string | null }>`
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 800;
  font-size: 0.9rem;
  color: ${(p) => p.$color ?? 'rgba(255, 255, 255, 0.7)'};
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 2rem 0 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    margin: 1rem 0 0.25rem;
    gap: 0.4rem;
  }

  &::after {
    content: '';
    display: inline-block;
    height: 2px;
    width: 60px;
    background: ${(p) =>
    p.$color
      ? `linear-gradient(90deg, ${p.$color}, transparent)`
      : `linear-gradient(90deg, ${COLORS.gogo_blue}, transparent)`};
    border-radius: 2px;

    @media (max-width: 768px) {
      width: 30px;
      height: 1.5px;
    }
  }
`;

const StatItem = styled.div<{ $borderColor?: string; $bgColor?: string; $borderWidth?: number; $clickable?: boolean }>`
  position: relative;
  background: ${(p) => p.$bgColor || 'rgba(25, 25, 25, 0.6)'};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${(p) => p.$borderWidth ?? 4}px;
    height: 100%;
    background: ${(p) => p.$borderColor || COLORS.gogo_green};
    transition: width 0.3s ease, opacity 0.3s ease;

    @media (max-width: 768px) {
      width: ${(p) => Math.min((p.$borderWidth ?? 4), 3)}px;
    }
  }

  /* Removed hardcoded nth-child colors to support customization */

  &:hover {
    transform: translateY(-10px);
    box-shadow: ${(p) => p.$clickable 
      ? `0 15px 45px rgba(0, 0, 0, 0.5), 0 0 20px ${p.$borderColor || COLORS.gogo_green}40`
      : '0 15px 35px rgba(0, 0, 0, 0.5)'};
    border-color: ${(p) => p.$clickable ? `${p.$borderColor || COLORS.gogo_green}60` : 'rgba(255, 255, 255, 0.05)'};

    @media (max-width: 768px) {
      transform: translateY(-4px);
    }
  }

  &:hover::before {
    width: 100%;
    opacity: 0.1;
  }

  &.slide-up {
    animation: slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
`;

const ClickHint = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.5)'};
  opacity: 0.7;
  transition: opacity 0.3s ease, color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 0.5rem;
    margin-top: 0.4rem;
    padding-top: 0.4rem;
    gap: 0.2rem;
    letter-spacing: 0.04em;
  }

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.3s ease;

    @media (max-width: 768px) {
      width: 10px;
      height: 10px;
    }
  }

  ${StatItem}:hover & {
    opacity: 1;
    color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.8)'};

    svg {
      transform: translateX(3px);
    }
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    margin: 0 auto 0.4rem;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const StatContent = styled.div`
  position: relative;
  z-index: 1;
`;

const StatNumber = styled.h3`
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0 0 0.8rem;
  background: linear-gradient(
    45deg,
    #fff,
    ${(props) => props.color || COLORS.gogo_green}
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin: 0 0 0.25rem;
  }
`;

const StatLabel = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

const EqualizerBars = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 40px;
  gap: 4px;
  margin-top: auto;
  padding-top: 1.5rem;

  @media (max-width: 768px) {
    height: 20px;
    gap: 2px;
    padding-top: 0.5rem;
  }
`;

const EqualizerBar = styled.div<{ $color?: string; $animate?: boolean }>`
  width: 6px;
  background: ${(props) => props.$color || COLORS.gogo_green};
  border-radius: 3px;
  ${(p) =>
    p.$animate === false
      ? css`
          animation: none;
        `
      : css`
          animation: ${pulseEqualizer} ease-in-out infinite;
          animation-play-state: paused;
          ${StatItem}:hover & {
            animation-play-state: running;
          }
        `};

  &:nth-child(1) {
    animation-duration: 1s;
  }
  &:nth-child(2) {
    animation-duration: 1.6s;
  }
  &:nth-child(3) {
    animation-duration: 1.2s;
  }
  &:nth-child(4) {
    animation-duration: 0.9s;
  }
`;

const ListenNow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3rem;
  padding: 1rem 2rem;
  background: rgba(25, 70, 245, 0.2);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-3px);
    background: rgba(25, 70, 245, 0.3);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .listen-icon {
    font-size: 1.2rem;
    color: ${COLORS.gogo_blue};
    margin-right: 0.8rem;
  }

  span {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
`;

// Modal content styles for disciplines grid (large cards)
const ModalHeader = styled.div`
  position: relative;
`;

const ModalSubtitle = styled.p`
  font-family: 'Century Gothic', 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0 20px;
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ModalCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  backdrop-filter: blur(6px);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
  }
`;

const ModalIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(123, 127, 209, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);

  svg {
    width: 28px;
    height: 28px;
    color: ${COLORS.gogo_teal};
    filter: drop-shadow(0 2px 6px rgba(123, 127, 209, 0.4));
  }
`;

const ModalName = styled.h3`
  font-family: 'Century Gothic', 'Arial', sans-serif;
  font-size: 1.05rem;
  color: white;
  margin: 0 0 6px;
  font-weight: 700;
`;

// Shimmering diagonal glint overlay
const shine = keyframes`
  0% {
    transform: translateX(-120%) rotate(35deg);
    opacity: 0.0;
  }
  10% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    transform: translateX(140%) rotate(35deg);
    opacity: 0.0;
  }
`;

const ShineOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -30%;
    width: 60%;
    height: 200%;
    transform: translateX(-120%) rotate(35deg);
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shine} 6s linear infinite;
  }
`;

interface MissionSectionProps {
  /** Data passed directly from parent - used for production */
  missionData?: MissionContent;
  /** National impact data passed from parent - used for sites count */
  nationalImpactData?: NationalImpactContent;
  /** Preview mode for admin editor */
  previewMode?: boolean;
  /** Override data for admin preview */
  missionOverride?: Partial<MissionContent>;
}

function MissionSection(props: MissionSectionProps = {}): JSX.Element | null {
  const { missionData, nationalImpactData, previewMode = false, missionOverride } = props;
  const [inView, setInView] = useState(true);
  const [showDisciplines, setShowDisciplines] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showStudentMusic, setShowStudentMusic] = useState(false);
  const [showMentorMusic, setShowMentorMusic] = useState(false);
  const modalGridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [mission, setMission] = useState<MissionContent | null>(missionData || null);
  const [nationalImpact, setNationalImpact] = useState<NationalImpactContent | null>(nationalImpactData || null);
  const [hearOurImpact, setHearOurImpact] = useState<HearOurImpactContent | null>(null);
  const [loading, setLoading] = useState(!previewMode && !missionData);
  const [error, setError] = useState(false);

  // Reveal immediately; no intersection gating for mission section
  // Kept for potential future hooks but does nothing now
  useEffect(() => {
    // no setup required currently
  }, []);

  // Load mission content (or apply preview override)
  useEffect(() => {
    if (missionData) {
      // missionData was provided by parent - use it directly
      setMission(missionData);
      setLoading(false);
    } else if (!previewMode) {
      // Backward compatibility: fetch data if no missionData provided
      fetchMissionContent().then((data) => {
        if (data) {
          setMission(data);
        } else {
          setError(true);
        }
        setLoading(false);
      });
    } else if (missionOverride) {
      // Preview mode with override
      setMission((prev) => ({
        ...(prev ?? {}),
        ...(missionOverride as MissionContent),
      }));
      setLoading(false);
    }
  }, [missionData, previewMode, missionOverride]);

  // Load national impact data for sites count (if not provided)
  useEffect(() => {
    if (nationalImpactData) {
      setNationalImpact(nationalImpactData);
    } else {
      // Always fetch if not provided, even in preview mode (for sites count)
      fetchNationalImpactContent().then((data) => {
        if (data) {
          setNationalImpact(data);
        }
      });
    }
  }, [nationalImpactData]);

  // Compute total map locations count from national impact data
  const mapLocationsCount = React.useMemo(() => {
    if (!nationalImpact?.regions) return 0;
    return nationalImpact.regions.reduce((total, region) => {
      return total + (region.locations?.length ?? 0);
    }, 0);
  }, [nationalImpact]);

  // Load HearOurImpact data for music modals (student/mentor embeds)
  useEffect(() => {
    fetchHearOurImpactContent().then((data) => {
      if (data) {
        setHearOurImpact(data);
      }
    });
  }, []);

  // Animate modal cards in rows when dialog opens
  useEffect(() => {
    if (!showDisciplines) return;

    const grid = modalGridRef.current;
    if (!grid) return;

    const cards = Array.from(
      grid.querySelectorAll('[data-disc-card="true"]'),
    ) as HTMLElement[];
    if (cards.length === 0) return;

    type RowGroup = { top: number; els: HTMLElement[] };
    const rowGroups: RowGroup[] = [];
    const threshold = 8; // px tolerance for grouping by row

    cards.forEach((node) => {
      const el = node as HTMLElement;
      const { top } = el.getBoundingClientRect();

      // find an existing group within threshold
      let group = rowGroups.find((g) => Math.abs(g.top - top) <= threshold);
      if (!group) {
        group = { top, els: [] };
        rowGroups.push(group);
      }
      group.els.push(el);

      // reset initial state for animation
      el.style.opacity = "0";
      el.style.transform = "translateY(16px) scale(0.98)";
    });

    // Sort by vertical position and animate row by row
    rowGroups.sort((a, b) => a.top - b.top);
    let cumulativeDelay = 0;
    const rowDelay = 80; // ms between rows

    rowGroups.forEach((group) => {
      animate(group.els, {
        opacity: [0, 1],
        translateY: [16, 0],
        scale: [0.98, 1],
        duration: 500,
        delay: stagger(60, { start: cumulativeDelay }),
        easing: "easeOutCubic",
      });
      cumulativeDelay += rowDelay;
    });
  }, [showDisciplines]);

  if (error) {
    return (
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <h3>Failed to load impact report data</h3>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }

  if (loading) {
    return <></>; // Or a loading spinner
  }

  const missionHidden =
    mission &&
    ((mission as any)?.visible === false ||
      (mission as any)?.enabled === false);

  const textAlign =
    (mission?.textAlign as "left" | "center" | "right") ?? "center";
  const layoutVariant =
    mission?.layoutVariant === "default" ? "default" : "ticket";
  const animationsEnabled = mission?.animationsEnabled !== false;

  // Compute composed background from gradient + image
  const isValidGradient = (s?: string | null) =>
    !!s &&
    !/undefined/i.test(String(s)) &&
    /(linear|radial|conic)-gradient\(/i.test(String(s));
  const gradientOk = isValidGradient(mission?.backgroundGradient || mission?.backgroundColor);
  const gradientBackground = gradientOk
    ? ((mission?.backgroundGradient || mission?.backgroundColor) as string)
    : undefined;
  const sectionBackground = gradientBackground;

  // Stats from API/override or default
  const disciplinesModal =
    (mission?.modals ?? undefined)?.find((m) => m?.id === "disciplines") ??
    null;
  
  // Disciplines data comes from database only - no fallbacks
  const disciplinesData = disciplinesModal?.items || [];
  
  const statsSource =
    mission?.stats && mission.stats.length > 0
      ? mission.stats.filter((s) => s.visible !== false)
      : []; // No default fallback stats if empty

  const getActionForStatId = (id: string) => {
    switch (id) {
      case "students":
        return "openStudentMusicModal";
      case "mentors":
        return "openMentorMusicModal";
      case "sites":
        return "openMapModal";
      case "disciplines":
        return "openDisciplinesModal";
      default:
        return "none";
    }
  };

  const computedStats = statsSource.map((s, idx) => {
    // Determine display number based on numberSource
    let displayNumber: string | number = s.number ?? "";
    if (s.numberSource === "modalItemsLength" && disciplinesModal?.items) {
      displayNumber = disciplinesModal.items.length;
    } else if (s.numberSource === "mapLocationsLength") {
      displayNumber = mapLocationsCount;
    }

    // Use action from data if explicitly set, otherwise default based on ID
    // An explicit "none" means user disabled interactivity, so respect it
    const effectiveAction =
      s.action !== undefined && s.action !== null
        ? s.action  // Respect explicit action (including "none")
        : getActionForStatId(s.id);  // Only default if action is not set at all

    return {
      ...s,
      action: effectiveAction,
      delay: idx * 0.2,
      displayNumber,
    };
  });

  const statsEqualizerConfig = mission?.statsEqualizer ?? {
    enabled: true,
    barCount: 4,
  };
  const showEqualizer = statsEqualizerConfig.enabled !== false;
  const equalizerBarCount = Math.max(
    1,
    Math.min(24, statsEqualizerConfig.barCount ?? 4),
  );
  const statsTitleText = mission?.statsTitle || "At a Glance";
  const statsTitleColor = mission?.statsTitleColor || "rgba(255,255,255,0.7)";
  // NEW: Stat card styling
  const statCardBgColor = mission?.statCardBgColor || undefined;
  const statCardBorderWidth = mission?.statCardBorderWidth ?? undefined;

  const getStaticEqualizerHeight = (statIndex: number, barIndex: number) =>
    40 + ((statIndex + barIndex) % 5) * 10;

  const badgeIconNode = (() => {
    if (mission?.badgeIcon?.type === "iconKey") {
      return (
        getIconByKey(mission.badgeIcon.value) ?? mission.badgeIcon.value ?? "♫"
      );
    }
    if (mission?.badgeIcon?.value) {
      return mission.badgeIcon.value;
    }
    return "♫";
  })();

  const renderStatIcon = (stat: any) => {
    const keyed = getIconByKey(stat.iconKey);
    if (keyed) return keyed;
    switch (stat.id) {
      case "students":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" />
          </svg>
        );
      case "mentors":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zM8 12c2.209 0 4-1.791 4-4S10.209 4 8 4 4 5.791 4 8s1.791 4 4 4zm8 2c-2.673 0-8 1.336-8 4v2h16v-2c0-2.664-5.327-4-8-4zM8 14c-.688 0-1.347.062-1.971.175C3.659 14.66 2 15.867 2 17v3h4v-2c0-1.188.75-2.238 2-2.986-.62-.01-1.31-.014-2-.014z" />
          </svg>
        );
      case "sites":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
          </svg>
        );
      case "disciplines":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
          </svg>
        );
      default:
        return <MusicNoteIcon />;
    }
  };

  if (missionHidden) {
    return <></>;
  }

  return (
    <SectionContainer
      ref={sectionRef}
      aria-label={mission?.ariaLabel || "Mission section"}
      $textAlign={textAlign}
      $overlayColor1={mission?.overlayColor1}
      $overlayColor2={mission?.overlayColor2}
      $overlayOpacity={mission?.overlayOpacity}
      $underlineGradient={mission?.titleUnderlineGradient || mission?.titleGradient}
      data-variant={layoutVariant}
      className={`mission-section${animationsEnabled && inView ? " fade-in" : ""
        }`}
      style={sectionBackground ? { background: sectionBackground } : undefined}
    >
      <Content style={{ textAlign }}>
        <SectionHeader
          style={{
            flexDirection: textAlign === "center" ? "column" : "row",
            alignItems: textAlign === "center" ? "center" : "flex-start",
            gap: textAlign === "center" ? "1rem" : "2rem",
          }}
        >
          <SectionTitle
            $useGradient={Boolean(mission?.titleGradient)}
            $titleGradient={mission?.titleGradient}
            $titleColor={mission?.titleColor}
            $underlineGradient={mission?.titleUnderlineGradient}
          >
            {mission?.title || "Our Mission"}
          </SectionTitle>
          <SpotifyBadge
            $bg={mission?.badgeBgColor}
            $border={mission?.badgeBorderColor}
            $textColor={mission?.badgeTextColor}
          >
            <div className="badge-icon">{badgeIconNode}</div>
            <span>{mission?.badgeLabel || "Since 2008"}</span>
          </SpotifyBadge>
        </SectionHeader>

        <MissionStatement
          statement={
            mission?.statementText ||
            "Our mission is to empower youth through music, art and mentorship. Guitars Over Guns offers students from our most vulnerable communities a combination of arts education and mentorship with paid, professional musician mentors to help them overcome hardship, find their voice and reach their potential as tomorrow's leaders. Since 2008, we have served nearly 12,000 students."
          }
          statementTitle={mission?.statementTitle ?? null}
          statementTitleColor={mission?.statementTitleColor ?? null}
          statementTextColor={mission?.statementTextColor ?? null}
          statementTextGradientColor={mission?.statementTextGradientColor ?? null}
          statementMeta={mission?.statementMeta ?? null}
          statementMetaColor={mission?.statementMetaColor ?? null}
          statementBoxBorderColor={mission?.statementBoxBorderColor ?? null}
          statementBoxBgColor={mission?.statementBoxBgColor ?? null}
          serial={mission?.serial ?? null}
          serialColor={mission?.serialColor ?? null}
          ticketStripeGradient={mission?.ticketStripeGradient ?? null}
          ticketBorderColor={mission?.ticketBorderColor ?? null}
          ticketBackdropColor={mission?.ticketBackdropColor ?? null}
          ticketBlotch1Color={mission?.ticketBlotch1Color ?? null}
          ticketBlotch2Color={mission?.ticketBlotch2Color ?? null}
          ticketShowBarcode={mission?.ticketShowBarcode !== false}
          barcodeColor={mission?.barcodeColor ?? null}
          backgroundLogoEnabled={mission?.backgroundLogoEnabled !== false}
          backgroundLogoOpacity={mission?.backgroundLogoOpacity ?? null}
          backgroundLogoRotation={mission?.backgroundLogoRotation ?? null}
          backgroundLogoScale={mission?.backgroundLogoScale ?? null}
        />

        <AtGlanceLabel $color={mission?.statsTitleColor}>
          {statsTitleText}
        </AtGlanceLabel>

        <StatsContainer $itemCount={computedStats.length}>
          {computedStats.map((stat: any, idx) => {
            // Use the computed action from stat (already respects toggle settings)
            const action: string = stat?.action ?? "none";

            const isClickable =
              action === "openModal" ||
              action === "openDisciplinesModal" ||
              action === "openStudentMusicModal" ||
              action === "openMentorMusicModal" ||
              action === "scrollToMap" ||
              action === "openMapModal";

            const handleClick = () => {
              if (!isClickable) return;
              if (action === "openModal" || action === "openDisciplinesModal") {
                setShowDisciplines(true);
                return;
              }
              if (action === "openStudentMusicModal") {
                setShowStudentMusic(true);
                return;
              }
              if (action === "openMentorMusicModal") {
                setShowMentorMusic(true);
                return;
              }
              if (action === "scrollToMap") {
                if (typeof document !== "undefined") {
                  const el = document.getElementById("locations");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }
              }
              if (action === "openMapModal") {
                setShowMap(true);
                return;
              }
            };

            return (
              <StatItem
                key={`${stat.id}-${idx}`}
                className={animationsEnabled && inView ? "slide-up" : undefined}
                $borderColor={stat.color}
                $bgColor={statCardBgColor}
                $borderWidth={statCardBorderWidth}
                $clickable={isClickable}
                style={{
                  animationDelay: animationsEnabled
                    ? `${stat.delay}s`
                    : undefined,
                  transitionDelay: animationsEnabled
                    ? `${stat.delay}s`
                    : undefined,
                  cursor: isClickable ? "pointer" : undefined,
                }}
                onClick={isClickable ? handleClick : undefined}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={isClickable ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                  }
                } : undefined}
              >
                <StatContent>
                  <StatIcon style={{ color: stat.color }}>
                    {renderStatIcon(stat)}
                  </StatIcon>
                  <StatNumber color={stat.color}>
                    {stat.displayNumber ?? stat.number ?? ""}
                  </StatNumber>
                  <StatLabel>{stat.label}</StatLabel>
                </StatContent>
                {showEqualizer && (
                  <EqualizerBars>
                    {Array.from({ length: equalizerBarCount }).map(
                      (_, barIdx) => (
                        <EqualizerBar
                          key={`${stat.id}-bar-${barIdx}`}
                          $color={stat.color}
                          $animate={animationsEnabled}
                          style={{
                            animationDuration: animationsEnabled
                              ? `${0.8 + (barIdx % 4) * 0.2}s`
                              : undefined,
                            animationDelay: animationsEnabled
                              ? `-${(barIdx * 0.4) % 2}s`
                              : undefined,
                            height: animationsEnabled
                              ? undefined
                              : `${getStaticEqualizerHeight(idx, barIdx)}%`,
                          }}
                        />
                      ),
                    )}
                  </EqualizerBars>
                )}
                {isClickable && (
                  <ClickHint $color={stat.color}>
                    <span>Click to explore</span>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </ClickHint>
                )}
              </StatItem>
            );
          })}
        </StatsContainer>
      </Content>

      <Dialog
        open={showDisciplines}
        onClose={() => setShowDisciplines(false)}
        fullWidth
        maxWidth="xl"
        container={previewMode ? sectionRef.current : undefined}
        disablePortal={previewMode}
        PaperProps={{
          style: {
            background:
              "linear-gradient(180deg, rgba(22,22,22,0.96), rgba(10,10,10,0.96))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(123,127,209,0.06)",
            width: previewMode ? "90%" : "min(1200px, 92vw)",
            maxWidth: previewMode ? "90%" : undefined,
            maxHeight: previewMode ? "85%" : undefined,
            margin: previewMode ? "auto" : undefined,
            position: "relative",
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0,0,0,0.6)",
            position: previewMode ? "absolute" : undefined,
            inset: previewMode ? 0 : undefined,
          },
        }}
        sx={previewMode ? {
          position: 'absolute',
          inset: 0,
          '& .MuiDialog-container': {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        } : undefined}
      >
        <DialogTitle sx={{ m: 0, p: 2, color: "white", fontFamily: "'Century Gothic', 'Arial', sans-serif" }}>
          {disciplinesModal?.title || "Artistic Disciplines"}
          <IconButton
            aria-label="close"
            onClick={() => setShowDisciplines(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ModalHeader>
            <ModalSubtitle>
              Guitars Over Guns mentors teach a diverse range of disciplines.
              Explore the areas students engage with:
            </ModalSubtitle>
          </ModalHeader>
          <ModalGrid ref={modalGridRef}>
            {disciplinesData.map((d: any) => {
              // Purely data-driven: use iconKey from DB, fallback to music note
              const modalIcon = getIconByKey(d?.iconKey) || <MusicNoteIcon />;
              return (
                <ModalCard
                  key={`discipline-card-${d.name.replace(/\s+/g, "-")}`}
                  data-disc-card="true"
                >
                  <ModalIcon>{modalIcon}</ModalIcon>
                  <ModalName>{d.name}</ModalName>
                </ModalCard>
              );
            })}
          </ModalGrid>
        </DialogContent>
        <ShineOverlay aria-hidden />
      </Dialog>

      {/* Map Modal */}
      <Dialog
        open={showMap}
        onClose={() => setShowMap(false)}
        fullWidth
        maxWidth="lg"
        container={previewMode ? sectionRef.current : undefined}
        disablePortal={previewMode}
        PaperProps={{
          style: {
            background: "#121212",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            overflow: "hidden",
            width: previewMode ? "90%" : undefined,
            maxWidth: previewMode ? "90%" : undefined,
            maxHeight: previewMode ? "85%" : undefined,
            margin: previewMode ? "auto" : undefined,
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0,0,0,0.6)",
            position: previewMode ? "absolute" : undefined,
            inset: previewMode ? 0 : undefined,
          },
        }}
        sx={previewMode ? {
          position: 'absolute',
          inset: 0,
          '& .MuiDialog-container': {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        } : undefined}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Our Locations
          <IconButton
            aria-label="close"
            onClick={() => setShowMap(false)}
            sx={{
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "500px" }}>
          <EnhancedLeafletMap regions={nationalImpact?.regions ?? undefined} />
        </DialogContent>
      </Dialog>

      {/* Student Music Modal */}
      <Dialog
        open={showStudentMusic}
        onClose={() => setShowStudentMusic(false)}
        fullWidth
        maxWidth="lg"
        container={previewMode ? sectionRef.current : undefined}
        disablePortal={previewMode}
        PaperProps={{
          style: {
            background: "linear-gradient(180deg, rgba(22,22,22,0.98), rgba(10,10,10,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            width: previewMode ? "90%" : undefined,
            maxWidth: previewMode ? "90%" : undefined,
            maxHeight: previewMode ? "85%" : undefined,
            margin: previewMode ? "auto" : undefined,
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0,0,0,0.6)",
            position: previewMode ? "absolute" : undefined,
            inset: previewMode ? 0 : undefined,
          },
        }}
        sx={previewMode ? {
          position: 'absolute',
          inset: 0,
          '& .MuiDialog-container': {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        } : undefined}
      >
        <DialogTitle sx={{ m: 0, p: 2, color: "white", fontFamily: "'Century Gothic', 'Arial', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {hearOurImpact?.allSongsModalTitle || "Student Music"}
          <IconButton
            aria-label="close"
            onClick={() => setShowStudentMusic(false)}
            sx={{ color: "rgba(255,255,255,0.6)" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'transparent' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {(hearOurImpact?.allSongsEmbeds || []).map((embed) => (
              <div key={embed.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <iframe
                  src={toSpotifyEmbedUrl(embed.url)}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ borderRadius: 8 }}
                />
              </div>
            ))}
            {(!hearOurImpact?.allSongsEmbeds || hearOurImpact.allSongsEmbeds.length === 0) && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Century Gothic', 'Arial', sans-serif", gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                No student music embeds configured. Add them in the "Hear Our Impact" section.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mentor Music Modal */}
      <Dialog
        open={showMentorMusic}
        onClose={() => setShowMentorMusic(false)}
        fullWidth
        maxWidth="lg"
        container={previewMode ? sectionRef.current : undefined}
        disablePortal={previewMode}
        PaperProps={{
          style: {
            background: "linear-gradient(180deg, rgba(22,22,22,0.98), rgba(10,10,10,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            width: previewMode ? "90%" : undefined,
            maxWidth: previewMode ? "90%" : undefined,
            maxHeight: previewMode ? "85%" : undefined,
            margin: previewMode ? "auto" : undefined,
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0,0,0,0.6)",
            position: previewMode ? "absolute" : undefined,
            inset: previewMode ? 0 : undefined,
          },
        }}
        sx={previewMode ? {
          position: 'absolute',
          inset: 0,
          '& .MuiDialog-container': {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        } : undefined}
      >
        <DialogTitle sx={{ m: 0, p: 2, color: "white", fontFamily: "'Century Gothic', 'Arial', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {hearOurImpact?.mentorProfilesModalTitle || "Mentor Profiles"}
          <IconButton
            aria-label="close"
            onClick={() => setShowMentorMusic(false)}
            sx={{ color: "rgba(255,255,255,0.6)" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'transparent' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {(hearOurImpact?.mentorProfileEmbeds || []).map((embed) => (
              <div key={embed.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <iframe
                  src={toSpotifyEmbedUrl(embed.url)}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ borderRadius: 8 }}
                />
              </div>
            ))}
            {(!hearOurImpact?.mentorProfileEmbeds || hearOurImpact.mentorProfileEmbeds.length === 0) && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Century Gothic', 'Arial', sans-serif", gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                No mentor profile embeds configured. Add them in the "Hear Our Impact" section.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* <ListenNow>
        <div className="listen-icon">▶</div>
        <span>Listen to our students&apos; music</span>
      </ListenNow> */}
    </SectionContainer>
  );
}

export default MissionSection;
