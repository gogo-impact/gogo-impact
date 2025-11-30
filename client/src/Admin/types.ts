// Shared types for the Admin customization pages

export type MissionLayoutVariant = 'ticket' | 'default';
export type MissionTextAlign = 'left' | 'center' | 'right';
export type MissionStatAction =
  | 'none'
  | 'openModal' // legacy
  | 'openDisciplinesModal'
  | 'openStudentMusicModal'
  | 'openMentorMusicModal'
  | 'scrollToMap'
  | 'openMapModal';
export type MissionStatNumberSource = 'explicit' | 'modalItemsLength';

export interface MissionBadgeIcon {
  type: 'glyph' | 'iconKey';
  value: string;
}

export interface MissionStat {
  id: string;
  number: string | number;
  label: string;
  color?: string;
  action?: MissionStatAction;
  modalId?: string | null;
  iconKey?: string | null;
  numberSource?: MissionStatNumberSource;
}

export interface MissionDisciplineItem {
  name: string;
  iconKey?: string | null;
}

export interface MissionStatsEqualizer {
  enabled: boolean;
  barCount: number;
}

export interface MissionBackgroundLogo {
  enabled: boolean;
  svgKey?: string;
  opacity?: number;
  rotationDeg?: number;
  scale?: number;
}

export interface HeroSectionForm {
  title: string;
  subtitle: string;
  year: string;
  tagline: string;
  textAlign: MissionTextAlign;
  layoutVariant: MissionLayoutVariant;
  titleColor?: string;
  subtitleColor?: string;
  yearColor?: string;
  taglineColor?: string;
  primaryCtaColor?: string;
  secondaryCtaColor?: string;
  bubblesCsv: string;
  // Background gradient - now stored as full CSS string
  backgroundGradient?: string | null;
  // Legacy separate fields (kept for backward compatibility during migration)
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
  // NEW: CTA button background colors
  primaryCtaBgColor?: string;
  primaryCtaHoverBgColor?: string;
  secondaryCtaBgColor?: string;
  secondaryCtaHoverBgColor?: string;
  // NEW: Title underline color
  titleUnderlineColor?: string;
  // NEW: Bubble/chip styling
  bubbleTextColor?: string;
  bubbleBgColor?: string;
  bubbleBorderColor?: string;
}

export interface MissionSectionForm {
  // enable/visibility
  enabled: boolean;
  ariaLabel: string;
  layoutVariant: MissionLayoutVariant;
  textAlign: MissionTextAlign;
  animationsEnabled: boolean;
  // basic copy
  title: string;
  titleColor?: string | null;
  // Title gradient - full CSS string
  titleGradient?: string | null;
  // Legacy separate fields (kept for backward compatibility)
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
  // Title underline gradient - full CSS string
  titleUnderlineGradient?: string | null;
  // Legacy separate fields
  titleUnderlineGradientDegree: number;
  titleUnderlineGradientColor1: string;
  titleUnderlineGradientColor2: string;
  // Ticket stripe gradient - full CSS string
  ticketStripeGradient?: string | null;
  // Legacy separate fields
  ticketStripeGradientDegree: number;
  ticketStripeGradientColor1: string;
  ticketStripeGradientColor2: string;
  // Background gradient - full CSS string
  backgroundGradient?: string | null;
  // Legacy separate fields (kept for backward compatibility)
  degree: number;
  color1: string;
  color2: string;
  gradientOpacity: number;
  // background blobs
  blob1ColorA?: string | null;
  blob1ColorB?: string | null;
  blob2ColorA?: string | null;
  blob2ColorB?: string | null;
  // stats and modal editing
  statsTitle?: string;
  statsTitleColor?: string | null;
  statsEqualizer: MissionStatsEqualizer;
  stats: MissionStat[];
  modalTitle?: string;
  disciplinesItems: MissionDisciplineItem[];
  backgroundLogo: MissionBackgroundLogo;
  // NEW: Overlay colors (radial gradients behind content)
  overlayColor1?: string | null;
  overlayColor2?: string | null;
  overlayOpacity?: number | null;
  // NEW: Ticket border and backdrop
  ticketBorderColor?: string | null;
  ticketBackdropColor?: string | null;
  ticketShowBarcode?: boolean;
  // NEW: Stat card styling
  statCardBgColor?: string | null;
  statCardBorderWidth?: number | null;
}

export interface ImpactStat {
  id: string;
  number: string;
  label: string;
}

export interface ImpactSectionForm {
  title: string;
  stats: ImpactStat[];
  enabled: boolean;
}

export interface ProgramItem {
  id: string;
  name: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
}

export interface ProgramsSectionForm {
  title: string;
  programs: ProgramItem[];
  enabled: boolean;
}

export interface LocationItem {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export interface LocationsSectionForm {
  title: string;
  locations: LocationItem[];
  enabled: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  content: string;
  image: File | null;
  imagePreview: string | null;
}

export interface TestimonialSectionForm {
  title: string;
  testimonials: TestimonialItem[];
  enabled: boolean;
}

// Re-export PopulationContent, FinancialContent, MethodContent, CurriculumContent, and ImpactSectionContent from impact.api for convenience
export type { PopulationContent, FinancialContent, MethodContent, CurriculumContent, ImpactSectionContent } from '../services/impact.api';

export interface ImpactReportForm {
  hero: HeroSectionForm;
  mission: MissionSectionForm;
  population: import('../services/impact.api').PopulationContent;
  financial: import('../services/impact.api').FinancialContent;
  method: import('../services/impact.api').MethodContent;
  curriculum: import('../services/impact.api').CurriculumContent;
  impactSection: import('../services/impact.api').ImpactSectionContent;
  hearOurImpact: import('../services/impact.api').HearOurImpactContent;
  testimonials: import('../services/impact.api').TestimonialsContent;
  nationalImpact: import('../services/impact.api').NationalImpactContent;
  impact: ImpactSectionForm;
  programs: ProgramsSectionForm;
  locations: LocationsSectionForm;
}

// Tab configuration
export const ADMIN_TABS = [
  { label: 'Defaults', value: 0, routeKey: 'defaults' as const },
  { label: 'Hero Section', value: 1, routeKey: 'hero' as const },
  { label: 'Mission Section', value: 2, routeKey: 'mission' as const },
  { label: 'Population Section', value: 3, routeKey: 'population' as const },
  { label: 'Financial Section', value: 4, routeKey: 'financial' as const },
  { label: 'Method Section', value: 5, routeKey: 'method' as const },
  { label: 'Curriculum Section', value: 6, routeKey: 'curriculum' as const },
  { label: 'Impact Section', value: 7, routeKey: 'impactSection' as const },
  { label: 'Hear Our Impact', value: 8, routeKey: 'hearOurImpact' as const },
  { label: 'Testimonials', value: 9, routeKey: 'testimonials' as const },
  { label: 'National Impact', value: 10, routeKey: 'nationalImpact' as const },
] as const;

export type AdminTabRouteKey = (typeof ADMIN_TABS)[number]['routeKey'];
export const LAST_ADMIN_TAB_STORAGE_KEY = 'gogo_admin_impact_tab';

export const DEFAULT_SWATCH_SIZE = 6;

export const MISSION_TEXT_ALIGN_OPTIONS: MissionTextAlign[] = ['left', 'center', 'right'];
export const MISSION_LAYOUT_VARIANTS: MissionLayoutVariant[] = ['ticket', 'default'];
export const BACKGROUND_LOGO_OPTIONS = [{ key: 'gogoLogoBK', label: 'GOGO Logo' }];
