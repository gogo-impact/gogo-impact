import React, { useMemo, memo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import COLORS from '../../assets/colors';
import photo1 from '../../assets/missionPhotos/Photo1.jpg';
import photo2 from '../../assets/missionPhotos/Photo2.jpg';
import photo3 from '../../assets/missionPhotos/Photo3.jpg';
import photo4 from '../../assets/missionPhotos/Photo4.jpg';
import photo5 from '../../assets/missionPhotos/Photo5.jpg';
import photo6 from '../../assets/missionPhotos/Photo6.jpg';
import photo7 from '../../assets/missionPhotos/Photo7.jpg';
import photo8 from '../../assets/missionPhotos/Photo8.jpg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Reveal from '../../animations/components/Reveal';

const Section = styled.section`
  padding: 8rem 0 10rem;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;

  /* Ambient background lighting */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 30%, ${COLORS.gogo_blue}15 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, ${COLORS.gogo_purple}15 0%, transparent 50%);
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

const Title = styled.h2`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  font-family: 'Century Gothic', 'Arial', sans-serif;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #e0e0e0 50%,
    ${COLORS.gogo_blue} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
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

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1rem;
  transition: background 0.3s ease;
  cursor: default;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
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
  color: white;
  font-family: 'Century Gothic', 'Arial', sans-serif;
`;

const Description = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.6);
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
  background: white;
  color: black;
  border-radius: 99px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
  font-family: 'Century Gothic', 'Arial', sans-serif;
  
  &:hover {
    transform: scale(1.05);
    background: ${COLORS.gogo_green}; // Spotify/Action green
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`;

const levels = [
  { img: photo1, amount: '$75', desc: 'Provides one mentoring session' },
  { img: photo2, amount: '$100', desc: 'Provides an acoustic guitar' },
  { img: photo3, amount: '$250', desc: 'Provides a drum set' },
  { img: photo4, amount: '$500', desc: 'Provides a keyboard' },
  { img: photo5, amount: '$1,000', desc: 'Supports a music video' },
  { img: photo6, amount: '$2,500', desc: 'Supports a recording session' },
  { img: photo7, amount: '$5,000', desc: 'Supports a summer scholarship' },
  { img: photo8, amount: '$10,000', desc: 'Supports national mental health programming' },
  { img: photo1, amount: '$25,000', desc: 'Supports Mentor Leadership Development' },
  { img: photo2, amount: '$50,000', desc: 'Supports a school program' },
];

function ImpactLevelsSection(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = sectionRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    const handleResize = () => {
      // Set canvas size to match display size for sharpness
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
    };

    // Initial resize
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    // Use IntersectionObserver to only animate when visible
    let isVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
             // Restart loop if it stopped
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

    // Listen on the whole section for mouse moves
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    const draw = () => {
      if (!isVisible) {
         animationId = 0; // Mark as stopped
         return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Bar settings
      const barWidth = 4;
      const gap = 4;
      const totalBarWidth = barWidth + gap;
      const barCount = Math.ceil(width / totalBarWidth);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, COLORS.gogo_purple);
      gradient.addColorStop(1, COLORS.gogo_blue);
      
      ctx.fillStyle = gradient;
      
      for (let i = 0; i < barCount; i++) {
        const x = i * totalBarWidth;
        
        // Base sine wave animation
        // Different frequencies for more organic look
        const baseHeight = 4 + 
          Math.sin(i * 0.1 + time) * 5 + 
          Math.sin(i * 0.05 - time * 1.5) * 5;
          
        // Mouse interaction
        // Calculate distance from mouse X
        const dist = Math.abs(x - mouseX);
        const influenceRadius = 150;
        let mouseInfluence = 0;
        
        if (dist < influenceRadius) {
          // Gaussian-like curve
          const factor = 1 - (dist / influenceRadius);
          // Easing
          const ease = factor * factor * (3 - 2 * factor); // smoothstep
          mouseInfluence = ease * 60;
        }
        
        // Final height logic
        let h = Math.max(4, baseHeight + mouseInfluence);
        
        // Clamp height
        if (h > height) h = height;
        
        // Draw rounded rect (pill)
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
  }, []);

  return (
    <Section ref={sectionRef}>
      <Container>
        <Reveal variant="fade-up">
          <Header>
            <Title>Impact Levels</Title>
            <Subtitle>
              Every dollar contributes to the transformative power of music and mentorship.
              See exactly what your gift can do.
            </Subtitle>
          </Header>
        </Reveal>
        
        <Reveal variant="stagger-up" staggerSelector=".impact-card" delay={200}>
          <Grid>
            {levels.map((l, i) => (
              <Card key={i} className="impact-card">
                <ThumbWrap>
                  <Thumb
                    src={l.img}
                    alt={`${l.amount} - ${l.desc}`}
                    loading="lazy"
                  />
                </ThumbWrap>
                <Content>
                  <Amount>{l.amount}</Amount>
                  <Description>{l.desc}</Description>
                </Content>
              </Card>
            ))}
          </Grid>
        </Reveal>

        <Reveal variant="fade-up" delay={400}>
          <CTAWrapper>
            <DonateButton
              href="https://www.classy.org/give/352794/#!/donation/checkout"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Donate to support GOGO"
            >
              Make an Impact Today
              <ArrowForwardIcon style={{ fontSize: '1.2rem' }} />
            </DonateButton>
          </CTAWrapper>
        </Reveal>
      </Container>

      <SoundWaveContainer>
        <WaveCanvas ref={canvasRef} />
      </SoundWaveContainer>
    </Section>
  );
}

export default memo(ImpactLevelsSection);
