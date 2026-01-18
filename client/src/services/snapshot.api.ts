/**
 * Snapshot API Service
 * 
 * Client-side functions for interacting with the version history/snapshot system.
 */

import type {
  HeroContent,
  MissionContent,
  DefaultsContent,
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
} from './impact.api';

const DEFAULT_BACKEND_URL = 'http://localhost:4000';

const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? DEFAULT_BACKEND_URL;

// Snapshot trigger types
export type SnapshotTrigger = 'manual' | 'auto' | 'pre-restore';

// Metadata for snapshot list display
export interface SnapshotMeta {
  _id: string;
  createdAt: string;
  name?: string;
  trigger: SnapshotTrigger;
}

// Full snapshot data structure
export interface ConfigSnapshotData {
  defaults: DefaultsContent | null;
  hero: HeroContent | null;
  mission: MissionContent | null;
  population: PopulationContent | null;
  financial: FinancialContent | null;
  method: MethodContent | null;
  curriculum: CurriculumContent | null;
  impactSection: ImpactSectionContent | null;
  hearOurImpact: HearOurImpactContent | null;
  testimonials: TestimonialsContent | null;
  nationalImpact: NationalImpactContent | null;
  flexA: FlexAContent | null;
  flexB: FlexBContent | null;
  flexC: FlexCContent | null;
  impactLevels: ImpactLevelsContent | null;
  partners: PartnersContent | null;
  footer: FooterContent | null;
}

// Full snapshot including data
export interface ConfigSnapshot extends SnapshotMeta {
  data: ConfigSnapshotData;
}

// List response
export interface ListSnapshotsResponse {
  snapshots: SnapshotMeta[];
  total: number;
  limit: number;
  skip: number;
}

/**
 * List all snapshots (metadata only, paginated)
 */
export async function listSnapshots(
  limit = 50,
  skip = 0
): Promise<ListSnapshotsResponse> {
  const url = new URL(`${API_BASE_URL}/api/snapshots`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('skip', String(skip));

  console.log('[client][snapshots] GET list', { url: url.toString() });

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to list snapshots: ${response.statusText}`);
  }

  const data = await response.json();
  return data as ListSnapshotsResponse;
}

/**
 * Create a new snapshot of current configuration
 */
export async function createSnapshot(
  name?: string,
  trigger: SnapshotTrigger = 'manual'
): Promise<SnapshotMeta> {
  const url = `${API_BASE_URL}/api/snapshots`;

  console.log('[client][snapshots] POST create', { name, trigger });

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, trigger }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create snapshot: ${response.statusText}`);
  }

  const data = await response.json();
  return data.snapshot as SnapshotMeta;
}

/**
 * Get a single snapshot with full data
 */
export async function getSnapshot(id: string): Promise<ConfigSnapshot> {
  const url = `${API_BASE_URL}/api/snapshots/${encodeURIComponent(id)}`;

  console.log('[client][snapshots] GET single', { id });

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Snapshot not found');
    }
    throw new Error(`Failed to get snapshot: ${response.statusText}`);
  }

  const data = await response.json();
  return data.snapshot as ConfigSnapshot;
}

/**
 * Delete a snapshot by ID
 */
export async function deleteSnapshot(id: string): Promise<void> {
  const url = `${API_BASE_URL}/api/snapshots/${encodeURIComponent(id)}`;

  console.log('[client][snapshots] DELETE', { id });

  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Snapshot not found');
    }
    throw new Error(`Failed to delete snapshot: ${response.statusText}`);
  }
}

/**
 * Download current configuration as JSON file
 */
export async function downloadCurrentConfig(): Promise<void> {
  const url = `${API_BASE_URL}/api/snapshots/export`;

  console.log('[client][snapshots] GET export (download)');

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to export configuration: ${response.statusText}`);
  }

  // Get filename from Content-Disposition header if available
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `gogo-impact-config-${new Date().toISOString().split('T')[0]}.json`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+?)"/);
    if (match) {
      filename = match[1];
    }
  }

  // Get the JSON data and trigger download
  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Section keys that can be restored
 */
export type SectionKey = keyof ConfigSnapshotData;

export const SECTION_KEYS: SectionKey[] = [
  'defaults',
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

/**
 * Get human-readable label for a section key
 */
export function getSectionLabel(key: SectionKey): string {
  const labels: Record<SectionKey, string> = {
    defaults: 'Defaults',
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
  return labels[key];
}
