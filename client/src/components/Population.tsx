import React, { useEffect, useState, memo } from 'react';
import { ResponsivePie } from "@nivo/pie";
import styled from "styled-components";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";
import COLORS from "../../assets/colors";
import Photo1 from "../../assets/populationPhotos/Photo1.jpg";
import Photo2 from "../../assets/populationPhotos/Photo2.jpg";
import Photo3 from "../../assets/populationPhotos/Photo3.jpg";
import Photo4 from "../../assets/populationPhotos/Photo4.jpg";
import Photo5 from "../../assets/populationPhotos/Photo5.jpg";
import Photo6 from "../../assets/populationPhotos/Photo6.jpg";
import {
  PopulationContent,
  fetchPopulationContent,
} from "../services/impact.api";

// --- Styled Components ---

const Container = styled.section<{
  $bgGradient?: string;
  $overlayColor1?: string;
  $overlayColor2?: string;
  $underlineGradient?: string;
}>`
  width: min(1200px, 92vw);
  margin: 4rem auto;
  padding: 3rem 2rem;
  background: ${(p) =>
    p.$bgGradient || "linear-gradient(180deg, #171717 0%, #0f0f0f 100%)"};
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  --section-underline: ${(p) => p.$underlineGradient || 'var(--spotify-green)'};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 10% 15%,
        ${(p) => p.$overlayColor1 || `${COLORS.gogo_blue}12`},
        transparent 38%
      ),
      radial-gradient(
        circle at 90% 85%,
        ${(p) => p.$overlayColor2 || `${COLORS.gogo_purple}12`},
        transparent 38%
      );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: calc(100vw - 16px);
    margin: 1rem auto;
    padding: 1rem 0.5rem;
    border-radius: 10px;
  }
`;

const Title = styled.h1<{ $gradient?: string }>`
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: "Airwaves", sans-serif;
  background: ${(p) =>
    p.$gradient || `linear-gradient(90deg, #ffffff, ${COLORS.gogo_teal} 65%)`};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    letter-spacing: 0.03em;
  }
`;

const SectionHeaderWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

const SectionBadge = styled.span<{ $gradient?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #0f0f0f;
  background: ${(p) =>
    p.$gradient ||
    `linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`};
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.06) inset;
`;

const SectionName = styled.h2`
  margin: 0 0 0.25rem 0;
  font-size: 2.1rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.02em;

  /* Override global section h2::after underline */
  &::after {
    display: none;
  }
`;

const SectionDivider = styled.div<{ $color?: string }>`
  height: 2px;
  width: 100%;
  margin: 0.5rem 0 1.25rem 0;
  background: ${(p) =>
    p.$color
      ? `linear-gradient(90deg, ${p.$color}, transparent 80%)`
      : `linear-gradient(90deg, ${COLORS.gogo_blue}66, ${COLORS.gogo_teal}66, transparent 80%)`};
`;

const TitleUnderline = styled.div<{ $color?: string }>`
  width: 120px;
  height: 4px;
  background: ${(p) => p.$color || COLORS.gogo_teal};
  margin: 1rem auto 2rem;
  border-radius: 2px;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transform: translateX(-100%);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

const GlowBlob = styled.div<{
  $size: number;
  $colorA: string;
  $colorB: string;
  $top?: string;
  $bottom?: string;
  $left?: string;
  $right?: string;
}>`
  position: absolute;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    ${(p) => p.$colorA},
    ${(p) => p.$colorB}
  );
  filter: blur(40px);
  opacity: 0.18;
  pointer-events: none;
  top: ${(p) => p.$top ?? "auto"};
  bottom: ${(p) => p.$bottom ?? "auto"};
  left: ${(p) => p.$left ?? "auto"};
  right: ${(p) => p.$right ?? "auto"};

  @keyframes slowDrift {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(10px, -6px, 0);
    }
  }

  animation: slowDrift 26s ease-in-out infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div<{ $bgColor?: string }>`
  background: ${(p) => p.$bgColor || "rgba(255, 255, 255, 0.04)"};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1.1rem;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
`;

const Text = styled.p<{ $white?: boolean }>`
  font-size: 1.08rem;
  color: ${(p) => (p.$white ? "white" : "rgba(255,255,255,0.8)")};
  line-height: 1.75;
`;

// --- Bento Components ---

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  margin: 3rem 0;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin: 1rem 0;
  }
`;

const BentoCard = styled.div<{ $colSpan?: number; $bg?: string }>`
  grid-column: span ${(p) => p.$colSpan || 4};
  background: ${(p) => p.$bg || "rgba(255, 255, 255, 0.05)"};
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  @media (max-width: 900px) {
    /* Full-width cards (6+ col) span 2, stat cards (3 col) span 1 */
    grid-column: span ${(p) => (p.$colSpan && p.$colSpan >= 6) ? 2 : 1};
    border-radius: 12px;
    padding: 0.6rem;
  }
`;

// Stat card variant for consistent sizing on mobile
const StatBentoCard = styled(BentoCard)`
  @media (max-width: 900px) {
    grid-column: span 1;
    min-height: 140px;
    justify-content: center;
    align-items: center;
  }
`;

const CardTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin-bottom: 0.4rem;
    gap: 0.25rem;
  }
`;

// --- C-GAS Components ---

const CGasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CGasItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1rem;
`;

const CGasValue = styled.div<{ $color: string }>`
  font-size: 2rem;
  font-weight: 800;
  color: ${(p) => p.$color};
  margin-bottom: 0.5rem;
`;

const CGasLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
`;

// --- Skills Components ---

const SkillsContainer = styled.div`
  margin-top: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
`;

const SkillChip = styled.div<{
  $bgColor?: string;
  $borderColor?: string;
  $textColor?: string;
}>`
  padding: 0.75rem 1.5rem;
  background: ${(p) => p.$bgColor || "rgba(255, 255, 255, 0.03)"};
  border: 1px solid ${(p) => p.$borderColor || "rgba(255, 255, 255, 0.08)"};
  border-radius: 12px;
  color: ${(p) => p.$textColor || "rgba(255, 255, 255, 0.9)"};
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    color: #fff;

    &::before {
      transform: translateX(100%);
    }
  }
`;

// --- Gallery Components ---

const ImageStrip = styled.div`
  display: flex;
  gap: 1.2rem;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 2.5rem 0 0 0;
  padding-bottom: 1rem;
  max-width: 100%;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 40px,
    black calc(100% - 40px),
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black 40px,
    black calc(100% - 40px),
    transparent 100%
  );

  /* Mobile: Hide scrollbar but allow touch scroll, prevent overflow outside container */
  @media (max-width: 768px) {
    gap: 0.8rem;
    margin: 1.5rem 0 0 0;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    max-width: calc(100vw - 32px);
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const StripImage = styled.img`
  width: 160px;
  height: 110px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  background: #222;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: rotate(-1.5deg);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
  flex-shrink: 0;

  &:nth-child(even) {
    transform: rotate(1.5deg);
  }

  &:hover {
    transform: translateY(-4px) rotate(0deg);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.22);
  }

  @media (max-width: 768px) {
    width: 120px;
    height: 85px;
    border-radius: 12px;
  }
`;

// --- Pie Chart Components ---

const PieChartWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  gap: 1.75rem;
  width: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

const PieContainer = styled.div`
  width: 100%;
  height: 320px;
  min-height: 280px;

  @media (max-width: 768px) {
    height: 140px;
    min-height: 120px;
  }
`;

const LegendRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
  align-self: center;

  @media (max-width: 900px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }
`;

const LegendChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;

  @media (max-width: 768px) {
    font-size: 0.5rem;
    padding: 0.2rem 0.4rem;
    gap: 0.2rem;
  }

  &:hover {
    transform: translateY(-1px) scale(1.02);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4);
  }
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25) inset;
`;

const PieCaption = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 0.7rem;
  text-align: center;
`;

// --- Percent Components ---

const PercentCircle = styled.div<{
  $percent: number;
  $accent: string;
  $innerBgColor?: string;
}>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.06),
    0 16px 40px rgba(0, 0, 0, 0.6);
  background: conic-gradient(
    ${(p) => p.$accent} 0deg,
    ${(p) => p.$accent} ${(p) => p.$percent * 3.6}deg,
    rgba(255, 255, 255, 0.08) ${(p) => p.$percent * 3.6}deg,
    rgba(255, 255, 255, 0.02) 360deg
  );
  transition: all 0.22s ease;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    margin-bottom: 0.5rem;
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.06),
      0 8px 20px rgba(0, 0, 0, 0.4);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 18px;
    border-radius: 50%;
    background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.12),
        transparent 60%
      ),
      ${(p) => p.$innerBgColor || "rgba(6, 6, 6, 0.96)"};
    box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.9);

    @media (max-width: 768px) {
      inset: 8px;
    }
  }
`;

const PercentText = styled.span<{ $gradient?: string }>`
  font-size: 2.8rem;
  font-weight: 800;
  background: ${(p) =>
    p.$gradient || `linear-gradient(90deg, #ffffff, ${COLORS.gogo_teal})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CardLabel = styled.div`
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.25rem;
  text-align: center;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.55rem;
    line-height: 1.3;
    margin-top: 0.15rem;
  }
`;

const pieTheme = {
  textColor: "#e0e0e0",
  fontSize: 12,
  legends: {
    text: { fill: "#e0e0e0" },
  },
  tooltip: { container: { background: "#2a2a2a", color: "#fff" } },
} as const;

// Default Data
const defaultSkills = [
  "Confidence and self-awareness",
  "Emotional intelligence and creativity",
  "Self-presentation and expression",
  "Workforce readiness and life skills",
  "Trusted mentors & positive role models",
  "Supportive community of peers",
];

const photos = [Photo1, Photo2, Photo3, Photo4, Photo5, Photo6];

interface PopulationProps {
  inline?: boolean;
  /** Data passed directly from parent - used for production */
  populationData?: PopulationContent;
  /** Preview mode for admin editor */
  previewMode?: boolean;
  /** Override data for admin preview */
  populationOverride?: PopulationContent | null;
}

function PopulationComponent({
  inline = false,
  populationData: externalData,
  previewMode = false,
  populationOverride,
}: PopulationProps) {
  const [activeSliceId, setActiveSliceId] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [internalData, setInternalData] = useState<PopulationContent | null>(externalData || null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch population content from backend when not in preview mode and no external data
  useEffect(() => {
    if (externalData) {
      // externalData was provided by parent - use it directly
      setInternalData(externalData);
    } else if (!previewMode && !populationOverride) {
      // Backward compatibility: fetch data if no externalData provided
      fetchPopulationContent().then((data) => {
        if (data) {
          setInternalData(data);
        }
      });
    }
  }, [externalData, previewMode, populationOverride]);

  // Use override data in preview mode, externalData, or fetched data
  const effectiveData = previewMode
    ? populationOverride
    : (externalData ?? populationOverride ?? internalData);

  // Helper to compose gradient from legacy fields
  const composeFromLegacy = (
    start: string | undefined,
    end: string | undefined,
    degree: number | undefined,
    suffix: string = ""
  ): string | undefined => {
    if (start && end) {
      return `linear-gradient(${degree ?? 90}deg, ${start}, ${end}${suffix})`;
    }
    return undefined;
  };

  // --- Data Mapping ---
  const sectionBadge = effectiveData?.sectionBadge ?? "Who We Serve";
  // Use full gradient string if available, otherwise compose from legacy fields
  const sectionBadgeGradient =
    effectiveData?.sectionBadgeGradient ||
    composeFromLegacy(
      effectiveData?.sectionBadgeGradientStart,
      effectiveData?.sectionBadgeGradientEnd,
      effectiveData?.sectionBadgeGradientDegree
    );

  const sectionTitle = effectiveData?.sectionTitle ?? "Our Population";
  const sectionTitleUnderlineColor = effectiveData?.sectionTitleUnderlineColor;

  const title =
    effectiveData?.title ??
    "TALENT IS UNIVERSALLY DISTRIBUTED, BUT OPPORTUNITY IS NOT.";

  // Use full gradient string if available, otherwise compose from legacy fields
  const titleGradient =
    effectiveData?.titleGradient ||
    composeFromLegacy(
      effectiveData?.titleGradientStart,
      effectiveData?.titleGradientEnd,
      effectiveData?.titleGradientDegree,
      " 65%"
    );

  const titleUnderlineColor = effectiveData?.titleUnderlineColor;

  const blob1ColorA = effectiveData?.blob1ColorA ?? `${COLORS.gogo_blue}55`;
  const blob1ColorB = effectiveData?.blob1ColorB ?? `${COLORS.gogo_purple}22`;
  const blob2ColorA = effectiveData?.blob2ColorA ?? `${COLORS.gogo_pink}55`;
  const blob2ColorB = effectiveData?.blob2ColorB ?? `${COLORS.gogo_yellow}22`;

  const infoCard1Text =
    effectiveData?.infoCard1Text ??
    "That is why, since 2008, Guitars Over Guns has used the transformative power of music, mentorship, and the arts to unlock possibilities for young people who face systemic barriers to opportunity.";

  const infoCard2Text =
    effectiveData?.infoCard2Text ??
    "The Childhood Global Assessment Scale (C-GAS) is a widely recognized tool to measure young people's psychological and social well-being.";

  const demographicsData = effectiveData?.demographicsData ?? [
    {
      id: "Hispanic/Latinx",
      label: "Hispanic/Latinx",
      value: 46,
      color: COLORS.gogo_teal,
    },
    {
      id: "Black/African American",
      label: "Black/African American",
      value: 44,
      color: COLORS.gogo_blue,
    },
    {
      id: "Other",
      label: "Other",
      value: 10,
      color: COLORS.gogo_purple,
    },
  ];

  const demographicsCaption =
    effectiveData?.demographicsCaption ??
    "Ages 8-18: 96% at or below the Federal Poverty Level";

  const stat1Percent = effectiveData?.stat1Percent ?? 94;
  const stat1Text =
    effectiveData?.stat1Text ??
    "of students made or maintained academic gains (2023-2024)";
  const stat1Color = effectiveData?.stat1Color ?? COLORS.gogo_teal;

  const stat2Percent = effectiveData?.stat2Percent ?? 95;
  const stat2Text =
    effectiveData?.stat2Text ??
    "of students improved conduct in their classes (2023-2024)";
  const stat2Color = effectiveData?.stat2Color ?? COLORS.gogo_pink;

  const cgasTitle =
    effectiveData?.cgasTitle ?? "Mental Health & Well-being (C-GAS)";
  const cgasTooltip =
    effectiveData?.cgasTooltip ??
    "The Childhood Global Assessment Scale (C-GAS) is a widely recognized tool to measure young people's psychological and social well-being.";

  const defaultCgasStats = [
    {
      value: "100%",
      label: "Improved 5+ points\n(High Risk Students)",
      color: COLORS.gogo_blue,
    },
    {
      value: "85%",
      label: "Maintained or Increased\n(Fall 2023)",
      color: COLORS.gogo_purple,
    },
    {
      value: "84%",
      label: "Maintained or Increased\n(Spring 2024)",
      color: COLORS.gogo_teal,
    },
  ];

  const cgasStats = effectiveData?.cgasStats ?? defaultCgasStats;

  const skillsTitle = effectiveData?.skillsTitle ?? "Core Skills Developed";
  const skillsList = effectiveData?.skillsList ?? defaultSkills;

  // Container and card styling - use full gradient string if available
  const containerBgGradient =
    effectiveData?.containerBgGradient ||
    composeFromLegacy(
      effectiveData?.containerBgGradientStart,
      effectiveData?.containerBgGradientEnd,
      effectiveData?.containerBgGradientDegree ?? 180
    );
  const containerOverlayColor1 = effectiveData?.containerOverlayColor1;
  const containerOverlayColor2 = effectiveData?.containerOverlayColor2;
  const infoCardBgColor = effectiveData?.infoCardBgColor;
  const bentoCardBgColor = effectiveData?.bentoCardBgColor;
  const skillChipBgColor = effectiveData?.skillChipBgColor;
  const skillChipBorderColor = effectiveData?.skillChipBorderColor;
  const skillChipTextColor = effectiveData?.skillChipTextColor;
  const percentCircleInnerBgColor = effectiveData?.percentCircleInnerBgColor;

  const content = (
    <Container
      $bgGradient={containerBgGradient}
      $overlayColor1={containerOverlayColor1}
      $overlayColor2={containerOverlayColor2}
      $underlineGradient={titleGradient || titleUnderlineColor}
    >
      <GlowBlob
        $size={240}
        $colorA={blob1ColorA}
        $colorB={blob1ColorB}
        $top="-60px"
        $left="-60px"
      />
      <GlowBlob
        $size={220}
        $colorA={blob2ColorA}
        $colorB={blob2ColorB}
        $bottom="-40px"
        $right="-40px"
      />

      <SectionHeaderWrap>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <SectionBadge $gradient={sectionBadgeGradient}>
            {sectionBadge}
          </SectionBadge>
          <SectionName>{sectionTitle}</SectionName>
        </div>
      </SectionHeaderWrap>
      <SectionDivider $color={sectionTitleUnderlineColor} />
      <Title $gradient={titleGradient} style={{ textAlign: "center" }}>
        {title}
      </Title>
      <TitleUnderline $color={titleUnderlineColor} />
      <InfoGrid style={{ justifyItems: "center", textAlign: "center" }}>
        <InfoCard $bgColor={infoCardBgColor}>
          <Text $white>{infoCard1Text}</Text>
        </InfoCard>
        <InfoCard $bgColor={infoCardBgColor}>
          <Text $white>{infoCard2Text}</Text>
        </InfoCard>
      </InfoGrid>

      <BentoGrid>
        {/* Demographics Pie Chart */}
        <BentoCard $colSpan={6} $bg={bentoCardBgColor}>
          <CardTitle>Student Demographics</CardTitle>
          <PieChartWrapper>
            <PieContainer>
              <ResponsivePie
                data={demographicsData}
                innerRadius={0.6}
                theme={pieTheme}
                colors={
                  ((datum: { data: { id: string; color: string } }) =>
                    activeSliceId && datum.data.id !== activeSliceId
                      ? `${datum.data.color}66`
                      : datum.data.color) as any
                }
                enableArcLabels={false}
                enableArcLinkLabels={false}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                onMouseEnter={(datum) => {
                  setActiveSliceId(datum.data.id);
                }}
                onMouseMove={(datum) => {
                  setActiveSliceId(datum.data.id);
                }}
                onMouseLeave={() => setActiveSliceId(null)}
              />
            </PieContainer>
            <LegendRow>
              {demographicsData.map((item) => (
                <LegendChip
                  key={item.id}
                  onMouseEnter={() => setActiveSliceId(item.id)}
                  onMouseLeave={() => setActiveSliceId(null)}
                >
                  <LegendDot $color={item.color} /> {item.value}% {item.label}
                </LegendChip>
              ))}
            </LegendRow>
          </PieChartWrapper>
          <PieCaption>{demographicsCaption}</PieCaption>
        </BentoCard>

        {/* Academic Gains */}
        <StatBentoCard $colSpan={3} $bg={bentoCardBgColor}>
          <PercentCircle
            $percent={stat1Percent}
            $accent={stat1Color}
            $innerBgColor={percentCircleInnerBgColor}
          >
            <PercentText>{stat1Percent}%</PercentText>
          </PercentCircle>
          <CardLabel>{stat1Text}</CardLabel>
        </StatBentoCard>

        {/* Conduct Improvement */}
        <StatBentoCard $colSpan={3} $bg={bentoCardBgColor}>
          <PercentCircle
            $percent={stat2Percent}
            $accent={stat2Color}
            $innerBgColor={percentCircleInnerBgColor}
          >
            <PercentText>{stat2Percent}%</PercentText>
          </PercentCircle>
          <CardLabel>{stat2Text}</CardLabel>
        </StatBentoCard>

        {/* C-GAS Stats - Wide Strip */}
        <BentoCard
          $colSpan={12}
          $bg={bentoCardBgColor || "#161616"}
          className="animate-in"
        >
          <CardTitle>
            {cgasTitle}
            <Tooltip
              title={cgasTooltip}
              arrow
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#222",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.85rem",
                    padding: "12px",
                    maxWidth: "300px",
                    textAlign: "center",
                  },
                },
              }}
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: "rgba(255,255,255,0.4)",
                  cursor: "help",
                  "&:hover": { color: COLORS.gogo_teal },
                }}
              />
            </Tooltip>
          </CardTitle>
          <CGasGrid>
            {cgasStats.map((stat, index) => (
              <CGasItem key={index}>
                <CGasValue $color={stat.color}>{stat.value}</CGasValue>
                <CGasLabel style={{ whiteSpace: "pre-wrap" }}>
                  {stat.label}
                </CGasLabel>
              </CGasItem>
            ))}
          </CGasGrid>
        </BentoCard>
      </BentoGrid>

      <div className="animate-in" style={{ textAlign: "center" }}>
        <h3
          style={{ color: "white", marginBottom: "1rem", fontSize: "1.2rem" }}
        >
          {skillsTitle}
        </h3>
        <SkillsContainer>
          {skillsList.map((skill) => (
            <SkillChip
              key={skill}
              $bgColor={skillChipBgColor}
              $borderColor={skillChipBorderColor}
              $textColor={skillChipTextColor}
            >
              {skill}
            </SkillChip>
          ))}
        </SkillsContainer>
      </div>

      {!inline && (
        <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
          <ImageStrip className="animate-in">
            {photos.map((photo, i) => (
              <StripImage key={i} src={photo} alt={`GOGO Student ${i + 1}`} loading="lazy" decoding="async" />
            ))}
          </ImageStrip>
        </div>
      )}
    </Container>
  );

  if (inline) {
    return content;
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        navigate("/impact-report");
      }}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        style: {
          background: "transparent",
          boxShadow: "none",
          overflow: "visible",
        },
      }}
      BackdropProps={{
        style: {
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(0,0,0,0.8)",
        },
      }}
    >
      <div style={{ position: "relative" }}>
        <IconButton
          onClick={() => {
            setOpen(false);
            navigate("/impact-report");
          }}
          sx={{
            position: "absolute",
            right: 20,
            top: 20,
            color: "white",
            zIndex: 10,
            background: "rgba(0,0,0,0.5)",
            "&:hover": { background: "rgba(0,0,0,0.8)" },
          }}
        >
          <CloseIcon />
        </IconButton>
        {content}
      </div>
    </Dialog>
  );
}

export default memo(PopulationComponent);
