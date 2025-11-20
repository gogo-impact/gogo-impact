import React, { useEffect, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { animate, stagger } from 'animejs';
import COLORS from '../../assets/colors';

const Section = styled.section`
  padding: 6rem 0;
  background: linear-gradient(180deg, #171717 0%, #121212 100%);
  position: relative;
  overflow: hidden;
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

const Glow = styled.div<{
  $color: string;
  $top: string;
  $left?: string;
  $right?: string;
}>`
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

const Title = styled.h2`
  font-size: 2.6rem;
  font-weight: 900;
  margin: 0 0 1rem;
  background: linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.02em;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.78);
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const Pedal = styled.div<{ $accentColor: string }>`
  background: #1a1a1a;
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

const Knob = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: conic-gradient(from 180deg, #2a2a2a 0%, #111 100%);
  border: 2px solid #333;
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
  position: relative;
  
  // Indicator
  &:after {
    content: '';
    position: absolute;
    top: 5px;
    left: 50%;
    width: 2px;
    height: 40%;
    background: #fff;
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(${(props: { $rot?: number }) => props.$rot || 0}deg);
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

const CardTitle = styled.h3`
  margin: 0 0 0.8rem;
  font-size: 1.4rem;
  color: white;
  font-weight: 800;
  font-family: 'Century Gothic', sans-serif;
  letter-spacing: -0.02em;
  text-transform: uppercase;
`;

const CardText = styled.p`
  margin: 0 0 1.5rem;
  color: rgba(255, 255, 255, 0.7);
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

const Timeline = styled.div`
  margin-top: 4rem;
  position: relative;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
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

const TimelineTitle = styled.h4`
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  color: ${COLORS.gogo_teal};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const TimelineText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

function CurriculumSection(): JSX.Element {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const notes = useMemo(
    () => [
      { ch: '♪', left: '6%', delay: 0.1, color: `${COLORS.gogo_blue}aa` },
      { ch: '♫', left: '18%', delay: 0.6, color: `${COLORS.gogo_teal}aa` },
      { ch: '♩', left: '28%', delay: 1.2 },
      { ch: '♬', left: '38%', delay: 0.3, color: `${COLORS.gogo_purple}aa` },
      { ch: '♪', left: '52%', delay: 0.9 },
      { ch: '♩', left: '63%', delay: 1.4, color: `${COLORS.gogo_pink}aa` },
      { ch: '♫', left: '74%', delay: 0.2 },
      { ch: '♬', left: '86%', delay: 1.1, color: `${COLORS.gogo_green}aa` },
    ],
    [],
  );

  useEffect(() => {
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
  }, []);

  const setCardRef = (el: HTMLDivElement | null, idx: number) => {
    if (el) {
      while (cardRefs.current.length <= idx) cardRefs.current.push(null as any);
      cardRefs.current[idx] = el;
    }
  };

  return (
    <Section>
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
      <Glow $color={COLORS.gogo_blue} $top="-10%" $left="-5%" />
      <Glow $color={COLORS.gogo_purple} $top="60%" $right="-10%" />
      <Container>
        <Header ref={headerRef}>
          <Title className="animate">Curriculum & Program Model</Title>
          <Subtitle className="animate">
            Every session runs like a band practice: we soundcheck together,
            pick from a shared setlist, and co‑arrange the music. Students lead
            artistic choices—from song selection and structure to visuals and
            performance planning.
          </Subtitle>
          <EqRow className="animate">
            {[5, 10, 16, 22, 18, 12, 8, 14, 20, 9, 6].map((h, i) => (
              <EqBar
                key={`eq-${i}`}
                $h={8 + h}
                $d={i * 0.08}
                $c={
                  i % 3 === 0
                    ? COLORS.gogo_blue
                    : i % 3 === 1
                    ? COLORS.gogo_purple
                    : COLORS.gogo_teal
                }
              />
            ))}
          </EqRow>
        </Header>

        <Grid>
          <Pedal
            ref={(el) => setCardRef(el, 0)}
            $accentColor={COLORS.gogo_blue}
          >
            <PedalTop>
              <Knob className="knob" />
              <Knob className="knob" />
              <Knob className="knob" />
            </PedalTop>
            <PedalBody>
              <Led $color={COLORS.gogo_blue} />
              <CardTitle>Opening Chorus</CardTitle>
              <CardText>
                We start with an opening circle and a shared song to tune the
                room—building community, voice, and confidence. Mentors and
                students shape the groove together.
              </CardText>
              <BadgeRow>
                <Badge $color={COLORS.gogo_blue}>Soundcheck</Badge>
                <Badge $color={COLORS.gogo_blue}>House Setlist</Badge>
                <Badge $color={COLORS.gogo_blue}>Band‑Led</Badge>
              </BadgeRow>
              <Footswitch />
            </PedalBody>
          </Pedal>

          <Pedal
            ref={(el) => setCardRef(el, 1)}
            $accentColor={COLORS.gogo_purple}
          >
            <PedalTop>
              <Knob className="knob" />
              <Knob className="knob" />
              <Knob className="knob" />
            </PedalTop>
            <PedalBody>
              <Led $color={COLORS.gogo_purple} />
              <CardTitle>Weekly Setlist</CardTitle>
              <CardText>
                After‑school programs rehearse twice weekly; community sites run
                3‑hour jam blocks. Instruments and backline are provided at no
                cost.
              </CardText>
              <BadgeRow>
                <Badge $color={COLORS.gogo_purple}>2 rehearsals/week</Badge>
                <Badge $color={COLORS.gogo_purple}>3h jam blocks</Badge>
                <Badge $color={COLORS.gogo_purple}>Backline provided</Badge>
              </BadgeRow>
              <Footswitch />
            </PedalBody>
          </Pedal>

          <Pedal
            ref={(el) => setCardRef(el, 2)}
            $accentColor={COLORS.gogo_teal}
          >
            <PedalTop>
              <Knob className="knob" />
              <Knob className="knob" />
              <Knob className="knob" />
            </PedalTop>
            <PedalBody>
              <Led $color={COLORS.gogo_teal} />
              <CardTitle>Culminating Releases</CardTitle>
              <CardText>
                Learning crescendos with live shows, studio sessions, exhibitions,
                and drops— students take the lead on and off stage and celebrate
                growth.
              </CardText>
              <BadgeRow>
                <Badge $color={COLORS.gogo_teal}>Live Shows</Badge>
                <Badge $color={COLORS.gogo_teal}>Studio Sessions</Badge>
                <Badge $color={COLORS.gogo_teal}>Release Parties</Badge>
              </BadgeRow>
              <Footswitch />
            </PedalBody>
          </Pedal>
        </Grid>

        <Timeline>
          <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#666', letterSpacing: '0.1em' }}>
            Signal Flow
          </div>
          <SignalPath>
            <TimelineItem>
              <Jack />
              <TimelineContent>
                <TimelineTitle>
                  Soundcheck & Opening Circle
                </TimelineTitle>
                <TimelineText>
                  Community agreements, vibe check, and tuning into the space together.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>
            
            <TimelineItem>
              <Jack />
              <TimelineContent>
                <TimelineTitle>
                  Rehearsal & Groove
                </TimelineTitle>
                <TimelineText>
                  Skill‑building through ensemble practice, jamming, and improvisation.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <Jack />
              <TimelineContent>
                <TimelineTitle>
                  Arrangement & Reflection
                </TimelineTitle>
                <TimelineText>
                  Student‑led decisions, goal‑setting, and finalizing the track for performance.
                </TimelineText>
              </TimelineContent>
            </TimelineItem>
          </SignalPath>
        </Timeline>
      </Container>
    </Section>
  );
}

export default CurriculumSection;
