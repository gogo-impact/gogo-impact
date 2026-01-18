import React, { useEffect, useRef, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { animate, stagger } from 'animejs';
import COLORS from '../../assets/colors';
import { fetchCurriculumContent, CurriculumContent, CurriculumPedalCard, CurriculumTimelineItem } from '../services/impact.api';
import { getOptimalColumns } from '../util/gridColumns';

interface SectionProps {
  $bgGradient?: string;
  $underlineGradient?: string;
}

const Section = styled.section<SectionProps>`
  padding: 6rem 0;
  background: ${(p) => p.$bgGradient || 'linear-gradient(180deg, #171717 0%, #121212 100%)'};
  position: relative;
  overflow: hidden;
  --section-underline: ${(p) => p.$underlineGradient || 'var(--spotify-green)'};
`;

// Musical ambience
const floatUp = keyframes`
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.6; }
  100% { transform: translateY(-140px) translateX(18px); opacity: 0; }
`;

const equalize = keyframes`
  0% { transform: scaleY(0.6); }
  50% { transform: scaleY(1.2); }
  100% { transform: scaleY(0.6); }
`;

const StaffBlock = styled.div<{ $top: string }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${(p) => p.$top};
  height: 140px;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    #ffffff,
    #ffffff 1px,
    transparent 1px,
    transparent 28px
  );
`;

const NoteCloud = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
`;

const Note = styled.span<{ $left: string; $delay: number; $color?: string }>`
  position: absolute;
  bottom: -40px;
  left: ${(p) => p.$left};
  color: ${(p) => p.$color ?? 'rgba(255, 255, 255, 0.45)'};
  font-size: clamp(12px, 2.2vw, 20px);
  animation: ${floatUp} 8s linear infinite;
  animation-delay: ${(p) => p.$delay}s;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.2));
`;

interface GlowProps {
  $color: string;
  $top: string;
  $left?: string;
  $right?: string;
}

const Glow = styled.div<GlowProps>`
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(100px);
  background: ${(p) => p.$color}14;
  top: ${(p) => p.$top};
  left: ${(p) => p.$left ?? 'auto'};
  right: ${(p) => p.$right ?? 'auto'};
  z-index: 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

interface TitleProps {
  $gradient?: string;
}

const Title = styled.h2<TitleProps>`
  font-size: 2.6rem;
  font-weight: 900;
  margin: 0 0 1rem;
  background: ${(p) => p.$gradient || `linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  letter-spacing: 0.02em;
`;

interface SubtitleProps {
  $color?: string;
}

const Subtitle = styled.p<SubtitleProps>`
  font-size: 1.2rem;
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.78)'};
  margin: 0 auto;
  max-width: 820px;
`;

const EqRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 4px;
  margin-top: 1rem;
  opacity: 0.7;
`;

const EqBar = styled.div<{ $h: number; $d: number; $c: string }>`
  width: 3px;
  height: ${(p) => p.$h}px;
  background: ${(p) => p.$c};
  border-radius: 2px;
  transform-origin: bottom center;
  animation: ${equalize} 1.6s ease-in-out infinite;
  animation-delay: ${(p) => p.$d}s;
`;

interface GridProps {
  $columns?: number;
}

const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: ${(p) => p.$columns 
    ? `repeat(${p.$columns}, minmax(300px, 340px))` 
    : 'repeat(auto-fit, minmax(300px, 340px))'};
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
`;

interface PedalProps {
  $accentColor: string;
  $bgColor?: string;
}

const Pedal = styled.div<PedalProps>`
  background: ${(p) => p.$bgColor || '#1a1a1a'};
  border-radius: 12px;
  padding: 0 0 1.5rem 0;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 40px -10px rgba(0,0,0,0.6),
    0 0 0 1px rgba(255,255,255,0.05);
  overflow: hidden;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px) !important;
  }

  // Metallic faceplate look
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }
`;

const PedalTop = styled.div`
  padding: 1.5rem;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const Knob = styled.div<{ $rot?: number }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: conic-gradient(from 180deg, #2a2a2a 0%, #111 100%);
  border: 2px solid #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  position: relative;

  // Indicator
  &:after {
    content: "";
    position: absolute;
    top: 5px;
    left: 50%;
    width: 2px;
    height: 40%;
    background: #fff;
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(${(p) => p.$rot || 0}deg);
  }
`;

const PedalBody = styled.div`
  padding: 1.5rem;
  text-align: center;
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Led = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  box-shadow: 0 0 10px ${(p) => p.$color}, 0 0 20px ${(p) => p.$color};
  margin-bottom: 1rem;
`;

const Footswitch = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #d0d0d0, #888);
  margin-top: auto;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 0 #555, 0 8px 15px rgba(0,0,0,0.5);
  position: relative;
  cursor: pointer;
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #555, 0 4px 8px rgba(0,0,0,0.5);
  }
`;

interface CardTitleProps {
  $color?: string;
}

const CardTitle = styled.h3<CardTitleProps>`
  margin: 0 0 0.8rem;
  font-size: 1.4rem;
  color: ${(p) => p.$color || 'white'};
  font-weight: 800;
  font-family: 'Century Gothic', sans-serif;
  letter-spacing: -0.02em;
  text-transform: uppercase;
`;

interface CardTextProps {
  $color?: string;
}

const CardText = styled.p<CardTextProps>`
  margin: 0 0 1.5rem;
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.7)'};
  line-height: 1.6;
  font-size: 0.95rem;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Badge = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: ${(p) => p.$color ? `${p.$color}22` : 'rgba(255, 255, 255, 0.06)'};
  border: 1px solid ${(p) => p.$color ? `${p.$color}44` : 'rgba(255, 255, 255, 0.1)'};
  color: ${(p) => p.$color ?? 'rgba(255, 255, 255, 0.9)'};
`;

interface TimelineContainerProps {
  $bgColor?: string;
  $borderColor?: string;
}

const Timeline = styled.div<TimelineContainerProps>`
  margin-top: 4rem;
  position: relative;
  padding: 2rem;
  background: ${(p) => p.$bgColor || 'rgba(0, 0, 0, 0.3)'};
  border: 1px solid ${(p) => p.$borderColor || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const SignalPath = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 23px;
    width: 4px;
    background: #333;
    border-radius: 2px;
    z-index: 0;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  z-index: 1;
`;

const Jack = styled.div`
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #222;
  border: 2px solid #444;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
  position: relative;
  
  &:after {
    content: '';
    width: 20px;
    height: 20px;
    background: #111;
    border-radius: 50%;
    border: 2px solid #555;
  }
`;

const TimelineContent = styled.div`
  padding-top: 0.4rem;
`;

interface TimelineTitleProps {
  $color?: string;
}

const TimelineTitle = styled.h4<TimelineTitleProps>`
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  color: ${(p) => p.$color || COLORS.gogo_teal};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

interface TimelineTextProps {
  $color?: string;
}

const TimelineText = styled.p<TimelineTextProps>`
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.6)'};
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

interface TimelineSectionTitleProps {
  $color?: string;
}

const TimelineSectionTitle = styled.div<TimelineSectionTitleProps>`
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: ${(p) => p.$color || '#666'};
  letter-spacing: 0.1em;
`;

interface CurriculumSectionProps {
  /** Data passed directly from parent - used for production */
  curriculumData?: CurriculumContent;
  /** Preview mode for admin editor */
  previewMode?: boolean;
  /** Override data for admin preview */
  curriculumOverride?: Partial<CurriculumContent>;
}

function CurriculumSection({ 
  curriculumData: externalData, 
  previewMode = false, 
  curriculumOverride 
}: CurriculumSectionProps): JSX.Element {
  const [internalData, setInternalData] = useState<CurriculumContent | null>(externalData || null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    if (externalData) {
      // externalData was provided by parent - use it directly
      setInternalData(externalData);
    } else if (!previewMode) {
      // Backward compatibility: fetch data if no externalData provided
      fetchCurriculumContent().then((data) => {
        if (data) setInternalData(data);
      });
    }
  }, [externalData, previewMode]);

  // Use externalData, fetched data, or override (for preview mode)
  // No defaults - all data should come from DB
  const effectiveData: CurriculumContent = externalData 
    ? { ...externalData, ...(curriculumOverride || {}) }
    : { ...(internalData || {}), ...(curriculumOverride || {}) };

  // Extract values (no defaults - data should come from DB)
  const title = effectiveData.title || '';
  const titleGradient = effectiveData.titleGradient || '';
  const subtitle = effectiveData.subtitle || '';
  const subtitleColor = effectiveData.subtitleColor || '';
  const sectionBgGradient = effectiveData.sectionBgGradient || '';
  const glowColor1 = effectiveData.glowColor1 || COLORS.gogo_blue;
  const glowColor2 = effectiveData.glowColor2 || COLORS.gogo_purple;
  const eqColor1 = effectiveData.eqColor1 || COLORS.gogo_blue;
  const eqColor2 = effectiveData.eqColor2 || COLORS.gogo_purple;
  const eqColor3 = effectiveData.eqColor3 || COLORS.gogo_teal;
  const pedalCards = effectiveData.pedalCards || [];
  const pedalBgColor = effectiveData.pedalBgColor || '';
  const cardTitleColor = effectiveData.cardTitleColor || '';
  const cardTextColor = effectiveData.cardTextColor || '';
  const timelineTitle = effectiveData.timelineTitle || '';
  const timelineTitleColor = effectiveData.timelineTitleColor || '';
  const timelineBgColor = effectiveData.timelineBgColor || '';
  const timelineBorderColor = effectiveData.timelineBorderColor || '';
  const timelineItems = effectiveData.timelineItems || [];
  const timelineItemTitleColor = effectiveData.timelineItemTitleColor || '';
  const timelineItemTextColor = effectiveData.timelineItemTextColor || '';

  const notes = useMemo(
    () => [
      { ch: '♪', left: '6%', delay: 0.1, color: `${glowColor1}aa` },
      { ch: '♫', left: '18%', delay: 0.6, color: `${eqColor3}aa` },
      { ch: '♩', left: '28%', delay: 1.2 },
      { ch: '♬', left: '38%', delay: 0.3, color: `${glowColor2}aa` },
      { ch: '♪', left: '52%', delay: 0.9 },
      { ch: '♩', left: '63%', delay: 1.4, color: `${COLORS.gogo_pink}aa` },
      { ch: '♫', left: '74%', delay: 0.2 },
      { ch: '♬', left: '86%', delay: 1.1, color: `${COLORS.gogo_green}aa` },
    ],
    [glowColor1, glowColor2, eqColor3],
  );

  useEffect(() => {
    // Only animate once on initial mount, not on data changes
    if (hasAnimatedRef.current) return;
    // Wait for data to be available before animating
    if (!pedalCards || pedalCards.length === 0) return;
    
    hasAnimatedRef.current = true;

    if (headerRef.current) {
      const nodes = headerRef.current.querySelectorAll('.animate');
      if (nodes && nodes.length > 0) {
        animate(nodes, {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: stagger(120),
          duration: 700,
          easing: 'easeOutCubic',
        });
      }
    }
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length) {
      animate(cards, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(150, { start: 300 }),
        duration: 800,
        easing: 'easeOutCubic',
      });
    }
  }, [pedalCards]);

  const setCardRef = (el: HTMLDivElement | null, idx: number) => {
    if (el) {
      while (cardRefs.current.length <= idx) cardRefs.current.push(null as any);
      cardRefs.current[idx] = el;
    }
  };

  // Determine EQ bar colors (cycle through 3 colors)
  const getEqColor = (index: number): string => {
    const mod = index % 3;
    if (mod === 0) return eqColor1;
    if (mod === 1) return eqColor2;
    return eqColor3;
  };

  // If no data at all, don't render
  if (!title && !subtitle && pedalCards.length === 0 && timelineItems.length === 0) {
    return <></>;
  }

  return (
    <Section $bgGradient={sectionBgGradient} $underlineGradient={titleGradient}>
      <StaffBlock $top="10%" />
      <StaffBlock $top="72%" />
      <NoteCloud>
        {notes.map((n, i) => (
          <Note
            key={`note-${i}`}
            $left={n.left}
            $delay={n.delay}
            $color={n.color}
          >
            {n.ch}
          </Note>
        ))}
      </NoteCloud>
      <Glow $color={glowColor1} $top="-10%" $left="-5%" />
      <Glow $color={glowColor2} $top="60%" $right="-10%" />
      <Container>
        <Header ref={headerRef}>
          {title && <Title className="animate" $gradient={titleGradient}>{title}</Title>}
          {subtitle && <Subtitle className="animate" $color={subtitleColor}>{subtitle}</Subtitle>}
          <EqRow className="animate">
            {[5, 10, 16, 22, 18, 12, 8, 14, 20, 9, 6].map((h, i) => (
              <EqBar
                key={`eq-${i}`}
                $h={8 + h}
                $d={i * 0.08}
                $c={getEqColor(i)}
              />
            ))}
          </EqRow>
        </Header>

        {pedalCards.length > 0 && (
          <Grid $columns={getOptimalColumns(pedalCards.length, 3)}>
            {pedalCards.map((card, idx) => (
              <Pedal
                key={card.id}
                ref={(el) => setCardRef(el, idx)}
                $accentColor={card.accentColor || COLORS.gogo_blue}
                $bgColor={pedalBgColor}
              >
                <PedalTop>
                  <Knob className="knob" />
                  <Knob className="knob" />
                  <Knob className="knob" />
                </PedalTop>
                <PedalBody>
                  <Led $color={card.accentColor || COLORS.gogo_blue} />
                  {card.title && <CardTitle $color={cardTitleColor}>{card.title}</CardTitle>}
                  {card.text && <CardText $color={cardTextColor}>{card.text}</CardText>}
                  {card.badges && card.badges.length > 0 && (
                    <BadgeRow>
                      {card.badges.map((badge, bidx) => (
                        <Badge key={bidx} $color={card.accentColor}>{badge}</Badge>
                      ))}
                    </BadgeRow>
                  )}
                  <Footswitch />
                </PedalBody>
              </Pedal>
            ))}
          </Grid>
        )}

        {timelineItems.length > 0 && (
          <Timeline $bgColor={timelineBgColor} $borderColor={timelineBorderColor}>
            {timelineTitle && (
              <TimelineSectionTitle $color={timelineTitleColor}>
                {timelineTitle}
              </TimelineSectionTitle>
            )}
            <SignalPath>
              {timelineItems.map((item) => (
                <TimelineItem key={item.id}>
                  <Jack />
                  <TimelineContent>
                    {item.title && <TimelineTitle $color={timelineItemTitleColor}>{item.title}</TimelineTitle>}
                    {item.text && <TimelineText $color={timelineItemTextColor}>{item.text}</TimelineText>}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </SignalPath>
          </Timeline>
        )}
      </Container>
    </Section>
  );
}

export default CurriculumSection;
