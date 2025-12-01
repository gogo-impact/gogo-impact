import React, { useState, useRef, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
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
  fetchDefaults,
  saveDefaults,
  PopulationContent,
  FinancialContent,
  MethodContent,
  CurriculumContent,
  ImpactSectionContent,
  HearOurImpactContent,
  TestimonialsContent,
  NationalImpactContent,
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
  validateFinancialPieCharts,
} from './components';

import FinancialAnalysisSection from '../components/FinancialAnalysisSection';
import OurMethodSection from '../components/OurMethodSection';
import CurriculumSection from '../components/CurriculumSection';
import ImpactSection from '../components/ImpactSection';
import SpotifyEmbedsSection from '../components/SpotifyEmbedsSection';
import SingleQuoteSection from '../components/SingleQuoteSection';
import LocationsSection from '../sections/LocationsSection';

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

// Viewport configurations
const VIEWPORTS = [
  { label: 'Desktop 1920×1080', width: 1920, height: 1080 },
  { label: 'Laptop 1280×800', width: 1280, height: 800 },
  { label: 'Tablet 1024×768', width: 1024, height: 768 },
  { label: 'Mobile 390×844', width: 390, height: 844 },
] as const;

// Default form values
function getDefaultFormValues(): ImpactReportForm {
  return {
    hero: {
      title: "",
      subtitle: "",
      year: "",
      tagline: "",
      textAlign: "center",
      layoutVariant: "default",
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
    },
    // Mission section - populated from backend only, no defaults
    mission: null,
    population: {
      sectionBadge: "Who We Serve",
      sectionTitle: "Our Population",
      title: "TALENT IS UNIVERSALLY DISTRIBUTED, BUT OPPORTUNITY IS NOT.",
      infoCard1Text:
        "That is why, since 2008, Guitars Over Guns has used the transformative power of music, mentorship, and the arts to unlock possibilities for young people who face systemic barriers to opportunity.",
      infoCard2Text:
        "The Childhood Global Assessment Scale (C-GAS) is a widely recognized tool to measure young people's psychological and social well-being.",
      demographicsData: [
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
        { id: "Other", label: "Other", value: 10, color: COLORS.gogo_purple },
      ],
      demographicsCaption:
        "Ages 8-18: 96% at or below the Federal Poverty Level",
      stat1Percent: 94,
      stat1Text: "of students made or maintained academic gains (2023-2024)",
      stat1Color: COLORS.gogo_teal,
      stat2Percent: 95,
      stat2Text: "of students improved conduct in their classes (2023-2024)",
      stat2Color: COLORS.gogo_pink,
      cgasTitle: "Mental Health & Well-being (C-GAS)",
      cgasTooltip:
        "The Childhood Global Assessment Scale (C-GAS) is a widely recognized tool to measure young people's psychological and social well-being.",
      cgasStats: [
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
      ],
      skillsTitle: "Core Skills Developed",
      skillsList: [
        "Confidence and self-awareness",
        "Emotional intelligence and creativity",
        "Self-presentation and expression",
        "Workforce readiness and life skills",
        "Trusted mentors & positive role models",
        "Supportive community of peers",
      ],
      blob1ColorA: `${COLORS.gogo_blue}55`,
      blob1ColorB: `${COLORS.gogo_purple}22`,
      blob2ColorA: `${COLORS.gogo_pink}55`,
      blob2ColorB: `${COLORS.gogo_yellow}22`,
    },
    financial: {},
    method: {},
    curriculum: {},
    impactSection: {},
    hearOurImpact: {},
    testimonials: {},
    nationalImpact: {},
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
    } catch {}
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Current tab state (synced with URL + localStorage)
  const [currentTab, setCurrentTab] = useState(0);

  // Keep tab selection in sync with URL segment and remember last used tab.
  useEffect(() => {
    const fromUrl = tab && ADMIN_TABS.find((t) => t.routeKey === (tab as AdminTabRouteKey));

    let fromStorage: (typeof ADMIN_TABS)[number] | undefined;
    if (!fromUrl) {
      try {
        const storedKey = window.localStorage.getItem(LAST_ADMIN_TAB_STORAGE_KEY) as AdminTabRouteKey | null;
        if (storedKey) {
          fromStorage = ADMIN_TABS.find((t) => t.routeKey === storedKey);
        }
      } catch {}
    }

    const fallback = fromUrl ?? fromStorage ?? ADMIN_TABS[0];

    if (currentTab !== fallback.value) {
      setCurrentTab(fallback.value);
    }

    try {
      window.localStorage.setItem(LAST_ADMIN_TAB_STORAGE_KEY, fallback.routeKey);
    } catch {}

    if (tab !== fallback.routeKey) {
      navigate(`/admin/${fallback.routeKey}`, { replace: true });
    }
  }, [tab, navigate, currentTab]);

  // Impact report form state with default values
  const [impactReportForm, setImpactReportForm] = useState<ImpactReportForm>(getDefaultFormValues);

  // Error states
  const [errors, setErrors] = useState<{ general: string }>({ general: '' });
  const [missionLoadError, setMissionLoadError] = useState(false);

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

  // Prefill from backend
  useEffect(() => {
    (async () => {
      const hero = await fetchHeroContent();
      if (!hero) {
        enqueueSnackbar(
          "Failed to load hero section data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
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
            title: hero.title !== undefined ? hero.title : prev.hero.title,
            subtitle:
              hero.subtitle !== undefined ? hero.subtitle : prev.hero.subtitle,
            year: hero.year !== undefined ? hero.year : prev.hero.year,
            tagline:
              hero.tagline !== undefined ? hero.tagline : prev.hero.tagline,
            ariaLabel:
              typeof hero.ariaLabel === "string"
                ? hero.ariaLabel
                : prev.hero.ariaLabel,
            textAlign:
              hero.textAlign &&
              (["left", "center", "right"] as string[]).includes(hero.textAlign)
                ? (hero.textAlign as "left" | "center" | "right")
                : prev.hero.textAlign,
            layoutVariant:
              hero.layoutVariant === "ticket" ||
              hero.layoutVariant === "default"
                ? hero.layoutVariant
                : prev.hero.layoutVariant,
            titleColor: (hero as any)?.titleColor ?? prev.hero.titleColor,
            subtitleColor:
              (hero as any)?.subtitleColor ?? prev.hero.subtitleColor,
            yearColor: (hero as any)?.yearColor ?? prev.hero.yearColor,
            taglineColor: (hero as any)?.taglineColor ?? prev.hero.taglineColor,
            // Title underline
            titleUnderlineColor:
              (hero as any)?.titleUnderlineColor ??
              prev.hero.titleUnderlineColor,
            // Bubble styling
            bubbleTextColor:
              (hero as any)?.bubbleTextColor ?? prev.hero.bubbleTextColor,
            bubbleBgColor:
              (hero as any)?.bubbleBgColor ?? prev.hero.bubbleBgColor,
            bubbleBorderColor:
              (hero as any)?.bubbleBorderColor ?? prev.hero.bubbleBorderColor,
            // CTA text colors
            primaryCtaColor:
              (hero as any)?.primaryCtaColor ?? prev.hero.primaryCtaColor,
            secondaryCtaColor:
              (hero as any)?.secondaryCtaColor ?? prev.hero.secondaryCtaColor,
            // CTA background colors
            primaryCtaBgColor:
              (hero as any)?.primaryCtaBgColor ?? prev.hero.primaryCtaBgColor,
            primaryCtaHoverBgColor:
              (hero as any)?.primaryCtaHoverBgColor ??
              prev.hero.primaryCtaHoverBgColor,
            secondaryCtaBgColor:
              (hero as any)?.secondaryCtaBgColor ??
              prev.hero.secondaryCtaBgColor,
            secondaryCtaHoverBgColor:
              (hero as any)?.secondaryCtaHoverBgColor ??
              prev.hero.secondaryCtaHoverBgColor,
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
            // Also set the backgroundGradient string directly from the loaded value
            backgroundGradient:
              hero.backgroundColor ?? prev.hero.backgroundGradient,
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

  // Prefill mission from backend - purely data driven, no defaults
  useEffect(() => {
    (async () => {
      const mission = await fetchMissionContent();
      if (!mission) {
        setMissionLoadError(true);
        enqueueSnackbar(
          "Failed to load mission section data. Please refresh the page.",
          { variant: "error" },
        );
        return;
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

      // Extract opacity from gradients if using rgba
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

      // Parse disciplines modal
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

      // Parse stats
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
                s?.modalId === "disciplines" ? "openDisciplinesModal" : "none";
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

      // Stats equalizer config
      const eq = (mission as any)?.statsEqualizer ?? {};
      const eqBarCount = Number(eq?.barCount);

      // Build mission form directly from backend data
      const missionForm: MissionSectionForm = {
        enabled: (mission as any)?.visible !== false,
        ariaLabel: (mission as any)?.ariaLabel ?? "",
        layoutVariant:
          (mission as any)?.layoutVariant === "default" ? "default" : "ticket",
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
        titleUnderlineGradient: (mission as any)?.titleUnderlineGradient ?? "",
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
        badgeIcon: (mission as any)?.badgeIcon ?? { type: "glyph", value: "♫" },
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
        ticketShowBarcode: (mission as any)?.ticketShowBarcode !== false,
        statCardBgColor: (mission as any)?.statCardBgColor ?? null,
        statCardBorderWidth: (mission as any)?.statCardBorderWidth ?? null,
      };

      setImpactReportForm((prev) => {
        const next = { ...prev, mission: missionForm };
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

  // Prefill population from backend
  useEffect(() => {
    (async () => {
      const population = await fetchPopulationContent();
      if (!population) {
        enqueueSnackbar(
          "Failed to load population section data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        population: {
          ...prev.population,
          ...population,
        },
      }));
    })();
  }, []);

  // Prefill financial from backend
  useEffect(() => {
    (async () => {
      const financial = await fetchFinancialContent();
      if (!financial) {
        enqueueSnackbar(
          "Failed to load financial section data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        financial: {
          ...prev.financial,
          ...financial,
        },
      }));
    })();
  }, []);

  // Prefill method from backend
  useEffect(() => {
    (async () => {
      const method = await fetchMethodContent();
      if (!method) {
        enqueueSnackbar(
          "Failed to load method section data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        method: {
          ...prev.method,
          ...method,
        },
      }));
    })();
  }, []);

  // Prefill curriculum from backend
  useEffect(() => {
    (async () => {
      const curriculum = await fetchCurriculumContent();
      if (!curriculum) {
        enqueueSnackbar(
          "Failed to load curriculum section data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        curriculum: {
          ...prev.curriculum,
          ...curriculum,
        },
      }));
    })();
  }, []);

  // Prefill impactSection from backend
  useEffect(() => {
    (async () => {
      const impactSection = await fetchImpactSectionContent();
      if (!impactSection) {
        enqueueSnackbar(
          "Failed to load impact section data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        impactSection: {
          ...prev.impactSection,
          ...impactSection,
        },
      }));
    })();
  }, []);

  // Prefill hearOurImpact from backend
  useEffect(() => {
    (async () => {
      const hearOurImpact = await fetchHearOurImpactContent();
      if (!hearOurImpact) {
        enqueueSnackbar(
          "Failed to load Hear Our Impact data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        hearOurImpact: {
          ...prev.hearOurImpact,
          ...hearOurImpact,
        },
      }));
    })();
  }, []);

  // Prefill testimonials from backend
  useEffect(() => {
    (async () => {
      const testimonials = await fetchTestimonialsContent();
      if (!testimonials) {
        enqueueSnackbar(
          "Failed to load Testimonials data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        testimonials: {
          ...prev.testimonials,
          ...testimonials,
        },
      }));
    })();
  }, []);

  // Prefill nationalImpact from backend
  useEffect(() => {
    (async () => {
      const nationalImpact = await fetchNationalImpactContent();
      if (!nationalImpact) {
        enqueueSnackbar(
          "Failed to load National Impact data from database. Using empty form.",
          { variant: "warning" },
        );
        return;
      }
      setImpactReportForm((prev) => ({
        ...prev,
        nationalImpact: {
          ...prev.nationalImpact,
          ...nationalImpact,
        },
      }));
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

      // Use the backgroundGradient string directly (opacity is embedded in the rgba colors)
      // Fall back to legacy fields if no backgroundGradient is set
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
          return composeGradient(safeDegree, safeColor1, safeColor2, safeAlpha);
        })();

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
        } catch {}
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

      const payload = {
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
        // Title underline
        titleUnderlineColor:
          impactReportForm.hero.titleUnderlineColor || undefined,
        // Bubble styling
        bubbleTextColor: impactReportForm.hero.bubbleTextColor || undefined,
        bubbleBgColor: impactReportForm.hero.bubbleBgColor || undefined,
        bubbleBorderColor: impactReportForm.hero.bubbleBorderColor || undefined,
        // CTA buttons
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
        primaryCtaBgColor: impactReportForm.hero.primaryCtaBgColor || undefined,
        primaryCtaHoverBgColor:
          impactReportForm.hero.primaryCtaHoverBgColor || undefined,
        secondaryCtaBgColor:
          impactReportForm.hero.secondaryCtaBgColor || undefined,
        secondaryCtaHoverBgColor:
          impactReportForm.hero.secondaryCtaHoverBgColor || undefined,
      };
      console.log("[admin][hero] save payload", payload);
      const heroSaveResult = await saveHeroContent(payload);
      if (!heroSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // Save Defaults (swatch)
      if (defaultSwatch && defaultSwatch.length > 0) {
        await saveDefaults({ colorSwatch: defaultSwatch });
      }

      // ======= Mission save =======
      if (!impactReportForm.mission) {
        throw new Error("Mission data not loaded. Please refresh the page.");
      }
      // Use full gradient strings directly if available, otherwise fall back to composing from legacy fields
      const missionBackgroundColor =
        impactReportForm.mission.backgroundGradient ||
        (() => {
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
          return composeGradient(
            mSafeDegree,
            mSafeColor1,
            mSafeColor2,
            mSafeAlpha,
          );
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
        visible: impactReportForm.mission.enabled,
        ariaLabel: impactReportForm.mission.ariaLabel || undefined,
        layoutVariant: impactReportForm.mission.layoutVariant,
        textAlign: impactReportForm.mission.textAlign,
        animationsEnabled: impactReportForm.mission.animationsEnabled,
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
        ticketShowBarcode: impactReportForm.mission.ticketShowBarcode,
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
        overlayColor1: impactReportForm.mission.overlayColor1 || undefined,
        overlayColor2: impactReportForm.mission.overlayColor2 || undefined,
        overlayOpacity: impactReportForm.mission.overlayOpacity,
        statCardBgColor: impactReportForm.mission.statCardBgColor || undefined,
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
      const missionSaveResult = await saveMissionContent(missionPayload);
      if (!missionSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= Population save =======
      const populationPayload = { ...impactReportForm.population };
      console.log("[admin][population] save payload", populationPayload);
      const populationSaveResult =
        await savePopulationContent(populationPayload);
      if (!populationSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= Financial save =======
      const financialPayload = { ...impactReportForm.financial };
      console.log("[admin][financial] save payload", financialPayload);
      const financialSaveResult = await saveFinancialContent(financialPayload);
      if (!financialSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= Method save =======
      const methodPayload = { ...impactReportForm.method };
      console.log("[admin][method] save payload", methodPayload);
      const methodSaveResult = await saveMethodContent(methodPayload);
      if (!methodSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= Curriculum save =======
      const curriculumPayload = { ...impactReportForm.curriculum };
      console.log("[admin][curriculum] save payload", curriculumPayload);
      const curriculumSaveResult =
        await saveCurriculumContent(curriculumPayload);
      if (!curriculumSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= Impact Section save =======
      const impactSectionPayload = { ...impactReportForm.impactSection };
      console.log("[admin][impactSection] save payload", impactSectionPayload);
      const impactSectionSaveResult =
        await saveImpactSectionContent(impactSectionPayload);
      if (!impactSectionSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= Hear Our Impact save =======
      const hearOurImpactPayload = { ...impactReportForm.hearOurImpact };
      console.log("[admin][hearOurImpact] save payload", hearOurImpactPayload);
      const hearOurImpactSaveResult =
        await saveHearOurImpactContent(hearOurImpactPayload);
      if (!hearOurImpactSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= Testimonials save =======
      const testimonialsPayload = { ...impactReportForm.testimonials };
      console.log("[admin][testimonials] save payload", testimonialsPayload);
      const testimonialsSaveResult =
        await saveTestimonialsContent(testimonialsPayload);
      if (!testimonialsSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      // ======= National Impact save =======
      const nationalImpactPayload = { ...impactReportForm.nationalImpact };
      console.log(
        "[admin][nationalImpact] save payload",
        nationalImpactPayload,
      );
      const nationalImpactSaveResult = await saveNationalImpactContent(
        nationalImpactPayload,
      );
      if (!nationalImpactSaveResult) {
        throw new Error(
          "Failed to save changes. Please check your connection and try again.",
        );
      }

      enqueueSnackbar("Impact report saved", { variant: "success" });
      setIsDirty(false);
      setLastSavedAt(new Date());
      setSavedSnapshot(
        JSON.parse(JSON.stringify(impactReportForm)) as ImpactReportForm,
      );
    } catch (error) {
      console.error("Error saving impact report:", error);
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

  // Discard changes and restore last saved snapshot
  const handleDiscard = async () => {
    if (!savedSnapshot) return;
    const restore = JSON.parse(
      JSON.stringify(savedSnapshot),
    ) as ImpactReportForm;
    setImpactReportForm(restore);
    setIsDirty(false);
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
    } catch {}
    enqueueSnackbar("Changes discarded", { variant: "info" });
  };

  // Build and debounce the preview hero override
  const liveHeroOverride = useMemo(() => {
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
      enabled: impactReportForm.mission.enabled,
      ariaLabel: impactReportForm.mission.ariaLabel,
      layoutVariant: impactReportForm.mission.layoutVariant,
      textAlign: impactReportForm.mission.textAlign,
      animationsEnabled: impactReportForm.mission.animationsEnabled,
      title: impactReportForm.mission.title,
      titleColor: impactReportForm.mission.titleColor || undefined,
      titleGradient: missionTitleGradient,
      titleUnderlineGradient: missionTitleUnderlineGradient,
      ticketStripeGradient: missionTicketStripeGradient,
      ticketBorderColor:
        impactReportForm.mission.ticketBorderColor || undefined,
      ticketBackdropColor:
        impactReportForm.mission.ticketBackdropColor || undefined,
      ticketShowBarcode: impactReportForm.mission.ticketShowBarcode,
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
  const renderPreview = () => {
    switch (currentTab) {
      case 0:
        return <DefaultsPreview defaultSwatch={defaultSwatch} />;
      case 1:
        return (
          <MemoHeroSection previewMode heroOverride={debouncedHeroOverride} />
        );
      case 2:
        if (missionLoadError || !impactReportForm.mission) {
          return (
            <Box sx={{ p: 4, textAlign: "center", color: "white" }}>
              <Typography variant="h6" color="error">
                Mission data not loaded
              </Typography>
            </Box>
          );
        }
        return (
          <MemoMissionSection
            previewMode
            missionOverride={debouncedMissionOverride as any}
          />
        );
      case 3:
        return (
          <MemoPopulationComponent
            inline
            previewMode
            populationOverride={debouncedPopulationOverride}
          />
        );
      case 4:
        return (
          <MemoFinancialSection
            previewMode
            financialOverride={debouncedFinancialOverride}
          />
        );
      case 5:
        return (
          <MemoMethodSection
            previewMode
            methodOverride={debouncedMethodOverride}
          />
        );
      case 6:
        return (
          <MemoCurriculumSection
            previewMode
            curriculumOverride={debouncedCurriculumOverride}
          />
        );
      case 7:
        return (
          <MemoImpactSection
            previewMode
            impactSectionOverride={debouncedImpactSectionOverride}
          />
        );
      case 8:
        return (
          <MemoSpotifyEmbedsSection
            previewMode
            hearOurImpactOverride={debouncedHearOurImpactOverride}
          />
        );
      case 9:
        return (
          <MemoSingleQuoteSection
            previewMode
            testimonialsOverride={debouncedTestimonialsOverride}
          />
        );
      case 10:
        return (
          <MemoLocationsSection
            previewMode
            nationalImpactOverride={debouncedNationalImpactOverride}
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
    switch (currentTab) {
      case 0:
        return (
          <DefaultsTabEditor
            defaultSwatch={defaultSwatch}
            onSwatchChange={setDefaultSwatch}
            onDirtyChange={() => setIsDirty(true)}
          />
        );
      case 1:
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
      case 2:
        if (missionLoadError || !impactReportForm.mission) {
          return (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="error" gutterBottom>
                Failed to load Mission section data
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
        return (
          <MissionTabEditor
            mission={impactReportForm.mission}
            defaultSwatch={defaultSwatch}
            onMissionChange={(field, value) =>
              handleSectionChange("mission", field, value)
            }
          />
        );
      case 3:
        return (
          <PopulationTabEditor
            population={impactReportForm.population}
            defaultSwatch={defaultSwatch}
            onPopulationChange={(field, value) =>
              handleSectionChange("population", field, value)
            }
          />
        );
      case 4:
        return (
          <FinancialTabEditor
            financial={impactReportForm.financial}
            defaultSwatch={defaultSwatch}
            onFinancialChange={(field, value) =>
              handleSectionChange("financial", field, value)
            }
          />
        );
      case 5:
        return (
          <MethodTabEditor
            method={impactReportForm.method}
            defaultSwatch={defaultSwatch}
            onMethodChange={(field, value) =>
              handleSectionChange("method", field, value)
            }
          />
        );
      case 6:
        return (
          <CurriculumTabEditor
            curriculum={impactReportForm.curriculum}
            defaultSwatch={defaultSwatch}
            onCurriculumChange={(field, value) =>
              handleSectionChange("curriculum", field, value)
            }
          />
        );
      case 7:
        return (
          <ImpactSectionTabEditor
            impactSection={impactReportForm.impactSection}
            defaultSwatch={defaultSwatch}
            onImpactSectionChange={(field, value) =>
              handleSectionChange("impactSection", field, value)
            }
          />
        );
      case 8:
        return (
          <HearOurImpactTabEditor
            hearOurImpact={impactReportForm.hearOurImpact}
            defaultSwatch={defaultSwatch}
            onHearOurImpactChange={(field, value) =>
              handleSectionChange("hearOurImpact", field, value)
            }
          />
        );
      case 9:
        return (
          <TestimonialsTabEditor
            testimonials={impactReportForm.testimonials}
            defaultSwatch={defaultSwatch}
            onTestimonialsChange={(field, value) =>
              handleSectionChange("testimonials", field, value)
            }
          />
        );
      case 10:
        return (
          <NationalImpactTabEditor
            nationalImpact={impactReportForm.nationalImpact}
            defaultSwatch={defaultSwatch}
            onNationalImpactChange={(field, value) =>
              handleSectionChange("nationalImpact", field, value)
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
        <Grid item container spacing={{ xs: 2, md: 3 }} sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Left column: title + permanent preview */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              maxHeight: 'none',
              overflow: 'visible',
              pr: { md: 1 },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h2"
                color="white"
                sx={{
                  mb: 1,
                  textAlign: { xs: 'center', md: 'left' },
                  fontFamily: "'Airwaves', 'Century Gothic', 'Arial', sans-serif",
                }}
              >
                Customize Impact Report
              </Typography>
              <Typography
                variant="subtitle1"
                color="white"
                sx={{
                  mb: 2,
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: 600,
                }}
              >
                Customize all sections of the impact report to match your organization's needs
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 1,
                  gap: 1,
                  flexWrap: 'wrap',
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
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255,255,255,0.06)',
                        color: 'white',
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
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  overflow: 'hidden',
                  height: { xs: '60vh', md: 'calc(100vh - 160px)' },
                }}
              >
                <CustomPaper
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    width: `${VIEWPORTS[viewportIdx].width * artboardScale}px`,
                    height: `${VIEWPORTS[viewportIdx].height * artboardScale}px`,
                  }}
                >
                  <PreviewFrame>
                    <Box
                      ref={artboardRef}
                      sx={{
                        borderRadius: 2,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        boxShadow:
                          currentTab === 1 && flashPreviewHero
                            ? `0 0 0 3px ${COLORS.gogo_blue}`
                            : 'none',
                        transition: 'box-shadow 0.3s ease',
                        width: `${VIEWPORTS[viewportIdx].width}px`,
                        height: `${VIEWPORTS[viewportIdx].height}px`,
                        transform: `scale(${artboardScale})`,
                        transformOrigin: 'top left',
                        background: '#0f1118',
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
              maxHeight: 'calc(100vh - 24px)',
              overflowY: 'auto',
              pl: { md: 1 },
            }}
          >
            {/* Sticky group: actions box then tabs box */}
            <Box
              sx={{
                position: 'sticky',
                top: 16,
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mb: 2,
              }}
            >
              <CustomPaper sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      flexWrap: 'wrap',
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
                          : 'No recent changes'}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip
                      title={
                        heroUploadPct !== null
                          ? 'Please wait for the upload to finish'
                          : !validateFinancialPieCharts(impactReportForm.financial)
                          ? 'Financial pie charts must add up to 100%'
                          : ''
                      }
                      disableHoverListener={heroUploadPct === null && validateFinancialPieCharts(impactReportForm.financial)}
                    >
                      <span>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={isSubmitting || heroUploadPct !== null || !validateFinancialPieCharts(impactReportForm.financial)}
                          sx={{
                            bgcolor: COLORS.gogo_blue,
                            '&:hover': { bgcolor: '#0066cc' },
                          }}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
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
                      enqueueSnackbar('Save or discard changes before switching tabs', { variant: 'info' });
                      return;
                    }
                    setCurrentTab(newValue);

                    const nextTab = ADMIN_TABS.find((t) => t.value === newValue) ?? ADMIN_TABS[0];

                    try {
                      window.localStorage.setItem(LAST_ADMIN_TAB_STORAGE_KEY, nextTab.routeKey);
                    } catch {}

                    navigate(`/admin/${nextTab.routeKey}`);
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiTab-root': {
                      color: 'rgba(255,255,255,0.7)',
                      minWidth: { xs: 'auto', sm: 120 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      borderRadius: 1,
                      textTransform: 'none',
                      '&.Mui-disabled': {
                        opacity: 0.45,
                        color: 'rgba(255,255,255,0.35)',
                      },
                      '&.Mui-selected': {
                        color: COLORS.gogo_blue,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        WebkitBackdropFilter: 'blur(6px) saturate(140%)',
                        backdropFilter: 'blur(6px) saturate(140%)',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: COLORS.gogo_blue,
                    },
                  }}
                >
                  {ADMIN_TABS.map((t) => (
                    <Tab key={t.value} label={t.label} value={t.value} disabled={isDirty} />
                  ))}
                </Tabs>
              </CustomPaper>
            </Box>
            {/* Tab content */}
            <CustomPaper
              sx={{
                p: { xs: 2, sm: 3 },
                minHeight: { xs: 400, md: 600 },
                overflow: 'auto',
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
    </FrostedScope>
  );
}

export default ImpactReportCustomizationPage;



