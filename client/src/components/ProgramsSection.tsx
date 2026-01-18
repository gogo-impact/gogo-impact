import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { animate, stagger } from 'animejs';
import COLORS from '../../assets/colors';
import photo1 from '../../assets/programPhotos/photo1.png';
import photo2 from '../../assets/programPhotos/photo2.png';
import photo3 from '../../assets/programPhotos/photo3.png';
import { Reveal } from '../../animations';

// Animation keyframes
const shimmer = keyframes`
  0% {
    background-position: -100% 0;
  }
  50% {
    background-position: 50% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(29, 185, 84, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(29, 185, 84, 0);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
`;

const rotateSlowly = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled components for Spotify-like design
const ProgramsContainer = styled.section`
  padding: 7rem 0;
  background: linear-gradient(to bottom, #191919, #0d0d0d);
  position: relative;
  overflow: hidden;
  --section-underline: linear-gradient(
    to right,
    ${COLORS.gogo_blue} 0%,
    ${COLORS.gogo_purple} 33%,
    ${COLORS.gogo_pink} 67%,
    ${COLORS.gogo_blue} 100%
  );
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(0, 0, 0, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.2) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.05;
  pointer-events: none;
`;

const GlowEffect = styled.div<{ $color?: string }>`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: ${(props) => props.$color || COLORS.gogo_blue}11;
  filter: blur(100px);
  opacity: 0.6;
  z-index: 1;
  animation: ${float} 15s ease infinite;
`;

const SoundWave = styled.div`
  position: absolute;
  top: 20%;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  opacity: 0.2;
  transform: rotate(-2deg);
  z-index: 0;
`;

const SoundBar = styled.div<{ $height: number; $delay: number }>`
  height: ${(props) => props.$height}px;
  width: 3px;
  background-color: ${COLORS.gogo_green};
  border-radius: 3px;
  animation: ${float} 1.5s ease-in-out infinite;
  animation-delay: ${(props) => props.$delay}s;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 5;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4rem;
  text-align: center;
  position: relative;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
  letter-spacing: 0.02em;
  background: linear-gradient(
    to right,
    ${COLORS.gogo_blue} 0%,
    ${COLORS.gogo_purple} 33%,
    ${COLORS.gogo_pink} 67%,
    ${COLORS.gogo_blue} 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: ${shimmer} 8s ease-in-out infinite;
`;

const UnderlineEffect = styled.div`
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    ${COLORS.gogo_blue} 0%,
    ${COLORS.gogo_purple} 33%,
    ${COLORS.gogo_teal} 67%,
    ${COLORS.gogo_blue} 100%
  );
  background-size: 300% 100%;
  animation: ${shimmer} 6s ease-in-out infinite;
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin: 1.5rem auto 0;
  line-height: 1.7;
`;

// Spotlight-styled elements (borrowed from FlexSections)
const SpotlightWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #121212;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SpotlightLabel = styled.div<{ $bg: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.8rem;
  background: ${(p) => p.$bg};
  color: #111;
`;

const SpotlightTitle = styled.h3`
  margin: 12px 0 8px;
  font-size: clamp(1.5rem, 4.5vw, 2.4rem);
  font-weight: 900;
  line-height: 1.1;
  color: #fff;
`;

const SpotlightCopy = styled.p`
  color: rgba(255, 255, 255, 0.82);
  font-size: 1.05rem;
  line-height: 1.8;
  margin: 0 0 0.5rem;
`;

const SpotlightImage = styled.div<{ $src: string }>`
  margin-top: 1rem;
  border-radius: 12px;
  background: url('${(p) => p.$src}') center/cover no-repeat;
  width: 100%;
  height: 360px;
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SplitBox = styled.div`
  background: #121212;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
`;

const SplitImage = styled.div<{ $src: string }>`
  border-radius: 16px;
  min-height: 380px;
  background: url('${(p) => p.$src}') center/cover no-repeat;
`;

const Band = styled.div`
  background: linear-gradient(90deg, ${COLORS.gogo_teal}, ${COLORS.gogo_blue});
  border-radius: 18px;
  padding: 1.25rem;
  margin-top: 1rem;
`;

const BandInner = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const BandItem = styled.div`
  color: #fff;
`;

// Define the program data
const programData = [
  {
    id: 'm-power',
    title: 'M-Power Program',
    description:
      'Our M-Power Mental Health and Wellness program has experienced remarkable expansion across all regions, emphasizing the need for comprehensive support services for both youth and mentors.',
    icon: '🌱',
    category: 'wellness',
    color: COLORS.gogo_pink,
    features: [
      'Enhanced curriculum with reflective, community-building circle sessions',
      'Mentors lead interactive exercises that promote connection and growth',
      'All staff trained in Youth Mental Health First Aid',
      'Mental wellness fully integrated into every aspect of our programming',
    ],
  },
  {
    id: 'tasc',
    title: 'Pilot Program with the TASC Reporting Center',
    description:
      'GOGO partnered with TASC to give justice-involved youth a voice through music, supporting support 39 Cook County youth on probation',
    icon: '🎙️',
    category: 'music',
    color: COLORS.gogo_yellow,
    features: [
      'Youth learned songwriting, rap, and music production from caring mentors',
      'Safe, creative spaces helped build self-esteem and emotional resilience',
      'Program addressed critical risks like incarceration, school dropout, and poor mental health',
      'Mentees gained clarity, confidence, and a renewed sense of direction through music',
    ],
  },
  {
    id: 'career-coaching',
    title: 'College and Career Coaching',
    description:
      'Through individualized mentorship and partnerships, students receive guidance on college access, vocational pathways, and early career readiness — building on Zaya’s model across regions.',
    icon: '🎓',
    category: 'readiness',
    color: COLORS.gogo_teal,
    features: [
      'Application and FAFSA support sessions with mentors',
      'Career days with industry professionals and alumni mentors',
      'Portfolio, resume, and audition prep integrated into programming',
    ],
  },
];

const programImages = {
  'm-power': photo1,
  tasc: photo2,
  'career-coaching': photo3,
};

function ProgramsSection(): JSX.Element {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Function to generate random heights for sound bars
  const generateSoundBars = useCallback(() => {
    const count = 40;
    return Array.from({ length: count }).map((_, i) => ({
      height: Math.floor(Math.random() * 20) + 5, // Random height between 5 and 25
      delay: (i / count) * 2, // Staggered delay
    }));
  }, []);

  const [soundBars] = useState(() => generateSoundBars());

  // No filters for spotlight layout

  // Setup intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);

          // Animate the header
          const header = headerRef.current;
          if (header) {
            const items = header.querySelectorAll('.animate-item');
            if (items && items.length > 0) {
              animate(items, {
                opacity: [0, 1],
                translateY: [30, 0],
                delay: stagger(150),
                duration: 800,
                easing: 'easeOutCubic',
              });
            }
          }

          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.2 },
    );

    const currentSection = sectionRef.current;

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <ProgramsContainer ref={sectionRef}>
      <BackgroundPattern />

      {/* Background glows */}
      <GlowEffect
        $color={COLORS.gogo_blue}
        style={{ top: '10%', left: '5%', animationDelay: '0s' }}
      />
      <GlowEffect
        $color={COLORS.gogo_purple}
        style={{ top: '60%', right: '5%', animationDelay: '2s' }}
      />

      {/* Sound wave visualization */}
      <SoundWave>
        {soundBars.map((bar, index) => (
          <SoundBar
            key={`sound-bar-${index}-${bar.height}-${bar.delay}`}
            $height={bar.height}
            $delay={bar.delay}
          />
        ))}
      </SoundWave>

      <ContentContainer>
        <SectionHeader ref={headerRef}>
          <SectionTitle className="animate-item" style={{ opacity: 0 }}>
            Our Programs
            <UnderlineEffect />
          </SectionTitle>
          <SectionSubtitle className="animate-item" style={{ opacity: 0 }}>
            GOGO offers diverse programs led by professional artist mentors who
            are passionate about nurturing creativity, building confidence, and
            developing skills in young artists.
          </SectionSubtitle>
        </SectionHeader>

        {programData.map((program, index) => {
          const imageSrc =
            programImages[program.id as keyof typeof programImages];

          // Alternate layouts inspired by FlexSections
          if (index % 3 === 1) {
            return (
              <Reveal key={program.id} variant="fade-up">
                <Split>
                  <SplitBox>
                    <SpotlightLabel $bg={program.color}>
                      Program Spotlight
                    </SpotlightLabel>
                    <SpotlightTitle style={{ marginTop: 12 }}>
                      {program.title}
                    </SpotlightTitle>
                    <SpotlightCopy>{program.description}</SpotlightCopy>
                    <ul
                      style={{
                        paddingLeft: '1.2rem',
                        marginTop: '0.75rem',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {program.features.slice(0, 3).map((feature) => (
                        <li
                          key={`f-${program.id}-${feature}`}
                          style={{ marginBottom: '0.4rem' }}
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </SplitBox>
                  <SplitImage $src={imageSrc} />
                </Split>
              </Reveal>
            );
          }

          if (index % 3 === 2) {
            return (
              <Reveal key={program.id} variant="fade-up">
                <div>
                  <SpotlightLabel $bg={COLORS.gogo_teal}>
                    Program Spotlight
                  </SpotlightLabel>
                  <SpotlightTitle>{program.title}</SpotlightTitle>
                  <SpotlightCopy>{program.description}</SpotlightCopy>
                  <SpotlightImage $src={imageSrc} />
                  <Band>
                    <BandInner>
                      {program.features.slice(0, 3).map((feature) => (
                        <BandItem key={`band-${program.id}-${feature}`}>
                          <strong>{feature}</strong>
                        </BandItem>
                      ))}
                    </BandInner>
                  </Band>
                </div>
              </Reveal>
            );
          }

          return (
            <Reveal key={program.id} variant="fade-up">
              <SpotlightWrapper>
                <SpotlightLabel $bg={COLORS.gogo_yellow}>
                  Program Spotlight
                </SpotlightLabel>
                <SpotlightTitle>{program.title}</SpotlightTitle>
                <SpotlightCopy>{program.description}</SpotlightCopy>
                <SpotlightImage $src={imageSrc} />
              </SpotlightWrapper>
            </Reveal>
          );
        })}
      </ContentContainer>
    </ProgramsContainer>
  );
}

export default ProgramsSection;
