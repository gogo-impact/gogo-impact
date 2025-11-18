import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Box,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import { v4 as uuidv4 } from "uuid";
import ScreenGrid from "../components/ScreenGrid.tsx";
import COLORS from "../../assets/colors.ts";
import styled from "styled-components";
import HeroSection from "../components/HeroSection.tsx";
import MissionSection from "../sections/MissionSection.tsx";
import { signUpload } from "../services/upload.api.ts";
import { saveMedia } from "../services/media.api.ts";
import {
  fetchHeroContent,
  saveHeroContent,
  fetchMissionContent,
  saveMissionContent,
  fetchDefaults,
  saveDefaults,
} from "../services/impact.api.ts";
import "../../assets/fonts/fonts.css";
import { useSnackbar } from "notistack";
import ColorPickerPopover from "../components/ColorPickerPopover";

const MemoHeroSection = React.memo(HeroSection);
const MemoMissionSection = React.memo(MissionSection);

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function parseGradient(input: string | null | undefined): {
  degree: number;
  color1: string;
  color2: string;
} {
  const fallback = { degree: 180, color1: "#5038a0", color2: "#121242" };
  if (!input) return fallback;
  // Expect strings we compose like: linear-gradient(180deg, <c1> 0%, <c2> 100%)
  const m = input.match(
    /linear-gradient\(\s*(\d+)\s*deg\s*,\s*(.+?)\s+0%\s*,\s*(.+?)\s+100%\s*\)/i,
  );
  if (!m) return fallback;
  const degree = Math.max(1, Math.min(360, Number(m[1]) || 180));
  const color1 = m[2].trim();
  const color2 = m[3].trim();
  if (
    !color1 ||
    !color2 ||
    /undefined/i.test(color1) ||
    /undefined/i.test(color2)
  ) {
    return fallback;
  }
  return { degree, color1, color2 };
}

function withAlpha(color: string, alpha: number): string {
  const clamp = (v: number, min = 0, max = 1) =>
    Math.max(min, Math.min(max, v));
  const a = clamp(alpha);
  const hex = color.trim();
  if (hex.startsWith("#")) {
    const raw = hex.slice(1);
    const expand = (s: string) =>
      s.length === 3
        ? s
            .split("")
            .map((c) => c + c)
            .join("")
        : s;
    const full = expand(raw);
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (hex.startsWith("rgb(")) {
    const nums = hex
      .replace(/rgb\(/i, "")
      .replace(/\)/, "")
      .split(",")
      .map((s) => s.trim());
    const [r, g, b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (hex.startsWith("rgba(")) {
    const nums = hex
      .replace(/rgba\(/i, "")
      .replace(/\)/, "")
      .split(",")
      .map((s) => s.trim());
    const [r, g, b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color; // fallback – leave as-is
}

function composeGradient(
  degree: number,
  color1: string,
  color2: string,
  alpha: number,
): string {
  const c1 = withAlpha(color1, alpha);
  const c2 = withAlpha(color2, alpha);
  return `linear-gradient(${degree}deg, ${c1} 0%, ${c2} 100%)`;
}

function composeSimpleGradient(
  degree: number,
  color1: string,
  color2: string,
): string {
  const safeDegree = Number.isFinite(degree) ? degree : 0;
  return `linear-gradient(${safeDegree}deg, ${color1}, ${color2})`;
}

function isValidColorStop(color: string | null | undefined): boolean {
  if (!color) return false;
  if (/undefined/i.test(color)) return false;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
  const rgba =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i;
  return hex.test(color) || rgb.test(color) || rgba.test(color);
}

// Convert any supported color string (hex/rgb/rgba) to 6-digit hex for <input type="color">
function toHex(color: string): string {
  const c = color.trim();
  const hex3or6 = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
  const rgba =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i;

  if (hex3or6.test(c)) {
    if (c.length === 4) {
      // Expand #rgb -> #rrggbb
      const r = c[1];
      const g = c[2];
      const b = c[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return c.toLowerCase();
  }

  const mRgb = c.match(rgb);
  if (mRgb) {
    const r = Math.max(0, Math.min(255, parseInt(mRgb[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(mRgb[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(mRgb[3], 10)));
    const to2 = (n: number) => n.toString(16).padStart(2, "0");
    return `#${to2(r)}${to2(g)}${to2(b)}`.toLowerCase();
  }

  const mRgba = c.match(rgba);
  if (mRgba) {
    const r = Math.max(0, Math.min(255, parseInt(mRgba[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(mRgba[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(mRgba[3], 10)));
    const to2 = (n: number) => n.toString(16).padStart(2, "0");
    return `#${to2(r)}${to2(g)}${to2(b)}`.toLowerCase();
  }

  // Fallback
  return "#000000";
}

// Simple color helpers for preview contrast/debug
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = toHex(hex).replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b]
    .map((v) => v / 255)
    .map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );
  // Rec. 709 luminance
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getReadableTextColor(bgHex: string): string {
  // Return white for dark backgrounds, dark for light backgrounds
  const L = relativeLuminance(bgHex);
  return L > 0.4 ? "#0f1118" : "#ffffff";
}

function withAlphaHex(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

// Styled components for dark theme
const CustomPaper = styled(Paper)`
  && {
    /* Frosted glass effect */
    background-color: rgba(21, 24, 33, 0.55); /* liquid glass */
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    backdrop-filter: blur(12px) saturate(140%);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    font-family: "Century Gothic", "Arial", sans-serif;
  }
`;

const CustomTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.06);
    -webkit-backdrop-filter: blur(8px) saturate(140%);
    backdrop-filter: blur(8px) saturate(140%);
    color: white;
    & fieldset {
      border-color: rgba(255, 255, 255, 0.3);
    }
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.5);
    }
    &.Mui-focused fieldset {
      border-color: ${COLORS.gogo_blue};
    }
  }
  & .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
    &.Mui-focused {
      color: ${COLORS.gogo_blue};
    }
  }
`;

/* Scope styles for clearer button states and glass look */
const FrostedScope = styled.div`
  /* Base glass look for outlined buttons */
  .MuiButton-root.MuiButton-outlined {
    background: rgba(255, 255, 255, 0.06);
    -webkit-backdrop-filter: blur(6px) saturate(140%);
    backdrop-filter: blur(6px) saturate(140%);
    border-color: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.9);
    transition:
      transform 0.15s ease,
      background 0.2s ease,
      border-color 0.2s ease;
  }
  .MuiButton-root.MuiButton-outlined:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.28);
    transform: translateY(-1px);
  }
  /* Clear disabled state for all buttons */
  .MuiButton-root.Mui-disabled,
  button.Mui-disabled {
    opacity: 0.45 !important;
    color: rgba(255, 255, 255, 0.35) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: rgba(255, 255, 255, 0.03) !important;
    cursor: not-allowed !important;
  }
`;

// Preview frame wrapper (no overrides to internal section heights)
const PreviewFrame = styled.div``;

// Simple circular degree picker
function DegreePicker({
  value,
  onChange,
  size = 120,
}: {
  value: number;
  onChange: (deg: number) => void;
  size?: number;
}) {
  const [dragging, setDragging] = useState(false);

  const handlePointer = (clientX: number, clientY: number, rect: DOMRect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = clientX - cx;
    const y = clientY - cy;
    // Photoshop-like: 0deg at top, clockwise
    const rad = Math.atan2(y, x);
    let deg = Math.round(((rad * 180) / Math.PI + 90 + 360) % 360);
    deg = Math.max(1, Math.min(360, deg));
    onChange(deg);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setDragging(true);
    handlePointer(e.clientX, e.clientY, rect);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    handlePointer(e.clientX, e.clientY, rect);
  };
  const onMouseUp = () => setDragging(false);
  const onMouseLeave = () => setDragging(false);

  const radius = size / 2;
  const angleRad = ((value - 90) * Math.PI) / 180;
  const indicatorX = radius + (radius - 10) * Math.cos(angleRad);
  const indicatorY = radius + (radius - 10) * Math.sin(angleRad);

  return (
    <div
      role="slider"
      aria-valuenow={value}
      aria-label="Gradient angle"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{
        width: size,
        height: size,
        position: "relative",
        cursor: "pointer",
      }}
    >
      <svg width={size} height={size} style={{ display: "block" }}>
        <circle
          cx={radius}
          cy={radius}
          r={radius - 1}
          fill="#0f1118"
          stroke="rgba(255,255,255,0.2)"
        />
        {/* Crosshairs */}
        <line
          x1={radius}
          y1={8}
          x2={radius}
          y2={size - 8}
          stroke="rgba(255,255,255,0.1)"
        />
        <line
          x1={8}
          y1={radius}
          x2={size - 8}
          y2={radius}
          stroke="rgba(255,255,255,0.1)"
        />
        {/* Indicator */}
        <line
          x1={radius}
          y1={radius}
          x2={indicatorX}
          y2={indicatorY}
          stroke={COLORS.gogo_blue}
          strokeWidth={2}
        />
        <circle cx={indicatorX} cy={indicatorY} r={6} fill={COLORS.gogo_blue} />
      </svg>
    </div>
  );
}

// Impact Report Section Types
interface HeroSection {
  title: string;
  subtitle: string;
  year: string;
  tagline: string;
  titleColor?: string;
  subtitleColor?: string;
  yearColor?: string;
  taglineColor?: string;
  primaryCtaColor?: string;
  secondaryCtaColor?: string;
  bubblesCsv: string;
  degree: number;
  color1: string;
  color2: string;
  gradientOpacity: number;
  backgroundImageUrl: string | null;
  backgroundImagePreview: string | null;
  backgroundImageFile?: File | null;
  ariaLabel: string;
  backgroundGrayscale: boolean;
  // CTA editing fields
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  enabled: boolean;
}

type MissionLayoutVariant = "ticket" | "default";
type MissionTextAlign = "left" | "center" | "right";
type MissionStatAction = "none" | "openModal";
type MissionStatNumberSource = "explicit" | "modalItemsLength";

interface MissionBadgeIcon {
  type: "glyph" | "iconKey";
  value: string;
}

interface MissionStat {
  id: string;
  number: string | number;
  label: string;
  color?: string;
  action?: MissionStatAction;
  modalId?: string | null;
  iconKey?: string | null;
  numberSource?: MissionStatNumberSource;
}

interface MissionDisciplineItem {
  name: string;
  iconKey?: string | null;
}

interface MissionStatsEqualizer {
  enabled: boolean;
  barCount: number;
}

interface MissionBackgroundLogo {
  enabled: boolean;
  svgKey?: string;
  opacity?: number;
  rotationDeg?: number;
  scale?: number;
}

interface MissionSection {
  // enable/visibility
  enabled: boolean;
  ariaLabel: string;
  layoutVariant: MissionLayoutVariant;
  textAlign: MissionTextAlign;
  animationsEnabled: boolean;
  // basic copy
  title: string;
  titleColor?: string | null;
  titleGradientDegree: number;
  titleGradientColor1: string;
  titleGradientColor2: string;
  titleGradientOpacity: number;
  badgeLabel: string;
  badgeIcon?: MissionBadgeIcon | null;
  badgeTextColor?: string | null;
  badgeBgColor?: string | null;
  badgeBorderColor?: string | null;
  statementTitle: string;
  statementText: string;
  statementMeta: string;
  serial: string;
  // per-text colors
  statementTitleColor?: string | null;
  statementTextColor?: string | null;
  statementMetaColor?: string | null;
  serialColor?: string | null;
  // title gradient override (optional text style)
  titleGradient?: string | null;
  titleUnderlineGradientDegree: number;
  titleUnderlineGradientColor1: string;
  titleUnderlineGradientColor2: string;
  titleUnderlineGradient?: string | null;
  // background controls (parity with hero)
  degree: number;
  color1: string;
  color2: string;
  gradientOpacity: number;
  // stats and modal editing
  statsTitle?: string;
  statsTitleColor?: string | null;
  statsEqualizer: MissionStatsEqualizer;
  stats: MissionStat[];
  modalTitle?: string;
  disciplinesItems: MissionDisciplineItem[];
  backgroundLogo: MissionBackgroundLogo;
}

interface ImpactSection {
  title: string;
  stats: Array<{
    id: string;
    number: string;
    label: string;
  }>;
  enabled: boolean;
}

interface ProgramsSection {
  title: string;
  programs: Array<{
    id: string;
    name: string;
    description: string;
    image: File | null;
    imagePreview: string | null;
  }>;
  enabled: boolean;
}

interface LocationsSection {
  title: string;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  }>;
  enabled: boolean;
}

interface TestimonialSection {
  title: string;
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    content: string;
    image: File | null;
    imagePreview: string | null;
  }>;
  enabled: boolean;
}

interface ImpactReportForm {
  hero: HeroSection;
  mission: MissionSection;
  impact: ImpactSection;
  programs: ProgramsSection;
  locations: LocationsSection;
  testimonials: TestimonialSection;
}

const DEFAULT_SWATCH_SIZE = 6;

const MISSION_TEXT_ALIGN_OPTIONS: MissionTextAlign[] = [
  "left",
  "center",
  "right",
];

const MISSION_LAYOUT_VARIANTS: MissionLayoutVariant[] = ["ticket", "default"];

const MISSION_ICON_LIBRARY = [
  { key: "musicNote", label: "Music Note" },
  { key: "graphicEq", label: "Graphic EQ" },
  { key: "mic", label: "Microphone" },
  { key: "piano", label: "Piano" },
  { key: "brush", label: "Brush" },
  { key: "theater", label: "Theater Masks" },
  { key: "queueMusic", label: "Queue Music" },
  { key: "libraryMusic", label: "Sheet Music" },
  { key: "audiotrack", label: "Audio Track" },
  { key: "computer", label: "Computer" },
  { key: "recordVoiceOver", label: "Voice Over" },
  { key: "directionsRun", label: "Movement" },
  { key: "equalizer", label: "Equalizer" },
];

const BACKGROUND_LOGO_OPTIONS = [{ key: "gogoLogoBK", label: "GOGO Logo" }];

/**
 * A page for customizing the entire impact report
 */
function ImpactReportCustomizationPage() {
  const { enqueueSnackbar } = useSnackbar();
  // Disable outermost page scroll while this page is mounted
  useEffect(() => {
    // Always jump to the top of the page on mount
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);
  // Current tab state
  const [currentTab, setCurrentTab] = useState(0);

  // Impact report form state with default values
  const [impactReportForm, setImpactReportForm] = useState<ImpactReportForm>({
    hero: {
      title: "",
      subtitle: "",
      year: "",
      tagline: "",
      bubblesCsv: "",
      degree: 180,
      color1: "#000000",
      color2: "#000000",
      gradientOpacity: 0,
      backgroundImageUrl: null,
      backgroundImagePreview: null,
      backgroundImageFile: null,
      ariaLabel: "",
      backgroundGrayscale: false,
      primaryCtaLabel: "Watch Our Story",
      primaryCtaHref: "https://youtu.be/21ufVKC5TEo?si=3N7xugwbc3Z4RNm-",
      secondaryCtaLabel: "Support Our Mission",
      secondaryCtaHref:
        "https://www.classy.org/give/352794/#!/donation/checkout",
      enabled: true,
    },
    mission: {
      enabled: true,
      ariaLabel: "Mission section",
      layoutVariant: "ticket",
      textAlign: "center",
      animationsEnabled: true,
      title: "Our Mission",
      titleColor: null,
      titleGradientDegree: 90,
      titleGradientColor1: "#7e9aff",
      titleGradientColor2: "#bfb1ff",
      titleGradientOpacity: 1,
      badgeLabel: "Since 2008",
      badgeIcon: { type: "glyph", value: "♫" },
      badgeTextColor: "rgba(255,255,255,0.8)",
      badgeBgColor: "rgba(0,0,0,0.4)",
      badgeBorderColor: "rgba(255,255,255,0.1)",
      statementTitle: "MISSION STATEMENT — ADMIT ALL",
      statementText:
        "Our mission is to empower youth through music, art and mentorship. Guitars Over Guns offers students from our most vulnerable communities a combination of arts education and mentorship with paid, professional musician mentors to help them overcome hardship, find their voice and reach their potential as tomorrow's leaders. Since 2008, we have served nearly 12,000 students.",
      statementMeta: "ISSUED 2025 • CHOOSE YOUR SOUND",
      serial: "SN-GOGO-2025",
      statementTitleColor: null,
      statementTextColor: null,
      statementMetaColor: null,
      serialColor: null,
      titleGradient:
        "linear-gradient(to right, rgb(126,154,255), rgb(191,175,255), rgb(178,255,241))",
      titleUnderlineGradientDegree: 0,
      titleUnderlineGradientColor1: "#5fa8d3",
      titleUnderlineGradientColor2: "#7b7fd1",
      titleUnderlineGradient: "linear-gradient(to right, #5fa8d3, #7b7fd1)",
      degree: 180,
      color1: "#5038a0",
      color2: "#121242",
      gradientOpacity: 0,
      statsTitle: "At a Glance",
      statsTitleColor: "rgba(255,255,255,0.7)",
      statsEqualizer: {
        enabled: true,
        barCount: 4,
      },
      stats: [
        {
          id: "students",
          number: 1622,
          label: "Students",
          color: "#22C55E",
          action: "none",
          modalId: null,
          iconKey: null,
          numberSource: "explicit",
        },
        {
          id: "mentors",
          number: 105,
          label: "Paid Mentors",
          color: "#3B82F6",
          action: "none",
          modalId: null,
          iconKey: null,
          numberSource: "explicit",
        },
        {
          id: "sites",
          number: 59,
          label: "School & Community Sites",
          color: "#8B5CF6",
          action: "none",
          modalId: null,
          iconKey: null,
          numberSource: "explicit",
        },
        {
          id: "disciplines",
          number: 12,
          label: "Artistic Disciplines",
          color: "#FDE047",
          action: "openModal",
          modalId: "disciplines",
          iconKey: null,
          numberSource: "explicit",
        },
      ],
      modalTitle: "Artistic Disciplines",
      disciplinesItems: [
        { name: "Music Production", iconKey: null },
        { name: "Guitar", iconKey: null },
        { name: "Drums", iconKey: null },
        { name: "Piano", iconKey: null },
        { name: "Vocals", iconKey: null },
        { name: "Bass", iconKey: null },
        { name: "DJing", iconKey: null },
        { name: "Songwriting", iconKey: null },
        { name: "Dance", iconKey: null },
        { name: "Visual Art", iconKey: null },
        { name: "Digital Art", iconKey: null },
        { name: "Spoken Word", iconKey: null },
        { name: "Theater", iconKey: null },
        { name: "Sound Engineering", iconKey: null },
        { name: "Brass Instruments", iconKey: null },
        { name: "Woodwind Instruments", iconKey: null },
        { name: "Strings", iconKey: null },
      ],
      backgroundLogo: {
        enabled: true,
        svgKey: "gogoLogoBK",
        opacity: 0.08,
        rotationDeg: 90,
        scale: 0.82,
      },
    },
    impact: {
      title: "Our Impact",
      stats: [
        { id: "1", number: "500+", label: "Students Served" },
        { id: "2", number: "15", label: "Years of Service" },
        { id: "3", number: "95%", label: "Graduation Rate" },
        { id: "4", number: "4", label: "Cities" },
      ],
      enabled: true,
    },
    programs: {
      title: "Our Programs",
      programs: [
        {
          id: "1",
          name: "Music Mentorship",
          description: "One-on-one mentorship with professional musicians",
          image: null,
          imagePreview: null,
        },
        {
          id: "2",
          name: "Group Sessions",
          description: "Collaborative learning in small groups",
          image: null,
          imagePreview: null,
        },
      ],
      enabled: true,
    },
    locations: {
      title: "Our Locations",
      locations: [
        {
          id: "1",
          name: "Miami",
          address: "Miami, FL",
          coordinates: { lat: 25.7617, lng: -80.1918 },
        },
        {
          id: "2",
          name: "Chicago",
          address: "Chicago, IL",
          coordinates: { lat: 41.8781, lng: -87.6298 },
        },
      ],
      enabled: true,
    },
    testimonials: {
      title: "What Our Students Say",
      testimonials: [
        {
          id: "1",
          name: "Maria Rodriguez",
          role: "Student, Miami",
          content:
            "Guitars Over Guns changed my life. I found my voice through music.",
          image: null,
          imagePreview: null,
        },
      ],
      enabled: true,
    },
  });

  const badgeIconConfig =
    impactReportForm.mission.badgeIcon ??
    ({
      type: "glyph",
      value: "♫",
    } as MissionBadgeIcon);
  const badgeIconType = badgeIconConfig.type ?? "glyph";
  const badgeIconValue = badgeIconConfig.value ?? "♫";
  const backgroundLogoState = impactReportForm.mission.backgroundLogo ?? {
    enabled: false,
    svgKey: BACKGROUND_LOGO_OPTIONS[0]?.key ?? "gogoLogoBK",
    opacity: 0.08,
    rotationDeg: 90,
    scale: 0.82,
  };

  // Error states
  const [errors, setErrors] = useState<{
    general: string;
  }>({
    general: "",
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [heroUploadPct, setHeroUploadPct] = useState<number | null>(null);
  const [flashPreviewHero, setFlashPreviewHero] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<ImpactReportForm | null>(
    null,
  );
  const [lastDeletedStat, setLastDeletedStat] = useState<{
    index: number;
    item: { id: string; number: string; label: string };
  } | null>(null);
  const [lastDeletedProgram, setLastDeletedProgram] = useState<{
    index: number;
    item: {
      id: string;
      name: string;
      description: string;
      image: File | null;
      imagePreview: string | null;
    };
  } | null>(null);
  const [lastDeletedTestimonial, setLastDeletedTestimonial] = useState<{
    index: number;
    item: {
      id: string;
      name: string;
      role: string;
      content: string;
      image: File | null;
      imagePreview: string | null;
    };
  } | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<
    | "color1"
    | "color2"
    | "titleColor"
    | "subtitleColor"
    | "yearColor"
    | "taglineColor"
    | "primaryCtaColor"
    | "secondaryCtaColor"
    | null
  >(null);
  const openColorPicker = Boolean(colorPickerAnchor);
  const currentPickerColor = colorPickerField
    ? colorPickerField === "color1"
      ? impactReportForm.hero.color1
      : colorPickerField === "color2"
        ? impactReportForm.hero.color2
        : colorPickerField === "titleColor"
          ? impactReportForm.hero.titleColor || "#ffffff"
          : colorPickerField === "subtitleColor"
            ? impactReportForm.hero.subtitleColor || "#77ddab"
            : colorPickerColorMap(colorPickerField)
    : "#000000";

  function colorPickerColorMap(
    field: NonNullable<typeof colorPickerField>,
  ): string {
    switch (field) {
      case "yearColor":
        return impactReportForm.hero.yearColor || "#e9bb4d";
      case "taglineColor":
        return impactReportForm.hero.taglineColor || COLORS.gogo_green;
      case "primaryCtaColor":
        return impactReportForm.hero.primaryCtaColor || "#ffffff";
      case "secondaryCtaColor":
        return impactReportForm.hero.secondaryCtaColor || "#ffffff";
      default:
        return "#000000";
    }
  }
  // EyeDropper and swatches are implemented inside ColorPickerPopover
  // Mission color picker (separate instance so hero logic remains untouched)
  const [missionColorPickerAnchor, setMissionColorPickerAnchor] =
    useState<HTMLElement | null>(null);
  const [missionColorPickerField, setMissionColorPickerField] = useState<
    | "statementTitleColor"
    | "statementTextColor"
    | "statementMetaColor"
    | "serialColor"
    | "titleColor"
    | "badgeTextColor"
    | "badgeBgColor"
    | "badgeBorderColor"
    | "statsTitleColor"
    | "titleGradientColor1"
    | "titleGradientColor2"
    | "titleUnderlineGradientColor1"
    | "titleUnderlineGradientColor2"
    | null
  >(null);
  const missionPickerOpen = Boolean(missionColorPickerAnchor);
  const currentMissionPickerColor = missionColorPickerField
    ? missionColorPickerField === "statementTitleColor"
      ? impactReportForm.mission.statementTitleColor || "#ffffff"
      : missionColorPickerField === "statementTextColor"
        ? impactReportForm.mission.statementTextColor || "#b8ffe9"
        : missionColorPickerField === "statementMetaColor"
          ? impactReportForm.mission.statementMetaColor ||
            "rgba(255,255,255,0.75)"
          : missionColorPickerField === "serialColor"
            ? impactReportForm.mission.serialColor || "rgba(255,255,255,0.55)"
            : missionColorPickerField === "titleColor"
              ? impactReportForm.mission.titleColor || "#ffffff"
              : missionColorPickerField === "badgeTextColor"
                ? impactReportForm.mission.badgeTextColor ||
                  "rgba(255,255,255,0.8)"
                : missionColorPickerField === "badgeBgColor"
                  ? impactReportForm.mission.badgeBgColor || "rgba(0,0,0,0.4)"
                  : missionColorPickerField === "badgeBorderColor"
                    ? impactReportForm.mission.badgeBorderColor ||
                      "rgba(255,255,255,0.1)"
                    : missionColorPickerField === "statsTitleColor"
                      ? impactReportForm.mission.statsTitleColor ||
                        "rgba(255,255,255,0.7)"
                      : missionColorPickerField === "titleGradientColor1"
                        ? impactReportForm.mission.titleGradientColor1
                        : missionColorPickerField === "titleGradientColor2"
                          ? impactReportForm.mission.titleGradientColor2
                          : missionColorPickerField ===
                              "titleUnderlineGradientColor1"
                            ? impactReportForm.mission
                                .titleUnderlineGradientColor1
                            : missionColorPickerField ===
                                "titleUnderlineGradientColor2"
                              ? impactReportForm.mission
                                  .titleUnderlineGradientColor2
                              : "#000000"
    : "#000000";

  // Refs for file inputs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  // Defaults swatch editor state
  const [defaultSwatch, setDefaultSwatch] = useState<string[] | null>(null);
  const [defaultsPickerAnchor, setDefaultsPickerAnchor] =
    useState<HTMLElement | null>(null);
  const defaultsPickerOpen = Boolean(defaultsPickerAnchor);
  const [defaultsPickerValue, setDefaultsPickerValue] =
    useState<string>("#1946f5");
  const [selectedSwatchIndex, setSelectedSwatchIndex] = useState<number | null>(
    null,
  );

  // Handle section changes
  const handleSectionChange = (
    section: keyof ImpactReportForm,
    field: string,
    value: any,
  ) => {
    setImpactReportForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setIsDirty(true);
    if (section === "hero") {
      setFlashPreviewHero(true);
      window.setTimeout(() => setFlashPreviewHero(false), 800);
    }
  };

  const updateMissionTitleGradient = (
    partial: Partial<
      Pick<
        MissionSection,
        | "titleGradientDegree"
        | "titleGradientColor1"
        | "titleGradientColor2"
        | "titleGradientOpacity"
      >
    >,
  ) => {
    setImpactReportForm((prev) => {
      const mission = {
        ...prev.mission,
        ...partial,
      };
      const gradient = composeGradient(
        mission.titleGradientDegree,
        mission.titleGradientColor1,
        mission.titleGradientColor2,
        mission.titleGradientOpacity ?? 1,
      );
      return {
        ...prev,
        mission: {
          ...mission,
          titleGradient: gradient,
        },
      };
    });
    setIsDirty(true);
  };

  const updateMissionUnderlineGradient = (
    partial: Partial<
      Pick<
        MissionSection,
        | "titleUnderlineGradientDegree"
        | "titleUnderlineGradientColor1"
        | "titleUnderlineGradientColor2"
      >
    >,
  ) => {
    setImpactReportForm((prev) => {
      const mission = {
        ...prev.mission,
        ...partial,
      };
      const gradient = composeSimpleGradient(
        mission.titleUnderlineGradientDegree,
        mission.titleUnderlineGradientColor1,
        mission.titleUnderlineGradientColor2,
      );
      return {
        ...prev,
        mission: {
          ...mission,
          titleUnderlineGradient: gradient,
        },
      };
    });
    setIsDirty(true);
  };

  // Handle hero background image selection (validate + local preview only)
  const handleHeroBackgroundUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    // Validate file type: allow common web-friendly formats only
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const isHeicLike =
      /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
    if (!allowedTypes.includes(file.type)) {
      const message = isHeicLike
        ? "HEIC images are not widely supported in browsers. Please upload a JPG or PNG instead."
        : "Unsupported image format. Please upload a JPG, PNG, or WebP image.";
      setErrors((prev) => ({ ...prev, general: message }));
      enqueueSnackbar(message, { variant: "warning" });
      return;
    }
    // Local preview only; upload deferred until Save
    const preview = URL.createObjectURL(file);
    setImpactReportForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgroundImagePreview: preview,
        backgroundImageFile: file,
      },
    }));
    setIsDirty(true);
    setErrors((prev) => ({ ...prev, general: "" }));
  };

  // Video/overlay support removed

  // Handle stat changes
  const handleStatChange = (
    statIndex: number,
    field: string,
    value: string,
  ) => {
    const updatedStats = [...impactReportForm.impact.stats];
    updatedStats[statIndex] = {
      ...updatedStats[statIndex],
      [field]: value,
    };
    handleSectionChange("impact", "stats", updatedStats);
  };

  // Add stat
  const handleAddStat = () => {
    const newStat = {
      id: uuidv4(),
      number: "",
      label: "",
    };
    handleSectionChange("impact", "stats", [
      ...impactReportForm.impact.stats,
      newStat,
    ]);
  };

  // Remove stat
  const handleRemoveStat = (index: number) => {
    const removed = impactReportForm.impact.stats[index];
    const updatedStats = impactReportForm.impact.stats.filter(
      (_, i) => i !== index,
    );
    handleSectionChange("impact", "stats", updatedStats);
    setLastDeletedStat({ index, item: removed });
    enqueueSnackbar("Statistic deleted", {
      variant: "info",
      action: (
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            setImpactReportForm((prev) => {
              const stats = [...prev.impact.stats];
              stats.splice(index, 0, removed);
              return { ...prev, impact: { ...prev.impact, stats } };
            });
            setLastDeletedStat(null);
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  // Handle program changes
  const handleProgramChange = (
    programIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedPrograms = [...impactReportForm.programs.programs];
    updatedPrograms[programIndex] = {
      ...updatedPrograms[programIndex],
      [field]: value,
    };
    handleSectionChange("programs", "programs", updatedPrograms);
  };

  // Add program
  const handleAddProgram = () => {
    const newProgram = {
      id: uuidv4(),
      name: "",
      description: "",
      image: null,
      imagePreview: null,
    };
    handleSectionChange("programs", "programs", [
      ...impactReportForm.programs.programs,
      newProgram,
    ]);
  };

  // Remove program
  const handleRemoveProgram = (index: number) => {
    const removed = impactReportForm.programs.programs[index];
    const updatedPrograms = impactReportForm.programs.programs.filter(
      (_, i) => i !== index,
    );
    handleSectionChange("programs", "programs", updatedPrograms);
    setLastDeletedProgram({ index, item: removed });
    enqueueSnackbar("Program deleted", {
      variant: "info",
      action: (
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            setImpactReportForm((prev) => {
              const programs = [...prev.programs.programs];
              programs.splice(index, 0, removed);
              return { ...prev, programs: { ...prev.programs, programs } };
            });
            setLastDeletedProgram(null);
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  // Handle testimonial changes
  const handleTestimonialChange = (
    testimonialIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedTestimonials = [...impactReportForm.testimonials.testimonials];
    updatedTestimonials[testimonialIndex] = {
      ...updatedTestimonials[testimonialIndex],
      [field]: value,
    };
    handleSectionChange("testimonials", "testimonials", updatedTestimonials);
  };

  // Add testimonial
  const handleAddTestimonial = () => {
    const newTestimonial = {
      id: uuidv4(),
      name: "",
      role: "",
      content: "",
      image: null,
      imagePreview: null,
    };
    handleSectionChange("testimonials", "testimonials", [
      ...impactReportForm.testimonials.testimonials,
      newTestimonial,
    ]);
  };

  // Remove testimonial
  const handleRemoveTestimonial = (index: number) => {
    const removed = impactReportForm.testimonials.testimonials[index];
    const updatedTestimonials =
      impactReportForm.testimonials.testimonials.filter((_, i) => i !== index);
    handleSectionChange("testimonials", "testimonials", updatedTestimonials);
    setLastDeletedTestimonial({ index, item: removed });
    enqueueSnackbar("Testimonial deleted", {
      variant: "info",
      action: (
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            setImpactReportForm((prev) => {
              const testimonials = [...prev.testimonials.testimonials];
              testimonials.splice(index, 0, removed);
              return {
                ...prev,
                testimonials: { ...prev.testimonials, testimonials },
              };
            });
            setLastDeletedTestimonial(null);
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  // Prefill from backend
  useEffect(() => {
    (async () => {
      const hero = await fetchHeroContent();
      if (!hero) return;
      const g = parseGradient(hero.backgroundColor as string | null);
      const alphaMatch = (hero.backgroundColor as string | "").match(
        /rgba\([^,]+,[^,]+,[^,]+,\s*(\d*\.?\d+)\)/i,
      );
      const parsedAlpha = alphaMatch
        ? Math.max(0, Math.min(1, parseFloat(alphaMatch[1] || "1")))
        : undefined;
      setImpactReportForm((prev) => {
        const next: ImpactReportForm = {
          ...prev,
          hero: {
            ...prev.hero,
            title: hero.title ?? prev.hero.title,
            subtitle: hero.subtitle ?? prev.hero.subtitle,
            year: hero.year ?? prev.hero.year,
            tagline: hero.tagline ?? prev.hero.tagline,
            titleColor: (hero as any)?.titleColor ?? prev.hero.titleColor,
            subtitleColor:
              (hero as any)?.subtitleColor ?? prev.hero.subtitleColor,
            yearColor: (hero as any)?.yearColor ?? prev.hero.yearColor,
            taglineColor: (hero as any)?.taglineColor ?? prev.hero.taglineColor,
            primaryCtaColor:
              (hero as any)?.primaryCtaColor ?? prev.hero.primaryCtaColor,
            secondaryCtaColor:
              (hero as any)?.secondaryCtaColor ?? prev.hero.secondaryCtaColor,
            bubblesCsv: Array.isArray(hero.bubbles)
              ? hero.bubbles.join(", ")
              : prev.hero.bubblesCsv,
            degree: g.degree,
            color1: toHex(g.color1),
            color2: toHex(g.color2),
            gradientOpacity:
              typeof parsedAlpha === "number"
                ? parsedAlpha
                : prev.hero.gradientOpacity,
            backgroundImageUrl: hero.backgroundImage ?? null,
            backgroundImagePreview: null,
            backgroundGrayscale:
              (hero as any)?.backgroundImageGrayscale === true ? true : false,
            primaryCtaLabel:
              hero.primaryCta?.label ?? prev.hero.primaryCtaLabel,
            primaryCtaHref: hero.primaryCta?.href ?? prev.hero.primaryCtaHref,
            secondaryCtaLabel:
              hero.secondaryCta?.label ?? prev.hero.secondaryCtaLabel,
            secondaryCtaHref:
              hero.secondaryCta?.href ?? prev.hero.secondaryCtaHref,
          },
        };
        setSavedSnapshot(next);
        return next;
      });
    })();
  }, []);

  // Prefill mission from backend
  useEffect(() => {
    (async () => {
      const mission = await fetchMissionContent();
      if (!mission) return;
      const g = parseGradient(mission.backgroundColor as string | null);
      const titleGradientParsed = parseGradient(
        ((mission as any)?.titleGradient as string) ?? null,
      );
      const titleUnderlineParsed = parseGradient(
        ((mission as any)?.titleUnderlineGradient as string) ?? null,
      );
      const alphaMatch = (mission.backgroundColor as string | "").match(
        /rgba\([^,]+,[^,]+,[^,]+,\s*(\d*\.?\d+)\)/i,
      );
      const parsedAlpha = alphaMatch
        ? Math.max(0, Math.min(1, parseFloat(alphaMatch[1] || "1")))
        : undefined;
      const titleAlphaMatch = (
        (mission as any)?.titleGradient as string | ""
      ).match(/rgba\([^,]+,[^,]+,[^,]+,\s*(\d*\.?\d+)\)/i);
      const parsedTitleAlpha = titleAlphaMatch
        ? Math.max(0, Math.min(1, parseFloat(titleAlphaMatch[1] || "1")))
        : undefined;
      const disciplinesModal = ((mission as any)?.modals ?? []).find(
        (m: any) => m?.id === "disciplines",
      );
      const sanitizedDisciplines =
        disciplinesModal?.items
          ?.map((it: any) => {
            const name = typeof it?.name === "string" ? it.name : "";
            if (!name) return null;
            return {
              name,
              iconKey:
                typeof it?.iconKey === "string" && it.iconKey.length > 0
                  ? it.iconKey
                  : null,
            };
          })
          .filter(Boolean) ?? null;
      const sanitizedStats: MissionStat[] | null = Array.isArray(
        (mission as any)?.stats,
      )
        ? ((mission as any)?.stats as any[]).map((s, idx) => ({
            id: String(s?.id ?? idx),
            number: s?.number ?? "",
            label: s?.label ?? "",
            color: s?.color ?? undefined,
            action:
              s?.action === "openModal"
                ? ("openModal" as MissionStatAction)
                : ("none" as MissionStatAction),
            modalId: s?.modalId ?? null,
            iconKey:
              typeof s?.iconKey === "string" && s.iconKey.length > 0
                ? s.iconKey
                : null,
            numberSource:
              s?.numberSource === "modalItemsLength"
                ? "modalItemsLength"
                : "explicit",
          }))
        : null;
      const statsEqualizerConfig = (() => {
        const eq = (mission as any)?.statsEqualizer ?? {};
        const enabled = eq?.enabled === false ? false : true;
        const eqBarCountRaw = Number(eq?.barCount);
        const barCount =
          Number.isFinite(eqBarCountRaw) && eqBarCountRaw > 0
            ? Math.min(24, Math.max(1, Math.round(eqBarCountRaw)))
            : null;
        return { enabled, barCount };
      })();
      setImpactReportForm((prev) => {
        const nextTitleGradientDegree =
          titleGradientParsed?.degree ?? prev.mission.titleGradientDegree;
        const nextTitleGradientColor1 = titleGradientParsed?.color1
          ? toHex(titleGradientParsed.color1)
          : prev.mission.titleGradientColor1;
        const nextTitleGradientColor2 = titleGradientParsed?.color2
          ? toHex(titleGradientParsed.color2)
          : prev.mission.titleGradientColor2;
        const nextTitleGradientOpacity =
          typeof parsedTitleAlpha === "number"
            ? parsedTitleAlpha
            : (prev.mission.titleGradientOpacity ?? 1);
        const composedTitleGradient = composeGradient(
          nextTitleGradientDegree,
          nextTitleGradientColor1,
          nextTitleGradientColor2,
          nextTitleGradientOpacity,
        );

        const nextUnderlineDegree =
          titleUnderlineParsed?.degree ??
          prev.mission.titleUnderlineGradientDegree;
        const nextUnderlineColor1 = titleUnderlineParsed?.color1
          ? toHex(titleUnderlineParsed.color1)
          : prev.mission.titleUnderlineGradientColor1;
        const nextUnderlineColor2 = titleUnderlineParsed?.color2
          ? toHex(titleUnderlineParsed.color2)
          : prev.mission.titleUnderlineGradientColor2;
        const composedUnderlineGradient = composeSimpleGradient(
          nextUnderlineDegree,
          nextUnderlineColor1,
          nextUnderlineColor2,
        );

        const prevEqualizer = prev.mission.statsEqualizer;
        const prevBackgroundLogo = prev.mission.backgroundLogo;
        const next: ImpactReportForm = {
          ...prev,
          mission: {
            ...prev.mission,
            enabled: (mission as any)?.visible === false ? false : true,
            ariaLabel:
              typeof (mission as any)?.ariaLabel === "string"
                ? (mission as any)?.ariaLabel
                : prev.mission.ariaLabel,
            layoutVariant:
              (mission as any)?.layoutVariant === "default"
                ? "default"
                : "ticket",
            textAlign: ["left", "center", "right"].includes(
              (mission as any)?.textAlign,
            )
              ? ((mission as any)?.textAlign as MissionTextAlign)
              : prev.mission.textAlign,
            animationsEnabled:
              (mission as any)?.animationsEnabled === false ? false : true,
            title: mission.title ?? prev.mission.title,
            titleColor:
              (mission as any)?.titleColor ?? prev.mission.titleColor ?? null,
            titleGradient: composedTitleGradient,
            titleGradientDegree: nextTitleGradientDegree,
            titleGradientColor1: nextTitleGradientColor1,
            titleGradientColor2: nextTitleGradientColor2,
            titleGradientOpacity: nextTitleGradientOpacity,
            titleUnderlineGradient:
              (mission as any)?.titleUnderlineGradient ??
              composedUnderlineGradient,
            titleUnderlineGradientDegree: nextUnderlineDegree,
            titleUnderlineGradientColor1: nextUnderlineColor1,
            titleUnderlineGradientColor2: nextUnderlineColor2,
            badgeLabel: (mission as any)?.badgeLabel ?? prev.mission.badgeLabel,
            badgeIcon:
              typeof (mission as any)?.badgeIcon?.value === "string"
                ? {
                    type:
                      (mission as any)?.badgeIcon?.type === "iconKey"
                        ? "iconKey"
                        : "glyph",
                    value: (mission as any)?.badgeIcon?.value,
                  }
                : prev.mission.badgeIcon,
            badgeTextColor:
              (mission as any)?.badgeTextColor ??
              prev.mission.badgeTextColor ??
              null,
            badgeBgColor:
              (mission as any)?.badgeBgColor ??
              prev.mission.badgeBgColor ??
              null,
            badgeBorderColor:
              (mission as any)?.badgeBorderColor ??
              prev.mission.badgeBorderColor ??
              null,
            statementTitle:
              (mission as any)?.statementTitle ?? prev.mission.statementTitle,
            statementText:
              (mission as any)?.statementText ?? prev.mission.statementText,
            statementMeta:
              (mission as any)?.statementMeta ?? prev.mission.statementMeta,
            serial: (mission as any)?.serial ?? prev.mission.serial,
            statementTitleColor:
              (mission as any)?.statementTitleColor ??
              prev.mission.statementTitleColor ??
              null,
            statementTextColor:
              (mission as any)?.statementTextColor ??
              prev.mission.statementTextColor ??
              null,
            statementMetaColor:
              (mission as any)?.statementMetaColor ??
              prev.mission.statementMetaColor ??
              null,
            serialColor:
              (mission as any)?.serialColor ?? prev.mission.serialColor ?? null,
            degree: g.degree,
            color1: toHex(g.color1),
            color2: toHex(g.color2),
            gradientOpacity:
              typeof parsedAlpha === "number"
                ? parsedAlpha
                : prev.mission.gradientOpacity,
            statsTitle:
              (mission as any)?.statsTitle ?? prev.mission.statsTitle ?? "",
            statsTitleColor:
              (mission as any)?.statsTitleColor ??
              prev.mission.statsTitleColor ??
              null,
            statsEqualizer: {
              enabled: statsEqualizerConfig.enabled,
              barCount:
                statsEqualizerConfig.barCount ??
                prevEqualizer?.barCount ??
                prev.mission.statsEqualizer.barCount,
            },
            stats: sanitizedStats ?? prev.mission.stats,
            modalTitle: disciplinesModal?.title ?? prev.mission.modalTitle,
            disciplinesItems:
              sanitizedDisciplines ?? prev.mission.disciplinesItems,
            backgroundLogo: {
              enabled:
                (mission as any)?.backgroundLogo?.enabled === false
                  ? false
                  : true,
              svgKey:
                (mission as any)?.backgroundLogo?.svgKey ??
                prevBackgroundLogo?.svgKey,
              opacity:
                typeof (mission as any)?.backgroundLogo?.opacity === "number"
                  ? (mission as any)?.backgroundLogo?.opacity
                  : prevBackgroundLogo?.opacity,
              rotationDeg:
                typeof (mission as any)?.backgroundLogo?.rotationDeg ===
                "number"
                  ? (mission as any)?.backgroundLogo?.rotationDeg
                  : prevBackgroundLogo?.rotationDeg,
              scale:
                typeof (mission as any)?.backgroundLogo?.scale === "number"
                  ? (mission as any)?.backgroundLogo?.scale
                  : prevBackgroundLogo?.scale,
            },
          },
        };
        setSavedSnapshot(next);
        return next;
      });
    })();
  }, []);

  // Prefill defaults (swatch) from backend
  useEffect(() => {
    (async () => {
      const defs = await fetchDefaults();
      const brand = [
        COLORS.gogo_blue,
        COLORS.gogo_purple,
        COLORS.gogo_teal,
        COLORS.gogo_yellow,
        COLORS.gogo_pink,
        COLORS.gogo_green,
      ];
      const incoming =
        defs?.colorSwatch &&
        Array.isArray(defs.colorSwatch) &&
        defs.colorSwatch.length > 0
          ? defs.colorSwatch
          : brand;
      const normalized = Array.from({ length: DEFAULT_SWATCH_SIZE }).map(
        (_, i) => incoming[i] ?? brand[i % brand.length],
      );
      setDefaultSwatch(normalized);
    })();
  }, []);

  // Handle form submission
  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Save Hero content to backend
      const bubbles = impactReportForm.hero.bubblesCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const safeDegree = Math.max(
        1,
        Math.min(360, Number(impactReportForm.hero.degree) || 180),
      );
      const safeColor1 = isValidColorStop(impactReportForm.hero.color1)
        ? impactReportForm.hero.color1
        : "#5038a0";
      const safeColor2 = isValidColorStop(impactReportForm.hero.color2)
        ? impactReportForm.hero.color2
        : "#121242";
      const safeAlpha = Math.max(
        0,
        Math.min(1, Number(impactReportForm.hero.gradientOpacity) || 0),
      );
      const backgroundColor = composeGradient(
        safeDegree,
        safeColor1,
        safeColor2,
        safeAlpha,
      );

      // Upload background image if a new file is pending
      let backgroundImagePayload =
        impactReportForm.hero.backgroundImageUrl ?? null;
      if (impactReportForm.hero.backgroundImageFile) {
        const file = impactReportForm.hero.backgroundImageFile as File;
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const signed = await signUpload({
          contentType: file.type,
          extension: ext,
          key: `hero/background.${ext}`,
        });
        setHeroUploadPct(0);
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signed.uploadUrl);
          if (file.type) xhr.setRequestHeader("Content-Type", file.type);
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              setHeroUploadPct(pct);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed: ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(file);
        });
        try {
          await saveMedia({
            key: signed.key,
            publicUrl: signed.publicUrl,
            contentType: file.type,
            bytes: file.size,
            tag: "hero-background",
          });
        } catch {
          // non-fatal
        }
        backgroundImagePayload = signed.publicUrl;
        // Reflect new URL and clear pending file in state
        setImpactReportForm((prev) => ({
          ...prev,
          hero: {
            ...prev.hero,
            backgroundImageUrl: signed.publicUrl,
            backgroundImageFile: null,
          },
        }));
        setHeroUploadPct(null);
      }

      const payload = {
        backgroundColor,
        backgroundImage: backgroundImagePayload,
        // image is always full opacity; do not send backgroundOpacity
        backgroundImageGrayscale:
          impactReportForm.hero.backgroundGrayscale || undefined,
        titleColor: impactReportForm.hero.titleColor || undefined,
        subtitleColor: impactReportForm.hero.subtitleColor || undefined,
        yearColor: impactReportForm.hero.yearColor || undefined,
        taglineColor: impactReportForm.hero.taglineColor || undefined,
        title: impactReportForm.hero.title,
        subtitle: impactReportForm.hero.subtitle,
        year: impactReportForm.hero.year,
        tagline: impactReportForm.hero.tagline,
        bubbles,
        ariaLabel: impactReportForm.hero.ariaLabel,
        primaryCta: {
          label: impactReportForm.hero.primaryCtaLabel || undefined,
          href: impactReportForm.hero.primaryCtaHref || undefined,
        },
        secondaryCta: {
          label: impactReportForm.hero.secondaryCtaLabel || undefined,
          href: impactReportForm.hero.secondaryCtaHref || undefined,
        },
        primaryCtaColor: impactReportForm.hero.primaryCtaColor || undefined,
        secondaryCtaColor: impactReportForm.hero.secondaryCtaColor || undefined,
      };
      console.log("[admin][hero] save payload", payload);
      await saveHeroContent(payload);
      // Save Defaults (swatch)
      if (defaultSwatch && defaultSwatch.length > 0) {
        await saveDefaults({ colorSwatch: defaultSwatch });
      }
      // ======= Mission save =======
      // Compose mission gradient
      const mSafeDegree = Math.max(
        1,
        Math.min(360, Number(impactReportForm.mission.degree) || 180),
      );
      const mSafeColor1 = isValidColorStop(impactReportForm.mission.color1)
        ? impactReportForm.mission.color1
        : "#5038a0";
      const mSafeColor2 = isValidColorStop(impactReportForm.mission.color2)
        ? impactReportForm.mission.color2
        : "#121242";
      const mSafeAlpha = Math.max(
        0,
        Math.min(1, Number(impactReportForm.mission.gradientOpacity) || 0),
      );
      const missionBackgroundColor = composeGradient(
        mSafeDegree,
        mSafeColor1,
        mSafeColor2,
        mSafeAlpha,
      );

      const composedMissionTitleGradient = composeGradient(
        impactReportForm.mission.titleGradientDegree,
        impactReportForm.mission.titleGradientColor1,
        impactReportForm.mission.titleGradientColor2,
        impactReportForm.mission.titleGradientOpacity ?? 1,
      );
      const composedMissionUnderlineGradient = composeSimpleGradient(
        impactReportForm.mission.titleUnderlineGradientDegree,
        impactReportForm.mission.titleUnderlineGradientColor1,
        impactReportForm.mission.titleUnderlineGradientColor2,
      );

      const missionPayload: Record<string, unknown> = {
        visible: impactReportForm.mission.enabled,
        ariaLabel: impactReportForm.mission.ariaLabel || undefined,
        layoutVariant: impactReportForm.mission.layoutVariant,
        textAlign: impactReportForm.mission.textAlign,
        animationsEnabled: impactReportForm.mission.animationsEnabled,
        backgroundColor: missionBackgroundColor,
        title: impactReportForm.mission.title,
        titleColor: impactReportForm.mission.titleColor || undefined,
        titleGradient: composedMissionTitleGradient || undefined,
        titleUnderlineGradient: composedMissionUnderlineGradient || undefined,
        badgeLabel: impactReportForm.mission.badgeLabel,
        badgeIcon: impactReportForm.mission.badgeIcon || undefined,
        badgeTextColor: impactReportForm.mission.badgeTextColor || undefined,
        badgeBgColor: impactReportForm.mission.badgeBgColor || undefined,
        badgeBorderColor:
          impactReportForm.mission.badgeBorderColor || undefined,
        statementTitle: impactReportForm.mission.statementTitle,
        statementTitleColor:
          impactReportForm.mission.statementTitleColor || undefined,
        statementText: impactReportForm.mission.statementText,
        statementTextColor:
          impactReportForm.mission.statementTextColor || undefined,
        statementMeta: impactReportForm.mission.statementMeta,
        statementMetaColor:
          impactReportForm.mission.statementMetaColor || undefined,
        serial: impactReportForm.mission.serial,
        serialColor: impactReportForm.mission.serialColor || undefined,
        statsTitle: impactReportForm.mission.statsTitle || undefined,
        statsTitleColor: impactReportForm.mission.statsTitleColor || undefined,
        statsEqualizer: impactReportForm.mission.statsEqualizer,
        backgroundLogo: impactReportForm.mission.backgroundLogo,
        // stats
        stats: impactReportForm.mission.stats.map((s) => ({
          id: s.id,
          number: s.number,
          label: s.label,
          color: s.color || undefined,
          action: s.action || "none",
          modalId: s.modalId ?? null,
          iconKey: s.iconKey || undefined,
          numberSource: s.numberSource || "explicit",
        })),
        // modals: single "disciplines"
        modals: [
          {
            id: "disciplines",
            title:
              impactReportForm.mission.modalTitle || "Artistic Disciplines",
            items: impactReportForm.mission.disciplinesItems
              .filter((item) => item.name?.trim().length > 0)
              .map((item) => ({
                name: item.name,
                iconKey: item.iconKey || undefined,
              })),
          },
        ],
      };
      console.log("[admin][mission] save payload", missionPayload);
      await saveMissionContent(missionPayload);
      enqueueSnackbar("Impact report saved", { variant: "success" });
      setIsDirty(false);
      setLastSavedAt(new Date());
      setSavedSnapshot(
        JSON.parse(JSON.stringify(impactReportForm)) as ImpactReportForm,
      );
    } catch (error) {
      console.error("Error saving impact report:", error);
      setErrors((prev) => ({
        ...prev,
        general: "An error occurred while saving. Please try again.",
      }));
      enqueueSnackbar("Failed to save impact report", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Discard changes and restore last saved snapshot
  const handleDiscard = async () => {
    if (!savedSnapshot) return;
    const restore = JSON.parse(
      JSON.stringify(savedSnapshot),
    ) as ImpactReportForm;
    setImpactReportForm(restore);
    setIsDirty(false);
    // Close any open pickers
    setColorPickerAnchor(null);
    setColorPickerField(null);
    setMissionColorPickerAnchor(null);
    setMissionColorPickerField(null as any);
    setDefaultsPickerAnchor(null);
    setSelectedSwatchIndex(null);
    // Reload default swatch from backend (Mongo)
    try {
      const defs = await fetchDefaults();
      const brand = [
        COLORS.gogo_blue,
        COLORS.gogo_purple,
        COLORS.gogo_teal,
        COLORS.gogo_yellow,
        COLORS.gogo_pink,
        COLORS.gogo_green,
      ];
      const incoming =
        defs?.colorSwatch &&
        Array.isArray(defs.colorSwatch) &&
        defs.colorSwatch.length > 0
          ? defs.colorSwatch
          : brand;
      const normalized = Array.from({ length: DEFAULT_SWATCH_SIZE }).map(
        (_, i) => incoming[i] ?? brand[i % brand.length],
      );
      setDefaultSwatch(normalized);
    } catch {
      // ignore fetch errors on discard; keep current swatch if failed
    }
    enqueueSnackbar("Changes discarded", { variant: "info" });
  };

  // No preview toggle; preview is always visible on the left

  // Tab configuration
  const tabs = [
    { label: "Defaults", value: 0 },
    { label: "Hero Section", value: 1 },
    { label: "Mission Section", value: 2 },
  ];

  // Build and debounce the preview hero override
  const liveHeroOverride = useMemo(
    () => ({
      title: impactReportForm.hero.title,
      subtitle: impactReportForm.hero.subtitle,
      year: impactReportForm.hero.year,
      tagline: impactReportForm.hero.tagline,
      titleColor: impactReportForm.hero.titleColor,
      subtitleColor: impactReportForm.hero.subtitleColor,
      yearColor: impactReportForm.hero.yearColor,
      taglineColor: impactReportForm.hero.taglineColor,
      primaryCta: {
        label: impactReportForm.hero.primaryCtaLabel,
        href: impactReportForm.hero.primaryCtaHref,
      },
      secondaryCta: {
        label: impactReportForm.hero.secondaryCtaLabel,
        href: impactReportForm.hero.secondaryCtaHref,
      },
      primaryCtaColor: impactReportForm.hero.primaryCtaColor,
      secondaryCtaColor: impactReportForm.hero.secondaryCtaColor,
      bubbles: impactReportForm.hero.bubblesCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      backgroundColor: composeGradient(
        impactReportForm.hero.degree,
        impactReportForm.hero.color1,
        impactReportForm.hero.color2,
        impactReportForm.hero.gradientOpacity,
      ),
      backgroundImage:
        impactReportForm.hero.backgroundImagePreview ||
        impactReportForm.hero.backgroundImageUrl ||
        null,
      backgroundImageGrayscale: impactReportForm.hero.backgroundGrayscale,
    }),
    [impactReportForm.hero],
  );

  const debouncedHeroOverride = useDebouncedValue(liveHeroOverride, 300);

  // Build and debounce the preview mission override
  const liveMissionOverride = useMemo(() => {
    const missionTitleGradient = composeGradient(
      impactReportForm.mission.titleGradientDegree,
      impactReportForm.mission.titleGradientColor1,
      impactReportForm.mission.titleGradientColor2,
      impactReportForm.mission.titleGradientOpacity ?? 1,
    );
    const missionTitleUnderlineGradient = composeSimpleGradient(
      impactReportForm.mission.titleUnderlineGradientDegree,
      impactReportForm.mission.titleUnderlineGradientColor1,
      impactReportForm.mission.titleUnderlineGradientColor2,
    );
    return {
      enabled: impactReportForm.mission.enabled,
      ariaLabel: impactReportForm.mission.ariaLabel,
      layoutVariant: impactReportForm.mission.layoutVariant,
      textAlign: impactReportForm.mission.textAlign,
      animationsEnabled: impactReportForm.mission.animationsEnabled,
      title: impactReportForm.mission.title,
      titleColor: impactReportForm.mission.titleColor || undefined,
      titleGradient: missionTitleGradient,
      titleUnderlineGradient: missionTitleUnderlineGradient,
      badgeLabel: impactReportForm.mission.badgeLabel,
      badgeIcon: impactReportForm.mission.badgeIcon,
      badgeTextColor: impactReportForm.mission.badgeTextColor || undefined,
      badgeBgColor: impactReportForm.mission.badgeBgColor || undefined,
      badgeBorderColor: impactReportForm.mission.badgeBorderColor || undefined,
      statementTitle: impactReportForm.mission.statementTitle,
      statementTitleColor:
        impactReportForm.mission.statementTitleColor || undefined,
      statementText: impactReportForm.mission.statementText,
      statementTextColor:
        impactReportForm.mission.statementTextColor || undefined,
      statementMeta: impactReportForm.mission.statementMeta,
      statementMetaColor:
        impactReportForm.mission.statementMetaColor || undefined,
      serial: impactReportForm.mission.serial,
      serialColor: impactReportForm.mission.serialColor || undefined,
      statsTitle: impactReportForm.mission.statsTitle || undefined,
      statsTitleColor: impactReportForm.mission.statsTitleColor || undefined,
      statsEqualizer: impactReportForm.mission.statsEqualizer,
      backgroundColor: composeGradient(
        impactReportForm.mission.degree,
        impactReportForm.mission.color1,
        impactReportForm.mission.color2,
        impactReportForm.mission.gradientOpacity,
      ),
      stats: impactReportForm.mission.stats.map((s) => ({
        id: s.id,
        number: s.number,
        label: s.label,
        color: s.color,
        action: s.action,
        modalId: s.modalId ?? null,
        iconKey: s.iconKey || undefined,
        numberSource: s.numberSource || "explicit",
      })),
      backgroundLogo: impactReportForm.mission.backgroundLogo,
      modals: [
        {
          id: "disciplines",
          title: impactReportForm.mission.modalTitle || "Artistic Disciplines",
          items: impactReportForm.mission.disciplinesItems
            .filter((item) => item.name?.trim().length > 0)
            .map((item) => ({
              name: item.name,
              iconKey: item.iconKey || undefined,
            })),
        },
      ],
    };
  }, [impactReportForm.mission]);
  const debouncedMissionOverride = useDebouncedValue(liveMissionOverride, 300);

  // Viewport simulator (desktop/tablet/mobile artboard)
  const VIEWPORTS = [
    { label: "Desktop 1440×900", width: 1440, height: 900 },
    { label: "Laptop 1280×800", width: 1280, height: 800 },
    { label: "Tablet 1024×768", width: 1024, height: 768 },
    { label: "Mobile 390×844", width: 390, height: 844 },
  ] as const;
  const [viewportIdx, setViewportIdx] = useState<number>(0);
  const artboardRef = useRef<HTMLDivElement | null>(null);
  const artboardOuterRef = useRef<HTMLDivElement | null>(null);
  const rightPaneRef = useRef<HTMLDivElement | null>(null);
  const [artboardScale, setArtboardScale] = useState<number>(1);

  useEffect(() => {
    function recomputeScale() {
      const outer = artboardOuterRef.current;
      if (!outer) return;
      const { width: availW, height: availH } = outer.getBoundingClientRect();
      const vp = VIEWPORTS[viewportIdx];
      if (!vp) return;
      // Fit by width; allow height to overflow to enable scrolling inside the simulated viewport
      const scale = Math.max(0.1, Math.min(1, availW / vp.width));
      setArtboardScale(scale);
    }
    recomputeScale();
    const ro = new ResizeObserver(recomputeScale);
    if (artboardOuterRef.current) ro.observe(artboardOuterRef.current);
    window.addEventListener("resize", recomputeScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recomputeScale);
    };
  }, [viewportIdx]);

  // Ensure inner scrollable panes are top-aligned on mount
  useEffect(() => {
    if (artboardRef.current) {
      artboardRef.current.scrollTop = 0;
    }
    if (rightPaneRef.current) {
      rightPaneRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <FrostedScope>
      <ScreenGrid>
        <Grid
          item
          container
          spacing={{ xs: 2, md: 3 }}
          sx={{ width: "100%", px: { xs: 1, sm: 2, md: 3 } }}
        >
          {/* Left column: title + permanent preview */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              // Left pane no longer scrolls; scroll is inside the preview itself
              maxHeight: "none",
              overflow: "visible",
              pr: { md: 1 },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h2"
                color="white"
                sx={{
                  mb: 1,
                  textAlign: { xs: "center", md: "left" },
                  fontFamily:
                    "'Airwaves', 'Century Gothic', 'Arial', sans-serif",
                }}
              >
                Customize Impact Report
              </Typography>
              <Typography
                variant="subtitle1"
                color="white"
                sx={{
                  mb: 2,
                  textAlign: { xs: "center", md: "left" },
                  maxWidth: 600,
                }}
              >
                Customize all sections of the impact report to match your
                organization's needs
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 1,
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <TextField
                    select
                    size="small"
                    value={viewportIdx}
                    onChange={(e) => setViewportIdx(Number(e.target.value))}
                    sx={{
                      minWidth: 220,
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255,255,255,0.06)",
                        color: "white",
                      },
                    }}
                  >
                    {VIEWPORTS.map((vp, i) => (
                      <MenuItem key={vp.label} value={i}>
                        {vp.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
              <Box
                ref={artboardOuterRef}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  // Do not scroll the wrapper; the artboard scrolls
                  overflow: "hidden",
                  // Match the visual "window" height; enough to feel like a viewport
                  height: { xs: "60vh", md: "calc(100vh - 160px)" },
                }}
              >
                <CustomPaper
                  sx={{
                    p: 0,
                    overflow: "hidden",
                    // The paper matches the scaled artboard size exactly
                    width: `${VIEWPORTS[viewportIdx].width * artboardScale}px`,
                    height: `${VIEWPORTS[viewportIdx].height * artboardScale}px`,
                  }}
                >
                  <PreviewFrame>
                    <Box
                      ref={artboardRef}
                      sx={{
                        borderRadius: 2,
                        // Scroll inside the simulated viewport
                        overflowY: "auto",
                        overflowX: "hidden",
                        WebkitOverflowScrolling: "touch",
                        boxShadow:
                          currentTab === 1 && flashPreviewHero
                            ? `0 0 0 3px ${COLORS.gogo_blue}`
                            : "none",
                        transition: "box-shadow 0.3s ease",
                        // Artboard (large viewport) simulated via transform scale
                        width: `${VIEWPORTS[viewportIdx].width}px`,
                        height: `${VIEWPORTS[viewportIdx].height}px`,
                        transform: `scale(${artboardScale})`,
                        transformOrigin: "top left",
                        background: "#0f1118",
                        // Make the outer paper size fit the scaled artboard
                        // (parent Box uses its own size, here we just ensure we don't overflow)
                      }}
                      style={{
                        // Dynamic inline style to help layout compute scaled height
                        marginBottom: `${Math.max(0, VIEWPORTS[viewportIdx].height * artboardScale * 0.02)}px`,
                      }}
                    >
                      {currentTab === 0 ? (
                        <Box sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            {(defaultSwatch ?? []).map((c, i) => {
                              const text = getReadableTextColor(c);
                              const accent =
                                (defaultSwatch ?? [])[
                                  (i + 1) % (defaultSwatch?.length || 1) || 0
                                ] || c;
                              const subtle = withAlphaHex(
                                text === "#ffffff" ? "#000000" : "#ffffff",
                                0.08,
                              );
                              return (
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  key={`swatch-preview-left-${i}`}
                                >
                                  <Box
                                    sx={{
                                      position: "relative",
                                      minHeight: 160,
                                      borderRadius: 2,
                                      overflow: "hidden",
                                      boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
                                      border:
                                        "1px solid rgba(255,255,255,0.08)",
                                      background: c,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: "30%",
                                        backgroundImage: `repeating-linear-gradient(0deg, ${subtle}, ${subtle} 6px, transparent 6px, transparent 14px)`,
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        right: -20,
                                        top: -20,
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        background: withAlphaHex(accent, 0.35),
                                        border: `4px solid ${withAlphaHex(text, 0.4)}`,
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        left: "38%",
                                        bottom: 12,
                                        width: 0,
                                        height: 0,
                                        borderLeft: "26px solid transparent",
                                        borderRight: "26px solid transparent",
                                        borderBottom: `46px solid ${withAlphaHex(accent, 0.8)}`,
                                        filter:
                                          "drop-shadow(0 3px 8px rgba(0,0,0,0.28))",
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        left: 16,
                                        top: 16,
                                        color: text,
                                      }}
                                    >
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: 900,
                                          letterSpacing: 0.2,
                                          textShadow:
                                            text === "#ffffff"
                                              ? "0 1px 2px rgba(0,0,0,0.25)"
                                              : "0 1px 0 rgba(255,255,255,0.35)",
                                        }}
                                      >
                                        Preview
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ opacity: 0.92 }}
                                      >
                                        {toHex(c)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>
                      ) : currentTab === 1 ? (
                        <MemoHeroSection
                          previewMode
                          heroOverride={debouncedHeroOverride}
                        />
                      ) : currentTab === 2 ? (
                        <MemoMissionSection
                          previewMode
                          missionOverride={debouncedMissionOverride as any}
                        />
                      ) : (
                        <MemoHeroSection
                          previewMode
                          heroOverride={debouncedHeroOverride}
                        />
                      )}
                    </Box>
                  </PreviewFrame>
                </CustomPaper>
              </Box>
            </Box>
          </Grid>

          {/* Right column: header + tabs + forms (independently scrollable) */}
          <Grid
            item
            xs={12}
            md={4}
            ref={rightPaneRef}
            sx={{
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
              pl: { md: 1 },
            }}
          >
            {/* Sticky group: actions box then tabs box */}
            <Box
              sx={{
                position: "sticky",
                top: 16,
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mb: 2,
              }}
            >
              <CustomPaper sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Editor
                    </Typography>
                    {isDirty ? (
                      <Typography variant="body2" color="warning.main">
                        Unsaved changes
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        {lastSavedAt
                          ? `All changes saved · ${lastSavedAt.toLocaleTimeString()}`
                          : "No recent changes"}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip
                      title={
                        heroUploadPct !== null
                          ? "Please wait for the upload to finish"
                          : ""
                      }
                      disableHoverListener={heroUploadPct === null}
                    >
                      <span>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={isSubmitting || heroUploadPct !== null}
                          sx={{
                            bgcolor: COLORS.gogo_blue,
                            "&:hover": { bgcolor: "#0066cc" },
                          }}
                        >
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                      </span>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleDiscard}
                      disabled={!isDirty}
                    >
                      Discard Changes
                    </Button>
                  </Box>
                </Box>
              </CustomPaper>
              <CustomPaper sx={{ p: 0 }}>
                <Tabs
                  value={currentTab}
                  onChange={(_, newValue) => {
                    if (isDirty) {
                      enqueueSnackbar(
                        "Save or discard changes before switching tabs",
                        { variant: "info" },
                      );
                      return;
                    }
                    setCurrentTab(newValue);
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    "& .MuiTab-root": {
                      color: "rgba(255,255,255,0.7)",
                      minWidth: { xs: "auto", sm: 120 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      borderRadius: 1,
                      textTransform: "none",
                      "&.Mui-disabled": {
                        opacity: 0.45,
                        color: "rgba(255,255,255,0.35)",
                      },
                      "&.Mui-selected": {
                        color: COLORS.gogo_blue,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        WebkitBackdropFilter: "blur(6px) saturate(140%)",
                        backdropFilter: "blur(6px) saturate(140%)",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: COLORS.gogo_blue,
                    },
                  }}
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.value}
                      label={tab.label}
                      value={tab.value}
                      disabled={isDirty}
                    />
                  ))}
                </Tabs>
              </CustomPaper>
            </Box>

            {/* Tab content */}
            <CustomPaper
              sx={{
                p: { xs: 2, sm: 3 },
                minHeight: { xs: 400, md: 600 },
                overflow: "auto",
              }}
            >
              {/* Defaults */}
              {currentTab === 0 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily:
                          "'Airwaves', 'Century Gothic', 'Arial', sans-serif",
                      }}
                    >
                      Overall Defaults
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.1)" }} />
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Default Swatch
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {Array.from({ length: DEFAULT_SWATCH_SIZE }).map(
                          (_, i) => {
                            const c = (defaultSwatch ?? [])[i] ?? "#1946f5";
                            return (
                              <button
                                key={`swatch-${i}`}
                                type="button"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 6,
                                  background: c,
                                  border: "1px solid rgba(255,255,255,0.25)",
                                  cursor: "pointer",
                                }}
                                title={`${c} (slot ${i + 1})`}
                                aria-label={`${c} (slot ${i + 1})`}
                                onClick={(e) => {
                                  setSelectedSwatchIndex(i);
                                  setDefaultsPickerValue(c);
                                  setDefaultsPickerAnchor(
                                    e.currentTarget as HTMLElement,
                                  );
                                }}
                              />
                            );
                          },
                        )}
                        <Button
                          variant="text"
                          onClick={() => {
                            const brand = [
                              COLORS.gogo_blue,
                              COLORS.gogo_purple,
                              COLORS.gogo_teal,
                              COLORS.gogo_yellow,
                              COLORS.gogo_pink,
                              COLORS.gogo_green,
                            ];
                            const normalized = Array.from({
                              length: DEFAULT_SWATCH_SIZE,
                            }).map((_, i) => brand[i % brand.length]);
                            setDefaultSwatch(normalized);
                            setIsDirty(true);
                          }}
                        >
                          Reset to Brand
                        </Button>
                      </Box>
                      <ColorPickerPopover
                        open={defaultsPickerOpen}
                        anchorEl={defaultsPickerAnchor}
                        onClose={() => {
                          setDefaultsPickerAnchor(null);
                          setSelectedSwatchIndex(null);
                        }}
                        value={defaultsPickerValue}
                        onChange={(val) => {
                          setDefaultsPickerValue(val);
                          if (selectedSwatchIndex != null) {
                            const base = (defaultSwatch ?? []).slice(
                              0,
                              DEFAULT_SWATCH_SIZE,
                            );
                            while (base.length < DEFAULT_SWATCH_SIZE)
                              base.push("#1946f5");
                            base[selectedSwatchIndex] = val;
                            setDefaultSwatch(base);
                            setIsDirty(true);
                          }
                        }}
                        presets={defaultSwatch ?? undefined}
                      />
                      {/* Confirm update button */}
                      {defaultsPickerOpen && selectedSwatchIndex != null && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              const base = (defaultSwatch ?? []).slice(
                                0,
                                DEFAULT_SWATCH_SIZE,
                              );
                              while (base.length < DEFAULT_SWATCH_SIZE)
                                base.push("#1946f5");
                              base[selectedSwatchIndex] = defaultsPickerValue;
                              setDefaultSwatch(base);
                              setDefaultsPickerAnchor(null);
                              setSelectedSwatchIndex(null);
                              setIsDirty(true);
                            }}
                          >
                            Use This Color
                          </Button>
                        </Box>
                      )}
                    </Grid>
                    {/* Swatch Preview moved to left viewport preview */}
                  </Grid>
                </Box>
              )}

              {/* Hero Section */}
              {currentTab === 1 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily:
                          "'Airwaves', 'Century Gothic', 'Arial', sans-serif",
                      }}
                    >
                      Hero Section
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={impactReportForm.hero.enabled}
                          onChange={(e) =>
                            handleSectionChange(
                              "hero",
                              "enabled",
                              e.target.checked,
                            )
                          }
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: COLORS.gogo_blue,
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: COLORS.gogo_blue,
                              },
                          }}
                        />
                      }
                      label="Enable Section"
                      sx={{ color: "white" }}
                    />
                  </Box>
                  <Divider sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.1)" }} />

                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Structure & accessibility */}
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="ARIA Label"
                        value={impactReportForm.mission.ariaLabel}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "ariaLabel",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        select
                        label="Text Alignment"
                        value={impactReportForm.mission.textAlign}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "textAlign",
                            e.target.value as MissionTextAlign,
                          )
                        }
                        fullWidth
                      >
                        {MISSION_TEXT_ALIGN_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <CustomTextField
                        select
                        label="Layout Variant"
                        value={impactReportForm.mission.layoutVariant}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "layoutVariant",
                            e.target.value as MissionLayoutVariant,
                          )
                        }
                        fullWidth
                      >
                        {MISSION_LAYOUT_VARIANTS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option === "ticket" ? "Ticket" : "Default"}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={impactReportForm.mission.animationsEnabled}
                            onChange={(e) =>
                              handleSectionChange(
                                "mission",
                                "animationsEnabled",
                                e.target.checked,
                              )
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: COLORS.gogo_blue,
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  backgroundColor: COLORS.gogo_blue,
                                },
                            }}
                          />
                        }
                        label="Enable Animations"
                        sx={{ color: "white" }}
                      />
                    </Grid>

                    {/* Basics */}
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Hero Title"
                        value={impactReportForm.hero.title}
                        onChange={(e) =>
                          handleSectionChange("hero", "title", e.target.value)
                        }
                        fullWidth
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("titleColor");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          mt: 1,
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background:
                              impactReportForm.hero.titleColor || "#ffffff",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Text color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Hero Subtitle"
                        value={impactReportForm.hero.subtitle}
                        onChange={(e) =>
                          handleSectionChange(
                            "hero",
                            "subtitle",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("subtitleColor");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          mt: 1,
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background:
                              impactReportForm.hero.subtitleColor || "#77ddab",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Text color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <CustomTextField
                        label="Year"
                        value={impactReportForm.hero.year}
                        onChange={(e) =>
                          handleSectionChange("hero", "year", e.target.value)
                        }
                        fullWidth
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("yearColor");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          mt: 1,
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background:
                              impactReportForm.hero.yearColor || "#e9bb4d",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Text color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <CustomTextField
                        label="Tagline"
                        value={impactReportForm.hero.tagline}
                        onChange={(e) =>
                          handleSectionChange("hero", "tagline", e.target.value)
                        }
                        fullWidth
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("taglineColor");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          mt: 1,
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background:
                              impactReportForm.hero.taglineColor ||
                              COLORS.gogo_green,
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Text color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <CustomTextField
                        label="Bubbles (comma separated)"
                        value={impactReportForm.hero.bubblesCsv}
                        onChange={(e) =>
                          handleSectionChange(
                            "hero",
                            "bubblesCsv",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                    </Grid>

                    {/* CTAs */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Call To Action Buttons
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Primary CTA Label"
                        value={impactReportForm.hero.primaryCtaLabel}
                        onChange={(e) =>
                          handleSectionChange(
                            "hero",
                            "primaryCtaLabel",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("primaryCtaColor");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          mt: 1,
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background:
                              impactReportForm.hero.primaryCtaColor ||
                              "#ffffff",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Text color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Primary CTA Link (URL)"
                        value={impactReportForm.hero.primaryCtaHref}
                        onChange={(e) =>
                          handleSectionChange(
                            "hero",
                            "primaryCtaHref",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Secondary CTA Label"
                        value={impactReportForm.hero.secondaryCtaLabel}
                        onChange={(e) =>
                          handleSectionChange(
                            "hero",
                            "secondaryCtaLabel",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("secondaryCtaColor");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          mt: 1,
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background:
                              impactReportForm.hero.secondaryCtaColor ||
                              "#ffffff",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Text color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Secondary CTA Link (URL)"
                        value={impactReportForm.hero.secondaryCtaHref}
                        onChange={(e) =>
                          handleSectionChange(
                            "hero",
                            "secondaryCtaHref",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                    </Grid>

                    {/* Gradient */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Background Gradient
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.7)"
                          >
                            Degree
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {impactReportForm.hero.degree}°
                            </Typography>
                            <DegreePicker
                              value={impactReportForm.hero.degree}
                              onChange={(deg) =>
                                handleSectionChange(
                                  "hero",
                                  "degree",
                                  Math.max(1, Math.min(360, deg || 180)),
                                )
                              }
                              size={140}
                            />
                          </Box>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sx={{
                            ml: { md: 1.5 },
                            mr: { md: -0.5 },
                            display: { md: "flex" },
                            justifyContent: { md: "flex-start" },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                color="rgba(255,255,255,0.7)"
                              >
                                Color 1
                              </Typography>
                              <Button
                                variant="outlined"
                                onClick={(e) => {
                                  setColorPickerField("color1");
                                  setColorPickerAnchor(
                                    e.currentTarget as HTMLElement,
                                  );
                                }}
                                sx={{
                                  mt: 0.5,
                                  minWidth: 48,
                                  px: 1,
                                  borderColor: "rgba(255,255,255,0.3)",
                                  color: "rgba(255,255,255,0.9)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: 18,
                                    height: 18,
                                    borderRadius: 3,
                                    background: impactReportForm.hero.color1,
                                    border: "1px solid rgba(255,255,255,0.2)",
                                  }}
                                />
                                Pick
                              </Button>
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                color="rgba(255,255,255,0.7)"
                              >
                                Color 2
                              </Typography>
                              <Button
                                variant="outlined"
                                onClick={(e) => {
                                  setColorPickerField("color2");
                                  setColorPickerAnchor(
                                    e.currentTarget as HTMLElement,
                                  );
                                }}
                                sx={{
                                  mt: 0.5,
                                  minWidth: 48,
                                  px: 1,
                                  borderColor: "rgba(255,255,255,0.3)",
                                  color: "rgba(255,255,255,0.9)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: 18,
                                    height: 18,
                                    borderRadius: 3,
                                    background: impactReportForm.hero.color2,
                                    border: "1px solid rgba(255,255,255,0.2)",
                                  }}
                                />
                                Pick
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ ml: { md: -2 } }}>
                          <Box
                            sx={{
                              width: 140,
                              height: 140,
                              borderRadius: 1,
                              border: "1px solid rgba(255,255,255,0.1)",
                              background: composeGradient(
                                impactReportForm.hero.degree,
                                impactReportForm.hero.color1,
                                impactReportForm.hero.color2,
                                impactReportForm.hero.gradientOpacity,
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <ColorPickerPopover
                      open={openColorPicker}
                      anchorEl={colorPickerAnchor}
                      onClose={() => {
                        setColorPickerAnchor(null);
                        setColorPickerField(null);
                      }}
                      value={currentPickerColor}
                      onChange={(val) => {
                        if (!colorPickerField) return;
                        handleSectionChange("hero", colorPickerField, val);
                      }}
                      presets={defaultSwatch ?? undefined}
                    />
                    <Grid item xs={12} md={9}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.7)"
                        >
                          Gradient Opacity
                        </Typography>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={impactReportForm.hero.gradientOpacity}
                          onChange={(e) =>
                            handleSectionChange(
                              "hero",
                              "gradientOpacity",
                              Number(e.target.value),
                            )
                          }
                        />
                        <Typography variant="body2">
                          {impactReportForm.hero.gradientOpacity.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Background Image */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Background Image
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleHeroBackgroundUpload}
                          style={{ display: "none" }}
                          ref={(el) => (fileInputRefs.current["hero-bg"] = el)}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          onClick={() =>
                            fileInputRefs.current["hero-bg"]?.click()
                          }
                          sx={{ minWidth: { xs: "100%", sm: "auto" } }}
                        >
                          Upload Background
                        </Button>
                        <Button
                          variant="text"
                          color="error"
                          startIcon={<ClearIcon />}
                          onClick={() => {
                            setImpactReportForm((prev) => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                backgroundImageUrl: null,
                                backgroundImagePreview: null,
                                backgroundImageFile: null,
                              },
                            }));
                            setIsDirty(true);
                            enqueueSnackbar("Background cleared", {
                              variant: "info",
                            });
                          }}
                          disabled={
                            !impactReportForm.hero.backgroundImageUrl &&
                            !impactReportForm.hero.backgroundImagePreview
                          }
                        >
                          Clear Background
                        </Button>
                        {heroUploadPct !== null && (
                          <Box sx={{ flex: 1, minWidth: 180 }}>
                            <LinearProgress
                              variant="determinate"
                              value={heroUploadPct}
                            />
                            <Typography
                              variant="caption"
                              color="rgba(255,255,255,0.7)"
                            >
                              {heroUploadPct}%
                            </Typography>
                          </Box>
                        )}
                        {heroUploadPct === null &&
                          impactReportForm.hero.backgroundImagePreview && (
                            <Box
                              sx={{
                                width: { xs: "100%", sm: 120 },
                                height: { xs: 140, sm: 70 },
                                overflow: "hidden",
                                borderRadius: 1,
                                minWidth: { xs: "auto", sm: 120 },
                              }}
                            >
                              <img
                                src={
                                  impactReportForm.hero.backgroundImagePreview
                                }
                                alt="Background preview"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  filter: impactReportForm.hero
                                    .backgroundGrayscale
                                    ? "grayscale(1)"
                                    : undefined,
                                }}
                              />
                            </Box>
                          )}
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                impactReportForm.hero.backgroundGrayscale
                              }
                              onChange={(e) =>
                                handleSectionChange(
                                  "hero",
                                  "backgroundGrayscale",
                                  e.target.checked,
                                )
                              }
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: COLORS.gogo_blue,
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                  {
                                    backgroundColor: COLORS.gogo_blue,
                                  },
                              }}
                            />
                          }
                          label="Render background image in grayscale (gradient and text stay color)"
                          sx={{ color: "white" }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            display: "block",
                          }}
                        >
                          Note: The preview frame is approximate. The background
                          image may not align exactly with other elements on the
                          final page.
                        </Typography>
                      </Box>
                    </Grid>
                    {/* Background image is always 100% opacity; no alt field */}

                    {/* Accessibility */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Accessibility
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="ARIA Label"
                        value={impactReportForm.hero.ariaLabel}
                        onChange={(e) =>
                          handleSectionChange(
                            "hero",
                            "ariaLabel",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                    </Grid>

                    {/* Preview removed from here; now permanently on the left */}
                  </Grid>
                </Box>
              )}

              {/* Mission Section */}
              {currentTab === 2 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily:
                          "'Airwaves', 'Century Gothic', 'Arial', sans-serif",
                      }}
                    >
                      Mission Section
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={impactReportForm.mission.enabled}
                          onChange={(e) =>
                            handleSectionChange(
                              "mission",
                              "enabled",
                              e.target.checked,
                            )
                          }
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: COLORS.gogo_blue,
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: COLORS.gogo_blue,
                              },
                          }}
                        />
                      }
                      label="Enable Section"
                      sx={{ color: "white" }}
                    />
                  </Box>
                  <Divider sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.1)" }} />

                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Basics */}
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Mission Title"
                        value={impactReportForm.mission.title}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "title",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("titleColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            mt: 1,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.titleColor ||
                                "#ffffff",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Title text color
                        </Button>
                      </Box>
                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Title Gradient
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Angle: {impactReportForm.mission.titleGradientDegree}°
                        </Typography>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={impactReportForm.mission.titleGradientDegree}
                          onChange={(e) =>
                            updateMissionTitleGradient({
                              titleGradientDegree: Number(e.target.value),
                            })
                          }
                          style={{ flex: 1, minWidth: 160 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mt: 1,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("titleGradientColor1");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.titleGradientColor1,
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Color A
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("titleGradientColor2");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.titleGradientColor2,
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Color B
                        </Button>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Opacity:{" "}
                          {impactReportForm.mission.titleGradientOpacity.toFixed(
                            2,
                          )}
                        </Typography>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={impactReportForm.mission.titleGradientOpacity}
                          onChange={(e) =>
                            updateMissionTitleGradient({
                              titleGradientOpacity: Number(e.target.value),
                            })
                          }
                          style={{ flex: 1, minWidth: 160 }}
                        />
                      </Box>
                      <Typography variant="subtitle2" sx={{ mt: 3 }}>
                        Title Underline Gradient
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Angle:{" "}
                          {
                            impactReportForm.mission
                              .titleUnderlineGradientDegree
                          }
                          °
                        </Typography>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={
                            impactReportForm.mission
                              .titleUnderlineGradientDegree
                          }
                          onChange={(e) =>
                            updateMissionUnderlineGradient({
                              titleUnderlineGradientDegree: Number(
                                e.target.value,
                              ),
                            })
                          }
                          style={{ flex: 1, minWidth: 160 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mt: 1,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField(
                              "titleUnderlineGradientColor1",
                            );
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission
                                  .titleUnderlineGradientColor1,
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Underline A
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField(
                              "titleUnderlineGradientColor2",
                            );
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission
                                  .titleUnderlineGradientColor2,
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Underline B
                        </Button>
                      </Box>
                      <CustomTextField
                        label="Badge Label"
                        value={impactReportForm.mission.badgeLabel}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "badgeLabel",
                            e.target.value,
                          )
                        }
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                      <CustomTextField
                        select
                        label="Badge Icon Type"
                        value={badgeIconType}
                        onChange={(e) => {
                          const nextType = e.target
                            .value as MissionBadgeIcon["type"];
                          const fallbackValue =
                            nextType === "glyph"
                              ? badgeIconType === "glyph"
                                ? badgeIconValue
                                : "♫"
                              : badgeIconType === "iconKey" && badgeIconValue
                                ? badgeIconValue
                                : (MISSION_ICON_LIBRARY[0]?.key ?? "");
                          handleSectionChange("mission", "badgeIcon", {
                            type: nextType,
                            value: fallbackValue,
                          });
                        }}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        <MenuItem value="glyph">Glyph</MenuItem>
                        <MenuItem value="iconKey">Icon</MenuItem>
                      </CustomTextField>
                      {badgeIconType === "glyph" ? (
                        <CustomTextField
                          label="Badge Glyph"
                          value={badgeIconValue}
                          onChange={(e) =>
                            handleSectionChange("mission", "badgeIcon", {
                              type: "glyph",
                              value: e.target.value,
                            })
                          }
                          fullWidth
                          sx={{ mt: 2 }}
                          placeholder="e.g. ♫"
                        />
                      ) : (
                        <CustomTextField
                          select
                          label="Badge Icon"
                          value={badgeIconValue || ""}
                          onChange={(e) =>
                            handleSectionChange("mission", "badgeIcon", {
                              type: "iconKey",
                              value: e.target.value,
                            })
                          }
                          fullWidth
                          sx={{ mt: 2 }}
                        >
                          {MISSION_ICON_LIBRARY.map((icon) => (
                            <MenuItem key={icon.key} value={icon.key}>
                              {icon.label}
                            </MenuItem>
                          ))}
                        </CustomTextField>
                      )}
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("badgeTextColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.badgeTextColor ||
                                "rgba(255,255,255,0.8)",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Badge text
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("badgeBgColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.badgeBgColor ||
                                "rgba(0,0,0,0.4)",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Badge background
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("badgeBorderColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.badgeBorderColor ||
                                "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Badge border
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Statement Title"
                        value={impactReportForm.mission.statementTitle}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "statementTitle",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("statementTitleColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            mt: 1,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.statementTitleColor ||
                                "#ffffff",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Title color
                        </Button>
                      </Box>
                    </Grid>

                    {/* Statement and Meta */}
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Statement Text"
                        value={impactReportForm.mission.statementText}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "statementText",
                            e.target.value,
                          )
                        }
                        fullWidth
                        multiline
                        minRows={5}
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("statementTextColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            mt: 1,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.statementTextColor ||
                                "#b8ffe9",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Text color
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Statement Meta"
                        value={impactReportForm.mission.statementMeta}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "statementMeta",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("statementMetaColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            mt: 1,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.statementMetaColor ||
                                "rgba(255,255,255,0.75)",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Meta color
                        </Button>
                      </Box>
                      <CustomTextField
                        label="Serial"
                        value={impactReportForm.mission.serial}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "serial",
                            e.target.value,
                          )
                        }
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setMissionColorPickerField("serialColor");
                            setMissionColorPickerAnchor(
                              e.currentTarget as HTMLElement,
                            );
                          }}
                          sx={{
                            mt: 1,
                            borderColor: "rgba(255,255,255,0.3)",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background:
                                impactReportForm.mission.serialColor ||
                                "rgba(255,255,255,0.55)",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          &nbsp;Serial color
                        </Button>
                      </Box>
                    </Grid>

                    {/* Background controls */}
                    <Grid item xs={12}>
                      <Divider
                        sx={{ my: 1.5, bgcolor: "rgba(255,255,255,0.08)" }}
                      />
                      <Typography variant="h6" sx={{ mb: 1.5 }}>
                        Background
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Gradient Angle: {impactReportForm.mission.degree}°
                      </Typography>
                      <input
                        type="range"
                        min={1}
                        max={360}
                        step={1}
                        value={impactReportForm.mission.degree}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "degree",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "100%" }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Color Stop 1
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("color1");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background: impactReportForm.mission.color1,
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Pick color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Color Stop 2
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setColorPickerField("color2");
                          setColorPickerAnchor(e.currentTarget as HTMLElement);
                        }}
                        sx={{
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background: impactReportForm.mission.color2,
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Pick color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Gradient Opacity:{" "}
                        {impactReportForm.mission.gradientOpacity.toFixed(2)}
                      </Typography>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={impactReportForm.mission.gradientOpacity}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "gradientOpacity",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "100%" }}
                      />
                    </Grid>

                    {/* Background logo */}
                    <Grid item xs={12}>
                      <Divider
                        sx={{ my: 1.5, bgcolor: "rgba(255,255,255,0.08)" }}
                      />
                      <Typography variant="h6" sx={{ mb: 1.5 }}>
                        Background Logo
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={backgroundLogoState.enabled}
                            onChange={(e) =>
                              handleSectionChange("mission", "backgroundLogo", {
                                ...backgroundLogoState,
                                enabled: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Show background logo"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        select
                        label="Logo"
                        value={backgroundLogoState.svgKey || ""}
                        onChange={(e) =>
                          handleSectionChange("mission", "backgroundLogo", {
                            ...backgroundLogoState,
                            svgKey: e.target.value,
                          })
                        }
                        fullWidth
                        disabled={!backgroundLogoState.enabled}
                      >
                        {BACKGROUND_LOGO_OPTIONS.map((opt) => (
                          <MenuItem key={opt.key} value={opt.key}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Logo opacity:{" "}
                        {(backgroundLogoState.opacity ?? 0.08).toFixed(2)}
                      </Typography>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={backgroundLogoState.opacity ?? 0.08}
                        onChange={(e) =>
                          handleSectionChange("mission", "backgroundLogo", {
                            ...backgroundLogoState,
                            opacity: Number(e.target.value),
                          })
                        }
                        style={{ width: "100%" }}
                        disabled={!backgroundLogoState.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Rotation: {backgroundLogoState.rotationDeg ?? 90}°
                      </Typography>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={backgroundLogoState.rotationDeg ?? 90}
                        onChange={(e) =>
                          handleSectionChange("mission", "backgroundLogo", {
                            ...backgroundLogoState,
                            rotationDeg: Number(e.target.value),
                          })
                        }
                        style={{ width: "100%" }}
                        disabled={!backgroundLogoState.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Scale: {(backgroundLogoState.scale ?? 0.82).toFixed(2)}
                      </Typography>
                      <input
                        type="range"
                        min={0.2}
                        max={2}
                        step={0.01}
                        value={backgroundLogoState.scale ?? 0.82}
                        onChange={(e) =>
                          handleSectionChange("mission", "backgroundLogo", {
                            ...backgroundLogoState,
                            scale: Number(e.target.value),
                          })
                        }
                        style={{ width: "100%" }}
                        disabled={!backgroundLogoState.enabled}
                      />
                    </Grid>

                    {/* Stats editor */}
                    <Grid item xs={12}>
                      <Divider
                        sx={{ my: 1.5, bgcolor: "rgba(255,255,255,0.08)" }}
                      />
                      <Typography variant="h6" sx={{ mb: 1.5 }}>
                        At a Glance (Stats)
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Stats Title"
                        value={impactReportForm.mission.statsTitle || ""}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "statsTitle",
                            e.target.value,
                          )
                        }
                        fullWidth
                        placeholder="At a Glance"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setMissionColorPickerField("statsTitleColor");
                          setMissionColorPickerAnchor(
                            e.currentTarget as HTMLElement,
                          );
                        }}
                        sx={{
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            background:
                              impactReportForm.mission.statsTitleColor ||
                              "rgba(255,255,255,0.7)",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        &nbsp;Stats title color
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              impactReportForm.mission.statsEqualizer.enabled
                            }
                            onChange={(e) =>
                              handleSectionChange("mission", "statsEqualizer", {
                                ...impactReportForm.mission.statsEqualizer,
                                enabled: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Show equalizer bars"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Equalizer Bars:{" "}
                        {impactReportForm.mission.statsEqualizer.barCount}
                      </Typography>
                      <input
                        type="range"
                        min={1}
                        max={24}
                        value={impactReportForm.mission.statsEqualizer.barCount}
                        onChange={(e) =>
                          handleSectionChange("mission", "statsEqualizer", {
                            ...impactReportForm.mission.statsEqualizer,
                            barCount: Number(e.target.value),
                          })
                        }
                        style={{ width: "100%" }}
                        disabled={
                          !impactReportForm.mission.statsEqualizer.enabled
                        }
                      />
                    </Grid>
                    {impactReportForm.mission.stats.map((s, idx) => (
                      <Grid item xs={12} md={6} key={`mission-stat-${s.id}`}>
                        <Card
                          variant="outlined"
                          sx={{ bgcolor: "transparent" }}
                        >
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <CustomTextField
                                  label="Label"
                                  value={s.label}
                                  onChange={(e) => {
                                    const next = [
                                      ...impactReportForm.mission.stats,
                                    ];
                                    next[idx] = { ...s, label: e.target.value };
                                    handleSectionChange(
                                      "mission",
                                      "stats",
                                      next,
                                    );
                                  }}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <CustomTextField
                                  label="Number"
                                  value={String(s.number ?? "")}
                                  onChange={(e) => {
                                    const next = [
                                      ...impactReportForm.mission.stats,
                                    ];
                                    next[idx] = {
                                      ...s,
                                      number: e.target.value,
                                    };
                                    handleSectionChange(
                                      "mission",
                                      "stats",
                                      next,
                                    );
                                  }}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <CustomTextField
                                  label="Color"
                                  value={s.color || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...impactReportForm.mission.stats,
                                    ];
                                    next[idx] = { ...s, color: e.target.value };
                                    handleSectionChange(
                                      "mission",
                                      "stats",
                                      next,
                                    );
                                  }}
                                  placeholder="#22C55E"
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <CustomTextField
                                  select
                                  label="Number Source"
                                  value={s.numberSource || "explicit"}
                                  onChange={(e) => {
                                    const next = [
                                      ...impactReportForm.mission.stats,
                                    ];
                                    next[idx] = {
                                      ...s,
                                      numberSource: e.target
                                        .value as MissionStatNumberSource,
                                    };
                                    handleSectionChange(
                                      "mission",
                                      "stats",
                                      next,
                                    );
                                  }}
                                  fullWidth
                                >
                                  <MenuItem value="explicit">
                                    Manual value
                                  </MenuItem>
                                  <MenuItem value="modalItemsLength">
                                    Disciplines count
                                  </MenuItem>
                                </CustomTextField>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <CustomTextField
                                  select
                                  label="Icon"
                                  value={s.iconKey || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...impactReportForm.mission.stats,
                                    ];
                                    next[idx] = {
                                      ...s,
                                      iconKey: e.target.value || null,
                                    };
                                    handleSectionChange(
                                      "mission",
                                      "stats",
                                      next,
                                    );
                                  }}
                                  fullWidth
                                >
                                  <MenuItem value="">Default</MenuItem>
                                  {MISSION_ICON_LIBRARY.map((icon) => (
                                    <MenuItem key={icon.key} value={icon.key}>
                                      {icon.label}
                                    </MenuItem>
                                  ))}
                                </CustomTextField>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={s.action === "openModal"}
                                      onChange={(e) => {
                                        const next = [
                                          ...impactReportForm.mission.stats,
                                        ];
                                        next[idx] = {
                                          ...s,
                                          action: e.target.checked
                                            ? "openModal"
                                            : "none",
                                          modalId: e.target.checked
                                            ? "disciplines"
                                            : null,
                                        };
                                        handleSectionChange(
                                          "mission",
                                          "stats",
                                          next,
                                        );
                                      }}
                                    />
                                  }
                                  label="Opens Disciplines Modal"
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <IconButton
                                  onClick={() => {
                                    const next =
                                      impactReportForm.mission.stats.filter(
                                        (_, i) => i !== idx,
                                      );
                                    handleSectionChange(
                                      "mission",
                                      "stats",
                                      next,
                                    );
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={() => {
                          const next = [
                            ...impactReportForm.mission.stats,
                            {
                              id: uuidv4(),
                              number: "",
                              label: "",
                              color: "#22C55E",
                              action: "none" as const,
                              modalId: null,
                              iconKey: null,
                              numberSource:
                                "explicit" as MissionStatNumberSource,
                            },
                          ];
                          handleSectionChange("mission", "stats", next);
                        }}
                      >
                        Add Stat
                      </Button>
                    </Grid>

                    {/* Disciplines modal editor */}
                    <Grid item xs={12}>
                      <Divider
                        sx={{ my: 1.5, bgcolor: "rgba(255,255,255,0.08)" }}
                      />
                      <Typography variant="h6" sx={{ mb: 1.5 }}>
                        Disciplines Modal
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        label="Modal Title"
                        value={impactReportForm.mission.modalTitle || ""}
                        onChange={(e) =>
                          handleSectionChange(
                            "mission",
                            "modalTitle",
                            e.target.value,
                          )
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Items
                      </Typography>
                      <Grid container spacing={1}>
                        {impactReportForm.mission.disciplinesItems.map(
                          (item, i) => (
                            <Grid item xs={12} md={6} key={`disc-${i}`}>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                }}
                              >
                                <CustomTextField
                                  label={`Item ${i + 1}`}
                                  value={item.name}
                                  onChange={(e) => {
                                    const next = [
                                      ...impactReportForm.mission
                                        .disciplinesItems,
                                    ];
                                    next[i] = { ...item, name: e.target.value };
                                    handleSectionChange(
                                      "mission",
                                      "disciplinesItems",
                                      next,
                                    );
                                  }}
                                  fullWidth
                                />
                                <CustomTextField
                                  select
                                  label="Icon"
                                  value={item.iconKey || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...impactReportForm.mission
                                        .disciplinesItems,
                                    ];
                                    next[i] = {
                                      ...item,
                                      iconKey: e.target.value || null,
                                    };
                                    handleSectionChange(
                                      "mission",
                                      "disciplinesItems",
                                      next,
                                    );
                                  }}
                                  sx={{ minWidth: 140 }}
                                >
                                  <MenuItem value="">Default</MenuItem>
                                  {MISSION_ICON_LIBRARY.map((icon) => (
                                    <MenuItem key={icon.key} value={icon.key}>
                                      {icon.label}
                                    </MenuItem>
                                  ))}
                                </CustomTextField>
                                <IconButton
                                  onClick={() => {
                                    const next =
                                      impactReportForm.mission.disciplinesItems.filter(
                                        (_, idx) => idx !== i,
                                      );
                                    handleSectionChange(
                                      "mission",
                                      "disciplinesItems",
                                      next,
                                    );
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Grid>
                          ),
                        )}
                      </Grid>
                      <Button
                        startIcon={<AddIcon />}
                        variant="outlined"
                        sx={{ mt: 1.5 }}
                        onClick={() => {
                          const next = [
                            ...impactReportForm.mission.disciplinesItems,
                            { name: "", iconKey: null },
                          ];
                          handleSectionChange(
                            "mission",
                            "disciplinesItems",
                            next,
                          );
                        }}
                      >
                        Add Item
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Mission color picker popover */}
                  <ColorPickerPopover
                    open={missionPickerOpen}
                    anchorEl={missionColorPickerAnchor}
                    onClose={() => {
                      setMissionColorPickerAnchor(null);
                      setMissionColorPickerField(null);
                    }}
                    value={currentMissionPickerColor}
                    onChange={(val) => {
                      if (!missionColorPickerField) return;
                      if (missionColorPickerField === "titleGradientColor1") {
                        updateMissionTitleGradient({
                          titleGradientColor1: val,
                        });
                        return;
                      }
                      if (missionColorPickerField === "titleGradientColor2") {
                        updateMissionTitleGradient({
                          titleGradientColor2: val,
                        });
                        return;
                      }
                      if (
                        missionColorPickerField ===
                        "titleUnderlineGradientColor1"
                      ) {
                        updateMissionUnderlineGradient({
                          titleUnderlineGradientColor1: val,
                        });
                        return;
                      }
                      if (
                        missionColorPickerField ===
                        "titleUnderlineGradientColor2"
                      ) {
                        updateMissionUnderlineGradient({
                          titleUnderlineGradientColor2: val,
                        });
                        return;
                      }
                      handleSectionChange(
                        "mission",
                        missionColorPickerField,
                        val,
                      );
                    }}
                    presets={defaultSwatch ?? undefined}
                  />
                </Box>
              )}

              {/* Impact Stats Section removed */}

              {/* Programs Section removed */}

              {/* Locations Section removed */}

              {/* Testimonials Section removed */}
            </CustomPaper>
          </Grid>

          {/* General error */}
          {errors.general && (
            <Grid item xs={12}>
              <Typography variant="body2" color="error" align="center">
                {errors.general}
              </Typography>
            </Grid>
          )}
        </Grid>
      </ScreenGrid>
    </FrostedScope>
  );
}

export default ImpactReportCustomizationPage;

