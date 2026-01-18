import React, { useMemo, memo, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import COLORS from '../../assets/colors';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Reveal from '../../animations/components/Reveal';
import { ImpactLevelsContent, fetchImpactLevelsContent } from '../services/impact.api';

interface ImpactLevelsSectionProps {
  previewMode?: boolean;
  impactLevelsOverride?: ImpactLevelsContent | null;
}

interface SectionProps {
  $bgGradient?: string;
  $bgColor?: string;
  $glowColor1?: string;
  $glowColor2?: string;
  $cardBgColor?: string;
  $cardHoverBgColor?: string;
  $amountColor?: string;
  $descriptionColor?: string;
  $ctaBgColor?: string;
  $ctaTextColor?: string;
  $ctaHoverBgColor?: string;
}

const Section = styled.section<SectionProps>`
  padding: 8rem 0 10rem;
  background: ${(p) => p.$bgGradient || p.$bgColor || '#0a0a0a'};
  position: relative;
  overflow: hidden;
  --section-underline: linear-gradient(
    135deg,
    #ffffff 0%,
    #e0e0e0 50%,
    ${COLORS.gogo_blue} 100%
  );
  --card-bg-color: ${(p) => p.$cardBgColor || 'rgba(255, 255, 255, 0.03)'};
  --card-hover-bg-color: ${(p) => p.$cardHoverBgColor || 'rgba(255, 255, 255, 0.08)'};
  --amount-color: ${(p) => p.$amountColor || 'white'};
  --description-color: ${(p) => p.$descriptionColor || 'rgba(255, 255, 255, 0.6)'};
  --cta-bg-color: ${(p) => p.$ctaBgColor || 'white'};
  --cta-text-color: ${(p) => p.$ctaTextColor || 'black'};
  --cta-hover-bg-color: ${(p) => p.$ctaHoverBgColor || COLORS.gogo_green};

  /* Ambient background lighting */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 30%, ${(p) => p.$glowColor1 || COLORS.gogo_blue}15 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, ${(p) => p.$glowColor2 || COLORS.gogo_purple}15 0%, transparent 50%);
    pointer-events: none;
  }
`;

const SoundWaveContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 0;
  mask-image: linear-gradient(to bottom, transparent, black 20%);
  pointer-events: none;
`;

const WaveCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 5rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h2<{ $gradient?: string }>`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  font-family: 'Airwaves', 'Century Gothic', 'Arial', sans-serif;
  background: ${(p) => p.$gradient || `linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, ${COLORS.gogo_blue} 100%)`};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

const Subtitle = styled.p<{ $color?: string }>`
  font-size: 1.1rem;
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.7)'};
  font-weight: 400;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  margin-bottom: 5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const Card = styled.a`
  background: var(--card-bg-color, rgba(255, 255, 255, 0.03));
  border-radius: 12px;
  padding: 1rem;
  transition: background 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-decoration: none;

  &:hover {
    background: var(--card-hover-bg-color, rgba(255, 255, 255, 0.08));
  }
`;

const ThumbWrap = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Amount = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--amount-color, white);
  font-family: 'Century Gothic', 'Arial', sans-serif;
`;

const Description = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--description-color, rgba(255, 255, 255, 0.6));
  font-weight: 400;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CTAWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const DonateButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 36px;
  background: var(--cta-bg-color, white);
  color: var(--cta-text-color, black);
  border-radius: 99px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
  font-family: 'Century Gothic', 'Arial', sans-serif;
  
  &:hover {
    transform: scale(1.05);
    background: var(--cta-hover-bg-color, ${COLORS.gogo_green});
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`;

function ImpactLevelsSection({ previewMode = false, impactLevelsOverride }: ImpactLevelsSectionProps): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [internalData, setInternalData] = useState<ImpactLevelsContent | null>(null);
  const [loading, setLoading] = useState(!previewMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewMode) {
      const loadContent = async () => {
        try {
          setLoading(true);
          const content = await fetchImpactLevelsContent();
          if (content) {
            setInternalData(content);
          } else {
            setError('Content not found. Please create it in the admin panel.');
          }
        } catch (err) {
          console.error('Failed to fetch ImpactLevels content:', err);
          setError('Failed to load content.');
        } finally {
          setLoading(false);
        }
      };
      loadContent();
    }
  }, [previewMode]);

  const data = previewMode ? impactLevelsOverride : internalData;

  // Sound wave animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = sectionRef.current;
    if (!canvas || !container || !data?.soundWave?.enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    const waveColor1 = data.soundWave?.color1 || COLORS.gogo_purple;
    const waveColor2 = data.soundWave?.color2 || COLORS.gogo_blue;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    let isVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
             if (!animationId) {
               draw();
             }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (container) {
      observer.observe(container);
    }

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    const draw = () => {
      if (!isVisible) {
         animationId = 0;
         return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = 4;
      const gap = 4;
      const totalBarWidth = barWidth + gap;
      const barCount = Math.ceil(width / totalBarWidth);
      
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, waveColor1);
      gradient.addColorStop(1, waveColor2);
      
      ctx.fillStyle = gradient;
      
      for (let i = 0; i < barCount; i++) {
        const x = i * totalBarWidth;
        
        const baseHeight = 4 + 
          Math.sin(i * 0.1 + time) * 5 + 
          Math.sin(i * 0.05 - time * 1.5) * 5;
          
        const dist = Math.abs(x - mouseX);
        const influenceRadius = 150;
        let mouseInfluence = 0;
        
        if (dist < influenceRadius) {
          const factor = 1 - (dist / influenceRadius);
          const ease = factor * factor * (3 - 2 * factor);
          mouseInfluence = ease * 60;
        }
        
        let h = Math.max(4, baseHeight + mouseInfluence);
        
        if (h > height) h = height;
        
        const radius = barWidth / 2;
        
        ctx.beginPath();
        ctx.roundRect(x, height - h, barWidth, h, radius);
        ctx.fill();
      }
      
      time += 0.05;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [data]);

  if (loading) {
    return (
      <Section ref={sectionRef}>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.6)' }}>
            Loading section...
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section ref={sectionRef}>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem', color: '#ff6b6b' }}>
            {error}
          </div>
        </Container>
      </Section>
    );
  }

  if (!data || data.visible === false) {
    return null;
  }

  const header = data.header ?? { title: '', titleGradient: '', subtitle: '', subtitleColor: '' };
  const levels = data.levels ?? [];
  const cta = data.cta ?? { text: '', url: '', bgColor: '', textColor: '', hoverBgColor: '' };
  const soundWave = data.soundWave ?? { enabled: true, color1: '', color2: '' };

  return (
    <Section
      ref={sectionRef}
      aria-label={data.ariaLabel || undefined}
      $bgGradient={data.sectionBgGradient || undefined}
      $bgColor={data.sectionBgColor || undefined}
      $glowColor1={data.glowColor1 || undefined}
      $glowColor2={data.glowColor2 || undefined}
      $cardBgColor={data.cardBgColor || undefined}
      $cardHoverBgColor={data.cardHoverBgColor || undefined}
      $amountColor={data.amountColor || undefined}
      $descriptionColor={data.descriptionColor || undefined}
      $ctaBgColor={cta.bgColor || undefined}
      $ctaTextColor={cta.textColor || undefined}
      $ctaHoverBgColor={cta.hoverBgColor || undefined}
    >
      <Container>
        <Reveal variant="fade-up" enabled={data.animationsEnabled ?? true}>
          <Header>
            <Title $gradient={header.titleGradient}>{header.title}</Title>
            <Subtitle $color={header.subtitleColor}>{header.subtitle}</Subtitle>
          </Header>
        </Reveal>
        
        <Reveal variant="stagger-up" staggerSelector=".impact-card" delay={200} enabled={data.animationsEnabled ?? true}>
          <Grid>
            {levels.map((level) => (
              <Card
                key={level.id}
                className="impact-card"
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ThumbWrap>
                  <Thumb
                    src={level.imageUrl}
                    alt={`${level.amount} - ${level.description}`}
                    loading="lazy"
                  />
                </ThumbWrap>
                <Content>
                  <Amount>{level.amount}</Amount>
                  <Description>{level.description}</Description>
                </Content>
              </Card>
            ))}
          </Grid>
        </Reveal>

        {cta.text && cta.url && (
          <Reveal variant="fade-up" delay={400} enabled={data.animationsEnabled ?? true}>
            <CTAWrapper>
              <DonateButton
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={cta.text}
              >
                {cta.text}
                <ArrowForwardIcon style={{ fontSize: '1.2rem' }} />
              </DonateButton>
            </CTAWrapper>
          </Reveal>
        )}
      </Container>

      {soundWave.enabled && (
        <SoundWaveContainer>
          <WaveCanvas ref={canvasRef} />
        </SoundWaveContainer>
      )}
    </Section>
  );
}

export default memo(ImpactLevelsSection);
