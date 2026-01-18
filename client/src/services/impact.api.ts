export interface HeroApiResponse<T> {
  data: T;
}

export interface HeroCta {
  label?: string;
  href?: string;
}

export interface HeroContent {
  // Background - Full CSS gradient string
  backgroundGradient?: string;
  backgroundColor?: string;
  backgroundImage?: string | null;
  backgroundImageGrayscale?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  layoutVariant?: 'ticket' | 'default';
  ariaLabel?: string;
  titleColor?: string;
  subtitleColor?: string;
  yearColor?: string;
  taglineColor?: string;
  primaryCtaColor?: string;
  secondaryCtaColor?: string;
  // CTA button background colors
  primaryCtaBgColor?: string;
  primaryCtaHoverBgColor?: string;
  secondaryCtaBgColor?: string;
  secondaryCtaHoverBgColor?: string;
  // Title underline color
  titleUnderlineColor?: string;
  // Bubble/chip styling
  bubbleTextColor?: string;
  bubbleBgColor?: string;
  bubbleBorderColor?: string;
  // Waveform & Music Toy
  showWaveform?: boolean;
  showMusicToy?: boolean;
  waveformGradient?: string | null;
  waveformRainbow?: boolean;
  title?: string;
  subtitle?: string;
  year?: string;
  tagline?: string;
  bubbles?: string[];
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  slug?: string;
}

// =========================
// Mission content interfaces
// =========================
export interface MissionModalItem {
  name: string;
  iconKey?: string | null;
}

export interface MissionModal {
  id: string;
  title?: string;
  items: MissionModalItem[];
}

export interface MissionStat {
  id: string;
  number: string | number;
  label: string;
  color?: string;
  iconKey?: string | null;
  action?: 'none' | 'openModal';
  modalId?: string | null;
  numberSource?: 'explicit' | 'modalItemsLength' | 'mapLocationsLength';
  visible?: boolean;
}

export interface MissionContent {
  // Background - Full CSS gradient string
  backgroundGradient?: string | null;
  backgroundColor?: string;
  backgroundImage?: string | null;
  backgroundImageAlt?: string | null;
  backgroundImageGrayscale?: boolean;
  ariaLabel?: string | null;
  visible?: boolean | null;
  textAlign?: 'left' | 'center' | 'right';
  layoutVariant?: 'ticket' | 'default';
  animationsEnabled?: boolean | null;

  title?: string | null;
  titleColor?: string | null;
  titleGradient?: string | null;
  titleUnderlineGradient?: string | null;

  badgeLabel?: string | null;
  badgeIcon?: { type: 'glyph' | 'iconKey'; value: string } | null;
  badgeTextColor?: string | null;
  badgeBgColor?: string | null;
  badgeBorderColor?: string | null;

  statementTitle?: string | null;
  statementTitleColor?: string | null;
  statementText?: string | null;
  statementTextColor?: string | null;
  statementMeta?: string | null;
  statementMetaColor?: string | null;
  serial?: string | null;
  serialColor?: string | null;

  ticketStripeGradient?: string | null;
  ticketBorderColor?: string | null;
  ticketBackdropColor?: string | null;
  ticketShowBarcode?: boolean | null;
  ticketBlotch1Color?: string | null;
  ticketBlotch2Color?: string | null;

  // Statement box styling
  statementBoxBorderColor?: string | null;
  statementBoxBgColor?: string | null;
  statementTextGradientColor?: string | null;

  // Barcode styling
  barcodeColor?: string | null;

  // Background logo
  backgroundLogoEnabled?: boolean | null;
  backgroundLogoOpacity?: number | null;
  backgroundLogoRotation?: number | null;
  backgroundLogoScale?: number | null;

  // Legacy backgroundLogo object (kept for backward compatibility)
  backgroundLogo?: {
    enabled: boolean;
    svgKey?: string;
    opacity?: number;
    rotationDeg?: number;
    scale?: number;
  } | null;

  statsTitle?: string | null;
  statsTitleColor?: string | null;
  stats?: MissionStat[] | null;
  overlayColor1?: string | null;
  overlayColor2?: string | null;
  overlayOpacity?: number | null;

  statsEqualizer?: {
    enabled: boolean;
    barCount?: number;
  } | null;

  modals?: MissionModal[] | null;

  // NEW: Stat card styling
  statCardBgColor?: string | null;
  statCardBorderWidth?: number | null;
}

// =========================
// Population content interfaces
// =========================
export interface PopulationStat {
  value: string;
  label: string;
  color: string;
}

export interface DemographicItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface PopulationContent {
  // Section Header
  sectionBadge?: string;
  sectionBadgeGradient?: string; // Full CSS gradient string
  // Legacy fields (kept for backward compatibility)
  sectionBadgeGradientStart?: string;
  sectionBadgeGradientEnd?: string;
  sectionBadgeGradientDegree?: number;
  sectionTitle?: string;
  sectionTitleUnderlineColor?: string;

  // Main Title
  title?: string;
  titleGradient?: string; // Full CSS gradient string
  // Legacy fields (kept for backward compatibility)
  titleGradientStart?: string;
  titleGradientEnd?: string;
  titleGradientDegree?: number;
  titleUnderlineColor?: string; // Animated underline under the main title

  // Glow Blobs
  blob1ColorA?: string;
  blob1ColorB?: string;
  blob2ColorA?: string;
  blob2ColorB?: string;

  // Info Cards
  infoCard1Text?: string;
  infoCard2Text?: string;

  // Demographics Pie
  demographicsTitle?: string;
  demographicsData?: DemographicItem[];
  demographicsCaption?: string;

  // Stats
  stat1Percent?: number;
  stat1Text?: string;
  stat1Color?: string;

  stat2Percent?: number;
  stat2Text?: string;
  stat2Color?: string;

  // C-GAS
  cgasTitle?: string;
  cgasTooltip?: string;
  cgasStats?: PopulationStat[]; // Array of 3

  // Skills
  skillsTitle?: string;
  skillsList?: string[];

  // Container background - Full CSS gradient string
  containerBgGradient?: string;
  // Legacy fields (kept for backward compatibility)
  containerBgGradientStart?: string;
  containerBgGradientEnd?: string;
  containerBgGradientDegree?: number;

  // NEW: Container overlay radials
  containerOverlayColor1?: string;
  containerOverlayColor2?: string;

  // NEW: Card backgrounds
  infoCardBgColor?: string;
  bentoCardBgColor?: string;

  // NEW: Skill chip styling
  skillChipBgColor?: string;
  skillChipBorderColor?: string;
  skillChipTextColor?: string;

  // NEW: Percent circle inner background
  percentCircleInnerBgColor?: string;

  // NEW: Population photos (array of image URLs)
  populationPhotos?: string[];
}

// =========================
// Financial content interfaces
// =========================
export interface FinancialPieItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface FinancialContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  decorationColor1?: string | null;
  decorationColor2?: string | null;
  decorationPosition1?: string | null;
  decorationPosition2?: string | null;

  // Header
  title?: string | null;
  titleGradient?: string | null;
  subtitle?: string | null;
  subtitleColor?: string | null;

  // KPI Cards styling
  kpiCardBgGradient?: string | null;
  kpiCardBorderColor?: string | null;
  kpiCardBorderRadius?: number | null;
  kpiValueColor?: string | null;
  kpiLabelColor?: string | null;
  kpiNetPositiveColor?: string | null;
  kpiNetNegativeColor?: string | null;

  // KPI Labels
  kpiRevenueLabel?: string | null;
  kpiExpensesLabel?: string | null;
  kpiNetLabel?: string | null;
  kpiYoyLabel?: string | null;

  // Line chart
  lineChartTitle?: string | null;
  lineChartTitleColor?: string | null;
  lineChartBgColor?: string | null;
  lineChartBorderColor?: string | null;
  revenueLineColor?: string | null;
  expenseLineColor?: string | null;
  revenueLineWidth?: number | null;
  expenseLineWidth?: number | null;
  axisLineColor?: string | null;
  axisLabelColor?: string | null;
  axisLabelFontSize?: number | null;
  tooltipBgColor?: string | null;
  tooltipTextColor?: string | null;
  tooltipBorderColor?: string | null;
  legendRevenueLabel?: string | null;
  legendExpensesLabel?: string | null;
  legendTextColor?: string | null;

  // Financial data
  years?: string[] | null;
  revenueData?: number[] | null;
  expenseData?: number[] | null;
  maxYAxis?: number | null;

  // Pie charts
  pieChartBgColor?: string | null;
  pieChartBorderColor?: string | null;
  pieChartInnerRadius?: number | null;

  // "Where the Money Comes From" pie
  comesFromTitle?: string | null;
  comesFromTitleColor?: string | null;
  comesFromData?: FinancialPieItem[] | null;

  // "Where the Money Goes" pie
  goesToTitle?: string | null;
  goesToTitleColor?: string | null;
  goesToData?: FinancialPieItem[] | null;

  // Breakdown card
  breakdownTitle?: string | null;
  breakdownTitleColor?: string | null;
  breakdownTextColor?: string | null;
  breakdownValueFontWeight?: number | null;

  // Optional note
  showNote?: boolean | null;
  noteText?: string | null;
  noteBgColor?: string | null;
  noteBorderColor?: string | null;
  noteTextColor?: string | null;
}

// =========================
// Method content interfaces
// =========================
export interface MethodItem {
  id: string;
  iconKey: string;
  text: string;
}

export interface MethodContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  glowColor1?: string | null;
  glowColor2?: string | null;

  // Header
  title?: string | null;
  titleGradient?: string | null;
  subtitle?: string | null;
  subtitleColor?: string | null;

  // Method cards
  cardBgColor?: string | null;
  cardBorderColor?: string | null;
  cardTitleColor?: string | null;
  iconGradient?: string | null;
  methodItems?: MethodItem[] | null;

  // Narrative section
  leadText?: string | null;
  leadTextColor?: string | null;
  secondaryText?: string | null;
  secondaryTextColor?: string | null;
  secondaryBorderColor?: string | null;
}

// =========================
// Curriculum content interfaces
// =========================
export interface CurriculumTimelineItem {
  id: string;
  title: string;
  text: string;
}

export interface CurriculumPedalCard {
  id: string;
  title: string;
  text: string;
  accentColor: string;
  badges: string[];
}

export interface CurriculumContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  glowColor1?: string | null;
  glowColor2?: string | null;

  // Header
  title?: string | null;
  titleGradient?: string | null;
  subtitle?: string | null;
  subtitleColor?: string | null;

  // Equalizer bar colors
  eqColor1?: string | null;
  eqColor2?: string | null;
  eqColor3?: string | null;

  // Pedal cards
  pedalCards?: CurriculumPedalCard[] | null;
  pedalBgColor?: string | null;
  pedalBorderColor?: string | null;
  cardTitleColor?: string | null;
  cardTextColor?: string | null;

  // Timeline section
  timelineTitle?: string | null;
  timelineTitleColor?: string | null;
  timelineBgColor?: string | null;
  timelineBorderColor?: string | null;
  timelineItems?: CurriculumTimelineItem[] | null;
  timelineItemTitleColor?: string | null;
  timelineItemTextColor?: string | null;
}

// =========================
// Impact Section content interfaces
// =========================
export interface ImpactTurntableStat {
  id: string;
  number: number;
  label: string;
  colorA: string;  // Gradient color A for record label
  colorB: string;  // Gradient color B for record label
}

export interface ImpactHighlightChip {
  id: string;
  text: string;
  iconKey: string;
}

export interface ImpactHighlightCard {
  id: string;
  title: string;
  text: string;
}

export interface ImpactSectionContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  topBorderGradient?: string | null;  // Top accent line gradient

  // Top image carousel
  topCarouselImages?: string[] | null;  // Array of image URLs (recommend 7+)

  // Stats section
  statsTitle?: string | null;
  statsTitleColor?: string | null;
  turntableStats?: ImpactTurntableStat[] | null;
  turntableCardBgGradient?: string | null;
  turntableCardBorderColor?: string | null;
  statCaptionColor?: string | null;

  // Highlights section
  highlightsTitle?: string | null;
  highlightsTitleColor?: string | null;
  highlightsSubtitle?: string | null;
  highlightsSubtitleColor?: string | null;
  highlightChips?: ImpactHighlightChip[] | null;
  highlightChipBgColor?: string | null;
  highlightChipBorderColor?: string | null;
  highlightChipTextColor?: string | null;
  highlightCards?: ImpactHighlightCard[] | null;
  highlightCardBgColor?: string | null;
  highlightCardBorderColor?: string | null;
  highlightCardTitleColor?: string | null;
  highlightCardTextColor?: string | null;

  // Bottom image carousel
  bottomCarouselImages?: string[] | null;  // Array of image URLs (recommend 7+)

  // Measurement section header
  measureSectionBgGradient?: string | null;  // Background gradient for the section
  measureTitle?: string | null;
  measureTitleHighlight?: string | null;  // The highlighted word
  measureTitleColor?: string | null;
  measureTitleHighlightColor?: string | null;
  measureSubtitle?: string | null;
  measureSubtitleColor?: string | null;
  measureAudioBarColor?: string | null;  // Audio wave bar color

  // "Our Method Provides" card (left column)
  methodCardTitle?: string | null;
  methodCardTitleColor?: string | null;
  methodCardAccentGradient?: string | null;  // The underline gradient
  methodCardBgColor?: string | null;
  methodCardBorderColor?: string | null;
  methodItems?: ImpactMethodItem[] | null;
  methodItemBgColor?: string | null;
  methodItemBorderColor?: string | null;
  methodItemTitleColor?: string | null;
  methodItemTextColor?: string | null;
  methodCardFooterText?: string | null;
  methodCardFooterTextColor?: string | null;

  // "Measurement & Evaluation Tools" card (right column)
  toolsCardTitle?: string | null;
  toolsCardTitleColor?: string | null;
  toolsCardBgColor?: string | null;
  toolsCardBorderColor?: string | null;
  toolItems?: ImpactToolItem[] | null;
  toolIconBgGradient?: string | null;
  toolNameColor?: string | null;
  toolDescriptionColor?: string | null;
  toolsFooterText?: string | null;
  toolsFooterTextColor?: string | null;
}

// Method item for "Our Method Provides" section
export interface ImpactMethodItem {
  id: string;
  iconKey?: string | null;
  title: string;
  text: string;
}

// Tool item for "Measurement & Evaluation Tools" section
export interface ImpactToolItem {
  id: string;
  iconSvg?: string | null;  // Optional custom SVG
  title: string;
  description: string;
}

// =========================
// Defaults content interfaces
// =========================

// Section keys that can be reordered (excludes 'defaults' which is always first)
export type ReorderableSectionKey = 
  | 'hero'
  | 'mission'
  | 'population'
  | 'financial'
  | 'method'
  | 'curriculum'
  | 'impactSection'
  | 'hearOurImpact'
  | 'testimonials'
  | 'nationalImpact'
  | 'flexA'
  | 'flexB'
  | 'flexC'
  | 'impactLevels'
  | 'partners'
  | 'footer';

// Default section order
export const DEFAULT_SECTION_ORDER: ReorderableSectionKey[] = [
  'hero',
  'mission',
  'population',
  'financial',
  'method',
  'curriculum',
  'impactSection',
  'hearOurImpact',
  'testimonials',
  'nationalImpact',
  'flexA',
  'flexB',
  'flexC',
  'impactLevels',
  'partners',
  'footer',
];

// Section display names for the reorder UI
export const SECTION_DISPLAY_NAMES: Record<ReorderableSectionKey, string> = {
  hero: 'Hero Section',
  mission: 'Mission Section',
  population: 'Population Section',
  financial: 'Financial Section',
  method: 'Method Section',
  curriculum: 'Curriculum Section',
  impactSection: 'Impact Section',
  hearOurImpact: 'Hear Our Impact',
  testimonials: 'Testimonials',
  nationalImpact: 'National Impact',
  flexA: 'Flex A',
  flexB: 'Flex B',
  flexC: 'Flex C',
  impactLevels: 'Impact Levels',
  partners: 'Partners',
  footer: 'Footer',
};

export interface DefaultsContent {
  colorSwatch?: string[] | null;
  sectionOrder?: ReorderableSectionKey[] | null;
  disabledSections?: ReorderableSectionKey[] | null;
}

// =========================
// Programs content interfaces
// =========================
export interface ProgramsProgram {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  features: string[];
  imageUrl?: string | null;
}

export interface ProgramsContent {
  enabled?: boolean | null;
  title?: string | null;
  subtitle?: string | null;
  programs?: ProgramsProgram[] | null;
}

// =========================
// Impact content interfaces
// =========================
export interface ImpactStat {
  id: string;
  number: number;
  label: string;
}

export interface ImpactCapacity {
  id: string;
  title: string;
  iconKey?: string | null;
}

export interface ImpactContent {
  enabled?: boolean | null;
  title?: string | null;
  statsTitle?: string | null;
  stats?: ImpactStat[] | null;
  highlightsTitle?: string | null;
  highlightsSubtitle?: string | null;
  capacities?: ImpactCapacity[] | null;
}

// =========================
// Locations content interfaces
// =========================
export interface LocationsContent {
  enabled?: boolean | null;
  title?: string | null;
}

// =========================
// Testimonials content interfaces
// =========================
export interface TestimonialsContent {
  enabled?: boolean | null;
  eyebrow?: string | null;
  name?: string | null;
  quote?: string | null;
  attribution?: string | null;
  imageUrl?: string | null;
}

// =========================
// Partners content interfaces
// =========================

// Individual partner item
export interface PartnerItem {
  id: string;
  name: string;
  descriptor?: string | null;  // Optional description
  url?: string | null;  // Optional individual link
  dotColor: string;
}

// Carousel settings
export interface PartnersCarousel {
  enabled: boolean;
  showCustomItems: boolean;  // If false, just show names from overflow partners
  customItems: string[];  // Custom names/items for carousel if showCustomItems is true
  speed: number;  // Animation duration in seconds
  itemBgColor?: string | null;
  itemTextColor?: string | null;
  itemBorderColor?: string | null;
  itemHoverBgColor?: string | null;
  itemHoverTextColor?: string | null;
}

// CTA buttons configuration
export interface PartnersCTA {
  viewAllText: string;
  viewAllUrl: string;
  viewAllBgColor?: string | null;
  viewAllTextColor?: string | null;
  viewAllBorderColor?: string | null;
  viewAllHoverBgColor?: string | null;
  donateText: string;
  donateUrl: string;
  donateBgGradient?: string | null;
  donateTextColor?: string | null;
  donateHoverBgGradient?: string | null;
}

// Fallback link settings
export interface PartnersFallbackLink {
  enabled: boolean;
  url: string;  // Default: https://guitarsoverguns.org/supporters/
}

export interface PartnersContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgGradient?: string | null;

  // Ambient glow/blob colors
  glowColor1?: string | null;
  glowColor2?: string | null;
  glowColor3?: string | null;

  // Header styling
  title?: string | null;
  titleGradient?: string | null;
  subtitle?: string | null;
  subtitleColor?: string | null;

  // Grid label styling
  gridLabel?: string | null;
  gridLabelColor?: string | null;

  // Badge/card styling
  badgeBgColor?: string | null;
  badgeHoverBgColor?: string | null;
  badgeBorderColor?: string | null;
  badgeHoverBorderColor?: string | null;
  badgeTitleColor?: string | null;
  badgeDescriptorColor?: string | null;
  badgeBorderRadius?: number | null;

  // Partners list
  partners?: PartnerItem[] | null;

  // Fallback link for partners without individual URLs
  fallbackLink?: PartnersFallbackLink | null;

  // Between note (text between grid and carousel)
  betweenNoteText?: string | null;
  betweenNoteColor?: string | null;

  // Carousel settings
  carousel?: PartnersCarousel | null;

  // CTA buttons
  cta?: PartnersCTA | null;

  // Accessibility
  ariaLabel?: string | null;
}

// Media upload flow:
// 1) Use client/src/services/upload.api.ts -> uploadFile(file, { folder? })
// 2) Persist the returned { key, publicUrl, ...metadata } in your domain model
// 3) Render using the publicUrl

const DEFAULT_BACKEND_URL = 'http://localhost:4000';

const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? DEFAULT_BACKEND_URL;

export async function fetchHeroContent(): Promise<HeroContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/hero`;
    console.log('[client][hero] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      // 404 means data doesn't exist yet - that's okay, not an error
      if (response.status === 404) {
        console.log('[client][hero] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][hero] GET failed', { status: response.status });
      return null;
    }

    const payload = (await response.json()) as HeroApiResponse<HeroContent>;
    console.log('[client][hero] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // Network errors (server not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[ImpactReport] Network error fetching hero content - is the server running?', error);
    } else {
      console.error('[ImpactReport] Failed to fetch hero content', error);
    }
    return null;
  }
}

export async function fetchDefaults(): Promise<DefaultsContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/defaults`;
    console.log('[client][defaults] GET', { url });
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      console.warn('[client][defaults] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<DefaultsContent>;
    console.log('[client][defaults] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch defaults', error);
    return null;
  }
}

export async function saveDefaults(
  data: DefaultsContent,
  options?: { slug?: string },
): Promise<DefaultsContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/defaults`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][defaults] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][defaults] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<DefaultsContent>;
    console.log('[client][defaults] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save defaults', error);
    return null;
  }
}

export async function fetchMissionContent(): Promise<MissionContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/mission`;
    console.log('[client][mission] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      // 404 means data doesn't exist yet - that's okay, not an error
      if (response.status === 404) {
        console.log('[client][mission] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][mission] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<MissionContent>;
    console.log('[client][mission] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // Network errors (server not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[ImpactReport] Network error fetching mission content - is the server running?', error);
    } else {
      console.error('[ImpactReport] Failed to fetch mission content', error);
    }
    return null;
  }
}

export async function saveMissionContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<MissionContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/mission`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][mission] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][mission] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<MissionContent>;
    console.log('[client][mission] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save mission content', error);
    // Re-throw network errors so they can be handled with better messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`);
    }
    return null;
  }
}

export async function saveHeroContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<HeroContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/hero`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][hero] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.warn('[client][hero] PUT failed', { status: response.status });
      return null;
    }

    const payload = (await response.json()) as HeroApiResponse<HeroContent>;
    console.log('[client][hero] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save hero content', error);
    // Re-throw network errors so they can be handled with better messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`);
    }
    return null;
  }
}

export async function fetchPopulationContent(): Promise<PopulationContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/population`;
    console.log('[client][population] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][population] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<PopulationContent>;
    console.log('[client][population] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch population content', error);
    return null;
  }
}

export async function savePopulationContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<PopulationContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/population`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][population] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][population] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<PopulationContent>;
    console.log('[client][population] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save population content', error);
    return null;
  }
}

export async function fetchFinancialContent(): Promise<FinancialContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/financial`;
    console.log('[client][financial] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][financial] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FinancialContent>;
    console.log('[client][financial] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch financial content', error);
    return null;
  }
}

export async function saveFinancialContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<FinancialContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/financial`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][financial] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][financial] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FinancialContent>;
    console.log('[client][financial] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save financial content', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`);
    }
    return null;
  }
}

// =========================
// Method content API
// =========================
export async function fetchMethodContent(): Promise<MethodContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/method`;
    console.log('[client][method] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][method] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<MethodContent>;
    console.log('[client][method] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch method content', error);
    return null;
  }
}

export async function saveMethodContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<MethodContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/method`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][method] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][method] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<MethodContent>;
    console.log('[client][method] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save method content', error);
    return null;
  }
}

// =========================
// Curriculum content API
// =========================
export async function fetchCurriculumContent(): Promise<CurriculumContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/curriculum`;
    console.log('[client][curriculum] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][curriculum] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<CurriculumContent>;
    console.log('[client][curriculum] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch curriculum content', error);
    return null;
  }
}

export async function saveCurriculumContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<CurriculumContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/curriculum`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][curriculum] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][curriculum] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<CurriculumContent>;
    console.log('[client][curriculum] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save curriculum content', error);
    return null;
  }
}

// =========================
// Impact Section content API
// =========================
export async function fetchImpactSectionContent(): Promise<ImpactSectionContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/impact-section`;
    console.log('[client][impact-section] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][impact-section] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<ImpactSectionContent>;
    console.log('[client][impact-section] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch impact section content', error);
    return null;
  }
}

export async function saveImpactSectionContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<ImpactSectionContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/impact-section`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][impact-section] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][impact-section] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<ImpactSectionContent>;
    console.log('[client][impact-section] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save impact section content', error);
    return null;
  }
}

// =========================
// Hear Our Impact (Spotify Embeds) content interfaces
// =========================
export interface SpotifyEmbed {
  id: string;
  url: string;
  type: 'album' | 'artist' | 'playlist' | 'track';
}

export interface HearOurImpactContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;

  // Header
  title?: string | null;
  titleGradient?: string | null;
  description?: string | null;
  descriptionColor?: string | null;

  // Embed card styling
  embedWrapperBgColor?: string | null;
  embedWrapperBorderColor?: string | null;

  // Featured embeds (main grid)
  featuredEmbeds?: SpotifyEmbed[] | null;

  // Action buttons
  mentorProfilesButtonText?: string | null;
  allSongsButtonText?: string | null;
  buttonBgGradient?: string | null;
  buttonTextColor?: string | null;

  // Mentor profiles modal
  mentorProfilesModalTitle?: string | null;
  mentorProfileEmbeds?: SpotifyEmbed[] | null;

  // All songs modal
  allSongsModalTitle?: string | null;
  allSongsEmbeds?: SpotifyEmbed[] | null;

  // Modal styling
  modalBgGradient?: string | null;
  modalBorderColor?: string | null;
  modalTitleColor?: string | null;
  modalCardBgColor?: string | null;
  modalCardBorderColor?: string | null;
}

// =========================
// Hear Our Impact content API
// =========================
export async function fetchHearOurImpactContent(): Promise<HearOurImpactContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/hear-our-impact`;
    console.log('[client][hear-our-impact] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][hear-our-impact] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<HearOurImpactContent>;
    console.log('[client][hear-our-impact] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch hear our impact content', error);
    return null;
  }
}

export async function saveHearOurImpactContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<HearOurImpactContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/hear-our-impact`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][hear-our-impact] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][hear-our-impact] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<HearOurImpactContent>;
    console.log('[client][hear-our-impact] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save hear our impact content', error);
    return null;
  }
}

// =========================
// Testimonials (Single Quote) content interfaces
// =========================
export interface TestimonialsContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  glowColor1?: string | null;
  glowColor2?: string | null;

  // Eyebrow
  eyebrowText?: string | null;
  eyebrowColor?: string | null;

  // Name
  name?: string | null;
  nameGradient?: string | null;

  // EQ bars
  eqBarGradient?: string | null;
  eqBgGradient?: string | null;
  eqBorderColor?: string | null;

  // Image
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageBorderColor?: string | null;

  // Quote card
  quoteCardBgGradient?: string | null;
  quoteCardBorderColor?: string | null;

  // Quote text
  quoteText?: string | null;
  quoteTextColor?: string | null;
  quoteMarkColor?: string | null;

  // Attribution
  attributionText?: string | null;
  attributionColor?: string | null;
  attributionIconColor?: string | null;
}

// =========================
// Testimonials content API
// =========================
export async function fetchTestimonialsContent(): Promise<TestimonialsContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/testimonials`;
    console.log('[client][testimonials] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][testimonials] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<TestimonialsContent>;
    console.log('[client][testimonials] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch testimonials content', error);
    return null;
  }
}

export async function saveTestimonialsContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<TestimonialsContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/testimonials`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][testimonials] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][testimonials] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<TestimonialsContent>;
    console.log('[client][testimonials] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save testimonials content', error);
    return null;
  }
}

// =========================
// National Impact Map content interfaces
// =========================
export type MapLocationType =
  | 'school'
  | 'community-center'
  | 'studio'
  | 'academy'
  | 'hub'
  | 'program'
  | 'office'
  | 'summer-program'
  | 'performance-venue'
  | 'default';

export interface MapLocation {
  id: string;
  name: string;                         // Required
  address: string;                      // Required (for geocoding)
  coordinates: [number, number];        // [lat, lng] - from geocoding
  showAddress?: boolean;                // Whether to display address in popup
  type?: MapLocationType | null;        // Icon type
  description?: string | null;          // Optional
  website?: string | null;              // Optional
}

export interface MapRegion {
  id: string;
  name: string;
  color?: string | null;
  coordinates?: [number, number] | null;  // Region center coordinates (auto-filled from city selection)
  locations: MapLocation[];
}

export interface NationalImpactContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section header
  title?: string | null;
  titleColor?: string | null;

  // Section background
  sectionBgColor?: string | null;

  // Overlay button
  overlayButtonBgColor?: string | null;
  overlayButtonHoverBgColor?: string | null;

  // Regions data
  regions?: MapRegion[] | null;
}

// Address validation response
export interface AddressValidationResult {
  valid: boolean;
  formattedAddress?: string;
  coordinates?: [number, number];
  error?: string;
}

// =========================
// National Impact content API
// =========================
export async function fetchNationalImpactContent(): Promise<NationalImpactContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/national-impact`;
    console.log('[client][national-impact] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      console.warn('[client][national-impact] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<NationalImpactContent>;
    console.log('[client][national-impact] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch national impact content', error);
    return null;
  }
}

export async function saveNationalImpactContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<NationalImpactContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/national-impact`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][national-impact] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][national-impact] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<NationalImpactContent>;
    console.log('[client][national-impact] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to save national impact content', error);
    return null;
  }
}

// =========================
// FlexA content interfaces
// =========================
export interface FlexAStat {
  id: string;
  number: string;
  label: string;
}

export interface FlexAQuote {
  text: string;
  author: string;
  insertAfterParagraph: number;
}

export interface FlexASidebar {
  title: string;
  stats: FlexAStat[];
}

export interface FlexAHeader {
  label: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
}

export interface FlexAHeroImage {
  url: string;
  alt: string;
}

export interface FlexAContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgColor?: string | null;
  sectionBgGradient?: string | null;
  sectionBgImage?: string | null;

  // Colors
  primaryColor?: string | null;
  textColor?: string | null;

  // Header
  header?: FlexAHeader | null;

  // Label/Badge styling
  labelTextColor?: string | null;

  // Headline styling
  headlineColor?: string | null;

  // Subtitle styling
  subtitleColor?: string | null;

  // Hero image
  heroImage?: FlexAHeroImage | null;

  // Hero image styling
  heroImageBorderRadius?: number | null;
  heroOverlayColor?: string | null;

  // Article content
  paragraphs?: string[] | null;

  // Quote
  quote?: FlexAQuote | null;

  // Quote styling
  quoteBgColor?: string | null;
  quoteTextColor?: string | null;
  quoteBorderRadius?: number | null;
  quoteAuthorColor?: string | null;

  // Sidebar
  sidebar?: FlexASidebar | null;

  // Sidebar styling
  sidebarBgColor?: string | null;
  sidebarBorderColor?: string | null;
  sidebarBorderRadius?: number | null;
  sidebarTitleColor?: string | null;
  sidebarTitleBorderColor?: string | null;
  statNumberColor?: string | null;
  statLabelColor?: string | null;

  // Accessibility
  ariaLabel?: string | null;
}

// =========================
// FlexA content API
// =========================
export async function fetchFlexAContent(): Promise<FlexAContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/flex-a`;
    console.log('[client][flex-a] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[client][flex-a] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][flex-a] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FlexAContent>;
    console.log('[client][flex-a] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to fetch flex-a content', error);
    return null;
  }
}

export async function saveFlexAContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<FlexAContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/flex-a`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][flex-a] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][flex-a] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FlexAContent>;
    console.log('[client][flex-a] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to save flex-a content', error);
    return null;
  }
}

// =========================
// FlexB content interfaces
// =========================
export interface FlexBHeader {
  label: string;
  headline: string;
}

export interface FlexBPullQuote {
  text: string;
  author: string;
  insertAfterParagraph: number;
}

export interface FlexBSidebar {
  imageUrl: string;
  imageAlt: string;
  title: string;
  bullets: string[];
}

export interface FlexBKeyTakeaway {
  text: string;
}

export interface FlexBContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgColor?: string | null;
  sectionBgGradient?: string | null;
  sectionBgImage?: string | null;

  // Colors
  primaryColor?: string | null;
  textColor?: string | null;

  // Header styling
  labelTextColor?: string | null;
  headlineColor?: string | null;

  // Text styling
  leadParagraphColor?: string | null;
  bodyTextColor?: string | null;

  // Pull quote styling
  pullQuoteBgColor?: string | null;
  pullQuoteTextColor?: string | null;
  pullQuoteAuthorColor?: string | null;

  // Sidebar styling
  sidebarBgColor?: string | null;
  sidebarBorderColor?: string | null;
  sidebarBorderRadius?: number | null;
  sidebarImageBorderRadius?: number | null;
  sidebarTitleColor?: string | null;
  bulletTextColor?: string | null;
  bulletMarkerColor?: string | null;

  // Key takeaway styling
  keyTakeawayBgColor?: string | null;
  keyTakeawayTextColor?: string | null;
  keyTakeawayBorderRadius?: number | null;

  // Header
  header?: FlexBHeader | null;

  // Main content
  leadParagraph?: string | null;
  bodyParagraphs?: string[] | null;

  // Pull quote
  pullQuote?: FlexBPullQuote | null;

  // Sidebar
  sidebar?: FlexBSidebar | null;

  // Key takeaway
  keyTakeaway?: FlexBKeyTakeaway | null;

  // Accessibility
  ariaLabel?: string | null;
}

// =========================
// FlexB content API
// =========================
export async function fetchFlexBContent(): Promise<FlexBContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/flex-b`;
    console.log('[client][flex-b] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[client][flex-b] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][flex-b] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FlexBContent>;
    console.log('[client][flex-b] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to fetch flex-b content', error);
    return null;
  }
}

export async function saveFlexBContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<FlexBContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/flex-b`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][flex-b] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][flex-b] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FlexBContent>;
    console.log('[client][flex-b] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to save flex-b content', error);
    return null;
  }
}

// =========================
// FlexC content interfaces
// =========================
export interface FlexCHeader {
  label: string;
  title: string;
  subtitle: string;
}

export interface FlexCPoster {
  imageUrl: string;
  imageAlt: string;
  videoUrl: string | null;
  showPlayButton: boolean;
}

export interface FlexCDirectorsNotes {
  label: string;
  paragraphs: string[];
}

export interface FlexCCredit {
  id: string;
  role: string;
  value: string;
}

export interface FlexCContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgColor?: string | null;
  sectionBgGradient?: string | null;
  sectionBgImage?: string | null;

  // Colors
  primaryColor?: string | null;

  // Title styling
  titleColor?: string | null;
  subtitleColor?: string | null;

  // Notes styling
  notesTextColor?: string | null;

  // Credits styling
  creditRoleColor?: string | null;
  creditValueColor?: string | null;

  // Border/bar styling
  borderColor?: string | null;

  // Header
  header?: FlexCHeader | null;

  // Poster
  poster?: FlexCPoster | null;

  // Director's notes
  directorsNotes?: FlexCDirectorsNotes | null;

  // Credits
  credits?: FlexCCredit[] | null;

  // Accessibility
  ariaLabel?: string | null;
}

// =========================
// FlexC content API
// =========================
export async function fetchFlexCContent(): Promise<FlexCContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/flex-c`;
    console.log('[client][flex-c] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[client][flex-c] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][flex-c] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FlexCContent>;
    console.log('[client][flex-c] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to fetch flex-c content', error);
    return null;
  }
}

export async function saveFlexCContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<FlexCContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/flex-c`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][flex-c] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][flex-c] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FlexCContent>;
    console.log('[client][flex-c] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to save flex-c content', error);
    return null;
  }
}

// =========================
// ImpactLevels content interfaces
// =========================
export interface ImpactLevelsHeader {
  title: string;
  titleGradient: string;
  subtitle: string;
  subtitleColor: string;
}

export interface ImpactLevel {
  id: string;
  imageUrl: string;
  amount: string;
  description: string;
}

export interface ImpactLevelsCTA {
  text: string;
  url: string;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
}

export interface ImpactLevelsSoundWave {
  enabled: boolean;
  color1: string;
  color2: string;
}

export interface ImpactLevelsContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgColor?: string | null;
  sectionBgGradient?: string | null;
  glowColor1?: string | null;
  glowColor2?: string | null;

  // Header
  header?: ImpactLevelsHeader | null;

  // Levels (cards)
  levels?: ImpactLevel[] | null;

  // Card styling
  cardBgColor?: string | null;
  cardHoverBgColor?: string | null;
  amountColor?: string | null;
  descriptionColor?: string | null;

  // CTA
  cta?: ImpactLevelsCTA | null;

  // Sound wave
  soundWave?: ImpactLevelsSoundWave | null;

  // Accessibility
  ariaLabel?: string | null;
}

// =========================
// ImpactLevels content API
// =========================
export async function fetchImpactLevelsContent(): Promise<ImpactLevelsContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/impact-levels`;
    console.log('[client][impact-levels] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[client][impact-levels] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][impact-levels] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<ImpactLevelsContent>;
    console.log('[client][impact-levels] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to fetch impact-levels content', error);
    return null;
  }
}

export async function saveImpactLevelsContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<ImpactLevelsContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/impact-levels`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][impact-levels] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][impact-levels] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<ImpactLevelsContent>;
    console.log('[client][impact-levels] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to save impact-levels content', error);
    return null;
  }
}

// =========================
// Partners content API
// =========================
export async function fetchPartnersContent(): Promise<PartnersContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/partners`;
    console.log('[client][partners] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[client][partners] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][partners] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<PartnersContent>;
    console.log('[client][partners] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to fetch partners content', error);
    return null;
  }
}

export async function savePartnersContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<PartnersContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/partners`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][partners] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][partners] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<PartnersContent>;
    console.log('[client][partners] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to save partners content', error);
    return null;
  }
}

// Validate and geocode an address
export async function validateAddress(address: string): Promise<AddressValidationResult> {
  try {
    const url = `${API_BASE_URL}/api/impact/validate-address`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ address }),
    });
    if (!response.ok) {
      return { valid: false, error: 'Failed to validate address' };
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[ImpactReport] Failed to validate address', error);
    return { valid: false, error: 'Network error' };
  }
}

// =========================
// Footer content interfaces
// =========================

// Social link item
export interface FooterSocialLink {
  id: string;
  iconKey: string;
  url: string;
  label: string;
}

// Link item in a column
export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
}

// Footer column
export interface FooterColumn {
  id: string;
  title: string;
  titleColor?: string | null;
  stackWithNext: boolean;  // If true, stacks vertically with the next column
  links: FooterLinkItem[];
}

// Bottom bar link
export interface FooterBottomLink {
  id: string;
  label: string;
  url: string;
}

// Bottom bar configuration
export interface FooterBottomBar {
  copyrightText: string;
  copyrightColor?: string | null;
  bgColor?: string | null;
  borderColor?: string | null;
  links: FooterBottomLink[];
  linkColor?: string | null;
  linkHoverColor?: string | null;
  linkSeparator?: string | null;
}

// Newsletter configuration
export interface FooterNewsletter {
  enabled: boolean;
  title?: string | null;
  titleColor?: string | null;
  placeholder?: string | null;
  buttonText?: string | null;
  buttonBgColor?: string | null;
  buttonTextColor?: string | null;
  inputBgColor?: string | null;
  inputBorderColor?: string | null;
  inputTextColor?: string | null;
}

// Mailing address
export interface FooterMailingAddress {
  enabled: boolean;
  text?: string | null;
  textColor?: string | null;
}

// Logo configuration
export interface FooterLogo {
  useDefaultLogo?: boolean | null;
  imageUrl?: string | null;
  alt?: string | null;
  width?: number | null;
}

export interface FooterContent {
  // Section visibility
  visible?: boolean | null;

  // Section background
  sectionBgGradient?: string | null;
  sectionBgColor?: string | null;

  // Top border/pattern gradient
  topBorderGradient?: string | null;

  // Logo & Branding
  logo?: FooterLogo | null;

  // Description text
  description?: string | null;
  descriptionColor?: string | null;

  // Social/Icon bubbles
  socialLinks?: FooterSocialLink[] | null;
  socialBubbleBgColor?: string | null;
  socialBubbleHoverBgColor?: string | null;
  socialBubbleIconColor?: string | null;
  socialBubbleBorderColor?: string | null;

  // Link columns
  columns?: FooterColumn[] | null;
  columnTitleColor?: string | null;
  columnLinkColor?: string | null;
  columnLinkHoverColor?: string | null;

  // Bottom bar
  bottomBar?: FooterBottomBar | null;

  // Newsletter (optional)
  newsletter?: FooterNewsletter | null;

  // Mailing address (optional)
  mailingAddress?: FooterMailingAddress | null;
}

// =========================
// Footer content API
// =========================
export async function fetchFooterContent(): Promise<FooterContent | null> {
  try {
    const url = `${API_BASE_URL}/api/impact/footer`;
    console.log('[client][footer] GET', { url });
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[client][footer] GET not found (404) - data not yet created');
        return null;
      }
      console.warn('[client][footer] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FooterContent>;
    console.log('[client][footer] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to fetch footer content', error);
    return null;
  }
}

export async function saveFooterContent(
  data: Record<string, unknown>,
  options?: { slug?: string },
): Promise<FooterContent | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/impact/footer`);
    if (options?.slug) url.searchParams.set('slug', options.slug);
    console.log('[client][footer] PUT', { url: url.toString(), keys: Object.keys(data || {}) });
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn('[client][footer] PUT failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<FooterContent>;
    console.log('[client][footer] PUT success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    console.error('[ImpactReport] Failed to save footer content', error);
    return null;
  }
}
