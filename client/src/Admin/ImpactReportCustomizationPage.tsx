import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Tabs,
  Tab,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import ScreenGrid from '../components/ScreenGrid';
import COLORS from '../../assets/colors';
import HeroSection from '../components/HeroSection';
import MissionSection from '../sections/MissionSection';
import PopulationComponent from '../components/Population';
import { signUpload } from '../services/upload.api';
import { saveMedia } from '../services/media.api';
import {
  fetchHeroContent,
  saveHeroContent,
  fetchMissionContent,
  saveMissionContent,
  fetchPopulationContent,
  savePopulationContent,
  fetchFinancialContent,
  saveFinancialContent,
  fetchMethodContent,
  saveMethodContent,
  fetchCurriculumContent,
  saveCurriculumContent,
  fetchImpactSectionContent,
  saveImpactSectionContent,
  fetchHearOurImpactContent,
  saveHearOurImpactContent,
  fetchTestimonialsContent,
  saveTestimonialsContent,
  fetchNationalImpactContent,
  saveNationalImpactContent,
  fetchFlexAContent,
  saveFlexAContent,
  fetchFlexBContent,
  saveFlexBContent,
  fetchFlexCContent,
  saveFlexCContent,
  fetchImpactLevelsContent,
  saveImpactLevelsContent,
  fetchPartnersContent,
  savePartnersContent,
  fetchFooterContent,
  saveFooterContent,
  fetchDefaults,
  saveDefaults,
  ReorderableSectionKey,
  DEFAULT_SECTION_ORDER,
  SECTION_DISPLAY_NAMES,
  PopulationContent,
  FinancialContent,
  MethodContent,
  CurriculumContent,
  ImpactSectionContent,
  HearOurImpactContent,
  TestimonialsContent,
  NationalImpactContent,
  FlexAContent,
  FlexBContent,
  FlexCContent,
  ImpactLevelsContent,
  PartnersContent,
  FooterContent,
} from '../services/impact.api';
import '../../assets/fonts/fonts.css';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';

// Import from Admin module
import { CustomPaper, FrostedScope, PreviewFrame } from './styles';
import {
  parseGradient,
  toHex,
  composeGradient,
  composeSimpleGradient,
  isValidColorStop,
  useDebouncedValue,
} from './utils';
import {
  ImpactReportForm,
  HeroSectionForm,
  MissionSectionForm,
  ADMIN_TABS,
  AdminTabRouteKey,
  LAST_ADMIN_TAB_STORAGE_KEY,
  DEFAULT_SWATCH_SIZE,
} from './types';

// Import tab editor components
import {
  DefaultsTabEditor,
  DefaultsPreview,
  HeroTabEditor,
  MissionTabEditor,
  PopulationTabEditor,
  FinancialTabEditor,
  MethodTabEditor,
  CurriculumTabEditor,
  ImpactSectionTabEditor,
  HearOurImpactTabEditor,
  TestimonialsTabEditor,
  NationalImpactTabEditor,
  FlexATabEditor,
  FlexBTabEditor,
  FlexCTabEditor,
  ImpactLevelsTabEditor,
  PartnersTabEditor,
  FooterTabEditor,
  validateFinancialPieCharts,
  VersionHistoryModal,
  ComparisonView,
} from './components';

import { type ConfigSnapshot } from '../services/snapshot.api';

import FinancialAnalysisSection from '../components/FinancialAnalysisSection';
import OurMethodSection from '../components/OurMethodSection';
import CurriculumSection from '../components/CurriculumSection';
import ImpactSection from '../components/ImpactSection';
import SpotifyEmbedsSection from '../components/SpotifyEmbedsSection';
import SingleQuoteSection from '../components/SingleQuoteSection';
import LocationsSection from '../sections/LocationsSection';
import FlexA from '../components/FlexA';
import FlexB from '../components/FlexB';
import FlexC from '../components/FlexC';
import ImpactLevelsSection from '../components/ImpactLevelsSection';
import PartnersSection from '../components/PartnersSection';
import FooterSection from '../components/FooterSection';

const MemoHeroSection = React.memo(HeroSection);
const MemoMissionSection = React.memo(MissionSection);
const MemoSpotifyEmbedsSection = React.memo(SpotifyEmbedsSection);
const MemoSingleQuoteSection = React.memo(SingleQuoteSection);
const MemoLocationsSection = React.memo(LocationsSection);
const MemoPopulationComponent = React.memo(PopulationComponent);
const MemoFinancialSection = React.memo(FinancialAnalysisSection);
const MemoMethodSection = React.memo(OurMethodSection);
const MemoCurriculumSection = React.memo(CurriculumSection);
const MemoImpactSection = React.memo(ImpactSection);
const MemoFlexA = React.memo(FlexA);
const MemoFlexB = React.memo(FlexB);
const MemoFlexC = React.memo(FlexC);
const MemoImpactLevelsSection = React.memo(ImpactLevelsSection);
const MemoPartnersSection = React.memo(PartnersSection);
const MemoFooterSection = React.memo(FooterSection);

// Reusable component for showing section load error state
function SectionLoadError({ sectionName }: { sectionName: string }) {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="error" gutterBottom>
        Failed to load {sectionName} section data
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Could not load data from the database. Please refresh the page
        to try again.
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </Box>
  );
}

// Reusable component for showing section loading state
function SectionLoading({ sectionName }: { sectionName: string }) {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="text.secondary">
        Loading {sectionName} section...
      </Typography>
    </Box>
  );
}

// Viewport configurations
const VIEWPORTS = [
  { label: 'Desktop 1920×1080', width: 1920, height: 1080 },
  { label: 'Laptop 1280×800', width: 1280, height: 800 },
  { label: 'Tablet 1024×768', width: 1024, height: 768 },
  { label: 'Mobile 390×844', width: 390, height: 844 },
] as const;

// Empty form values - all data comes from database, no defaults
function getDefaultFormValues(): ImpactReportForm {
  return {
    // All sections start as null - data loaded from database on demand
    hero: null,
    mission: null,
    population: null,
    financial: null,
    method: null,
    curriculum: null,
    impactSection: null,
    hearOurImpact: null,
    testimonials: null,
    nationalImpact: null,
    flexA: null,
    flexB: null,
    flexC: null,
    impactLevels: null,
    partners: null,
    footer: null,
    // Legacy sections (may still use defaults for now)
    impact: null,
    programs: null,
    locations: null,
  };
}

/**
 * A page for customizing the entire impact report
 */
function ImpactReportCustomizationPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: AdminTabRouteKey }>();

  // Disable outermost page scroll while this page is mounted
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch { }
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Current tab state (synced with URL + localStorage)
  const [currentTab, setCurrentTab] = useState(0);

  // Keep tab selection in sync with URL segment and remember last used tab.
  useEffect(() => {
    const fromUrl =
      tab && orderedTabs.find((t) => t.routeKey === (tab as AdminTabRouteKey));

    let fromStorage: (typeof orderedTabs)[number] | undefined;
    if (!fromUrl) {
      try {
        const storedKey = window.localStorage.getItem(
          LAST_ADMIN_TAB_STORAGE_KEY,
        ) as AdminTabRouteKey | null;
        if (storedKey) {
          fromStorage = orderedTabs.find((t) => t.routeKey === storedKey);
        }
      } catch { }
    }

    const fallback = fromUrl ?? fromStorage ?? orderedTabs[0];

    if (currentTab !== fallback.value) {
      setCurrentTab(fallback.value);
    }

    try {
      window.localStorage.setItem(
        LAST_ADMIN_TAB_STORAGE_KEY,
        fallback.routeKey,
      );
    } catch { }

    if (tab !== fallback.routeKey) {
      navigate(`/admin/${fallback.routeKey}`, { replace: true });
    }
  }, [tab, navigate, currentTab]);

  // Impact report form state with default values
  const [impactReportForm, setImpactReportForm] =
    useState<ImpactReportForm>(getDefaultFormValues);

  // Error states
  const [errors, setErrors] = useState<{ general: string }>({ general: "" });
  const [sectionLoadErrors, setSectionLoadErrors] = useState<Set<AdminTabRouteKey>>(new Set());

  // Helper to mark a section as having a load error
  const setSectionLoadError = (section: AdminTabRouteKey) => {
    setSectionLoadErrors(prev => new Set([...prev, section]));
  };

  // Legacy alias for backward compatibility
  const missionLoadError = sectionLoadErrors.has("mission");

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [heroUploadPct, setHeroUploadPct] = useState<number | null>(null);
  const [flashPreviewHero, setFlashPreviewHero] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<ImpactReportForm | null>(
    null,
  );

  // Defaults swatch editor state
  const [defaultSwatch, setDefaultSwatch] = useState<string[] | null>(null);
  // Section order state
  const [sectionOrder, setSectionOrder] = useState<ReorderableSectionKey[]>([...DEFAULT_SECTION_ORDER]);
  // Disabled sections state
  const [disabledSections, setDisabledSections] = useState<ReorderableSectionKey[]>([]);
  
  // Version history state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ConfigSnapshot | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Dynamic tabs based on section order
  const orderedTabs = useMemo(() => {
    // Defaults tab is always first and not reorderable
    const defaultsTab = { label: 'Defaults', value: 0, routeKey: 'defaults' as const };

    // Map section order to tab configs
    const sectionTabs = sectionOrder.map((sectionKey, index) => ({
      label: SECTION_DISPLAY_NAMES[sectionKey],
      value: index + 1, // +1 because defaults is at 0
      routeKey: sectionKey,
    }));

    return [defaultsTab, ...sectionTabs];
  }, [sectionOrder]);

  // Track which sections have been loaded from API
  const [loadedSections, setLoadedSections] = useState<Set<AdminTabRouteKey>>(
    new Set(["defaults"]),
  );
  const [sectionLoading, setSectionLoading] = useState<AdminTabRouteKey | null>(
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

  // Handle hero background image selection
  const handleHeroBackgroundUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
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

  const handleClearHeroBackground = () => {
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
    enqueueSnackbar("Background cleared", { variant: "info" });
  };

  // Load section data from API based on tab route key
  const loadSection = async (routeKey: AdminTabRouteKey, force = false) => {
    // Skip if already loaded or currently loading (unless force is true)
    if (!force && (loadedSections.has(routeKey) || sectionLoading === routeKey))
      return;

    setSectionLoading(routeKey);

    try {
      switch (routeKey) {
        case "hero": {
          const hero = await fetchHeroContent();
          if (!hero) {
            setSectionLoadError("hero");
            enqueueSnackbar("Failed to load hero section data.", {
              variant: "error",
            });
            break;
          }
          const g = parseGradient(hero.backgroundColor as string | null);
          const alphaMatch = (hero.backgroundColor as string | "").match(
            /rgba\([^,]+,[^,]+,[^,]+,\s*(\d*\.?\d+)\)/i,
          );
          const parsedAlpha = alphaMatch
            ? Math.max(0, Math.min(1, parseFloat(alphaMatch[1] || "1")))
            : 1;

          // Build hero form directly from API data - no defaults
          const heroForm: HeroSectionForm = {
            title: hero.title ?? "",
            subtitle: hero.subtitle ?? "",
            year: hero.year ?? "",
            tagline: hero.tagline ?? "",
            ariaLabel: hero.ariaLabel ?? "",
            textAlign: (["left", "center", "right"].includes(
              hero.textAlign ?? "",
            )
              ? hero.textAlign
              : "center") as "left" | "center" | "right",
            layoutVariant: (hero.layoutVariant === "ticket" ||
              hero.layoutVariant === "default"
              ? hero.layoutVariant
              : "default") as "ticket" | "default",
            titleColor: (hero as any)?.titleColor ?? null,
            subtitleColor: (hero as any)?.subtitleColor ?? null,
            yearColor: (hero as any)?.yearColor ?? null,
            taglineColor: (hero as any)?.taglineColor ?? null,
            titleUnderlineColor: (hero as any)?.titleUnderlineColor ?? null,
            bubbleTextColor: (hero as any)?.bubbleTextColor ?? null,
            bubbleBgColor: (hero as any)?.bubbleBgColor ?? null,
            bubbleBorderColor: (hero as any)?.bubbleBorderColor ?? null,
            primaryCtaColor: (hero as any)?.primaryCtaColor ?? null,
            secondaryCtaColor: (hero as any)?.secondaryCtaColor ?? null,
            primaryCtaBgColor: (hero as any)?.primaryCtaBgColor ?? null,
            primaryCtaHoverBgColor:
              (hero as any)?.primaryCtaHoverBgColor ?? null,
            secondaryCtaBgColor: (hero as any)?.secondaryCtaBgColor ?? null,
            secondaryCtaHoverBgColor:
              (hero as any)?.secondaryCtaHoverBgColor ?? null,
            bubblesCsv: Array.isArray(hero.bubbles)
              ? hero.bubbles.join(", ")
              : "",
            degree: g.degree,
            color1: toHex(g.color1),
            color2: toHex(g.color2),
            gradientOpacity: parsedAlpha,
            backgroundGradient: hero.backgroundColor ?? null,
            backgroundImageUrl: hero.backgroundImage ?? null,
            backgroundImagePreview: null,
            backgroundImageFile: null,
            backgroundGrayscale:
              (hero as any)?.backgroundImageGrayscale === true,
            primaryCtaLabel: hero.primaryCta?.label ?? "",
            primaryCtaHref: hero.primaryCta?.href ?? "",
            secondaryCtaLabel: hero.secondaryCta?.label ?? "",
            secondaryCtaHref: hero.secondaryCta?.href ?? "",
            // Waveform & Music Toy
            showWaveform: (hero as any)?.showWaveform !== false,
            showMusicToy: (hero as any)?.showMusicToy !== false,
            waveformGradient: (hero as any)?.waveformGradient ?? null,
            waveformRainbow: (hero as any)?.waveformRainbow === true,
          };

          setImpactReportForm((prev) => {
            const next: ImpactReportForm = { ...prev, hero: heroForm };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot ? { ...prevSnapshot, hero: next.hero } : next,
            );
            return next;
          });
          break;
        }

        case "mission": {
          const mission = await fetchMissionContent();
          if (!mission) {
            setSectionLoadError("mission");
            enqueueSnackbar("Failed to load mission section data.", {
              variant: "error",
            });
            break;
          }
          // Parse gradients from backend data
          const bgGradient =
            (mission as any)?.backgroundGradient || mission.backgroundColor;
          const g = parseGradient(bgGradient as string | null);
          const titleGradientParsed = parseGradient(
            (mission as any)?.titleGradient ?? null,
          );
          const titleUnderlineParsed = parseGradient(
            (mission as any)?.titleUnderlineGradient ?? null,
          );
          const ticketStripeParsed = parseGradient(
            (mission as any)?.ticketStripeGradient ?? null,
          );
          const alphaMatch = ((bgGradient as string) || "").match(
            /rgba\([^,]+,[^,]+,[^,]+,\s*(\d*\.?\d+)\)/i,
          );
          const parsedAlpha = alphaMatch
            ? Math.max(0, Math.min(1, parseFloat(alphaMatch[1] || "1")))
            : 1;
          const titleAlphaMatch = (
            ((mission as any)?.titleGradient as string) || ""
          ).match(/rgba\([^,]+,[^,]+,[^,]+,\s*(\d*\.?\d+)\)/i);
          const parsedTitleAlpha = titleAlphaMatch
            ? Math.max(0, Math.min(1, parseFloat(titleAlphaMatch[1] || "1")))
            : 1;
          const disciplinesModal = ((mission as any)?.modals ?? []).find(
            (m: any) => m?.id === "disciplines",
          );
          const sanitizedDisciplines =
            disciplinesModal?.items
              ?.map((it: any) => ({
                name: typeof it?.name === "string" ? it.name : "",
                iconKey:
                  typeof it?.iconKey === "string" && it.iconKey.length > 0
                    ? it.iconKey
                    : null,
              }))
              .filter((it: any) => it.name) ?? [];
          const sanitizedStats = Array.isArray((mission as any)?.stats)
            ? (mission as any).stats.map((s: any, idx: number) => {
              const rawAction = s?.action || "none";
              let action = "none";
              if (
                [
                  "openDisciplinesModal",
                  "openStudentMusicModal",
                  "openMentorMusicModal",
                  "scrollToMap",
                  "openMapModal",
                ].includes(rawAction)
              ) {
                action = rawAction;
              } else if (rawAction === "openModal") {
                action =
                  s?.modalId === "disciplines"
                    ? "openDisciplinesModal"
                    : "none";
              }
              return {
                id: String(s?.id ?? idx),
                number: s?.number ?? "",
                label: s?.label ?? "",
                color: s?.color ?? "#ffffff",
                action,
                modalId: s?.modalId ?? null,
                iconKey:
                  typeof s?.iconKey === "string" && s.iconKey.length > 0
                    ? s.iconKey
                    : null,
                numberSource:
                  s?.numberSource === "modalItemsLength"
                    ? "modalItemsLength"
                    : "explicit",
                visible: s?.visible !== false,
              };
            })
            : [];
          const eq = (mission as any)?.statsEqualizer ?? {};
          const eqBarCount = Number(eq?.barCount);
          const missionForm: MissionSectionForm = {
            enabled: (mission as any)?.visible !== false,
            ariaLabel: (mission as any)?.ariaLabel ?? "",
            layoutVariant:
              (mission as any)?.layoutVariant === "default"
                ? "default"
                : "ticket",
            textAlign: ["left", "center"].includes((mission as any)?.textAlign)
              ? (mission as any)?.textAlign
              : "center",
            animationsEnabled: (mission as any)?.animationsEnabled !== false,
            title: mission.title ?? "",
            titleColor: (mission as any)?.titleColor ?? null,
            titleGradient: (mission as any)?.titleGradient ?? "",
            titleGradientDegree: titleGradientParsed?.degree ?? 90,
            titleGradientColor1: titleGradientParsed?.color1
              ? toHex(titleGradientParsed.color1)
              : "#ffffff",
            titleGradientColor2: titleGradientParsed?.color2
              ? toHex(titleGradientParsed.color2)
              : "#ffffff",
            titleGradientOpacity: parsedTitleAlpha,
            titleUnderlineGradient:
              (mission as any)?.titleUnderlineGradient ?? "",
            titleUnderlineGradientDegree: titleUnderlineParsed?.degree ?? 90,
            titleUnderlineGradientColor1: titleUnderlineParsed?.color1
              ? toHex(titleUnderlineParsed.color1)
              : "#ffffff",
            titleUnderlineGradientColor2: titleUnderlineParsed?.color2
              ? toHex(titleUnderlineParsed.color2)
              : "#ffffff",
            ticketStripeGradient: (mission as any)?.ticketStripeGradient ?? "",
            ticketStripeGradientDegree: ticketStripeParsed?.degree ?? 180,
            ticketStripeGradientColor1: ticketStripeParsed?.color1
              ? toHex(ticketStripeParsed.color1)
              : "#ffffff",
            ticketStripeGradientColor2: ticketStripeParsed?.color2
              ? toHex(ticketStripeParsed.color2)
              : "#ffffff",
            backgroundGradient: bgGradient ?? "",
            degree: g.degree,
            color1: toHex(g.color1),
            color2: toHex(g.color2),
            gradientOpacity: parsedAlpha,
            badgeLabel: (mission as any)?.badgeLabel ?? "",
            badgeIcon: (mission as any)?.badgeIcon ?? {
              type: "glyph",
              value: "♫",
            },
            badgeTextColor: (mission as any)?.badgeTextColor ?? null,
            badgeBgColor: (mission as any)?.badgeBgColor ?? null,
            badgeBorderColor: (mission as any)?.badgeBorderColor ?? null,
            statementTitle: (mission as any)?.statementTitle ?? "",
            statementText: (mission as any)?.statementText ?? "",
            statementMeta: (mission as any)?.statementMeta ?? "",
            serial: (mission as any)?.serial ?? "",
            statementTitleColor: (mission as any)?.statementTitleColor ?? null,
            statementTextColor: (mission as any)?.statementTextColor ?? null,
            statementMetaColor: (mission as any)?.statementMetaColor ?? null,
            serialColor: (mission as any)?.serialColor ?? null,
            statsTitle: (mission as any)?.statsTitle ?? "",
            statsTitleColor: (mission as any)?.statsTitleColor ?? null,
            statsEqualizer: {
              enabled: eq?.enabled !== false,
              barCount:
                Number.isFinite(eqBarCount) && eqBarCount > 0
                  ? Math.min(24, Math.max(1, Math.round(eqBarCount)))
                  : 4,
            },
            stats: sanitizedStats,
            modalTitle: disciplinesModal?.title ?? "",
            disciplinesItems: sanitizedDisciplines,
            backgroundLogo: {
              enabled: (mission as any)?.backgroundLogo?.enabled !== false,
              svgKey: (mission as any)?.backgroundLogo?.svgKey ?? "gogoLogoBK",
              opacity: (mission as any)?.backgroundLogo?.opacity ?? 0.05,
              rotationDeg: (mission as any)?.backgroundLogo?.rotationDeg ?? 0,
              scale: (mission as any)?.backgroundLogo?.scale ?? 1,
            },
            overlayColor1: (mission as any)?.overlayColor1 ?? null,
            overlayColor2: (mission as any)?.overlayColor2 ?? null,
            overlayOpacity: (mission as any)?.overlayOpacity ?? null,
            ticketBorderColor: (mission as any)?.ticketBorderColor ?? null,
            ticketBackdropColor: (mission as any)?.ticketBackdropColor ?? null,
            ticketBlotch1Color: (mission as any)?.ticketBlotch1Color ?? null,
            ticketBlotch2Color: (mission as any)?.ticketBlotch2Color ?? null,
            ticketShowBarcode: (mission as any)?.ticketShowBarcode !== false,
            statementBoxBorderColor:
              (mission as any)?.statementBoxBorderColor ?? null,
            statementBoxBgColor: (mission as any)?.statementBoxBgColor ?? null,
            statementTextGradientColor:
              (mission as any)?.statementTextGradientColor ?? null,
            barcodeColor: (mission as any)?.barcodeColor ?? null,
            backgroundLogoEnabled:
              (mission as any)?.backgroundLogoEnabled !== false,
            backgroundLogoOpacity:
              (mission as any)?.backgroundLogoOpacity ?? null,
            backgroundLogoRotation:
              (mission as any)?.backgroundLogoRotation ?? null,
            backgroundLogoScale: (mission as any)?.backgroundLogoScale ?? null,
            statCardBgColor: (mission as any)?.statCardBgColor ?? null,
            statCardBorderWidth: (mission as any)?.statCardBorderWidth ?? null,
          };
          setImpactReportForm((prev) => {
            const next = { ...prev, mission: missionForm };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot ? { ...prevSnapshot, mission: missionForm } : next,
            );
            return next;
          });
          break;
        }

        case "population": {
          const population = await fetchPopulationContent();
          if (!population) {
            setSectionLoadError("population");
            enqueueSnackbar("Failed to load population section data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              population: { ...prev.population, ...population },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, population: next.population }
                : next,
            );
            return next;
          });
          break;
        }

        case "financial": {
          const financial = await fetchFinancialContent();
          if (!financial) {
            setSectionLoadError("financial");
            enqueueSnackbar("Failed to load financial section data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              financial: { ...prev.financial, ...financial },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, financial: next.financial }
                : next,
            );
            return next;
          });
          break;
        }

        case "method": {
          const method = await fetchMethodContent();
          if (!method) {
            setSectionLoadError("method");
            enqueueSnackbar("Failed to load method section data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = { ...prev, method: { ...prev.method, ...method } };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot ? { ...prevSnapshot, method: next.method } : next,
            );
            return next;
          });
          break;
        }

        case "curriculum": {
          const curriculum = await fetchCurriculumContent();
          if (!curriculum) {
            setSectionLoadError("curriculum");
            enqueueSnackbar("Failed to load curriculum section data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              curriculum: { ...prev.curriculum, ...curriculum },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, curriculum: next.curriculum }
                : next,
            );
            return next;
          });
          break;
        }

        case "impactSection": {
          const impactSection = await fetchImpactSectionContent();
          if (!impactSection) {
            setSectionLoadError("impactSection");
            enqueueSnackbar("Failed to load impact section data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              impactSection: { ...prev.impactSection, ...impactSection },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, impactSection: next.impactSection }
                : next,
            );
            return next;
          });
          break;
        }

        case "hearOurImpact": {
          const hearOurImpact = await fetchHearOurImpactContent();
          if (!hearOurImpact) {
            setSectionLoadError("hearOurImpact");
            enqueueSnackbar("Failed to load Hear Our Impact data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              hearOurImpact: { ...prev.hearOurImpact, ...hearOurImpact },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, hearOurImpact: next.hearOurImpact }
                : next,
            );
            return next;
          });
          break;
        }

        case "testimonials": {
          const testimonials = await fetchTestimonialsContent();
          if (!testimonials) {
            setSectionLoadError("testimonials");
            enqueueSnackbar("Failed to load Testimonials data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              testimonials: { ...prev.testimonials, ...testimonials },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, testimonials: next.testimonials }
                : next,
            );
            return next;
          });
          break;
        }

        case "nationalImpact": {
          const nationalImpact = await fetchNationalImpactContent();
          if (!nationalImpact) {
            setSectionLoadError("nationalImpact");
            enqueueSnackbar("Failed to load National Impact data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              nationalImpact: { ...prev.nationalImpact, ...nationalImpact },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, nationalImpact: next.nationalImpact }
                : next,
            );
            return next;
          });
          break;
        }

        case "flexA": {
          const flexA = await fetchFlexAContent();
          if (!flexA) {
            setSectionLoadError("flexA");
            enqueueSnackbar("Failed to load Flex A data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              flexA: { ...prev.flexA, ...flexA },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, flexA: next.flexA }
                : next,
            );
            return next;
          });
          break;
        }

        case "flexB": {
          const flexB = await fetchFlexBContent();
          if (!flexB) {
            setSectionLoadError("flexB");
            enqueueSnackbar("Failed to load Flex B data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              flexB: { ...prev.flexB, ...flexB },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, flexB: next.flexB }
                : next,
            );
            return next;
          });
          break;
        }

        case "flexC": {
          const flexC = await fetchFlexCContent();
          if (!flexC) {
            setSectionLoadError("flexC");
            enqueueSnackbar("Failed to load Flex C data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              flexC: { ...prev.flexC, ...flexC },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, flexC: next.flexC }
                : next,
            );
            return next;
          });
          break;
        }

        case "impactLevels": {
          const impactLevels = await fetchImpactLevelsContent();
          if (!impactLevels) {
            setSectionLoadError("impactLevels");
            enqueueSnackbar("Failed to load Impact Levels data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              impactLevels: { ...prev.impactLevels, ...impactLevels },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, impactLevels: next.impactLevels }
                : next,
            );
            return next;
          });
          break;
        }

        case "partners": {
          const partners = await fetchPartnersContent();
          if (!partners) {
            setSectionLoadError("partners");
            enqueueSnackbar("Failed to load Partners data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              partners: { ...prev.partners, ...partners },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, partners: next.partners }
                : next,
            );
            return next;
          });
          break;
        }

        case "footer": {
          const footer = await fetchFooterContent();
          if (!footer) {
            setSectionLoadError("footer");
            enqueueSnackbar("Failed to load Footer data.", {
              variant: "error",
            });
            break;
          }
          setImpactReportForm((prev) => {
            const next = {
              ...prev,
              footer: { ...prev.footer, ...footer },
            };
            setSavedSnapshot((prevSnapshot) =>
              prevSnapshot
                ? { ...prevSnapshot, footer: next.footer }
                : next,
            );
            return next;
          });
          break;
        }

        case "defaults":
          // Defaults are loaded globally on mount
          break;
      }

      setLoadedSections((prev) => new Set([...prev, routeKey]));
    } catch (error) {
      console.error(`Failed to load section ${routeKey}:`, error);
      enqueueSnackbar(`Failed to load ${routeKey} section.`, {
        variant: "error",
      });
    } finally {
      setSectionLoading(null);
    }
  };

  // Load section when tab changes
  useEffect(() => {
    const currentTabConfig = orderedTabs.find((t) => t.value === currentTab);
    if (currentTabConfig) {
      loadSection(currentTabConfig.routeKey);
    }
  }, [currentTab]);

  // Prefill defaults (swatch + section order) from backend - always loaded globally
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

      // Load section order
      if (defs?.sectionOrder && Array.isArray(defs.sectionOrder) && defs.sectionOrder.length > 0) {
        // Ensure all sections are present (add any missing ones at the end)
        const loadedOrder = defs.sectionOrder as ReorderableSectionKey[];
        const missingSections = DEFAULT_SECTION_ORDER.filter(s => !loadedOrder.includes(s));
        setSectionOrder([...loadedOrder, ...missingSections]);
      }

      // Load disabled sections
      if (defs?.disabledSections && Array.isArray(defs.disabledSections)) {
        setDisabledSections(defs.disabledSections as ReorderableSectionKey[]);
      }
    })();
  }, []);

  // Handle PDF download via Sejda's free web tool
  // Opens Sejda with the print-ready page URL (includes cover slide + full webapp)
  const handleDownloadPDF = () => {
    // Use the print-ready page which includes the cover slide
    const printUrl = encodeURIComponent('https://gogo-vercel.vercel.app/print');
    const opts = ['save-link=' + printUrl, 'pageOrientation=auto'];
    window.open('https://www.sejda.com/html-to-pdf?' + opts.join('&'));
  };

  // Handle form submission - only saves the current section + defaults
  const handleSave = async () => {
    setIsSubmitting(true);
    const currentTabConfig = orderedTabs.find((t) => t.value === currentTab);
    const sectionKey = currentTabConfig?.routeKey ?? "defaults";

    try {
      // Always save defaults (color swatch + section order + disabled sections) since they're shared
      if (defaultSwatch && defaultSwatch.length > 0) {
        await saveDefaults({ colorSwatch: defaultSwatch, sectionOrder, disabledSections });
      }

      // Save the current section based on tab
      switch (sectionKey) {
        case "defaults":
          // Defaults already saved above
          break;

        case "hero": {
          const bubbles = impactReportForm.hero.bubblesCsv
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const backgroundColor =
            impactReportForm.hero.backgroundGradient ||
            (() => {
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
              return composeGradient(
                safeDegree,
                safeColor1,
                safeColor2,
                safeAlpha,
              );
            })();
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
                if (evt.lengthComputable)
                  setHeroUploadPct(Math.round((evt.loaded / evt.total) * 100));
              };
              xhr.onload = () =>
                xhr.status >= 200 && xhr.status < 300
                  ? resolve()
                  : reject(new Error(`Upload failed: ${xhr.status}`));
              xhr.onerror = () =>
                reject(new Error("Network error during upload"));
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
            } catch { }
            backgroundImagePayload = signed.publicUrl;
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
          const heroPayload = {
            backgroundColor,
            backgroundImage: backgroundImagePayload,
            backgroundImageGrayscale:
              impactReportForm.hero.backgroundGrayscale || undefined,
            textAlign: impactReportForm.hero.textAlign,
            layoutVariant: impactReportForm.hero.layoutVariant,
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
            titleUnderlineColor:
              impactReportForm.hero.titleUnderlineColor || undefined,
            bubbleTextColor: impactReportForm.hero.bubbleTextColor || undefined,
            bubbleBgColor: impactReportForm.hero.bubbleBgColor || undefined,
            bubbleBorderColor:
              impactReportForm.hero.bubbleBorderColor || undefined,
            primaryCta: {
              label: impactReportForm.hero.primaryCtaLabel || undefined,
              href: impactReportForm.hero.primaryCtaHref || undefined,
            },
            secondaryCta: {
              label: impactReportForm.hero.secondaryCtaLabel || undefined,
              href: impactReportForm.hero.secondaryCtaHref || undefined,
            },
            primaryCtaColor: impactReportForm.hero.primaryCtaColor || undefined,
            secondaryCtaColor:
              impactReportForm.hero.secondaryCtaColor || undefined,
            primaryCtaBgColor:
              impactReportForm.hero.primaryCtaBgColor || undefined,
            primaryCtaHoverBgColor:
              impactReportForm.hero.primaryCtaHoverBgColor || undefined,
            secondaryCtaBgColor:
              impactReportForm.hero.secondaryCtaBgColor || undefined,
            secondaryCtaHoverBgColor:
              impactReportForm.hero.secondaryCtaHoverBgColor || undefined,
            // Waveform & Music Toy
            showWaveform: impactReportForm.hero.showWaveform,
            showMusicToy: impactReportForm.hero.showMusicToy,
            waveformGradient: impactReportForm.hero.waveformGradient || undefined,
            waveformRainbow: impactReportForm.hero.waveformRainbow,
          };
          console.log("[admin][hero] save payload", heroPayload);
          const heroResult = await saveHeroContent(heroPayload);
          if (!heroResult) throw new Error("Failed to save Hero section.");
          break;
        }

        case "mission": {
          if (!impactReportForm.mission)
            throw new Error("Mission data not loaded.");
          const missionBackgroundColor =
            impactReportForm.mission.backgroundGradient ||
            (() => {
              const d = Math.max(
                1,
                Math.min(360, Number(impactReportForm.mission!.degree) || 180),
              );
              const c1 = isValidColorStop(impactReportForm.mission!.color1)
                ? impactReportForm.mission!.color1
                : "#5038a0";
              const c2 = isValidColorStop(impactReportForm.mission!.color2)
                ? impactReportForm.mission!.color2
                : "#121242";
              const a = Math.max(
                0,
                Math.min(
                  1,
                  Number(impactReportForm.mission!.gradientOpacity) || 0,
                ),
              );
              return composeGradient(d, c1, c2, a);
            })();
          const missionTitleGradient =
            impactReportForm.mission.titleGradient ||
            composeGradient(
              impactReportForm.mission.titleGradientDegree,
              impactReportForm.mission.titleGradientColor1,
              impactReportForm.mission.titleGradientColor2,
              impactReportForm.mission.titleGradientOpacity ?? 1,
            );
          const missionUnderlineGradient =
            impactReportForm.mission.titleUnderlineGradient ||
            composeSimpleGradient(
              impactReportForm.mission.titleUnderlineGradientDegree,
              impactReportForm.mission.titleUnderlineGradientColor1,
              impactReportForm.mission.titleUnderlineGradientColor2,
            );
          const missionTicketStripeGradient =
            impactReportForm.mission.ticketStripeGradient ||
            composeSimpleGradient(
              impactReportForm.mission.ticketStripeGradientDegree,
              impactReportForm.mission.ticketStripeGradientColor1,
              impactReportForm.mission.ticketStripeGradientColor2,
            );
          const missionPayload: Record<string, unknown> = {
            visible: true, // Visibility now controlled centrally via defaults
            ariaLabel: impactReportForm.mission.ariaLabel || undefined,
            layoutVariant: impactReportForm.mission.layoutVariant,
            textAlign: impactReportForm.mission.textAlign,
            animationsEnabled: true, // Animations always enabled (no longer a per-section toggle)
            backgroundGradient: missionBackgroundColor,
            title: impactReportForm.mission.title,
            titleColor: impactReportForm.mission.titleColor || undefined,
            titleGradient: missionTitleGradient || undefined,
            titleUnderlineGradient: missionUnderlineGradient || undefined,
            ticketStripeGradient: missionTicketStripeGradient || undefined,
            ticketBorderColor:
              impactReportForm.mission.ticketBorderColor || undefined,
            ticketBackdropColor:
              impactReportForm.mission.ticketBackdropColor || undefined,
            ticketBlotch1Color:
              impactReportForm.mission.ticketBlotch1Color || undefined,
            ticketBlotch2Color:
              impactReportForm.mission.ticketBlotch2Color || undefined,
            ticketShowBarcode: impactReportForm.mission.ticketShowBarcode,
            statementBoxBorderColor:
              impactReportForm.mission.statementBoxBorderColor || undefined,
            statementBoxBgColor:
              impactReportForm.mission.statementBoxBgColor || undefined,
            statementTextGradientColor:
              impactReportForm.mission.statementTextGradientColor || undefined,
            barcodeColor: impactReportForm.mission.barcodeColor || undefined,
            backgroundLogoEnabled:
              impactReportForm.mission.backgroundLogoEnabled,
            backgroundLogoOpacity:
              impactReportForm.mission.backgroundLogoOpacity ?? undefined,
            backgroundLogoRotation:
              impactReportForm.mission.backgroundLogoRotation ?? undefined,
            backgroundLogoScale:
              impactReportForm.mission.backgroundLogoScale ?? undefined,
            badgeLabel: impactReportForm.mission.badgeLabel,
            badgeIcon: impactReportForm.mission.badgeIcon || undefined,
            badgeTextColor:
              impactReportForm.mission.badgeTextColor || undefined,
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
            statsTitleColor:
              impactReportForm.mission.statsTitleColor || undefined,
            statsEqualizer: impactReportForm.mission.statsEqualizer,
            overlayColor1: impactReportForm.mission.overlayColor1 || undefined,
            overlayColor2: impactReportForm.mission.overlayColor2 || undefined,
            overlayOpacity: impactReportForm.mission.overlayOpacity,
            statCardBgColor:
              impactReportForm.mission.statCardBgColor || undefined,
            statCardBorderWidth: impactReportForm.mission.statCardBorderWidth,
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
          const missionResult = await saveMissionContent(missionPayload);
          if (!missionResult)
            throw new Error("Failed to save Mission section.");
          break;
        }

        case "population": {
          console.log(
            "[admin][population] save payload",
            impactReportForm.population,
          );
          const result = await savePopulationContent({
            ...impactReportForm.population,
          });
          if (!result) throw new Error("Failed to save Population section.");
          break;
        }

        case "financial": {
          console.log(
            "[admin][financial] save payload",
            impactReportForm.financial,
          );
          const result = await saveFinancialContent({
            ...impactReportForm.financial,
          });
          if (!result) throw new Error("Failed to save Financial section.");
          break;
        }

        case "method": {
          console.log("[admin][method] save payload", impactReportForm.method);
          const result = await saveMethodContent({
            ...impactReportForm.method,
          });
          if (!result) throw new Error("Failed to save Method section.");
          break;
        }

        case "curriculum": {
          console.log(
            "[admin][curriculum] save payload",
            impactReportForm.curriculum,
          );
          const result = await saveCurriculumContent({
            ...impactReportForm.curriculum,
          });
          if (!result) throw new Error("Failed to save Curriculum section.");
          break;
        }

        case "impactSection": {
          console.log(
            "[admin][impactSection] save payload",
            impactReportForm.impactSection,
          );
          const result = await saveImpactSectionContent({
            ...impactReportForm.impactSection,
          });
          if (!result) throw new Error("Failed to save Impact Section.");
          break;
        }

        case "hearOurImpact": {
          console.log(
            "[admin][hearOurImpact] save payload",
            impactReportForm.hearOurImpact,
          );
          const result = await saveHearOurImpactContent({
            ...impactReportForm.hearOurImpact,
          });
          if (!result)
            throw new Error("Failed to save Hear Our Impact section.");
          break;
        }

        case "testimonials": {
          console.log(
            "[admin][testimonials] save payload",
            impactReportForm.testimonials,
          );
          const result = await saveTestimonialsContent({
            ...impactReportForm.testimonials,
          });
          if (!result) throw new Error("Failed to save Testimonials section.");
          break;
        }

        case "nationalImpact": {
          console.log(
            "[admin][nationalImpact] save payload",
            impactReportForm.nationalImpact,
          );
          const result = await saveNationalImpactContent({
            ...impactReportForm.nationalImpact,
          });
          if (!result)
            throw new Error("Failed to save National Impact section.");
          break;
        }

        case "flexA": {
          console.log(
            "[admin][flexA] save payload",
            impactReportForm.flexA,
          );
          const result = await saveFlexAContent({
            ...impactReportForm.flexA,
          });
          if (!result)
            throw new Error("Failed to save Flex A section.");
          break;
        }

        case "flexB": {
          console.log(
            "[admin][flexB] save payload",
            impactReportForm.flexB,
          );
          const result = await saveFlexBContent({
            ...impactReportForm.flexB,
          });
          if (!result)
            throw new Error("Failed to save Flex B section.");
          break;
        }

        case "flexC": {
          console.log(
            "[admin][flexC] save payload",
            impactReportForm.flexC,
          );
          const result = await saveFlexCContent({
            ...impactReportForm.flexC,
          });
          if (!result)
            throw new Error("Failed to save Flex C section.");
          break;
        }

        case "impactLevels": {
          console.log(
            "[admin][impactLevels] save payload",
            impactReportForm.impactLevels,
          );
          const result = await saveImpactLevelsContent({
            ...impactReportForm.impactLevels,
          });
          if (!result)
            throw new Error("Failed to save Impact Levels section.");
          break;
        }

        case "partners": {
          console.log(
            "[admin][partners] save payload",
            impactReportForm.partners,
          );
          const result = await savePartnersContent({
            ...impactReportForm.partners,
            visible: true, // Visibility now controlled centrally via defaults
            animationsEnabled: true, // Animations always enabled
          });
          if (!result)
            throw new Error("Failed to save Partners section.");
          break;
        }

        case "footer": {
          console.log(
            "[admin][footer] save payload",
            impactReportForm.footer,
          );
          const result = await saveFooterContent({
            ...impactReportForm.footer,
          });
          if (!result)
            throw new Error("Failed to save Footer section.");
          break;
        }
      }

      const sectionLabel = currentTabConfig?.label ?? "Section";
      enqueueSnackbar(`${sectionLabel} saved`, { variant: "success" });
      setIsDirty(false);
      setLastSavedAt(new Date());
      setSavedSnapshot(
        JSON.parse(JSON.stringify(impactReportForm)) as ImpactReportForm,
      );
    } catch (error) {
      console.error("Error saving section:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while saving. Please try again.";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Discard changes - refetch the current section from API
  const handleDiscard = async () => {
    const currentTabConfig = orderedTabs.find((t) => t.value === currentTab);
    const sectionKey = currentTabConfig?.routeKey ?? "defaults";

    // Mark section as not loaded so it will be refetched
    setLoadedSections((prev) => {
      const next = new Set(prev);
      next.delete(sectionKey);
      return next;
    });

    // Refetch defaults (color swatch + section order)
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

      // Restore section order
      if (defs?.sectionOrder && Array.isArray(defs.sectionOrder) && defs.sectionOrder.length > 0) {
        const loadedOrder = defs.sectionOrder as ReorderableSectionKey[];
        const missingSections = DEFAULT_SECTION_ORDER.filter(s => !loadedOrder.includes(s));
        setSectionOrder([...loadedOrder, ...missingSections]);
      } else {
        setSectionOrder([...DEFAULT_SECTION_ORDER]);
      }

      // Restore disabled sections
      if (defs?.disabledSections && Array.isArray(defs.disabledSections)) {
        setDisabledSections(defs.disabledSections as ReorderableSectionKey[]);
      } else {
        setDisabledSections([]);
      }
    } catch { }

    // Refetch the current section (force reload since we just removed it from loadedSections)
    await loadSection(sectionKey, true);
    setIsDirty(false);
    enqueueSnackbar("Changes discarded", { variant: "info" });
  };

  // Handle version history
  const handleOpenHistory = useCallback(() => {
    setIsHistoryModalOpen(true);
  }, []);

  const handleCloseHistory = useCallback(() => {
    setIsHistoryModalOpen(false);
  }, []);

  const handleSelectSnapshot = useCallback((snapshot: ConfigSnapshot) => {
    setSelectedSnapshot(snapshot);
    setIsHistoryModalOpen(false);
    setIsComparisonOpen(true);
  }, []);

  const handleCloseComparison = useCallback(() => {
    setIsComparisonOpen(false);
    setSelectedSnapshot(null);
  }, []);

  const handleRestoreComplete = useCallback(() => {
    // Reload all sections after restore
    enqueueSnackbar('Section restored successfully! Reloading data...', { variant: 'success' });
    // Clear loaded sections to force reload
    setLoadedSections(new Set());
    setSectionLoadErrors(new Set());
  }, [enqueueSnackbar]);

  // Build and debounce the preview hero override
  const liveHeroOverride = useMemo(() => {
    // Return null if hero data hasn't loaded yet
    if (!impactReportForm.hero) return null;

    // Use the backgroundGradient string directly (opacity is embedded in the rgba colors)
    const backgroundColor =
      impactReportForm.hero.backgroundGradient ||
      composeGradient(
        impactReportForm.hero.degree,
        impactReportForm.hero.color1,
        impactReportForm.hero.color2,
        impactReportForm.hero.gradientOpacity,
      );

    return {
      title: impactReportForm.hero.title,
      subtitle: impactReportForm.hero.subtitle,
      year: impactReportForm.hero.year,
      tagline: impactReportForm.hero.tagline,
      textAlign: impactReportForm.hero.textAlign,
      layoutVariant: impactReportForm.hero.layoutVariant,
      titleColor: impactReportForm.hero.titleColor,
      subtitleColor: impactReportForm.hero.subtitleColor,
      yearColor: impactReportForm.hero.yearColor,
      taglineColor: impactReportForm.hero.taglineColor,
      // Title underline
      titleUnderlineColor: impactReportForm.hero.titleUnderlineColor,
      // Bubble styling
      bubbleTextColor: impactReportForm.hero.bubbleTextColor,
      bubbleBgColor: impactReportForm.hero.bubbleBgColor,
      bubbleBorderColor: impactReportForm.hero.bubbleBorderColor,
      // CTA buttons
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
      primaryCtaBgColor: impactReportForm.hero.primaryCtaBgColor,
      primaryCtaHoverBgColor: impactReportForm.hero.primaryCtaHoverBgColor,
      secondaryCtaBgColor: impactReportForm.hero.secondaryCtaBgColor,
      secondaryCtaHoverBgColor: impactReportForm.hero.secondaryCtaHoverBgColor,
      bubbles: impactReportForm.hero.bubblesCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      backgroundColor,
      backgroundImage:
        impactReportForm.hero.backgroundImagePreview ||
        impactReportForm.hero.backgroundImageUrl ||
        null,
      backgroundImageGrayscale: impactReportForm.hero.backgroundGrayscale,
      ariaLabel: impactReportForm.hero.ariaLabel,
      // Waveform & Music Toy
      showWaveform: impactReportForm.hero.showWaveform,
      showMusicToy: impactReportForm.hero.showMusicToy,
      waveformGradient: impactReportForm.hero.waveformGradient,
      waveformRainbow: impactReportForm.hero.waveformRainbow,
    };
  }, [impactReportForm.hero]);

  const debouncedHeroOverride = useDebouncedValue(liveHeroOverride, 300);

  // Build and debounce the preview mission override
  const liveMissionOverride = useMemo(() => {
    // Return null if mission data hasn't loaded yet
    if (!impactReportForm.mission) return null;

    // Use full gradient strings directly if available, otherwise fall back to composing from legacy fields
    const missionTitleGradient =
      impactReportForm.mission.titleGradient ||
      composeGradient(
        impactReportForm.mission.titleGradientDegree,
        impactReportForm.mission.titleGradientColor1,
        impactReportForm.mission.titleGradientColor2,
        impactReportForm.mission.titleGradientOpacity ?? 1,
      );
    const missionTitleUnderlineGradient =
      impactReportForm.mission.titleUnderlineGradient ||
      composeSimpleGradient(
        impactReportForm.mission.titleUnderlineGradientDegree,
        impactReportForm.mission.titleUnderlineGradientColor1,
        impactReportForm.mission.titleUnderlineGradientColor2,
      );
    const missionTicketStripeGradient =
      impactReportForm.mission.ticketStripeGradient ||
      composeSimpleGradient(
        impactReportForm.mission.ticketStripeGradientDegree,
        impactReportForm.mission.ticketStripeGradientColor1,
        impactReportForm.mission.ticketStripeGradientColor2,
      );
    const missionBackgroundGradient =
      impactReportForm.mission.backgroundGradient ||
      composeGradient(
        impactReportForm.mission.degree,
        impactReportForm.mission.color1,
        impactReportForm.mission.color2,
        impactReportForm.mission.gradientOpacity,
      );
    return {
      enabled: true, // Visibility now controlled centrally via defaults
      ariaLabel: impactReportForm.mission.ariaLabel,
      layoutVariant: impactReportForm.mission.layoutVariant,
      textAlign: impactReportForm.mission.textAlign,
      animationsEnabled: true, // Animations always enabled
      title: impactReportForm.mission.title,
      titleColor: impactReportForm.mission.titleColor || undefined,
      titleGradient: missionTitleGradient,
      titleUnderlineGradient: missionTitleUnderlineGradient,
      ticketStripeGradient: missionTicketStripeGradient,
      ticketBorderColor:
        impactReportForm.mission.ticketBorderColor || undefined,
      ticketBackdropColor:
        impactReportForm.mission.ticketBackdropColor || undefined,
      ticketBlotch1Color:
        impactReportForm.mission.ticketBlotch1Color || undefined,
      ticketBlotch2Color:
        impactReportForm.mission.ticketBlotch2Color || undefined,
      ticketShowBarcode: impactReportForm.mission.ticketShowBarcode,
      statementBoxBorderColor:
        impactReportForm.mission.statementBoxBorderColor || undefined,
      statementBoxBgColor:
        impactReportForm.mission.statementBoxBgColor || undefined,
      statementTextGradientColor:
        impactReportForm.mission.statementTextGradientColor || undefined,
      barcodeColor: impactReportForm.mission.barcodeColor || undefined,
      backgroundLogoEnabled: impactReportForm.mission.backgroundLogoEnabled,
      backgroundLogoOpacity:
        impactReportForm.mission.backgroundLogoOpacity ?? undefined,
      backgroundLogoRotation:
        impactReportForm.mission.backgroundLogoRotation ?? undefined,
      backgroundLogoScale:
        impactReportForm.mission.backgroundLogoScale ?? undefined,
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
      backgroundGradient: missionBackgroundGradient,
      overlayColor1: impactReportForm.mission.overlayColor1 || undefined,
      overlayColor2: impactReportForm.mission.overlayColor2 || undefined,
      overlayOpacity: impactReportForm.mission.overlayOpacity,
      statCardBgColor: impactReportForm.mission.statCardBgColor || undefined,
      statCardBorderWidth: impactReportForm.mission.statCardBorderWidth,
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

  const livePopulationOverride = useMemo(
    () => impactReportForm.population,
    [impactReportForm.population],
  );
  const debouncedPopulationOverride = useDebouncedValue(
    livePopulationOverride,
    300,
  );

  const liveFinancialOverride = useMemo(
    () => impactReportForm.financial,
    [impactReportForm.financial],
  );
  const debouncedFinancialOverride = useDebouncedValue(
    liveFinancialOverride,
    300,
  );

  const liveMethodOverride = useMemo(
    () => impactReportForm.method,
    [impactReportForm.method],
  );
  const debouncedMethodOverride = useDebouncedValue(liveMethodOverride, 300);

  const liveCurriculumOverride = useMemo(
    () => impactReportForm.curriculum,
    [impactReportForm.curriculum],
  );
  const debouncedCurriculumOverride = useDebouncedValue(
    liveCurriculumOverride,
    300,
  );

  const liveImpactSectionOverride = useMemo(
    () => impactReportForm.impactSection,
    [impactReportForm.impactSection],
  );
  const debouncedImpactSectionOverride = useDebouncedValue(
    liveImpactSectionOverride,
    300,
  );

  const liveHearOurImpactOverride = useMemo(
    () => impactReportForm.hearOurImpact,
    [impactReportForm.hearOurImpact],
  );
  const debouncedHearOurImpactOverride = useDebouncedValue(
    liveHearOurImpactOverride,
    300,
  );

  const liveTestimonialsOverride = useMemo(
    () => impactReportForm.testimonials,
    [impactReportForm.testimonials],
  );
  const debouncedTestimonialsOverride = useDebouncedValue(
    liveTestimonialsOverride,
    300,
  );

  const liveNationalImpactOverride = useMemo(
    () => impactReportForm.nationalImpact,
    [impactReportForm.nationalImpact],
  );
  const debouncedNationalImpactOverride = useDebouncedValue(
    liveNationalImpactOverride,
    300,
  );

  const liveFlexAOverride = useMemo(
    () => impactReportForm.flexA,
    [impactReportForm.flexA],
  );
  const debouncedFlexAOverride = useDebouncedValue(
    liveFlexAOverride,
    300,
  );

  const liveFlexBOverride = useMemo(
    () => impactReportForm.flexB,
    [impactReportForm.flexB],
  );
  const debouncedFlexBOverride = useDebouncedValue(
    liveFlexBOverride,
    300,
  );

  const liveFlexCOverride = useMemo(
    () => impactReportForm.flexC,
    [impactReportForm.flexC],
  );
  const debouncedFlexCOverride = useDebouncedValue(
    liveFlexCOverride,
    300,
  );

  const liveImpactLevelsOverride = useMemo(
    () => impactReportForm.impactLevels,
    [impactReportForm.impactLevels],
  );
  const debouncedImpactLevelsOverride = useDebouncedValue(
    liveImpactLevelsOverride,
    300,
  );

  const livePartnersOverride = useMemo(
    () => impactReportForm.partners,
    [impactReportForm.partners],
  );
  const debouncedPartnersOverride = useDebouncedValue(
    livePartnersOverride,
    300,
  );

  const liveFooterOverride = useMemo(
    () => impactReportForm.footer,
    [impactReportForm.footer],
  );
  const debouncedFooterOverride = useDebouncedValue(
    liveFooterOverride,
    300,
  );

  // Viewport simulator
  const [viewportIdx, setViewportIdx] = useState<number>(0);
  const artboardRef = useRef<HTMLDivElement | null>(null);
  const artboardOuterRef = useRef<HTMLDivElement | null>(null);
  const rightPaneRef = useRef<HTMLDivElement | null>(null);
  const [artboardScale, setArtboardScale] = useState<number>(1);

  useEffect(() => {
    function recomputeScale() {
      const outer = artboardOuterRef.current;
      if (!outer) return;
      const { width: availW } = outer.getBoundingClientRect();
      const vp = VIEWPORTS[viewportIdx];
      if (!vp) return;
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

  useEffect(() => {
    if (artboardRef.current) {
      artboardRef.current.scrollTop = 0;
    }
    if (rightPaneRef.current) {
      rightPaneRef.current.scrollTop = 0;
    }
  }, []);

  // Render preview based on current tab
  // Helper to show preview error state
  const PreviewError = ({ sectionName }: { sectionName: string }) => (
    <Box sx={{ p: 4, textAlign: "center", color: "white" }}>
      <Typography variant="h6" color="error">
        {sectionName} data not loaded
      </Typography>
    </Box>
  );

  const renderPreview = () => {
    // Use routeKey to determine which preview to show (supports dynamic tab ordering)
    const currentTabConfig = orderedTabs.find((t) => t.value === currentTab);
    const routeKey = currentTabConfig?.routeKey;

    switch (routeKey) {
      case "defaults":
        return <DefaultsPreview defaultSwatch={defaultSwatch} />;
      case "hero":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("hero") && (sectionLoadErrors.has("hero") || !impactReportForm.hero)) {
          return <PreviewError sectionName="Hero" />;
        }
        return (
          <MemoHeroSection previewMode heroOverride={debouncedHeroOverride} />
        );
      case "mission":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("mission") && (sectionLoadErrors.has("mission") || !impactReportForm.mission)) {
          return <PreviewError sectionName="Mission" />;
        }
        return (
          <MemoMissionSection
            previewMode
            missionOverride={debouncedMissionOverride as any}
          />
        );
      case "population":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("population") && (sectionLoadErrors.has("population") || !impactReportForm.population)) {
          return <PreviewError sectionName="Population" />;
        }
        return (
          <MemoPopulationComponent
            inline
            previewMode
            populationOverride={debouncedPopulationOverride}
          />
        );
      case "financial":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("financial") && (sectionLoadErrors.has("financial") || !impactReportForm.financial)) {
          return <PreviewError sectionName="Financial" />;
        }
        return (
          <MemoFinancialSection
            previewMode
            financialOverride={debouncedFinancialOverride}
          />
        );
      case "method":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("method") && (sectionLoadErrors.has("method") || !impactReportForm.method)) {
          return <PreviewError sectionName="Method" />;
        }
        return (
          <MemoMethodSection
            previewMode
            methodOverride={debouncedMethodOverride}
          />
        );
      case "curriculum":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("curriculum") && (sectionLoadErrors.has("curriculum") || !impactReportForm.curriculum)) {
          return <PreviewError sectionName="Curriculum" />;
        }
        return (
          <MemoCurriculumSection
            previewMode
            curriculumOverride={debouncedCurriculumOverride}
          />
        );
      case "impactSection":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("impactSection") && (sectionLoadErrors.has("impactSection") || !impactReportForm.impactSection)) {
          return <PreviewError sectionName="Impact Section" />;
        }
        return (
          <MemoImpactSection
            previewMode
            impactSectionOverride={debouncedImpactSectionOverride}
          />
        );
      case "hearOurImpact":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("hearOurImpact") && (sectionLoadErrors.has("hearOurImpact") || !impactReportForm.hearOurImpact)) {
          return <PreviewError sectionName="Hear Our Impact" />;
        }
        return (
          <MemoSpotifyEmbedsSection
            previewMode
            hearOurImpactOverride={debouncedHearOurImpactOverride}
          />
        );
      case "testimonials":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("testimonials") && (sectionLoadErrors.has("testimonials") || !impactReportForm.testimonials)) {
          return <PreviewError sectionName="Testimonials" />;
        }
        return (
          <MemoSingleQuoteSection
            previewMode
            testimonialsOverride={debouncedTestimonialsOverride}
          />
        );
      case "nationalImpact":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("nationalImpact") && (sectionLoadErrors.has("nationalImpact") || !impactReportForm.nationalImpact)) {
          return <PreviewError sectionName="National Impact" />;
        }
        return (
          <MemoLocationsSection
            previewMode
            nationalImpactOverride={debouncedNationalImpactOverride}
          />
        );
      case "flexA":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("flexA") && (sectionLoadErrors.has("flexA") || !impactReportForm.flexA)) {
          return <PreviewError sectionName="Flex A" />;
        }
        return (
          <MemoFlexA
            previewMode
            flexAOverride={debouncedFlexAOverride}
          />
        );
      case "flexB":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("flexB") && (sectionLoadErrors.has("flexB") || !impactReportForm.flexB)) {
          return <PreviewError sectionName="Flex B" />;
        }
        return (
          <MemoFlexB
            previewMode
            flexBOverride={debouncedFlexBOverride}
          />
        );
      case "flexC":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("flexC") && (sectionLoadErrors.has("flexC") || !impactReportForm.flexC)) {
          return <PreviewError sectionName="Flex C" />;
        }
        return (
          <MemoFlexC
            previewMode
            flexCOverride={debouncedFlexCOverride}
          />
        );
      case "impactLevels":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("impactLevels") && (sectionLoadErrors.has("impactLevels") || !impactReportForm.impactLevels)) {
          return <PreviewError sectionName="Impact Levels" />;
        }
        return (
          <MemoImpactLevelsSection
            previewMode
            impactLevelsOverride={debouncedImpactLevelsOverride}
          />
        );
      case "partners":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("partners") && (sectionLoadErrors.has("partners") || !impactReportForm.partners)) {
          return <PreviewError sectionName="Partners" />;
        }
        return (
          <MemoPartnersSection
            previewMode
            partnersOverride={debouncedPartnersOverride}
          />
        );
      case "footer":
        // Only show error if section finished loading but has error or no data
        if (loadedSections.has("footer") && (sectionLoadErrors.has("footer") || !impactReportForm.footer)) {
          return <PreviewError sectionName="Footer" />;
        }
        return (
          <MemoFooterSection
            previewMode
            footerOverride={debouncedFooterOverride}
          />
        );
      default:
        return (
          <MemoHeroSection previewMode heroOverride={debouncedHeroOverride} />
        );
    }
  };

  // Render editor based on current tab
  const renderEditor = () => {
    // Show loading state while section is being fetched
    const currentTabConfig = orderedTabs.find((t) => t.value === currentTab);
    if (sectionLoading === currentTabConfig?.routeKey) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Loading {currentTabConfig?.label ?? "section"}...
          </Typography>
        </Box>
      );
    }

    // Use routeKey to determine which editor to show (supports dynamic tab ordering)
    const routeKey = currentTabConfig?.routeKey;

    switch (routeKey) {
      case "defaults":
        return (
          <DefaultsTabEditor
            defaultSwatch={defaultSwatch}
            sectionOrder={sectionOrder}
            disabledSections={disabledSections}
            onSwatchChange={setDefaultSwatch}
            onSectionOrderChange={setSectionOrder}
            onDisabledSectionsChange={setDisabledSections}
            onDirtyChange={() => setIsDirty(true)}
          />
        );
      case "hero":
        if (!loadedSections.has("hero")) {
          return <SectionLoading sectionName="Hero" />;
        }
        if (sectionLoadErrors.has("hero") || !impactReportForm.hero) {
          return <SectionLoadError sectionName="Hero" />;
        }
        return (
          <HeroTabEditor
            hero={impactReportForm.hero}
            defaultSwatch={defaultSwatch}
            heroUploadPct={heroUploadPct}
            onHeroChange={(field, value) =>
              handleSectionChange("hero", field, value)
            }
            onBackgroundUpload={handleHeroBackgroundUpload}
            onClearBackground={handleClearHeroBackground}
          />
        );
      case "mission":
        if (!loadedSections.has("mission")) {
          return <SectionLoading sectionName="Mission" />;
        }
        if (sectionLoadErrors.has("mission") || !impactReportForm.mission) {
          return <SectionLoadError sectionName="Mission" />;
        }
        return (
          <MissionTabEditor
            mission={impactReportForm.mission}
            defaultSwatch={defaultSwatch}
            onMissionChange={(field, value) =>
              handleSectionChange("mission", field, value)
            }
          />
        );
      case "population":
        if (!loadedSections.has("population")) {
          return <SectionLoading sectionName="Population" />;
        }
        if (sectionLoadErrors.has("population") || !impactReportForm.population) {
          return <SectionLoadError sectionName="Population" />;
        }
        return (
          <PopulationTabEditor
            population={impactReportForm.population}
            defaultSwatch={defaultSwatch}
            onPopulationChange={(field, value) =>
              handleSectionChange("population", field, value)
            }
          />
        );
      case "financial":
        if (!loadedSections.has("financial")) {
          return <SectionLoading sectionName="Financial" />;
        }
        if (sectionLoadErrors.has("financial") || !impactReportForm.financial) {
          return <SectionLoadError sectionName="Financial" />;
        }
        return (
          <FinancialTabEditor
            financial={impactReportForm.financial}
            defaultSwatch={defaultSwatch}
            onFinancialChange={(field, value) =>
              handleSectionChange("financial", field, value)
            }
          />
        );
      case "method":
        if (!loadedSections.has("method")) {
          return <SectionLoading sectionName="Method" />;
        }
        if (sectionLoadErrors.has("method") || !impactReportForm.method) {
          return <SectionLoadError sectionName="Method" />;
        }
        return (
          <MethodTabEditor
            method={impactReportForm.method}
            defaultSwatch={defaultSwatch}
            onMethodChange={(field, value) =>
              handleSectionChange("method", field, value)
            }
          />
        );
      case "curriculum":
        if (!loadedSections.has("curriculum")) {
          return <SectionLoading sectionName="Curriculum" />;
        }
        if (sectionLoadErrors.has("curriculum") || !impactReportForm.curriculum) {
          return <SectionLoadError sectionName="Curriculum" />;
        }
        return (
          <CurriculumTabEditor
            curriculum={impactReportForm.curriculum}
            defaultSwatch={defaultSwatch}
            onCurriculumChange={(field, value) =>
              handleSectionChange("curriculum", field, value)
            }
          />
        );
      case "impactSection":
        if (!loadedSections.has("impactSection")) {
          return <SectionLoading sectionName="Impact" />;
        }
        if (sectionLoadErrors.has("impactSection") || !impactReportForm.impactSection) {
          return <SectionLoadError sectionName="Impact" />;
        }
        return (
          <ImpactSectionTabEditor
            impactSection={impactReportForm.impactSection}
            defaultSwatch={defaultSwatch}
            onImpactSectionChange={(field, value) =>
              handleSectionChange("impactSection", field, value)
            }
          />
        );
      case "hearOurImpact":
        if (!loadedSections.has("hearOurImpact")) {
          return <SectionLoading sectionName="Hear Our Impact" />;
        }
        if (sectionLoadErrors.has("hearOurImpact") || !impactReportForm.hearOurImpact) {
          return <SectionLoadError sectionName="Hear Our Impact" />;
        }
        return (
          <HearOurImpactTabEditor
            hearOurImpact={impactReportForm.hearOurImpact}
            defaultSwatch={defaultSwatch}
            onHearOurImpactChange={(field, value) =>
              handleSectionChange("hearOurImpact", field, value)
            }
          />
        );
      case "testimonials":
        if (!loadedSections.has("testimonials")) {
          return <SectionLoading sectionName="Testimonials" />;
        }
        if (sectionLoadErrors.has("testimonials") || !impactReportForm.testimonials) {
          return <SectionLoadError sectionName="Testimonials" />;
        }
        return (
          <TestimonialsTabEditor
            testimonials={impactReportForm.testimonials}
            defaultSwatch={defaultSwatch}
            onTestimonialsChange={(field, value) =>
              handleSectionChange("testimonials", field, value)
            }
          />
        );
      case "nationalImpact":
        if (!loadedSections.has("nationalImpact")) {
          return <SectionLoading sectionName="National Impact" />;
        }
        if (sectionLoadErrors.has("nationalImpact") || !impactReportForm.nationalImpact) {
          return <SectionLoadError sectionName="National Impact" />;
        }
        return (
          <NationalImpactTabEditor
            nationalImpact={impactReportForm.nationalImpact}
            defaultSwatch={defaultSwatch}
            onNationalImpactChange={(field, value) =>
              handleSectionChange("nationalImpact", field, value)
            }
          />
        );
      case "flexA":
        if (!loadedSections.has("flexA")) {
          return <SectionLoading sectionName="Flex A" />;
        }
        if (sectionLoadErrors.has("flexA") || !impactReportForm.flexA) {
          return <SectionLoadError sectionName="Flex A" />;
        }
        return (
          <FlexATabEditor
            flexA={impactReportForm.flexA}
            defaultSwatch={defaultSwatch}
            onFlexAChange={(field, value) =>
              handleSectionChange("flexA", field, value)
            }
          />
        );
      case "flexB":
        if (!loadedSections.has("flexB")) {
          return <SectionLoading sectionName="Flex B" />;
        }
        if (sectionLoadErrors.has("flexB") || !impactReportForm.flexB) {
          return <SectionLoadError sectionName="Flex B" />;
        }
        return (
          <FlexBTabEditor
            flexB={impactReportForm.flexB}
            defaultSwatch={defaultSwatch}
            onFlexBChange={(field, value) =>
              handleSectionChange("flexB", field, value)
            }
          />
        );
      case "flexC":
        if (!loadedSections.has("flexC")) {
          return <SectionLoading sectionName="Flex C" />;
        }
        if (sectionLoadErrors.has("flexC") || !impactReportForm.flexC) {
          return <SectionLoadError sectionName="Flex C" />;
        }
        return (
          <FlexCTabEditor
            flexC={impactReportForm.flexC}
            defaultSwatch={defaultSwatch}
            onFlexCChange={(field, value) =>
              handleSectionChange("flexC", field, value)
            }
          />
        );
      case "impactLevels":
        if (!loadedSections.has("impactLevels")) {
          return <SectionLoading sectionName="Impact Levels" />;
        }
        if (sectionLoadErrors.has("impactLevels") || !impactReportForm.impactLevels) {
          return <SectionLoadError sectionName="Impact Levels" />;
        }
        return (
          <ImpactLevelsTabEditor
            impactLevels={impactReportForm.impactLevels}
            defaultSwatch={defaultSwatch}
            onImpactLevelsChange={(field, value) =>
              handleSectionChange("impactLevels", field, value)
            }
          />
        );
      case "partners":
        if (sectionLoading === "partners") {
          return <LoadingEditor />;
        }
        if (sectionLoadErrors.has("partners") || !impactReportForm.partners) {
          return <SectionLoadError sectionName="Partners" />;
        }
        return (
          <PartnersTabEditor
            partners={impactReportForm.partners}
            defaultSwatch={defaultSwatch}
            onPartnersChange={(field, value) =>
              handleSectionChange("partners", field, value)
            }
          />
        );
      case "footer":
        if (sectionLoading === "footer") {
          return <LoadingEditor />;
        }
        if (sectionLoadErrors.has("footer") || !impactReportForm.footer) {
          return <SectionLoadError sectionName="Footer" />;
        }
        return (
          <FooterTabEditor
            footer={impactReportForm.footer}
            defaultSwatch={defaultSwatch}
            onFooterChange={(field, value) =>
              handleSectionChange("footer", field, value)
            }
          />
        );

      default:
        return null;
    }
  };

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
                  overflow: "hidden",
                  height: { xs: "60vh", md: "calc(100vh - 160px)" },
                }}
              >
                <CustomPaper
                  sx={{
                    p: 0,
                    overflow: "hidden",
                    width: `${VIEWPORTS[viewportIdx].width * artboardScale}px`,
                    height: `${VIEWPORTS[viewportIdx].height * artboardScale}px`,
                  }}
                >
                  <PreviewFrame>
                    <Box
                      ref={artboardRef}
                      sx={{
                        borderRadius: 2,
                        overflowY: "auto",
                        overflowX: "hidden",
                        WebkitOverflowScrolling: "touch",
                        boxShadow:
                          currentTab === 1 && flashPreviewHero
                            ? `0 0 0 3px ${COLORS.gogo_blue}`
                            : "none",
                        transition: "box-shadow 0.3s ease",
                        width: `${VIEWPORTS[viewportIdx].width}px`,
                        height: `${VIEWPORTS[viewportIdx].height}px`,
                        transform: `scale(${artboardScale})`,
                        transformOrigin: "top left",
                        background: "#0f1118",
                      }}
                      style={{
                        marginBottom: `${Math.max(0, VIEWPORTS[viewportIdx].height * artboardScale * 0.02)}px`,
                      }}
                    >
                      {renderPreview()}
                    </Box>
                  </PreviewFrame>
                </CustomPaper>
              </Box>
            </Box>
          </Grid>

          {/* Right column: header + tabs + forms */}
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
                          : !validateFinancialPieCharts(
                            impactReportForm.financial,
                          )
                            ? "Financial pie charts must add up to 100%"
                            : ""
                      }
                      disableHoverListener={
                        heroUploadPct === null &&
                        validateFinancialPieCharts(impactReportForm.financial)
                      }
                    >
                      <span>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={
                            isSubmitting ||
                            heroUploadPct !== null ||
                            !validateFinancialPieCharts(
                              impactReportForm.financial,
                            )
                          }
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
                    <Button
                      variant="contained"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={handleDownloadPDF}
                      sx={{
                        bgcolor: COLORS.gogo_purple,
                        "&:hover": { bgcolor: "#513ea1" },
                      }}
                    >
                      Download PDF
                    </Button>
                    <Tooltip title="View version history, create snapshots, and restore previous configurations">
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<HistoryIcon />}
                        onClick={handleOpenHistory}
                        disabled={isDirty}
                        sx={{
                          borderColor: 'rgba(255,255,255,0.3)',
                          '&:hover': {
                            borderColor: COLORS.gogo_purple,
                            bgcolor: 'rgba(255,255,255,0.05)',
                          },
                        }}
                      >
                        Version History
                      </Button>
                    </Tooltip>
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

                    const nextTab =
                      orderedTabs.find((t) => t.value === newValue) ??
                      orderedTabs[0];

                    try {
                      window.localStorage.setItem(
                        LAST_ADMIN_TAB_STORAGE_KEY,
                        nextTab.routeKey,
                      );
                    } catch { }

                    navigate(`/admin/${nextTab.routeKey}`);
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
                  {orderedTabs.map((t) => (
                    <Tab
                      key={t.routeKey}
                      label={t.label}
                      value={t.value}
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
              {renderEditor()}
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
      
      {/* Version History Modal */}
      <VersionHistoryModal
        open={isHistoryModalOpen}
        onClose={handleCloseHistory}
        onSelectSnapshot={handleSelectSnapshot}
      />

      {/* Comparison View Modal */}
      {selectedSnapshot && (
        <ComparisonView
          open={isComparisonOpen}
          onClose={handleCloseComparison}
          snapshot={selectedSnapshot}
          onRestoreComplete={handleRestoreComplete}
        />
      )}
    </FrostedScope>
  );
}

export default ImpactReportCustomizationPage;



