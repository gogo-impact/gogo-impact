import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { ResponsivePieCanvas } from '@nivo/pie';
import COLORS from '../../assets/colors';
import { fetchFinancialContent, FinancialContent, FinancialPieItem } from '../services/impact.api';

// Reuse the visual flair from the former Future section
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const SectionWrapper = styled.section`
  padding: 7rem 0;
  background: linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #121212 100%);
  position: relative;
  overflow: hidden;
`;

const BackgroundDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: radial-gradient(
      circle at 20% 20%,
      rgba(25, 70, 245, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(190, 43, 147, 0.08) 0%,
      transparent 50%
    );
`;

const MainContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3.5rem;
`;

const Title = styled.h2<{ $gradient?: string }>`
  font-size: 3rem;
  font-weight: 900;
  background: ${(p) => p.$gradient ?? `linear-gradient(to right, ${COLORS.gogo_green}, ${COLORS.gogo_blue}, ${COLORS.gogo_purple})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.75);
  max-width: 820px;
  margin: 0 auto;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1.25rem 0 2.25rem;
`;

const ToggleGroup = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 4px;
  display: inline-flex;
  gap: 4px;
`;

const ToggleButton = styled.button<{ $active?: boolean }>`
  border: none;
  background: ${(p) => (p.$active ? 'white' : 'transparent')};
  color: ${(p) => (p.$active ? '#121212' : 'white')};
  padding: 8px 14px;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
`;

const Chip = styled.button<{ $color: string; $active?: boolean }>`
  border: 1px solid ${(p) => `${p.$color}66`};
  background: ${(p) => (p.$active ? `${p.$color}` : 'transparent')};
  color: ${(p) => (p.$active ? '#121212' : 'white')};
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const KpiCard = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 1rem 1.25rem;
`;

const KpiValue = styled.div`
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
`;

const KpiLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

// Dashboard layout: 12-column grid for precise alignment
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(12, 1fr);
    gap: 1.25rem;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Line Chart (custom SVG; no new deps)
const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  position: relative;

  &.tall {
    min-height: 420px;
    display: grid;
    grid-template-rows: auto 1fr;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
`;

const Legend = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
`;

const Swatch = styled.span<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: inline-block;
`;

// Pies
const PiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const PieRow = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 1.75rem;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PieCard = styled(ChartCard)`
  height: 420px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
`;

const PieContainer = styled.div`
  height: 320px;
`;

const Tooltip = styled.div`
  position: absolute;
  pointer-events: none;
  background: #1f1f1f;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
`;

const Bullets = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
`;

const BulletItem = styled.li`
  display: grid;
  grid-template-columns: 14px auto 1fr;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
`;

const BulletDot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(p) => p.$color};
`;

const Note = styled.div`
  background: rgba(106, 27, 154, 0.15);
  border: 1px solid rgba(186, 104, 200, 0.35);
  color: #f3e5f5;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 0.95rem;
`;

// Default data (used when no API data is available)
const DEFAULT_YEARS = [
  '2015',
  '2016',
  '2017-18',
  '2018-19',
  '2019-20',
  '2020-21',
  '2021-22',
  '2022-23',
];

const DEFAULT_REVENUE = [
  200000, 300000, 800000, 1400000, 2300000, 2500000, 3200000, 3400000,
];
const DEFAULT_EXPENSES = [
  150000, 280000, 500000, 1100000, 1500000, 2400000, 2950000, 3100000,
];

const DEFAULT_MAX_Y = 4000000; // $4,000,000 top tick from screenshot

const DEFAULT_COMES_FROM: FinancialPieItem[] = [
  { id: 'foundations', label: "Foundations & The Children's Trust", value: 41, color: COLORS.gogo_blue },
  { id: 'individuals', label: 'Individuals', value: 19, color: COLORS.gogo_yellow },
  { id: 'government', label: 'Government Grants', value: 18, color: COLORS.gogo_purple },
  { id: 'program-services', label: 'Program Services & Earned Revenue', value: 15, color: COLORS.gogo_teal },
  { id: 'special-events', label: 'Special Events', value: 5, color: COLORS.gogo_pink },
  { id: 'corporate', label: 'Corporate Contributions', value: 2, color: '#bdbdbd' },
];

const DEFAULT_GOES_TO: FinancialPieItem[] = [
  { id: 'program-services', label: 'Program Services', value: 75, color: COLORS.gogo_blue },
  { id: 'admin', label: 'Administrative & General', value: 12, color: COLORS.gogo_purple },
  { id: 'fundraising', label: 'Fundraising', value: 13, color: COLORS.gogo_yellow },
];

interface FinancialAnalysisSectionProps {
  /** Data passed directly from parent - used for production */
  financialData?: FinancialContent;
  /** Preview mode for admin editor */
  previewMode?: boolean;
  /** Override data for admin preview */
  financialOverride?: FinancialContent | null;
}

function buildPolyline(
  points: number[],
  width: number,
  height: number,
  padL = 60,
  padR = 20,
  padT = 20,
  padB = 40,
  maxY = DEFAULT_MAX_Y,
) {
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const stepX = innerW / (points.length - 1);

  const toPoint = (value: number, idx: number) => {
    const x = padL + idx * stepX;
    const y = padT + innerH - (value / maxY) * innerH;
    return `${x},${y}`;
  };

  return points.map((v, i) => toPoint(v, i)).join(' ');
}

interface AxisLabelsProps {
  width: number;
  height: number;
  years: string[];
  maxY: number;
  axisLineColor: string;
  axisLabelColor: string;
}

function AxisLabels({ width, height, years, maxY, axisLineColor, axisLabelColor }: AxisLabelsProps) {
  const padL = 60;
  const padB = 40;
  const innerW = width - padL - 20;
  const innerH = height - 20 - padB;
  const stepX = innerW / (years.length - 1);

  // Generate y-ticks based on maxY
  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

  return (
    <g>
      {/* X-axis */}
      <line
        x1={padL}
        y1={20 + innerH}
        x2={padL + innerW}
        y2={20 + innerH}
        stroke={axisLineColor}
      />
      {/* Y-axis */}
      <line x1={padL} y1={20} x2={padL} y2={20 + innerH} stroke={axisLineColor} />
      {yTicks.map((t) => {
        const y = 20 + innerH - (t / maxY) * innerH;
        return (
          <g key={`y-${t}`}>
            <line x1={padL - 5} y1={y} x2={padL} y2={y} stroke={axisLineColor} />
            <text
              x={padL - 10}
              y={y + 4}
              fill={axisLabelColor}
              fontSize="11"
              textAnchor="end"
            >
              {`$${(t / 1000000).toFixed(0)}m`}
            </text>
          </g>
        );
      })}
      {years.map((yr, i) => (
        <text
          key={yr}
          x={padL + i * stepX}
          y={20 + innerH + 18}
          fill={axisLabelColor}
          fontSize="11"
          textAnchor="middle"
        >
          {yr}
        </text>
      ))}
    </g>
  );
}

function FinancialAnalysisSection({
  financialData: externalData,
  previewMode = false,
  financialOverride,
}: FinancialAnalysisSectionProps): JSX.Element {
  const [internalData, setInternalData] = useState<FinancialContent | null>(externalData || null);

  // Fetch data from API when not in preview mode and no external data
  useEffect(() => {
    if (externalData) {
      // externalData was provided by parent - use it directly
      setInternalData(externalData);
    } else if (!previewMode) {
      // Backward compatibility: fetch data if no externalData provided
      (async () => {
        const data = await fetchFinancialContent();
        if (data) setInternalData(data);
      })();
    }
  }, [externalData, previewMode]);

  // Use override in preview mode, externalData, or fetched data
  const effectiveData = useMemo(() => {
    if (previewMode && financialOverride) return financialOverride;
    return externalData ?? internalData ?? {};
  }, [previewMode, financialOverride, externalData, internalData]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const chartCardRef = useRef<HTMLDivElement>(null);
  const [showRevenue] = useState(true);
  const [showExpenses] = useState(true);
  const [range] = useState<'ALL' | 'SINCE2019' | 'RECENT3'>('ALL');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Extract values from effectiveData with defaults
  const years = effectiveData.years ?? DEFAULT_YEARS;
  const revenue = effectiveData.revenueData ?? DEFAULT_REVENUE;
  const expenses = effectiveData.expenseData ?? DEFAULT_EXPENSES;
  const MAX_Y = effectiveData.maxYAxis ?? DEFAULT_MAX_Y;

  const title = effectiveData.title ?? 'Financial Overview';
  const titleGradient = effectiveData.titleGradient ?? `linear-gradient(to right, ${COLORS.gogo_green}, ${COLORS.gogo_blue}, ${COLORS.gogo_purple})`;
  const subtitle = effectiveData.subtitle ?? 'Annual budget growth since 2015 and how resources are raised and allocated';
  const subtitleColor = effectiveData.subtitleColor ?? 'rgba(255, 255, 255, 0.75)';

  const sectionBgGradient = effectiveData.sectionBgGradient ?? 'linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #121212 100%)';
  const decorationColor1 = effectiveData.decorationColor1 ?? 'rgba(25, 70, 245, 0.08)';
  const decorationColor2 = effectiveData.decorationColor2 ?? 'rgba(190, 43, 147, 0.08)';

  const kpiValueColor = effectiveData.kpiValueColor ?? '#ffffff';
  const kpiLabelColor = effectiveData.kpiLabelColor ?? 'rgba(255, 255, 255, 0.7)';
  const kpiNetPositiveColor = effectiveData.kpiNetPositiveColor ?? '#9BE15D';
  const kpiNetNegativeColor = effectiveData.kpiNetNegativeColor ?? '#FF8A80';
  const kpiRevenueLabel = effectiveData.kpiRevenueLabel ?? 'Latest Revenue';
  const kpiExpensesLabel = effectiveData.kpiExpensesLabel ?? 'Latest Expenses';
  const kpiNetLabel = effectiveData.kpiNetLabel ?? 'Net';
  const kpiYoyLabel = effectiveData.kpiYoyLabel ?? 'YoY Growth (Rev / Exp)';

  const lineChartTitle = effectiveData.lineChartTitle ?? 'Annual Budget Growth (Since 2015)';
  const revenueLineColor = effectiveData.revenueLineColor ?? COLORS.gogo_blue;
  const expenseLineColor = effectiveData.expenseLineColor ?? COLORS.gogo_pink;
  const axisLineColor = effectiveData.axisLineColor ?? '#666666';
  const axisLabelColor = effectiveData.axisLabelColor ?? '#aaaaaa';
  const legendRevenueLabel = effectiveData.legendRevenueLabel ?? 'Revenue';
  const legendExpensesLabel = effectiveData.legendExpensesLabel ?? 'Expenses';

  const comesFromTitle = effectiveData.comesFromTitle ?? 'Where the Money Comes From';
  const goesToTitle = effectiveData.goesToTitle ?? 'Where the Money Goes';
  const breakdownTitle = effectiveData.breakdownTitle ?? 'Breakdown';
  const breakdownTextColor = effectiveData.breakdownTextColor ?? 'rgba(255, 255, 255, 0.9)';
  const pieChartInnerRadius = effectiveData.pieChartInnerRadius ?? 0.6;

  const comesFrom = effectiveData.comesFromData ?? DEFAULT_COMES_FROM;
  const goesTo = effectiveData.goesToData ?? DEFAULT_GOES_TO;

  const width = 800;
  const height = 360;

  const filterByRange = (
    arr: number[],
  ): { values: number[]; labels: string[] } => {
    if (range === 'ALL') return { values: arr, labels: years };
    if (range === 'SINCE2019') {
      const idx = years.findIndex((y) => y === '2019-20');
      return { values: arr.slice(idx), labels: years.slice(idx) };
    }
    // RECENT3
    return { values: arr.slice(-3), labels: years.slice(-3) };
  };

  const rev = filterByRange(revenue);
  const exp = filterByRange(expenses);
  const labels = rev.labels; // both ranges aligned

  const revenuePoints = buildPolyline(rev.values, width, height, 60, 20, 20, 40, MAX_Y);
  const expensePoints = buildPolyline(exp.values, width, height, 60, 20, 20, 40, MAX_Y);

  const pieTheme = {
    textColor: '#e0e0e0',
    fontSize: 12,
    tooltip: { container: { background: '#2a2a2a', color: '#fff' } },
  } as const;

  const lastRev = rev.values[rev.values.length - 1] || 0;
  const lastExp = exp.values[exp.values.length - 1] || 0;
  const prevRev = rev.values[rev.values.length - 2] || 0;
  const prevExp = exp.values[exp.values.length - 2] || 0;
  const net = lastRev - lastExp;
  const revYoY = prevRev ? ((lastRev - prevRev) / prevRev) * 100 : 0;
  const expYoY = prevExp ? ((lastExp - prevExp) / prevExp) * 100 : 0;

  const formatMoney = (v: number) => `$${(v / 1000000).toFixed(2)}m`;

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = chartRef.current;
    if (!svg) return;

    // Use the SVG's current transform matrix so this stays correct
    // even if the SVG is scaled, animated, or transformed by CSS.
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const svgPoint = pt.matrixTransform(ctm.inverse());

    const padL = 60;
    const padR = 20;
    const innerW = width - padL - padR;

    const clampedX = Math.max(padL, Math.min(width - padR, svgPoint.x));
    setCursorX(clampedX);

    const container = chartCardRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    const t = (clampedX - padL) / innerW;
    const idx = Math.round(t * (labels.length - 1));
    setHoverIdx(idx);
  };

  const onMouseLeave = () => {
    setHoverIdx(null);
    setCursorX(null);
    setCursorPos(null);
  };

  return (
    <SectionWrapper ref={sectionRef} style={{ background: sectionBgGradient }}>
      <BackgroundDecoration style={{
        background: `radial-gradient(circle at 20% 20%, ${decorationColor1} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${decorationColor2} 0%, transparent 50%)`
      }} />
      <MainContainer>
        <SectionHeader>
          <Title $gradient={titleGradient}>
            {title}
          </Title>
          <Subtitle style={{ color: subtitleColor }}>
            {subtitle}
          </Subtitle>
        </SectionHeader>

        <KpiGrid
          className="animate-child"
          data-anim-id="kpi-grid"
          style={{ gridColumn: '1 / -1' }}
        >
          <KpiCard>
            <KpiValue style={{ color: kpiValueColor }}>{formatMoney(lastRev)}</KpiValue>
            <KpiLabel style={{ color: kpiLabelColor }}>{kpiRevenueLabel}</KpiLabel>
          </KpiCard>
          <KpiCard>
            <KpiValue style={{ color: kpiValueColor }}>{formatMoney(lastExp)}</KpiValue>
            <KpiLabel style={{ color: kpiLabelColor }}>{kpiExpensesLabel}</KpiLabel>
          </KpiCard>
          <KpiCard>
            <KpiValue style={{ color: net >= 0 ? kpiNetPositiveColor : kpiNetNegativeColor }}>
              {formatMoney(net)}
            </KpiValue>
            <KpiLabel style={{ color: kpiLabelColor }}>{kpiNetLabel}</KpiLabel>
          </KpiCard>
          <KpiCard>
            <KpiValue style={{ color: kpiValueColor }}>
              <span style={{ color: revenueLineColor }}>
                {revYoY.toFixed(1)}%
              </span>{' '}
              /{' '}
              <span style={{ color: expenseLineColor }}>
                {expYoY.toFixed(1)}%
              </span>
            </KpiValue>
            <KpiLabel style={{ color: kpiLabelColor }}>{kpiYoyLabel}</KpiLabel>
          </KpiCard>
        </KpiGrid>

        <Grid>
          {/* Line chart spans full width on the top row */}
          <ChartCard
            ref={chartCardRef}
            className="tall animate-child"
            data-anim-id="line-chart"
            style={{ gridColumn: '1 / -1' }}
          >
            <CardTitle>{lineChartTitle}</CardTitle>
            <svg
              ref={chartRef}
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              height="340"
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              style={{ cursor: 'crosshair' }}
            >
              <defs>
                <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={revenueLineColor}
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor={revenueLineColor}
                    stopOpacity="0.05"
                  />
                </linearGradient>
                <linearGradient id="exp" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={expenseLineColor}
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor={expenseLineColor}
                    stopOpacity="0.05"
                  />
                </linearGradient>
              </defs>

              <AxisLabels width={width} height={height} years={labels} maxY={MAX_Y} axisLineColor={axisLineColor} axisLabelColor={axisLabelColor} />

              {showRevenue && (
                <polyline
                  fill="none"
                  stroke={revenueLineColor}
                  strokeWidth={3}
                  points={revenuePoints}
                />
              )}
              {showExpenses && (
                <polyline
                  fill="none"
                  stroke={expenseLineColor}
                  strokeWidth={3}
                  points={expensePoints}
                />
              )}

              {hoverIdx !== null && cursorX !== null && (
                <g>
                  {/* vertical guide - continuous */}
                  <line
                    x1={cursorX}
                    y1={20}
                    x2={cursorX}
                    y2={height - 40}
                    stroke="#888"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />

                  {/* points - snapped to data */}
                  {(() => {
                    const padL = 60;
                    const padR = 20;
                    const padT = 20;
                    const padB = 40;
                    const innerW = width - padL - padR;
                    const innerH = height - padT - padB;
                    const stepX = innerW / (labels.length - 1);
                    const x = padL + hoverIdx * stepX;
                    const revY =
                      padT +
                      innerH -
                      ((rev.values[hoverIdx] || 0) / MAX_Y) * innerH;
                    const expY =
                      padT +
                      innerH -
                      ((exp.values[hoverIdx] || 0) / MAX_Y) * innerH;
                    return (
                      <>
                        {showRevenue && (
                          <circle
                            cx={x}
                            cy={revY}
                            r={5}
                            fill={revenueLineColor}
                            stroke="#121212"
                            strokeWidth={2}
                          />
                        )}
                        {showExpenses && (
                          <circle
                            cx={x}
                            cy={expY}
                            r={5}
                            fill={expenseLineColor}
                            stroke="#121212"
                            strokeWidth={2}
                          />
                        )}
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>
            <Legend>
              <LegendItem>
                <Swatch $color={revenueLineColor} /> {legendRevenueLabel}
              </LegendItem>
              <LegendItem>
                <Swatch $color={expenseLineColor} /> {legendExpensesLabel}
              </LegendItem>
            </Legend>
            {hoverIdx !== null && cursorPos !== null && (
              <Tooltip
                style={{
                  left: cursorPos.x,
                  top: cursorPos.y,
                  transform: 'translate(15px, -50%)',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {labels[hoverIdx]}
                </div>
                {showRevenue && (
                  <div>
                    <span style={{ color: revenueLineColor }}>{legendRevenueLabel}:</span>{' '}
                    {formatMoney(rev.values[hoverIdx])}
                  </div>
                )}
                {showExpenses && (
                  <div>
                    <span style={{ color: expenseLineColor }}>{legendExpensesLabel}:</span>{' '}
                    {formatMoney(exp.values[hoverIdx])}
                  </div>
                )}
              </Tooltip>
            )}
          </ChartCard>

          {/* Second row: four boxes arranged across the bottom */}
          <div
            style={{
              gridColumn: '1 / -1',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <PieCard className="animate-child" data-anim-id="pie-comes-from">
              <CardTitle>{comesFromTitle}</CardTitle>
              <PieContainer>
                <ResponsivePieCanvas
                  data={comesFrom}
                  innerRadius={pieChartInnerRadius}
                  theme={pieTheme}
                  colors={{ datum: 'data.color' }}
                  enableArcLabels={false}
                  enableArcLinkLabels={false}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                />
              </PieContainer>
            </PieCard>

            <ChartCard className="animate-child" data-anim-id="breakdown">
              <CardTitle style={{ marginBottom: '0.75rem' }}>
                {breakdownTitle}
              </CardTitle>
              <Bullets>
                {comesFrom.map((c) => (
                  <BulletItem key={c.id} style={{ color: breakdownTextColor }}>
                    <BulletDot $color={c.color} />
                    <span style={{ fontWeight: 700 }}>{c.value}%</span>
                    <span>{c.label}</span>
                  </BulletItem>
                ))}
              </Bullets>
            </ChartCard>

            <PieCard className="animate-child" data-anim-id="pie-goes-to">
              <CardTitle>{goesToTitle}</CardTitle>
              <PieContainer>
                <ResponsivePieCanvas
                  data={goesTo}
                  innerRadius={pieChartInnerRadius}
                  theme={pieTheme}
                  colors={{ datum: 'data.color' }}
                  enableArcLabels={false}
                  enableArcLinkLabels={false}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                />
              </PieContainer>
            </PieCard>

          </div>
        </Grid>
      </MainContainer>
    </SectionWrapper>
  );
}

export default FinancialAnalysisSection;
