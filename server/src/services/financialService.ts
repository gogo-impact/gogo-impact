import { getDatabase } from '../config/database.js';

// Pie chart data item
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

export interface FinancialDocument extends FinancialContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const FINANCIAL_COLLECTION = 'financial';

export async function findFinancialBySlug(slug = 'impact-report'): Promise<FinancialDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<FinancialDocument>(FINANCIAL_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertFinancialBySlug(slug: string, data: FinancialContent): Promise<FinancialDocument> {
  const db = await getDatabase();
  const collection = db.collection<FinancialDocument>(FINANCIAL_COLLECTION);

  const now = new Date();
  const update = {
    $set: {
      ...data,
      slug,
      updatedAt: now,
    },
  };

  await collection.updateOne({ slug }, update, { upsert: true });
  const saved = await collection.findOne({ slug });
  return saved as FinancialDocument;
}





