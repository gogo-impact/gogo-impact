import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';

// Import all section services
import { findHeroBySlug, HeroContent } from './heroService.js';
import { findMissionBySlug, MissionContent } from './missionService.js';
import { findDefaultsBySlug, DefaultsContent } from './defaultsService.js';
import { findPopulationBySlug, PopulationContent } from './populationService.js';
import { findFinancialBySlug, FinancialContent } from './financialService.js';
import { findMethodBySlug, MethodContent } from './methodService.js';
import { findCurriculumBySlug, CurriculumContent } from './curriculumService.js';
import { findImpactSectionBySlug, ImpactSectionContent } from './impactSectionService.js';
import { findHearOurImpactBySlug, HearOurImpactContent } from './hearOurImpactService.js';
import { findTestimonialsBySlug, TestimonialsContent } from './testimonialsService.js';
import { findNationalImpactBySlug, NationalImpactContent } from './nationalImpactService.js';
import { findFlexABySlug, FlexAContent } from './flexAService.js';
import { findFlexBBySlug, FlexBContent } from './flexBService.js';
import { findFlexCBySlug, FlexCContent } from './flexCService.js';
import { findImpactLevelsBySlug, ImpactLevelsContent } from './impactLevelsService.js';
import { findPartnersBySlug, PartnersContent } from './partnersService.js';
import { findFooterBySlug, FooterContent } from './footerService.js';

// Snapshot trigger types
export type SnapshotTrigger = 'manual' | 'auto' | 'pre-restore';

// Data structure for all sections
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

// Full snapshot document
export interface ConfigSnapshot {
  _id?: ObjectId;
  createdAt: Date;
  name?: string;
  trigger: SnapshotTrigger;
  data: ConfigSnapshotData;
}

// Metadata-only version for list responses
export interface SnapshotMeta {
  _id: string;
  createdAt: Date;
  name?: string;
  trigger: SnapshotTrigger;
}

const SNAPSHOTS_COLLECTION = 'configSnapshots';
const DEFAULT_SLUG = 'impact-report';

/**
 * Fetch all section data from the database
 */
export async function fetchAllSectionData(slug = DEFAULT_SLUG): Promise<ConfigSnapshotData> {
  const [
    defaults,
    hero,
    mission,
    population,
    financial,
    method,
    curriculum,
    impactSection,
    hearOurImpact,
    testimonials,
    nationalImpact,
    flexA,
    flexB,
    flexC,
    impactLevels,
    partners,
    footer,
  ] = await Promise.all([
    findDefaultsBySlug(slug),
    findHeroBySlug(slug),
    findMissionBySlug(slug),
    findPopulationBySlug(slug),
    findFinancialBySlug(slug),
    findMethodBySlug(slug),
    findCurriculumBySlug(slug),
    findImpactSectionBySlug(slug),
    findHearOurImpactBySlug(slug),
    findTestimonialsBySlug(slug),
    findNationalImpactBySlug(slug),
    findFlexABySlug(slug),
    findFlexBBySlug(slug),
    findFlexCBySlug(slug),
    findImpactLevelsBySlug(slug),
    findPartnersBySlug(slug),
    findFooterBySlug(slug),
  ]);

  // Strip out _id, slug, updatedAt from each section
  const stripMeta = <T extends Record<string, unknown>>(doc: T | null): T | null => {
    if (!doc) return null;
    const { _id, slug: _slug, updatedAt, ...rest } = doc as Record<string, unknown>;
    return rest as T;
  };

  return {
    defaults: stripMeta(defaults),
    hero: stripMeta(hero),
    mission: stripMeta(mission),
    population: stripMeta(population),
    financial: stripMeta(financial),
    method: stripMeta(method),
    curriculum: stripMeta(curriculum),
    impactSection: stripMeta(impactSection),
    hearOurImpact: stripMeta(hearOurImpact),
    testimonials: stripMeta(testimonials),
    nationalImpact: stripMeta(nationalImpact),
    flexA: stripMeta(flexA),
    flexB: stripMeta(flexB),
    flexC: stripMeta(flexC),
    impactLevels: stripMeta(impactLevels),
    partners: stripMeta(partners),
    footer: stripMeta(footer),
  };
}

/**
 * Create a new snapshot of the current configuration
 */
export async function createSnapshot(
  name?: string,
  trigger: SnapshotTrigger = 'manual'
): Promise<SnapshotMeta> {
  const db = await getDatabase();
  const collection = db.collection<ConfigSnapshot>(SNAPSHOTS_COLLECTION);

  const data = await fetchAllSectionData();

  const snapshot: ConfigSnapshot = {
    createdAt: new Date(),
    name: name || undefined,
    trigger,
    data,
  };

  const result = await collection.insertOne(snapshot);
  
  console.log('[snapshots] created', {
    id: result.insertedId.toString(),
    name: snapshot.name,
    trigger: snapshot.trigger,
  });

  return {
    _id: result.insertedId.toString(),
    createdAt: snapshot.createdAt,
    name: snapshot.name,
    trigger: snapshot.trigger,
  };
}

/**
 * List snapshots with metadata only (paginated)
 */
export async function listSnapshots(
  limit = 50,
  skip = 0
): Promise<{ snapshots: SnapshotMeta[]; total: number }> {
  const db = await getDatabase();
  const collection = db.collection<ConfigSnapshot>(SNAPSHOTS_COLLECTION);

  const [snapshots, total] = await Promise.all([
    collection
      .find({}, { projection: { _id: 1, createdAt: 1, name: 1, trigger: 1 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(),
  ]);

  return {
    snapshots: snapshots.map((s) => ({
      _id: s._id!.toString(),
      createdAt: s.createdAt,
      name: s.name,
      trigger: s.trigger,
    })),
    total,
  };
}

/**
 * Get a single snapshot with full data
 */
export async function getSnapshot(id: string): Promise<ConfigSnapshot | null> {
  const db = await getDatabase();
  const collection = db.collection<ConfigSnapshot>(SNAPSHOTS_COLLECTION);

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    console.warn('[snapshots] invalid id format', { id });
    return null;
  }

  const snapshot = await collection.findOne({ _id: objectId });
  return snapshot ?? null;
}

/**
 * Delete a snapshot by ID
 */
export async function deleteSnapshot(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<ConfigSnapshot>(SNAPSHOTS_COLLECTION);

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    console.warn('[snapshots] invalid id format for delete', { id });
    return false;
  }

  const result = await collection.deleteOne({ _id: objectId });
  
  console.log('[snapshots] deleted', { id, deletedCount: result.deletedCount });
  
  return result.deletedCount === 1;
}
