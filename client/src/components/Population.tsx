import React, { useEffect, useState } from 'react';
import { ResponsivePieCanvas } from '@nivo/pie';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import COLORS from '../../assets/colors';
import Photo1 from '../../assets/populationPhotos/Photo1.jpg';
import Photo2 from '../../assets/populationPhotos/Photo2.jpg';
import Photo3 from '../../assets/populationPhotos/Photo3.jpg';
import Photo4 from '../../assets/populationPhotos/Photo4.jpg';
import Photo5 from '../../assets/populationPhotos/Photo5.jpg';
import Photo6 from '../../assets/populationPhotos/Photo6.jpg';

const Container = styled.section`
  width: min(1200px, 92vw);
  margin: 4rem auto;
  padding: 3rem 2rem;
  background: linear-gradient(180deg, #171717 0%, #0f0f0f 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 10% 15%,
        ${COLORS.gogo_blue}12,
        transparent 38%
      ),
      radial-gradient(
        circle at 90% 85%,
        ${COLORS.gogo_purple}12,
        transparent 38%
      );
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: 'Airwaves', sans-serif;
  background: linear-gradient(90deg, #ffffff, ${COLORS.gogo_teal} 65%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-align: center;
`;

const Subtitle = styled.h2`
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0 0.5rem 0 !important;
  text-align: center;
`;

const GraphsContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.2fr);
  grid-auto-rows: minmax(0, auto);
  gap: 2rem 1.75rem;
  margin: 3rem 0 2rem 0;
  padding: 0;
  align-items: stretch;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const GraphCard = styled.div`
  position: relative;
  background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.08), transparent 55%),
    rgba(10, 10, 10, 0.96);
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  min-width: 0;
  overflow: hidden;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease,
    border-color 0.22s ease;

  &:first-child {
    grid-row: 1 / span 2;
    align-items: stretch;
    transform: translateY(-4px);
    box-shadow:
      0 18px 50px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(255, 255, 255, 0.06);
    border-color: ${COLORS.gogo_teal}66;
    background: radial-gradient(circle at 0% 0%, ${COLORS.gogo_teal}14, transparent 60%),
      rgba(8, 8, 8, 0.96);
  }

  &:nth-child(2) {
    align-self: flex-end;
  }

  &:nth-child(3) {
    align-self: flex-start;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow:
      0 20px 46px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.12), transparent 60%),
      rgba(14, 14, 14, 0.98);
    border-color: rgba(255, 255, 255, 0.24);
  }

  @media (max-width: 1100px) {
    &:first-child {
      grid-row: auto;
      transform: none;
    }
  }
`;

const PieChartWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  gap: 1.75rem;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PieCaption = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 0.7rem;
  text-align: center;
`;

const PieContainer = styled.div`
  width: 100%;
  height: 240px;
`;

const PercentCircle = styled.div<{ $percent: number; $accent: string }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.06),
    0 16px 40px rgba(0, 0, 0, 0.6);
  background:
    conic-gradient(
      ${(p) => p.$accent} 0deg,
      ${(p) => p.$accent} ${(p) => p.$percent * 3.6}deg,
      rgba(255, 255, 255, 0.08) ${(p) => p.$percent * 3.6}deg,
      rgba(255, 255, 255, 0.02) 360deg
    );
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 18px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), transparent 60%),
      rgba(6, 6, 6, 0.96);
    box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.9);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 10% 0%, rgba(255, 255, 255, 0.16), transparent 60%);
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  &:hover {
    transform: translateY(-3px) scale(1.04);
    box-shadow:
      0 0 0 4px rgba(255, 255, 255, 0.1),
      0 22px 52px rgba(0, 0, 0, 0.8);
  }

  &:hover::after {
    opacity: 0.4;
  }
`;

const PercentText = styled.span`
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(90deg, #ffffff, ${COLORS.gogo_teal});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  position: relative;
  z-index: 2;
`;

const CardLabel = styled.div`
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.25rem;
  text-align: center;
  line-height: 1.5;
`;

const Text = styled.p<{ $white?: boolean }>`
  font-size: 1.08rem;
  color: ${(p) => (p.$white ? 'white' : 'rgba(255,255,255,0.8)')};
  line-height: 1.75;
`;

const SkillsList = styled.ul`
  margin: 1.2rem 0 0 0;
  padding-left: 1.5rem;
  color: white;
  font-size: 1.08rem;
  line-height: 1.7;
`;

const SkillsItem = styled.li`
  margin-bottom: 0.3rem;
  color: white;
`;

const SimplePercentsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 1.5rem;
  margin: 2.5rem 0 1.5rem 0;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const SimplePercentCard = styled.div`
  flex: 1;
  background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.08), transparent 60%),
    rgba(8, 8, 8, 0.96);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.6rem 0.75rem 1.1rem 0.75rem;
  min-width: 0;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;

  &:nth-child(2) {
    margin-top: -6px;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow:
      0 16px 34px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.08);
    background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.12), transparent 60%),
      rgba(12, 12, 12, 0.98);
    border-color: rgba(255, 255, 255, 0.24);
  }
`;

const SimplePercentValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(120deg, #ffffff, ${COLORS.gogo_teal});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.35rem;
`;

const SimplePercentLabel = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
`;

const ImageGallery = styled.div`
  display: flex;
  gap: 1.2rem;
  overflow-x: auto;
  margin: 2.5rem 0 0 0;
  padding-bottom: 1rem;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 40px,
    black calc(100% - 40px),
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black 40px,
    black calc(100% - 40px),
    transparent 100%
  );
`;

const GalleryImage = styled.img`
  width: 160px;
  height: 110px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  background: #222;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: rotate(-1.5deg);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;

  &:nth-child(even) {
    transform: rotate(1.5deg);
  }

  &:hover {
    transform: translateY(-4px) rotate(0deg);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.22);
  }
`;

// Info layout for reducing plain text feel
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1.1rem;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.75rem;
`;

const SkillChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.01em;
`;

// Unique inline section header and vibe elements
const SectionHeaderWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #0f0f0f;
  background: linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal});
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.06) inset;
`;

const SectionName = styled.h2`
  margin: 0 0 0.25rem 0;
  font-size: 2.1rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.02em;
`;

const SectionDivider = styled.div`
  height: 2px;
  width: 100%;
  margin: 0.5rem 0 1.25rem 0;
  background: linear-gradient(
    90deg,
    ${COLORS.gogo_blue}66,
    ${COLORS.gogo_teal}66,
    transparent 80%
  );
`;

const GlowBlob = styled.div<{
  $size: number;
  $colorA: string;
  $colorB: string;
  $top?: string;
  $bottom?: string;
  $left?: string;
  $right?: string;
}>`
  position: absolute;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    ${(p) => p.$colorA},
    ${(p) => p.$colorB}
  );
  filter: blur(40px);
  opacity: 0.18;
  pointer-events: none;
  top: ${(p) => p.$top ?? 'auto'};
  bottom: ${(p) => p.$bottom ?? 'auto'};
  left: ${(p) => p.$left ?? 'auto'};
  right: ${(p) => p.$right ?? 'auto'};

  @keyframes slowDrift {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(10px, -6px, 0);
    }
  }

  animation: slowDrift 26s ease-in-out infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const LegendRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
  align-self: center;

  @media (max-width: 900px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const LegendChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-1px) scale(1.02);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4);
  }
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25) inset;
`;

const pieTheme = {
  textColor: '#e0e0e0',
  fontSize: 12,
  legends: {
    text: { fill: '#e0e0e0' },
  },
  tooltip: { container: { background: '#2a2a2a', color: '#fff' } },
} as const;

interface PopulationProps {
  inline?: boolean;
}

function PopulationComponent({ inline = false }: PopulationProps) {
  const [activeSliceId, setActiveSliceId] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Removed scroll-dim effect per request

  const content = (
    <Container>
      <GlowBlob
        $size={240}
        $colorA={`${COLORS.gogo_blue}55`}
        $colorB={`${COLORS.gogo_purple}22`}
        $top="-60px"
        $left="-60px"
      />
      <GlowBlob
        $size={220}
        $colorA={`${COLORS.gogo_pink}55`}
        $colorB={`${COLORS.gogo_yellow}22`}
        $bottom="-40px"
        $right="-40px"
      />

      <SectionHeaderWrap>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'center',
          }}
        >
          <SectionBadge>Who We Serve</SectionBadge>
          <SectionName>Our Population</SectionName>
        </div>
      </SectionHeaderWrap>
      <SectionDivider />
      <Title style={{ textAlign: 'center' }}>
        TALENT IS UNIVERSALLY DISTRIBUTED, BUT OPPORTUNITY IS NOT.
      </Title>
      <InfoGrid style={{ justifyItems: 'center', textAlign: 'center' }}>
        <InfoCard>
          <Text $white>
            That is why, since 2008, Guitars Over Guns has used the
            transformative power of music, mentorship, and the arts to unlock
            possibilities for young people who face systemic barriers to
            opportunity.
          </Text>
        </InfoCard>
        <InfoCard>
          <Text $white>
            The Childhood Global Assessment Scale (C-GAS) is a widely recognized
            tool to measure young people&apos;s psychological and social
            well-being.
          </Text>
        </InfoCard>
      </InfoGrid>

      <GraphsContainer>
        <GraphCard>
          <PieChartWrapper>
            <PieContainer>
              <ResponsivePieCanvas
                data={[
                  {
                    id: 'Hispanic/Latinx',
                    label: 'Hispanic/Latinx',
                    value: 46,
                    color: COLORS.gogo_teal,
                  },
                  {
                    id: 'Black/African American',
                    label: 'Black/African American',
                    value: 44,
                    color: COLORS.gogo_blue,
                  },
                  {
                    id: 'Other',
                    label: 'Other',
                    value: 10,
                    color: COLORS.gogo_purple,
                  },
                ]}
                innerRadius={0.6}
                theme={pieTheme}
                colors={
                  ((
                    datum: {
                      data: { id: string; color: string };
                    },
                  ) =>
                    activeSliceId && datum.data.id !== activeSliceId
                      ? `${datum.data.color}66`
                      : datum.data.color) as any
                }
                enableArcLabels={false}
                enableArcLinkLabels={false}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                onMouseEnter={(datum: { data: { id: string } }) => {
                  setActiveSliceId(datum.data.id);
                }}
                onMouseMove={(datum: { data: { id: string } }) => {
                  setActiveSliceId(datum.data.id);
                }}
                onMouseLeave={() => setActiveSliceId(null)}
              />
            </PieContainer>
            <LegendRow>
              <LegendChip
                onMouseEnter={() => setActiveSliceId('Hispanic/Latinx')}
                onMouseLeave={() => setActiveSliceId(null)}
              >
                <LegendDot $color={COLORS.gogo_teal} /> 46% Hispanic/Latinx
              </LegendChip>
              <LegendChip
                onMouseEnter={() => setActiveSliceId('Black/African American')}
                onMouseLeave={() => setActiveSliceId(null)}
              >
                <LegendDot $color={COLORS.gogo_blue} /> 44% Black/African
                American
              </LegendChip>
              <LegendChip
                onMouseEnter={() => setActiveSliceId('Other')}
                onMouseLeave={() => setActiveSliceId(null)}
              >
                <LegendDot $color={COLORS.gogo_purple} /> 10% Other
              </LegendChip>
            </LegendRow>
            <PieCaption>
              Ages 8-18: 96% at or below the Federal Poverty Level
            </PieCaption>
          </PieChartWrapper>
        </GraphCard>
        <GraphCard>
          <PercentCircle $percent={94} $accent={COLORS.gogo_teal}>
            <PercentText>94%</PercentText>
          </PercentCircle>
          <CardLabel>
            of Guitars Over Guns students made or maintained academic gains in
            the school year 2023-2024.
          </CardLabel>
        </GraphCard>
        <GraphCard>
          <PercentCircle $percent={95} $accent={COLORS.gogo_pink}>
            <PercentText>95%</PercentText>
          </PercentCircle>
          <CardLabel>
            of Guitars Over Guns students improved conduct in their classes over
            the course of the school year in 2023-2024.
          </CardLabel>
        </GraphCard>
      </GraphsContainer>
      <Text>
        <em>
          Through Guitars Over Guns&apos; programs, youth develop core skills
          and a support system that are crucial for personal and professional
          success:
        </em>
      </Text>
      <ChipsRow style={{ justifyContent: 'center' }}>
        <SkillChip>Confidence and self-awareness</SkillChip>
        <SkillChip>Emotional intelligence and creativity</SkillChip>
        <SkillChip>Self-presentation and expression</SkillChip>
        <SkillChip>Workforce readiness and life skills</SkillChip>
        <SkillChip>Trusted mentors & positive role models</SkillChip>
        <SkillChip>Supportive community of peers</SkillChip>
      </ChipsRow>
      <SectionDivider />

      <SimplePercentsContainer>
        <SimplePercentCard>
          <SimplePercentValue>100%</SimplePercentValue>
          <SimplePercentLabel>
            of GOGO students with initial problems improved 5+ points
          </SimplePercentLabel>
        </SimplePercentCard>
        <SimplePercentCard>
          <SimplePercentValue>85%</SimplePercentValue>
          <SimplePercentLabel>
            Fall 2023: students increased or maintained C-GAS
          </SimplePercentLabel>
        </SimplePercentCard>
        <SimplePercentCard>
          <SimplePercentValue>84%</SimplePercentValue>
          <SimplePercentLabel>
            Spring 2024: studentsincreased or maintained C-GAS
          </SimplePercentLabel>
        </SimplePercentCard>
      </SimplePercentsContainer>
      {inline ? null : (
        <ImageGallery>
          <GalleryImage src={Photo1} alt="Photo 1" />
          <GalleryImage src={Photo2} alt="Photo 2" />
          <GalleryImage src={Photo3} alt="Photo 3" />
          <GalleryImage src={Photo4} alt="Photo 4" />
          <GalleryImage src={Photo5} alt="Photo 5" />
          <GalleryImage src={Photo6} alt="Photo 6" />
        </ImageGallery>
      )}
    </Container>
  );

  if (inline) {
    return content;
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        navigate('/impact-report');
      }}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        style: {
          background:
            'linear-gradient(180deg, rgba(22,22,22,0.96), rgba(10,10,10,0.96))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          boxShadow:
            '0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(123,127,209,0.06)',
          width: 'min(1200px, 92vw)',
          position: 'relative',
        },
      }}
      BackdropProps={{
        style: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0,0,0,0.6)',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Our Population
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpen(false);
            navigate('/impact-report');
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 16,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpen(false);
              navigate('/impact-report');
            }}
          >
            Return to Impact Report
          </Button>
        </div>
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default PopulationComponent;
