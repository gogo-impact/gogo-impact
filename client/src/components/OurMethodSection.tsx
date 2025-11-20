import React from 'react';
import styled from 'styled-components';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import COLORS from '../../assets/colors';
import Reveal from '../../animations/components/Reveal';

const Section = styled.section`
  padding: 8rem 0;
  background: linear-gradient(180deg, #111111 0%, #0a0a0a 100%);
  position: relative;
  overflow: hidden;

  /* Subtle background glow */
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${COLORS.gogo_blue}11 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: -5%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, ${COLORS.gogo_teal}11 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  text-align: left;
  margin-bottom: 4rem;
  max-width: 900px;
`;

const Title = styled.h2`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 900;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const Subtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 300;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const IconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal});
  color: white;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;

  svg {
    width: 32px;
    height: 32px;
    stroke-width: 1.5;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);

  /* Subtle inner sheen */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.01)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  /* Hover glow effect */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      ${COLORS.gogo_blue}15 0%,
      transparent 50%
    );
    opacity: 0;
    transform: translate(0, 0);
    transition: opacity 0.4s ease;
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-6px) scale(1.01);
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);

    &::after {
      opacity: 1;
    }

    ${IconWrap} {
      transform: scale(1.1);
      box-shadow: 0 0 20px ${COLORS.gogo_blue}66;
    }
  }
`;

const CardTitle = styled.h3`
  color: white;
  font-family: 'Century Gothic', 'Arial', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1.4;
  margin: 0;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
`;

const NarrativeContainer = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3rem;
  align-items: start;
  margin-top: 2rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const LeadText = styled.div`
  font-size: 1.5rem;
  line-height: 1.5;
  color: white;
  font-weight: 500;
  
  span {
    color: ${COLORS.gogo_teal};
    font-weight: 700;
  }
`;

const SecondaryText = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  padding-left: 2rem;
  border-left: 1px solid ${COLORS.gogo_purple};
  max-width: 90%;

  @media (max-width: 900px) {
    padding-left: 1.5rem;
    border-left-width: 2px;
    max-width: 100%;
  }
`;

function OurMethodSection(): JSX.Element {
  const items = [
    {
      icon: <HandshakeOutlinedIcon fontSize="inherit" />,
      text: 'Trusting relationships with caring adults',
    },
    {
      icon: <MenuBookOutlinedIcon fontSize="inherit" />,
      text: 'High-quality, no-cost arts education during typically unsupervised hours',
    },
    {
      icon: <LightbulbOutlinedIcon fontSize="inherit" />,
      text: 'Enriching, safe activities that foster self-esteem & creative self-expression',
    },
    { icon: <SettingsOutlinedIcon fontSize="inherit" />, text: 'Skill Development' },
    { icon: <MicNoneOutlinedIcon fontSize="inherit" />, text: 'Performance' },
    { icon: <FavoriteBorderOutlinedIcon fontSize="inherit" />, text: 'Trauma-informed mental health support' },
  ];

  return (
    <Section>
      <Container>
        <Reveal variant="fade-up" duration={800}>
          <Header>
            <Title>Our Method</Title>
            <Subtitle>
              Our mentoring-centric approach is delivered by paid, professional
              musician mentors and helps alleviate primary challenges faced by
              youth in vulnerable communities by providing:
            </Subtitle>
          </Header>
        </Reveal>

        <Reveal variant="stagger-up" staggerSelector=".method-card" delay={200}>
          <Grid>
            {items.map((it, index) => (
              <Card key={index} className="method-card">
                <IconWrap aria-hidden>{it.icon}</IconWrap>
                <CardTitle>{it.text}</CardTitle>
              </Card>
            ))}
          </Grid>
        </Reveal>

        <Reveal variant="fade-up" delay={400} duration={800}>
          <NarrativeContainer>
            <LeadText>
              Our successful model pairs youth with a <span>caring adult mentor</span>, the
              unparalleled power of <span>music</span>, and <span>trauma-informed mental health
              support</span>.
            </LeadText>
            <SecondaryText>
              Separately, these interventions increase academic and
              social-emotional development as well as future employability and
              economic potential. We uniquely combine these to maximize their
              collective effectiveness. Through weekly after-school music and art
              instruction, mentoring, trauma-informed care, and performance
              opportunities across Miami, Chicago, Los Angeles, and New York, GOGO
              is a platform for youth to learn, grow and unleash their leadership
              potential.
            </SecondaryText>
          </NarrativeContainer>
        </Reveal>
      </Container>
    </Section>
  );
}

export default OurMethodSection;
