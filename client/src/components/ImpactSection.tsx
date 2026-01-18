import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  FC,
  memo,
} from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import COLORS from '../../assets/colors';
import {
  fetchImpactSectionContent,
  ImpactSectionContent,
  ImpactTurntableStat,
  ImpactHighlightChip,
  ImpactHighlightCard,
} from '../services/impact.api';
import { getImpactIconByKey } from './IconSelector';
import { getOptimalColumns } from '../util/gridColumns';

// Ambient gradient animation
const ambientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const blobAnimation = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
`;

const blobAnimation2 = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-30px, 50px) scale(0.9);
  }
  66% {
    transform: translate(20px, -20px) scale(1.1);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
`;

const audioWave = keyframes`
  0% { height: 5px; }
  20% { height: 20px; }
  40% { height: 10px; }
  60% { height: 25px; }
  80% { height: 15px; }
  100% { height: 5px; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const beltScroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

interface SectionProps {
  $bgGradient?: string;
  $topBorderGradient?: string;
  $underlineGradient?: string;
}

const ImpactContainer = styled.section<SectionProps>`
  padding: 3rem 0;
  background: ${(p) => p.$bgGradient || 'linear-gradient(180deg, #171717 0%, #121212 100%)'};
  position: relative;
  overflow: hidden;
  --section-underline: ${(p) => p.$underlineGradient || p.$topBorderGradient || 'var(--spotify-green)'};

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${(p) => p.$topBorderGradient || `linear-gradient(90deg, ${COLORS.gogo_blue}88, ${COLORS.gogo_pink}88, ${COLORS.gogo_purple}88, ${COLORS.gogo_green}88)`};
    z-index: 1;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at center,
      ${COLORS.gogo_purple}10,
      transparent 70%
    );
    z-index: 0;
  }
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
`;

const BeltContainer = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const BeltTrack = styled.div<{ $direction: 'left' | 'right' }>`
  display: flex;
  gap: 1rem;
  width: max-content;
  animation: ${beltScroll} 30s linear infinite;
  animation-direction: ${(p) => (p.$direction === 'right' ? 'reverse' : 'normal')};
`;

const BeltCard = styled.div`
  flex-shrink: 0;
  width: 200px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  padding: 1.2rem 1.2rem 1.6rem;
  border-radius: 16px;
  background: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.03) 0 2px,
      rgba(0, 0, 0, 0) 2px 6px
    ),
    linear-gradient(180deg, rgba(18, 18, 18, 0.9), rgba(12, 12, 12, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  text-align: center;
`;

interface StatsTitleProps {
  $color?: string;
}

const StatsTitle = styled.h3<StatsTitleProps>`
  font-size: 2.2rem;
  font-weight: 900;
  color: ${(p) => p.$color || 'white'};
  margin-bottom: 2.5rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

interface TurntableGridProps {
  $columns?: number;
}

const TurntableGrid = styled.div<TurntableGridProps>`
  display: grid;
  grid-template-columns: ${(p) => p.$columns 
    ? `repeat(${p.$columns}, minmax(260px, 300px))` 
    : 'repeat(auto-fit, minmax(260px, 300px))'};
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

interface TurntableCardProps {
  $bgGradient?: string;
  $borderColor?: string;
}

const TurntableCard = styled.div<TurntableCardProps>`
  position: relative;
  border-radius: 16px;
  padding: 1.25rem 1.25rem 1.5rem;
  background: ${(p) =>
    p.$bgGradient ||
    "linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))"};
  border: 1px solid ${(p) => p.$borderColor || "rgba(255, 255, 255, 0.08)"};
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
  user-select: none;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem 1rem;
    border-radius: 12px;
  }
`;

const Deck = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0f0f0f 100%);
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.5),
    0 0 0 4px #2a2a2a,
    0 0 0 5px #111;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    box-shadow:
      inset 0 0 10px rgba(0, 0, 0, 0.5),
      0 0 0 2px #2a2a2a,
      0 0 0 3px #111;
  }
`;

const Record = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at 50% 50%,
    #111 0px,
    #111 2px,
    #1a1a1a 2px,
    #1a1a1a 4px
  );
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.6),
    0 0 5px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  animation: ${spin} var(--spin-speed) linear infinite;
  animation-play-state: paused;
  will-change: transform;

  &.playing {
    animation-play-state: running;
  }
`;

const RecordLabel = styled.div<{ $colorA: string; $colorB: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    ${(p) => p.$colorA || COLORS.gogo_yellow},
    ${(p) => p.$colorB || COLORS.gogo_pink}
  );
  color: white;
  font-weight: 1100;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.35);

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
`;

const Spindle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 3px;
  transform: translate(-50%, -50%);
  background: #d9d9d9;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #111, 0 0 0 3px rgba(255, 255, 255, 0.08);
`;

const Tonearm = styled.div<{ $engaged: boolean }>`
  position: absolute;
  right: 10px;
  top: 10px;
  width: 160px;
  height: 160px;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    right: 8px;
    top: 8px;
    width: 96px;
    height: 6px;
    background: linear-gradient(90deg, #bfbfbf, #6f6f6f);
    border-radius: 6px;
    transform-origin: calc(100% - 8px) 50%;
    transform: rotate(${(p) => (p.$engaged ? "-28deg" : "0deg")});
    transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  }

  &::after {
    content: "";
    position: absolute;
    right: 94px;
    top: 4px;
    width: 14px;
    height: 14px;
    background: #eee;
    border-radius: 50%;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    right: 5px;
    top: 5px;
    width: 90px;
    height: 90px;

    &::before {
      right: 4px;
      top: 4px;
      width: 54px;
      height: 4px;
      border-radius: 4px;
      transform-origin: calc(100% - 4px) 50%;
    }

    &::after {
      right: 52px;
      top: 2px;
      width: 8px;
      height: 8px;
    }
  }
`;

interface StatCaptionProps {
  $color?: string;
}

const StatCaption = styled.div<StatCaptionProps>`
  margin-top: 0.9rem;
  color: ${(p) => p.$color || "rgba(255, 255, 255, 0.85)"};
  text-align: center;
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.4;

  @media (max-width: 768px) {
    margin-top: 0.5rem;
    font-size: 0.7rem;
    line-height: 1.3;
  }
`;

// Highlights section
interface HighlightsContainerProps {
  $bgColor?: string;
}

const HighlightsContainer = styled.div<HighlightsContainerProps>`
  margin: 2rem 0;
  padding: 2rem;
  background: ${(p) => p.$bgColor || 'rgba(255, 255, 255, 0.02)'};
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

interface HighlightsTitleProps {
  $color?: string;
}

const HighlightsTitle = styled.h3<HighlightsTitleProps>`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${(p) => p.$color || 'white'};
  margin-bottom: 0.5rem;
  text-align: center;
`;

interface HighlightsSubtitleProps {
  $color?: string;
}

const HighlightsSubtitle = styled.p<HighlightsSubtitleProps>`
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.7)'};
  text-align: center;
  margin-bottom: 1.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const HighlightsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

interface HighlightChipProps {
  $bgColor?: string;
  $borderColor?: string;
  $textColor?: string;
}

const HighlightChip = styled.div<HighlightChipProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(p) => p.$bgColor || 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${(p) => p.$borderColor || 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  color: ${(p) => p.$textColor || 'rgba(255, 255, 255, 0.9)'};
  font-size: 0.9rem;
  font-weight: 600;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const HighlightCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

interface HighlightCardStyleProps {
  $bgColor?: string;
  $borderColor?: string;
}

const HighlightCardStyled = styled.div<HighlightCardStyleProps>`
  background: ${(p) => p.$bgColor || "rgba(255, 255, 255, 0.03)"};
  border: 1px solid ${(p) => p.$borderColor || "rgba(255, 255, 255, 0.08)"};
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 600px) {
    padding: 0.75rem;
    border-radius: 8px;
  }
`;

interface HighlightCardTitleProps {
  $color?: string;
}

const HighlightCardTitle = styled.h4<HighlightCardTitleProps>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(p) => p.$color || "white"};
  margin-bottom: 0.5rem;

  @media (max-width: 600px) {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
`;

interface HighlightCardTextProps {
  $color?: string;
}

const HighlightCardText = styled.p<HighlightCardTextProps>`
  color: ${(p) => p.$color || "rgba(255, 255, 255, 0.7)"};
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 0.65rem;
    line-height: 1.3;
  }
`;

// Measurement section
interface MeasurementContainerProps {
  $bgGradient?: string;
  $underlineColor?: string;
}

const MeasurementContainer = styled.section<MeasurementContainerProps>`
  padding: 6rem 0;
  background: ${(p) => p.$bgGradient || 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)'};
  position: relative;
  overflow: hidden;
  --section-underline: ${(p) => p.$underlineColor || COLORS.gogo_teal};
`;

const MeasurementWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const MeasurementHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

interface MeasureTitleProps {
  $color?: string;
  $highlightColor?: string;
}

const MeasureTitle = styled.h2<MeasureTitleProps>`
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;

  .regular {
    color: ${(p) => p.$color || 'white'};
  }

  .highlight {
    color: ${(p) => p.$highlightColor || COLORS.gogo_teal};
  }
`;

interface SpotifySubtitleProps {
  $color?: string;
}

const SpotifySubtitle = styled.p<SpotifySubtitleProps>`
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.7)'};
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
`;

const AudioWaveContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 3px;
  height: 30px;
  margin-top: 1.5rem;
`;

interface AudioBarProps {
  $index: number;
  $color?: string;
}

const AudioBar = styled.div<AudioBarProps>`
  width: 4px;
  height: 5px;
  background: ${(p) => p.$color || COLORS.gogo_teal};
  border-radius: 2px;
  animation: ${audioWave} 1.2s ease-in-out infinite;
  animation-delay: ${(p) => p.$index * 0.1}s;
`;

const SpotifyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 340px));
  justify-content: center;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SpotifyCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
  }
`;

interface MethodTitleProps {
  $color?: string;
}

const MethodTitle = styled.div<MethodTitleProps>`
  font-size: 1rem;
  font-weight: 700;
  color: ${(p) => p.$color || COLORS.gogo_teal};
  margin-bottom: 0.3rem;
`;

interface MethodTextProps {
  $color?: string;
}

const MethodText = styled.div<MethodTextProps>`
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.7)'};
  font-size: 0.95rem;
  line-height: 1.5;
`;

// Spotify-style methods list
const SpotifyMethodsList = styled.div`
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

interface SpotifyMethodProps {
  $bgColor?: string;
  $borderColor?: string;
}

const SpotifyMethod = styled.div<SpotifyMethodProps>`
  background: ${(p) => p.$bgColor || "rgba(30, 30, 30, 0.5)"};
  border-radius: 8px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border-left: 3px solid ${(p) => p.$borderColor || "rgba(30, 215, 96, 0.5)"};

  &:hover {
    background: rgba(40, 40, 40, 0.6);
    transform: translateX(5px);
    border-left-color: #1ed760;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 0.75rem;
    margin-bottom: 0;
    border-radius: 6px;
    border-left-width: 2px;
  }
`;

interface MethodNameProps {
  $color?: string;
}

const MethodName = styled.h4<MethodNameProps>`
  color: ${(p) => p.$color || "white"};
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: "Century Gothic", "CenturyGothic", sans-serif;
  display: flex;
  align-items: center;
  letter-spacing: 0.02em;

  svg {
    margin-right: 0.5rem;
    color: #1ed760;
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin-bottom: 0.25rem;

    svg {
      width: 12px;
      height: 12px;
      margin-right: 0.25rem;
    }
  }
`;

interface MethodDescriptionProps {
  $color?: string;
}

const MethodDescription = styled.p<MethodDescriptionProps>`
  color: ${(p) => p.$color || "rgba(255, 255, 255, 0.7)"};
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  font-family: "Century Gothic", "CenturyGothic", sans-serif;

  @media (max-width: 768px) {
    font-size: 0.55rem;
    line-height: 1.3;
  }
`;

interface ToolsSectionProps {
  $bgColor?: string;
  $borderColor?: string;
  $titleColor?: string;
}

const ToolsSection = styled.div<ToolsSectionProps>`
  background: ${(p) => p.$bgColor || "rgba(30, 30, 30, 0.5)"};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${(p) => p.$borderColor || "transparent"};

  h3 {
    color: ${(p) => p.$titleColor || "white"};
    font-size: 1.3rem;
    margin-top: 0;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.8rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    border-radius: 10px;

    h3 {
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
    }
  }
`;

const ToolItemsGrid = styled.div`
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const ToolItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    .tool-name {
      color: #1ed760;
    }
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    border-bottom: none;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

interface ToolIconProps {
  $bgGradient?: string;
}

const ToolIcon = styled.div<ToolIconProps>`
  width: 32px;
  height: 32px;
  background: ${(p) =>
    p.$bgGradient || "linear-gradient(135deg, #1ed760, #169c46)"};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;

  svg {
    color: white;
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-right: 0;
    margin-bottom: 0.25rem;

    svg {
      width: 10px;
      height: 10px;
    }
  }
`;

const ToolInfo = styled.div`
  flex: 1;
`;

interface ToolNameStyledProps {
  $color?: string;
}

const ToolNameStyled = styled.div<ToolNameStyledProps>`
  color: ${(p) => p.$color || "white"};
  font-weight: 600;
  font-size: 1rem;
  transition: color 0.2s ease;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

interface ToolDescriptionStyledProps {
  $color?: string;
}

const ToolDescriptionStyled = styled.div<ToolDescriptionStyledProps>`
  color: ${(p) => p.$color || "rgba(255, 255, 255, 0.6)"};
  font-size: 0.85rem;
  margin-top: 0.2rem;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    margin-top: 0.1rem;
  }
`;

interface MethodCardProps {
  $bgColor?: string;
  $borderColor?: string;
}

const MethodCard = styled.div<MethodCardProps>`
  background: ${(p) => p.$bgColor || "rgba(255, 255, 255, 0.05)"};
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid ${(p) => p.$borderColor || "rgba(255, 255, 255, 0.08)"};

  @media (max-width: 768px) {
    padding: 0.75rem;
    border-radius: 12px;

    h4 {
      font-size: 0.9rem !important;
      margin-bottom: 0.25rem !important;
    }
  }
`;

// TurntableStat component
interface TurntableStatProps {
  stat: ImpactTurntableStat;
  index: number;
  cardBgGradient?: string;
  cardBorderColor?: string;
  captionColor?: string;
}

const TurntableStatComponent: FC<TurntableStatProps> = function TurntableStatComponent({
  stat,
  index,
  cardBgGradient,
  cardBorderColor,
  captionColor,
}) {
  const storageKey = `turntable:${stat.label}`;
  const [playing, setPlaying] = useState(false);
  const recordRef = useRef<HTMLDivElement | null>(null);
  const [speedMs, setSpeedMs] = useState(4500);
  const [hovered, setHovered] = useState(false);

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const onHover = useCallback(() => {
    setHovered(true);
    setPlaying(true);
  }, []);
  const onLeave = useCallback(() => {
    setHovered(false);
    setPlaying(false);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    setSpeedMs((prev) => {
      const next = Math.min(
        7000,
        Math.max(1200, prev + (e.deltaY > 0 ? 350 : -350)),
      );
      return next;
    });
  }, []);

  useEffect(() => {
    if (recordRef.current) {
      recordRef.current.style.setProperty('--spin-speed', `${speedMs}ms`);
    }
  }, [speedMs]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { speedMs?: number };
        if (typeof parsed.speedMs === 'number') setSpeedMs(parsed.speedMs);
      }
    } catch {
      /* no-op */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ speedMs }));
    } catch {
      /* no-op */
    }
  }, [speedMs, storageKey]);

  return (
    <TurntableCard
      $bgGradient={cardBgGradient}
      $borderColor={cardBorderColor}
      role="group"
      aria-label={`${stat.number}% ${stat.label}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Deck onWheel={onWheel}>
        <Record
          ref={recordRef}
          className={playing ? 'playing' : ''}
          onClick={toggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggle();
          }}
          aria-pressed={playing}
        >
          <RecordLabel
            $colorA={stat.colorA || COLORS.gogo_yellow}
            $colorB={stat.colorB || COLORS.gogo_pink}
          >
            {stat.number}
            <span style={{ fontSize: '0.7rem', marginLeft: 2 }}>%</span>
          </RecordLabel>
          <Spindle />
        </Record>
        <Tonearm $engaged={hovered || playing} />
      </Deck>
      <StatCaption $color={captionColor}>{stat.label}</StatCaption>
    </TurntableCard>
  );
};

interface ImpactSectionProps {
  /** Data passed directly from parent - used for production */
  impactSectionData?: ImpactSectionContent;
  /** Preview mode for admin editor */
  previewMode?: boolean;
  /** Override data for admin preview */
  impactSectionOverride?: Partial<ImpactSectionContent>;
}

function ImpactSection({
  impactSectionData: externalData,
  previewMode = false,
  impactSectionOverride,
}: ImpactSectionProps): JSX.Element {
  const [internalData, setInternalData] = useState<ImpactSectionContent | null>(externalData || null);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef(null);

  useEffect(() => {
    if (externalData) {
      setInternalData(externalData);
    } else if (!previewMode) {
      fetchImpactSectionContent().then((data) => {
        if (data) setInternalData(data);
      });
    }
  }, [externalData, previewMode]);

  // Merge data
  const effectiveData: ImpactSectionContent = externalData
    ? { ...externalData, ...(impactSectionOverride || {}) }
    : { ...(internalData || {}), ...(impactSectionOverride || {}) };

  // Extract values (no defaults - data should come from DB)
  const sectionBgGradient = effectiveData.sectionBgGradient || '';
  const topBorderGradient = effectiveData.topBorderGradient || '';
  const topCarouselImages = effectiveData.topCarouselImages || [];
  const statsTitle = effectiveData.statsTitle || '';
  const statsTitleColor = effectiveData.statsTitleColor || '';
  const turntableStats = effectiveData.turntableStats || [];
  const turntableCardBgGradient = effectiveData.turntableCardBgGradient || '';
  const turntableCardBorderColor = effectiveData.turntableCardBorderColor || '';
  const statCaptionColor = effectiveData.statCaptionColor || '';
  const highlightsTitle = effectiveData.highlightsTitle || '';
  const highlightsTitleColor = effectiveData.highlightsTitleColor || '';
  const highlightsSubtitle = effectiveData.highlightsSubtitle || '';
  const highlightsSubtitleColor = effectiveData.highlightsSubtitleColor || '';
  const highlightChips = effectiveData.highlightChips || [];
  const highlightChipBgColor = effectiveData.highlightChipBgColor || '';
  const highlightChipBorderColor = effectiveData.highlightChipBorderColor || '';
  const highlightChipTextColor = effectiveData.highlightChipTextColor || '';
  const highlightCards = effectiveData.highlightCards || [];
  const highlightCardBgColor = effectiveData.highlightCardBgColor || '';
  const highlightCardBorderColor = effectiveData.highlightCardBorderColor || '';
  const highlightCardTitleColor = effectiveData.highlightCardTitleColor || '';
  const highlightCardTextColor = effectiveData.highlightCardTextColor || '';
  const bottomCarouselImages = effectiveData.bottomCarouselImages || [];

  // Measurement section header
  const measureSectionBgGradient = effectiveData.measureSectionBgGradient || '';
  const measureTitle = effectiveData.measureTitle || '';
  const measureTitleHighlight = effectiveData.measureTitleHighlight || '';
  const measureTitleColor = effectiveData.measureTitleColor || '';
  const measureTitleHighlightColor = effectiveData.measureTitleHighlightColor || '';
  const measureSubtitle = effectiveData.measureSubtitle || '';
  const measureSubtitleColor = effectiveData.measureSubtitleColor || '';
  const measureAudioBarColor = effectiveData.measureAudioBarColor || '';

  // "Our Method Provides" card (left column)
  const methodCardTitle = effectiveData.methodCardTitle || '';
  const methodCardTitleColor = effectiveData.methodCardTitleColor || '';
  const methodCardAccentGradient = effectiveData.methodCardAccentGradient || '';
  const methodCardBgColor = effectiveData.methodCardBgColor || '';
  const methodCardBorderColor = effectiveData.methodCardBorderColor || '';
  const methodItems = effectiveData.methodItems || [];
  const methodItemBgColor = effectiveData.methodItemBgColor || '';
  const methodItemBorderColor = effectiveData.methodItemBorderColor || '';
  const methodItemTitleColor = effectiveData.methodItemTitleColor || '';
  const methodItemTextColor = effectiveData.methodItemTextColor || '';
  const methodCardFooterText = effectiveData.methodCardFooterText || '';
  const methodCardFooterTextColor = effectiveData.methodCardFooterTextColor || '';

  // "Measurement & Evaluation Tools" card (right column)
  const toolsCardTitle = effectiveData.toolsCardTitle || '';
  const toolsCardTitleColor = effectiveData.toolsCardTitleColor || '';
  const toolsCardBgColor = effectiveData.toolsCardBgColor || '';
  const toolsCardBorderColor = effectiveData.toolsCardBorderColor || '';
  const toolItems = effectiveData.toolItems || [];
  const toolIconBgGradient = effectiveData.toolIconBgGradient || '';
  const toolNameColor = effectiveData.toolNameColor || '';
  const toolDescriptionColor = effectiveData.toolDescriptionColor || '';
  const toolsFooterText = effectiveData.toolsFooterText || '';
  const toolsFooterTextColor = effectiveData.toolsFooterTextColor || '';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.unobserve(entries[0].target);

          if (headerRef.current) {
            const items = headerRef.current.querySelectorAll('.animate-item');
            if (items && items.length > 0) {
              animate(items, {
                opacity: [0, 1],
                translateY: [30, 0],
                delay: stagger(150),
                duration: 800,
                easing: 'easeOutCubic',
              });
            }
          }
        }
      },
      { threshold: 0.2 },
    );

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setExpanded(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );
    if (measureRef.current) observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, []);

  // If no data at all, don't render
  const hasContent = statsTitle || turntableStats.length > 0 || highlightsTitle || measureTitle;
  if (!hasContent) {
    return <></>;
  }

  // Duplicate carousel images for seamless loop
  const topImagesForBelt = topCarouselImages.length > 0 ? [...topCarouselImages, ...topCarouselImages] : [];
  const bottomImagesForBelt = bottomCarouselImages.length > 0 ? [...bottomCarouselImages, ...bottomCarouselImages] : [];

  return (
    <>
      <ImpactContainer
        ref={sectionRef}
        $bgGradient={sectionBgGradient}
        $topBorderGradient={topBorderGradient}
        $underlineGradient={topBorderGradient}
      >
        <SectionContainer>
          {topImagesForBelt.length > 0 && (
            <BeltContainer style={{ marginBottom: "1.5rem" }}>
              <BeltTrack $direction="left">
                {topImagesForBelt.map((src, i) => (
                  <BeltCard key={`top-belt-${i}`}>
                    <img
                      src={src}
                      alt="Program"
                      loading="lazy"
                      decoding="async"
                    />
                  </BeltCard>
                ))}
              </BeltTrack>
            </BeltContainer>
          )}

          {statsTitle && (
            <StatsGrid
              style={{
                background: "transparent",
                border: "none",
                boxShadow: "none",
                padding: 0,
                margin: "0.5rem 0 1rem",
              }}
            >
              <StatsTitle
                $color={statsTitleColor}
                style={{ margin: "0.25rem 0 0.75rem" }}
              >
                {statsTitle}
              </StatsTitle>
            </StatsGrid>
          )}

          {turntableStats.length > 0 && (
            <TurntableGrid $columns={getOptimalColumns(turntableStats.length, 4)}>
              {turntableStats.map((stat, idx) => (
                <TurntableStatComponent
                  key={stat.id}
                  stat={stat}
                  index={idx}
                  cardBgGradient={turntableCardBgGradient}
                  cardBorderColor={turntableCardBorderColor}
                  captionColor={statCaptionColor}
                />
              ))}
            </TurntableGrid>
          )}

          {(highlightsTitle ||
            highlightChips.length > 0 ||
            highlightCards.length > 0) && (
            <HighlightsContainer aria-label="Program capacities">
              {highlightsTitle && (
                <HighlightsTitle $color={highlightsTitleColor}>
                  {highlightsTitle}
                </HighlightsTitle>
              )}
              {highlightsSubtitle && (
                <HighlightsSubtitle $color={highlightsSubtitleColor}>
                  {highlightsSubtitle}
                </HighlightsSubtitle>
              )}
              {highlightChips.length > 0 && (
                <HighlightsRow>
                  {highlightChips.map((chip) => {
                    const iconEntry = chip.iconKey
                      ? getImpactIconByKey(chip.iconKey)
                      : null;
                    const IconComponent = iconEntry?.Icon;
                    return (
                      <HighlightChip
                        key={chip.id}
                        $bgColor={highlightChipBgColor}
                        $borderColor={highlightChipBorderColor}
                        $textColor={highlightChipTextColor}
                      >
                        {IconComponent && <IconComponent />}
                        <span>{chip.text}</span>
                      </HighlightChip>
                    );
                  })}
                </HighlightsRow>
              )}
              {highlightCards.length > 0 && (
                <HighlightCardsGrid>
                  {highlightCards.map((card) => (
                    <HighlightCardStyled
                      key={card.id}
                      $bgColor={highlightCardBgColor}
                      $borderColor={highlightCardBorderColor}
                    >
                      <HighlightCardTitle $color={highlightCardTitleColor}>
                        {card.title}
                      </HighlightCardTitle>
                      <HighlightCardText $color={highlightCardTextColor}>
                        {card.text}
                      </HighlightCardText>
                    </HighlightCardStyled>
                  ))}
                </HighlightCardsGrid>
              )}
            </HighlightsContainer>
          )}

          {bottomImagesForBelt.length > 0 && (
            <BeltContainer style={{ marginTop: "1.5rem" }}>
              <BeltTrack $direction="right">
                {bottomImagesForBelt.map((src, i) => (
                  <BeltCard key={`bottom-belt-${i}`}>
                    <img
                      src={src}
                      alt="Program"
                      loading="lazy"
                      decoding="async"
                    />
                  </BeltCard>
                ))}
              </BeltTrack>
            </BeltContainer>
          )}
        </SectionContainer>
      </ImpactContainer>

      {/* Measurement Section - fully data-driven from MongoDB */}
      <MeasurementContainer
        ref={measureRef}
        $bgGradient={measureSectionBgGradient}
        $underlineColor={measureTitleHighlightColor}
      >
        <MeasurementWrapper>
          <MeasurementHeader>
            <MeasureTitle
              $color={measureTitleColor}
              $highlightColor={measureTitleHighlightColor}
            >
              {measureTitle && <span className="regular">{measureTitle} </span>}
              {measureTitleHighlight && (
                <span className="highlight">{measureTitleHighlight}</span>
              )}
            </MeasureTitle>
            {measureSubtitle && (
              <SpotifySubtitle
                $color={measureSubtitleColor}
                style={{ marginTop: "0.1rem" }}
              >
                {measureSubtitle}
              </SpotifySubtitle>
            )}

            <AudioWaveContainer>
              {[...Array(18)].map((_, i) => (
                <AudioBar
                  key={`audio-bar-${i}`}
                  $index={i}
                  $color={measureAudioBarColor}
                />
              ))}
            </AudioWaveContainer>
          </MeasurementHeader>

          <SpotifyGrid>
            <div>
              <MethodCard
                $bgColor={methodCardBgColor}
                $borderColor={methodCardBorderColor}
              >
                {methodCardTitle && (
                  <h4
                    style={{
                      color: methodCardTitleColor || "white",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      margin: "0 0 0.4rem 0",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {methodCardTitle}
                  </h4>
                )}
                {methodCardAccentGradient && (
                  <div
                    style={{
                      width: "80px",
                      height: "2.5px",
                      background: methodCardAccentGradient,
                      borderRadius: "2px",
                      marginBottom: "1.3rem",
                    }}
                  />
                )}
                {methodItems.length > 0 && (
                  <SpotifyMethodsList>
                    {methodItems.map((item) => {
                      const iconEntry = item.iconKey
                        ? getImpactIconByKey(item.iconKey)
                        : null;
                      const IconComponent = iconEntry?.Icon;
                      return (
                        <SpotifyMethod
                          key={item.id}
                          $bgColor={methodItemBgColor}
                          $borderColor={methodItemBorderColor}
                        >
                          <MethodName $color={methodItemTitleColor}>
                            {IconComponent && <IconComponent />}
                            {item.title}
                          </MethodName>
                          <MethodDescription $color={methodItemTextColor}>
                            {item.text}
                          </MethodDescription>
                        </SpotifyMethod>
                      );
                    })}
                  </SpotifyMethodsList>
                )}

                {methodCardFooterText && (
                  <SpotifySubtitle
                    $color={methodCardFooterTextColor}
                    style={{
                      fontSize: "1rem",
                      marginTop: "2rem",
                      maxWidth: "100%",
                    }}
                  >
                    {methodCardFooterText}
                  </SpotifySubtitle>
                )}
              </MethodCard>
            </div>

            <div>
              <ToolsSection
                $bgColor={toolsCardBgColor}
                $borderColor={toolsCardBorderColor}
                $titleColor={toolsCardTitleColor}
              >
                {toolsCardTitle && <h3>{toolsCardTitle}</h3>}

                {toolItems.length > 0 && (
                  <ToolItemsGrid>
                    {toolItems.map((tool) => (
                      <ToolItem key={tool.id}>
                        <ToolIcon $bgGradient={toolIconBgGradient}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8Z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8.5 11L11.5 14L16 9"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </ToolIcon>
                        <ToolInfo>
                          <ToolNameStyled
                            className="tool-name"
                            $color={toolNameColor}
                          >
                            {tool.title}
                          </ToolNameStyled>
                          <ToolDescriptionStyled $color={toolDescriptionColor}>
                            {tool.description}
                          </ToolDescriptionStyled>
                        </ToolInfo>
                      </ToolItem>
                    ))}
                  </ToolItemsGrid>
                )}
              </ToolsSection>

              {toolsFooterText && (
                <SpotifySubtitle
                  $color={toolsFooterTextColor}
                  style={{
                    fontSize: "0.95rem",
                    margin: "1.5rem 0",
                    textAlign: "center",
                  }}
                >
                  {toolsFooterText}
                </SpotifySubtitle>
              )}
            </div>
          </SpotifyGrid>
        </MeasurementWrapper>
      </MeasurementContainer>
    </>
  );
}

export default memo(ImpactSection);
