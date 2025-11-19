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
import COLORS from '../../assets/colors.ts';
import { fetchMissionContent, type MissionContent } from '../services/impact.api';
import photo1 from '../../assets/missionPhotos/Photo1.jpg';
import photo2 from '../../assets/missionPhotos/Photo2.jpg';
import photo3 from '../../assets/missionPhotos/Photo3.jpg';
import photo4 from '../../assets/missionPhotos/Photo4.jpg';
import photo5 from '../../assets/missionPhotos/Photo5.jpg';
import photo6 from '../../assets/missionPhotos/Photo6.jpg';
import photo7 from '../../assets/missionPhotos/Photo7.jpg';
import photo8 from '../../assets/missionPhotos/Photo8.jpg';
import photo9 from '../../assets/missionPhotos/Photo9.jpg';
import photo10 from '../../assets/missionPhotos/Photo10.jpg';
import photo11 from '../../assets/missionPhotos/Photo11.jpg';
import photo12 from '../../assets/missionPhotos/Photo12.jpg';
import photo13 from '../../assets/missionPhotos/Photo13.jpg';
import photo14 from '../../assets/missionPhotos/Photo14.jpg';

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

const getIconByKey = (key?: string | null) =>
  (key && ICON_COMPONENTS[key]) || null;

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

const SectionContainer = styled.section<{ $textAlign?: 'left' | 'center' | 'right' }>`
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

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle at 30% 20%,
        ${COLORS.gogo_blue}08,
        transparent 40%
      ),
      radial-gradient(
        circle at 70% 80%,
        ${COLORS.gogo_purple}08,
        transparent 40%
      );
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

  .badge-icon {
    margin-right: 0.8rem;
    font-size: 1.2rem;
    color: ${(p) => p.$textColor ?? '#7b7fd1'};
  }

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${(p) => p.$textColor ?? 'rgba(255, 255, 255, 0.8)'};
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 4rem 0 2rem;
  position: relative;
  z-index: 1;
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
  }
`;

const StatItem = styled.div`
  position: relative;
  background: rgba(25, 25, 25, 0.6);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${COLORS.gogo_green};
    transition: width 0.3s ease, opacity 0.3s ease;
  }

  &:nth-child(2)::before {
    background: ${COLORS.gogo_blue};
  }

  &:nth-child(3)::before {
    background: ${COLORS.gogo_purple};
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  }

  &:hover::before {
    width: 100%;
    opacity: 0.1;
  }

  &.slide-up {
    animation: slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
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
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const StatLabel = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 600;
`;

const EqualizerBars = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 40px;
  gap: 4px;
  margin-top: auto;
  padding-top: 1.5rem;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
    content: '';
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

function MissionSection(
  props: { previewMode?: boolean; missionOverride?: Partial<MissionContent> } = {},
): JSX.Element {
  const { previewMode = false, missionOverride } = props;
  const [inView, setInView] = useState(true);
  const [showDisciplines, setShowDisciplines] = useState(false);
  const modalGridRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [mission, setMission] = useState<MissionContent | null>(null);

  // Reveal immediately; no intersection gating for mission section
  // Kept for potential future hooks but does nothing now
  useEffect(() => {
    // no setup required currently
  }, []);

  // Load mission content (or apply preview override)
  useEffect(() => {
    if (!previewMode) {
      fetchMissionContent().then((data) => setMission(data));
    } else if (missionOverride) {
      setMission((prev) => ({ ...(prev ?? {}), ...(missionOverride as MissionContent) }));
    }
  }, [previewMode, missionOverride]);

  // Artistic disciplines mapped to vector icons
  const disciplineNameIcons: Record<string, React.ReactNode> = {
    'Music Production': <GraphicEqIcon />,
    Guitar: <MusicNoteIcon />,
    Drums: <AudiotrackIcon />,
    Piano: <PianoIcon />,
    Vocals: <MicIcon />,
    Bass: <QueueMusicIcon />,
    DJing: <GraphicEqIcon />,
    Songwriting: <LibraryMusicIcon />,
    Dance: <DirectionsRunIcon />,
    'Visual Art': <BrushIcon />,
    'Digital Art': <ComputerIcon />,
    'Spoken Word': <RecordVoiceOverIcon />,
    Theater: <TheaterComedyIcon />,
    'Sound Engineering': <EqualizerIcon />,
    'Brass Instruments': <MusicNoteIcon />,
    'Woodwind Instruments': <MusicNoteIcon />,
    Strings: <MusicNoteIcon />,
  };

  // Fallback disciplines dataset for modal (used if none provided)
  const fallbackDisciplinesData = [
    { name: 'Music Production', students: 78, projects: 120 },
    { name: 'Guitar', students: 95, projects: 150 },
    { name: 'Drums', students: 65, projects: 85 },
    { name: 'Piano', students: 70, projects: 110 },
    { name: 'Vocals', students: 85, projects: 130 },
    { name: 'Bass', students: 55, projects: 75 },
    { name: 'DJing', students: 60, projects: 95 },
    { name: 'Songwriting', students: 72, projects: 140 },
    { name: 'Dance', students: 68, projects: 90 },
    { name: 'Visual Art', students: 63, projects: 105 },
    { name: 'Digital Art', students: 58, projects: 80 },
    { name: 'Spoken Word', students: 50, projects: 85 },
    { name: 'Theater', students: 45, projects: 60 },
    { name: 'Sound Engineering', students: 40, projects: 65 },
    { name: 'Brass Instruments', students: 35, projects: 50 },
    { name: 'Woodwind Instruments', students: 30, projects: 45 },
    { name: 'Strings', students: 25, projects: 40 },
  ];

  const missionHidden =
    mission &&
    (((mission as any)?.visible === false) ||
      ((mission as any)?.enabled === false));

  const textAlign =
    (mission?.textAlign as 'left' | 'center' | 'right') ?? 'center';
  const layoutVariant =
    mission?.layoutVariant === 'default' ? 'default' : 'ticket';
  const animationsEnabled = mission?.animationsEnabled !== false;

  // Compute composed background from gradient + image
  const isValidGradient = (s?: string | null) =>
    !!s && !/undefined/i.test(String(s)) && /linear-gradient\(/i.test(String(s));
  const gradientOk = isValidGradient(mission?.backgroundColor);
  const gradientBackground = gradientOk
    ? (mission?.backgroundColor as string)
    : undefined;
  const sectionBackground = gradientBackground;

  // Stats from API/override or default
  const disciplinesModal =
    (mission?.modals ?? undefined)?.find((m) => m?.id === 'disciplines') ?? null;
  const statsSource =
    mission?.stats && mission.stats.length > 0
      ? mission.stats
      : [
          { id: 'students', number: '1622', label: 'Students', color: COLORS.gogo_green },
          { id: 'mentors', number: '105', label: 'Paid Mentors', color: COLORS.gogo_blue },
          { id: 'sites', number: '59', label: 'School & Community Sites', color: COLORS.gogo_purple },
          {
            id: 'disciplines',
            number: fallbackDisciplinesData.length,
            label: 'Artistic Disciplines',
            color: COLORS.gogo_yellow,
          },
        ];
  const computedStats = statsSource.map((s, idx) => {
    const useModalCount = s.numberSource === 'modalItemsLength';
    const displayNumber =
      useModalCount && disciplinesModal?.items
        ? disciplinesModal.items.length
        : s.number ?? '';
    return {
      ...s,
      delay: idx * 0.2,
      displayNumber,
    };
  });

  const statsEqualizerConfig =
    mission?.statsEqualizer ?? { enabled: true, barCount: 4 };
  const showEqualizer = statsEqualizerConfig.enabled !== false;
  const equalizerBarCount = Math.max(
    1,
    Math.min(24, statsEqualizerConfig.barCount ?? 4),
  );
  const statsTitleText = mission?.statsTitle || 'At a Glance';
  const statsTitleColor = mission?.statsTitleColor || 'rgba(255,255,255,0.7)';

  const getStaticEqualizerHeight = (statIndex: number, barIndex: number) =>
    40 + (((statIndex + barIndex) % 5) * 10);

  const badgeIconNode = (() => {
    if (mission?.badgeIcon?.type === 'iconKey') {
      return (
        getIconByKey(mission.badgeIcon.value) ??
        mission.badgeIcon.value ??
        '♫'
      );
    }
    if (mission?.badgeIcon?.value) {
      return mission.badgeIcon.value;
    }
    return '♫';
  })();

  const renderStatIcon = (stat: any) => {
    const keyed = getIconByKey(stat.iconKey);
    if (keyed) return keyed;
    switch (stat.id) {
      case 'students':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" />
          </svg>
        );
      case 'mentors':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zM8 12c2.209 0 4-1.791 4-4S10.209 4 8 4 4 5.791 4 8s1.791 4 4 4zm8 2c-2.673 0-8 1.336-8 4v2h16v-2c0-2.664-5.327-4-8-4zM8 14c-.688 0-1.347.062-1.971.175C3.659 14.66 2 15.867 2 17v3h4v-2c0-1.188.75-2.238 2-2.986-.62-.01-1.31-.014-2-.014z" />
          </svg>
        );
      case 'sites':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
          </svg>
        );
      case 'disciplines':
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
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px) scale(0.98)';
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
        easing: 'easeOutCubic',
      });
      cumulativeDelay += rowDelay;
    });
  }, [showDisciplines]);

  return (
    <SectionContainer
      aria-label={mission?.ariaLabel || 'Mission section'}
      $textAlign={textAlign}
      data-variant={layoutVariant}
      className={`mission-section${
        animationsEnabled && inView ? ' fade-in' : ''
      }`}
      style={sectionBackground ? { background: sectionBackground } : undefined}
    >
      <Content style={{ textAlign }}>
        <SectionHeader
          style={{
            flexDirection: textAlign === 'center' ? 'column' : 'row',
            alignItems: textAlign === 'center' ? 'center' : 'flex-start',
            gap: textAlign === 'center' ? '1rem' : '2rem',
          }}
        >
          <SectionTitle
            $useGradient={Boolean(mission?.titleGradient)}
            $titleGradient={mission?.titleGradient}
            $titleColor={mission?.titleColor}
            $underlineGradient={mission?.titleUnderlineGradient}
          >
            {mission?.title || 'Our Mission'}
          </SectionTitle>
          <SpotifyBadge
            $bg={mission?.badgeBgColor}
            $border={mission?.badgeBorderColor}
            $textColor={mission?.badgeTextColor}
          >
            <div className="badge-icon">{badgeIconNode}</div>
            <span>{mission?.badgeLabel || 'Since 2008'}</span>
          </SpotifyBadge>
        </SectionHeader>

        <MissionStatement
          topImages={[photo1, photo2, photo3, photo4, photo5, photo6, photo7]}
          bottomImages={[
            photo8,
            photo9,
            photo10,
            photo11,
            photo12,
            photo13,
            photo14,
          ]}
          statement={
            mission?.statementText ||
            "Our mission is to empower youth through music, art and mentorship. Guitars Over Guns offers students from our most vulnerable communities a combination of arts education and mentorship with paid, professional musician mentors to help them overcome hardship, find their voice and reach their potential as tomorrow's leaders. Since 2008, we have served nearly 12,000 students."
          }
          statementTitle={mission?.statementTitle ?? null}
          statementTitleColor={mission?.statementTitleColor ?? null}
          statementTextColor={mission?.statementTextColor ?? null}
          statementMeta={mission?.statementMeta ?? null}
          statementMetaColor={mission?.statementMetaColor ?? null}
          serial={mission?.serial ?? null}
          serialColor={mission?.serialColor ?? null}
          ticketStripeGradient={mission?.ticketStripeGradient ?? null}
          ticketBorderColor={mission?.ticketBorderColor ?? null}
          ticketBackdropColor={mission?.ticketBackdropColor ?? null}
          ticketShowBarcode={
            // Default to showing the barcode unless explicitly disabled
            mission?.ticketShowBarcode === false ? false : true
          }
        />

        <AtGlanceLabel $color={mission?.statsTitleColor}>
          {statsTitleText}
        </AtGlanceLabel>

        <StatsContainer>
          {computedStats.map((stat: any, idx) => {
            const action: string =
              stat?.action ||
              (stat?.id === 'disciplines' ? 'openDisciplinesModal' : 'none');

            const isClickable =
              action === 'openModal' ||
              action === 'openDisciplinesModal' ||
              action === 'openStudentMusicModal' ||
              action === 'openMentorMusicModal' ||
              action === 'scrollToMap';

            const handleClick = () => {
              if (!isClickable) return;
              if (action === 'openModal' || action === 'openDisciplinesModal') {
                setShowDisciplines(true);
                return;
              }
              if (action === 'openStudentMusicModal') {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('openStudentMusicModal'));
                }
                return;
              }
              if (action === 'openMentorMusicModal') {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('openMentorMusicModal'));
                }
                return;
              }
              if (action === 'scrollToMap') {
                if (typeof document !== 'undefined') {
                  const el = document.getElementById('locations');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }
            };

            return (
              <StatItem
                key={`${stat.id}-${idx}`}
                className={
                  animationsEnabled && inView ? 'slide-up' : undefined
                }
                style={{
                  animationDelay: animationsEnabled ? `${stat.delay}s` : undefined,
                  transitionDelay: animationsEnabled
                    ? `${stat.delay}s`
                    : undefined,
                  cursor: isClickable ? 'pointer' : undefined,
                }}
                onClick={isClickable ? handleClick : undefined}
              >
              <StatContent>
                <StatIcon style={{ color: stat.color }}>
                  {renderStatIcon(stat)}
                </StatIcon>
                <StatNumber color={stat.color}>
                  {stat.displayNumber ?? stat.number ?? ''}
                </StatNumber>
                <StatLabel>{stat.label}</StatLabel>
              </StatContent>
              {showEqualizer && (
                <EqualizerBars>
                  {Array.from({ length: equalizerBarCount }).map((_, barIdx) => (
                    <EqualizerBar
                      key={`${stat.id}-bar-${barIdx}`}
                      $color={stat.color}
                      $animate={animationsEnabled}
                      style={{
                        animationDuration: animationsEnabled
                          ? `${0.8 + (barIdx % 4) * 0.2}s`
                          : undefined,
                        height: animationsEnabled
                          ? undefined
                          : `${getStaticEqualizerHeight(idx, barIdx)}%`,
                      }}
                    />
                  ))}
                </EqualizerBars>
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
        PaperProps={{
          style: {
            background:
              'linear-gradient(180deg, rgba(22,22,22,0.96), rgba(10,10,10,0.96))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            boxShadow:
              '0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(123,127,209,0.06)',
            width: 'min(1200px, 92vw)',
            position: 'relative',
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {disciplinesModal?.title ||
            mission?.modalTitle ||
            'Artistic Disciplines'}
          <IconButton
            aria-label="close"
            onClick={() => setShowDisciplines(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 16,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowDisciplines(false);
                navigate('/impact-report');
              }}
            >
              Return to Impact Report
            </Button>
          </div>
          <ModalHeader>
            <ModalSubtitle>
              Guitars Over Guns mentors teach a diverse range of disciplines.
              Explore the areas students engage with:
            </ModalSubtitle>
          </ModalHeader>
          <ModalGrid ref={modalGridRef}>
            {(disciplinesModal?.items?.length
              ? disciplinesModal.items
              : fallbackDisciplinesData
            ).map((d: any) => {
              const modalIcon =
                getIconByKey(d?.iconKey) ||
                disciplineNameIcons[d.name] ||
                <MusicNoteIcon />;
              return (
                <ModalCard
                  key={`discipline-card-${d.name.replace(/\s+/g, '-')}`}
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

      {/* <ListenNow>
        <div className="listen-icon">▶</div>
        <span>Listen to our students&apos; music</span>
      </ListenNow> */}
    </SectionContainer>
  );
}

export default MissionSection;
