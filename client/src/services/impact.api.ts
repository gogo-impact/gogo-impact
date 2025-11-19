export interface HeroApiResponse<T> {
  data: T;
}

export interface HeroCta {
  label?: string;
  href?: string;
}

export interface HeroContent {
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
  numberSource?: 'explicit' | 'modalItemsLength';
}

export interface MissionContent {
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

  statsEqualizer?: {
    enabled: boolean;
    barCount?: number;
  } | null;

  modals?: MissionModal[] | null;
}

// =========================
// Defaults content interfaces
// =========================
export interface DefaultsContent {
  colorSwatch?: string[] | null;
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
      console.warn('[client][hero] GET failed', { status: response.status });
      return null;
    }

    const payload = (await response.json()) as HeroApiResponse<HeroContent>;
    console.log('[client][hero] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch hero content', error);
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
      console.warn('[client][mission] GET failed', { status: response.status });
      return null;
    }
    const payload = (await response.json()) as HeroApiResponse<MissionContent>;
    console.log('[client][mission] GET success', { fields: Object.keys(payload?.data || {}) });
    return payload?.data ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ImpactReport] Failed to fetch mission content', error);
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
    return null;
  }
}

