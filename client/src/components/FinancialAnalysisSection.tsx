import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ResponsivePieCanvas } from '@nivo/pie';
import COLORS from '../../assets/colors';

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

const Title = styled.h2`
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(
    to right,
    ${COLORS.gogo_green},
    ${COLORS.gogo_blue},
    ${COLORS.gogo_purple}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  transform: translate(-50%, -120%);
  white-space: nowrap;
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

// Data from screenshot (percentages, approximated budget trend)
const years = [
  '2015',
  '2016',
  '2017-18',
  '2018-19',
  '2019-20',
  '2020-21',
  '2021-22',
  '2022-23',
];

const revenue = [
  200000, 300000, 800000, 1400000, 2300000, 2500000, 3200000, 3400000,
];
const expenses = [
  150000, 280000, 500000, 1100000, 1500000, 2400000, 2950000, 3100000,
];

const MAX_Y = 4000000; // $4,000,000 top tick from screenshot

function buildPolyline(
  points: number[],
  width: number,
  height: number,
  padL = 60,
  padR = 20,
  padT = 20,
  padB = 40,
) {
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const stepX = innerW / (points.length - 1);

  const toPoint = (value: number, idx: number) => {
    const x = padL + idx * stepX;
    const y = padT + innerH - (value / MAX_Y) * innerH;
    return `${x},${y}`;
  };

  return points.map((v, i) => toPoint(v, i)).join(' ');
}

function AxisLabels({ width, height }: { width: number; height: number }) {
  const padL = 60;
  const padB = 40;
  const innerW = width - padL - 20;
  const innerH = height - 20 - padB;
  const stepX = innerW / (years.length - 1);

  const yTicks = [0, 1000000, 2000000, 3000000, 4000000];

  return (
    <g>
      {/* X-axis */}
      <line
        x1={padL}
        y1={20 + innerH}
        x2={padL + innerW}
        y2={20 + innerH}
        stroke="#666"
      />
      {/* Y-axis */}
      <line x1={padL} y1={20} x2={padL} y2={20 + innerH} stroke="#666" />
      {yTicks.map((t) => {
        const y = 20 + innerH - (t / MAX_Y) * innerH;
        return (
          <g key={`y-${t}`}>
            <line x1={padL - 5} y1={y} x2={padL} y2={y} stroke="#666" />
            <text
              x={padL - 10}
              y={y + 4}
              fill="#aaa"
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
          fill="#aaa"
          fontSize="11"
          textAnchor="middle"
        >
          {yr}
        </text>
      ))}
    </g>
  );
}

function FinancialAnalysisSection(): JSX.Element {
  useEffect(() => {
    // Mount/unmount trace
    console.log('[FinancialAnalysis] mount');
    return () => {
      console.log('[FinancialAnalysis] unmount');
    };
  }, []);

  useEffect(() => {
    // Log animatable children inside this section
    const section = sectionRef.current;
    if (!section) return;
    const nodes = Array.from(
      section.querySelectorAll('.animate-child'),
    ) as HTMLElement[];
    console.log(
      '[FinancialAnalysis][Anim] registered children:',
      nodes.map((n) => n.dataset.animId || `${n.tagName}.${n.className}`),
    );
  }, []);
  const sectionRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const chartCardRef = useRef<HTMLDivElement>(null);
  const [showRevenue] = useState(true);
  const [showExpenses] = useState(true);
  const [range] = useState<'ALL' | 'SINCE2019' | 'RECENT3'>('ALL');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Animations temporarily disabled in this section

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

  const revenuePoints = buildPolyline(rev.values, width, height);
  const expensePoints = buildPolyline(exp.values, width, height);

  const comesFrom = [
    {
      id: "Foundations & The Children's Trust",
      label: "Foundations & The Children's Trust",
      value: 41,
      color: COLORS.gogo_blue,
    },
    {
      id: 'Individuals',
      label: 'Individuals',
      value: 19,
      color: COLORS.gogo_yellow,
    },
    {
      id: 'Government Grants',
      label: 'Government Grants',
      value: 18,
      color: COLORS.gogo_purple,
    },
    {
      id: 'Program Services & Earned Revenue',
      label: 'Program Services & Earned Revenue',
      value: 15,
      color: COLORS.gogo_teal,
    },
    {
      id: 'Special Events',
      label: 'Special Events',
      value: 5,
      color: COLORS.gogo_pink,
    },
    {
      id: 'Corporate Contributions',
      label: 'Corporate Contributions',
      value: 2,
      color: '#bdbdbd',
    },
  ];

  const goesTo = [
    {
      id: 'Program Services',
      label: 'Program Services',
      value: 75,
      color: COLORS.gogo_blue,
    },
    {
      id: 'Administrative & General',
      label: 'Administrative & General',
      value: 12,
      color: COLORS.gogo_purple,
    },
    {
      id: 'Fundraising',
      label: 'Fundraising',
      value: 13,
      color: COLORS.gogo_yellow,
    },
  ];

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
    const t = (clampedX - padL) / innerW;
    const idx = Math.round(t * (labels.length - 1));
    setHoverIdx(idx);
  };

  const onMouseLeave = () => setHoverIdx(null);

  return (
    <SectionWrapper ref={sectionRef}>
      <BackgroundDecoration />
      <MainContainer>
        <SectionHeader>
          <Title>Financial Overview</Title>
          <Subtitle>
            Annual budget growth since 2015 and how resources are raised and
            allocated
          </Subtitle>
        </SectionHeader>

        {/* Controls removed per request */}

        <KpiGrid
          className="animate-child"
          data-anim-id="kpi-grid"
          style={{ gridColumn: '1 / -1' }}
        >
          <KpiCard>
            <KpiValue>{formatMoney(lastRev)}</KpiValue>
            <KpiLabel>Latest Revenue</KpiLabel>
          </KpiCard>
          <KpiCard>
            <KpiValue>{formatMoney(lastExp)}</KpiValue>
            <KpiLabel>Latest Expenses</KpiLabel>
          </KpiCard>
          <KpiCard>
            <KpiValue style={{ color: net >= 0 ? '#9BE15D' : '#FF8A80' }}>
              {formatMoney(net)}
            </KpiValue>
            <KpiLabel>Net</KpiLabel>
          </KpiCard>
          <KpiCard>
            <KpiValue>
              <span style={{ color: COLORS.gogo_blue }}>
                {revYoY.toFixed(1)}%
              </span>{' '}
              /{' '}
              <span style={{ color: COLORS.gogo_pink }}>
                {expYoY.toFixed(1)}%
              </span>
            </KpiValue>
            <KpiLabel>YoY Growth (Rev / Exp)</KpiLabel>
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
            <CardTitle>Annual Budget Growth (Since 2015)</CardTitle>
            <svg
              ref={chartRef}
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              height="340"
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
            >
              <defs>
                <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={`${COLORS.gogo_blue}`}
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor={`${COLORS.gogo_blue}`}
                    stopOpacity="0.05"
                  />
                </linearGradient>
                <linearGradient id="exp" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={`${COLORS.gogo_pink}`}
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor={`${COLORS.gogo_pink}`}
                    stopOpacity="0.05"
                  />
                </linearGradient>
              </defs>

              <AxisLabels width={width} height={height} />

              {showRevenue && (
                <polyline
                  fill="none"
                  stroke={COLORS.gogo_blue}
                  strokeWidth={3}
                  points={revenuePoints}
                />
              )}
              {showExpenses && (
                <polyline
                  fill="none"
                  stroke={COLORS.gogo_pink}
                  strokeWidth={3}
                  points={expensePoints}
                />
              )}

              {hoverIdx !== null && (
                <g>
                  {/* vertical guide */}
                  {(() => {
                    const padL = 60;
                    const padR = 20;
                    const innerW = width - padL - padR;
                    const stepX = innerW / (labels.length - 1);
                    const x = padL + hoverIdx * stepX;
                    return (
                      <line
                        x1={x}
                        y1={20}
                        x2={x}
                        y2={height - 40}
                        stroke="#777"
                        strokeDasharray="4 4"
                      />
                    );
                  })()}

                  {/* points */}
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
                            fill={COLORS.gogo_blue}
                          />
                        )}
                        {showExpenses && (
                          <circle
                            cx={x}
                            cy={expY}
                            r={5}
                            fill={COLORS.gogo_pink}
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
                <Swatch $color={COLORS.gogo_blue} /> Revenue
              </LegendItem>
              <LegendItem>
                <Swatch $color={COLORS.gogo_pink} /> Expenses
              </LegendItem>
            </Legend>
            {hoverIdx !== null && (
              <Tooltip
                style={{
                  left: (() => {
                    const svg = chartRef.current;
                    const container = chartCardRef.current;
                    if (!svg || !container) return undefined;
                    const rectSVG = svg.getBoundingClientRect();
                    const rectContainer = container.getBoundingClientRect();
                    const padL = 60;
                    const padR = 20;
                    const innerW = width - padL - padR;
                    const stepX = innerW / (labels.length - 1);
                    // X position of the guide line in SVG viewBox coordinates
                    const xViewBox = padL + hoverIdx * stepX;
                    // Convert that SVG x-coordinate into screen pixels, then
                    // into a left-offset within the chart card container.
                    const xPx =
                      rectSVG.left + (xViewBox / width) * rectSVG.width;
                    const leftPx = xPx - rectContainer.left;
                    return `${leftPx}px`;
                  })(),
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {labels[hoverIdx]}
                </div>
                {showRevenue && (
                  <div>
                    <span style={{ color: COLORS.gogo_blue }}>Revenue:</span>{' '}
                    {formatMoney(rev.values[hoverIdx])}
                  </div>
                )}
                {showExpenses && (
                  <div>
                    <span style={{ color: COLORS.gogo_pink }}>Expenses:</span>{' '}
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
              <CardTitle>Where the Money Comes From</CardTitle>
              <PieContainer>
                <ResponsivePieCanvas
                  data={comesFrom}
                  innerRadius={0.6}
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
                Breakdown
              </CardTitle>
              <Bullets>
                {comesFrom.map((c) => (
                  <BulletItem key={c.id}>
                    <BulletDot $color={(c as any).color} />
                    <span style={{ fontWeight: 700 }}>{c.value}%</span>
                    <span>{c.label}</span>
                  </BulletItem>
                ))}
              </Bullets>
            </ChartCard>

            <PieCard className="animate-child" data-anim-id="pie-goes-to">
              <CardTitle>Where the Money Goes</CardTitle>
              <PieContainer>
                <ResponsivePieCanvas
                  data={goesTo}
                  innerRadius={0.6}
                  theme={pieTheme}
                  colors={{ datum: 'data.color' }}
                  enableArcLabels={false}
                  enableArcLinkLabels={false}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                />
              </PieContainer>
            </PieCard>

            <ChartCard
              className="animate-child"
              data-anim-id="program-services"
            >
              <CardTitle style={{ marginBottom: '0.75rem' }}>
                Program Services Includes
              </CardTitle>
              <Note>
                Mentors, Staff, Performances, Field Trips, Instruments &
                Supplies, Mentor Training, Other operating expenses.
              </Note>
              <Legend style={{ marginTop: '1rem' }}>
                {goesTo.map((g) => (
                  <LegendItem key={g.id}>
                    <Swatch $color={(g as any).color} />
                    <strong>{g.label}</strong>: {g.value}%
                  </LegendItem>
                ))}
              </Legend>
            </ChartCard>
          </div>
        </Grid>
      </MainContainer>
    </SectionWrapper>
  );
}

export default FinancialAnalysisSection;
