import React from 'react';
import styled from 'styled-components';
import { Reveal } from '../../animations';
import COLORS from '../../assets/colors';

const Wrapper = styled.section`
  padding: 10rem 0;
  background: #050505; /* Deepest black for cinematic feel */
  color: #e0e0e0;
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const Header = styled.header`
  margin-bottom: 4rem;
`;

const Label = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  color: ${COLORS.gogo_teal};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const Title = styled.h2`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 0.9;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  
  span {
    display: block;
    font-size: 0.4em;
    font-weight: 400;
    letter-spacing: 0.1em;
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const PosterContainer = styled.div`
  position: relative;
  margin: 0 auto 5rem;
  max-width: 1200px;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 100px 20px #050505;
    z-index: 2;
    pointer-events: none;
  }
`;

const PosterImage = styled.div<{ $src: string }>`
  width: 100%;
  aspect-ratio: 16/9;
  background: url('${(p) => p.$src}') center/cover no-repeat;
  border-radius: 4px;
  opacity: 0.9;
`;

const PlayButtonOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 3;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${COLORS.gogo_teal};
    transform: translate(-50%, -50%) scale(1.1);
    border-color: ${COLORS.gogo_teal};
  }

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 0 10px 16px;
    border-color: transparent transparent transparent #fff;
    margin-left: 4px;
  }
`;

const DirectorsNotes = styled.div`
  max-width: 700px;
  margin: 0 auto 5rem;
  text-align: left;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 2rem;

  @media (max-width: 600px) {
    padding-left: 1rem;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 2rem;
  }
`;

const NoteLabel = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: ${COLORS.gogo_teal};
  margin-bottom: 1rem;
  text-transform: uppercase;
`;

const NoteText = styled.p`
  font-size: 1.2rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
`;

const CreditsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0;
  text-align: left;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const CreditItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CreditRole = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.4);
`;

const CreditValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
`;

function FlexC(): JSX.Element {
  return (
    <Wrapper>
      <Container>
        <Reveal variant="fade-up">
          <Header>
            <Label>New York City Launch</Label>
            <Title>
              Concrete <br /> Symphony
              <span>A Mini-Documentary</span>
            </Title>
          </Header>

          <PosterContainer>
            <PosterImage $src={'https://picsum.photos/1400/700?random=23'} />
            <PlayButtonOverlay />
          </PosterContainer>

          <DirectorsNotes>
            <NoteLabel>Director's Notes</NoteLabel>
            <NoteText>
              Capturing the energy of our New York launch required more than just a camera; it required a presence. We wanted to document not just the performance, but the quiet moments before the beat drops—the nervous laughter, the tuning of instruments, the shared glances of encouragement.
            </NoteText>
            <NoteText>
              The film follows students across three boroughs as they prepare for their debut. Between scenes, they share the "why" behind their art—stories of perseverance, family, and the undeniable joy of creation. The result is a portrait of a creative community in motion.
            </NoteText>
          </DirectorsNotes>

          <CreditsGrid>
            <CreditItem>
              <CreditRole>Location</CreditRole>
              <CreditValue>New York City</CreditValue>
            </CreditItem>
            <CreditItem>
              <CreditRole>Cast</CreditRole>
              <CreditValue>120+ Students</CreditValue>
            </CreditItem>
            <CreditItem>
              <CreditRole>Soundtrack</CreditRole>
              <CreditValue>9 Original Tracks</CreditValue>
            </CreditItem>
            <CreditItem>
              <CreditRole>Production</CreditRole>
              <CreditValue>48 Mentors</CreditValue>
            </CreditItem>
          </CreditsGrid>
        </Reveal>
      </Container>
    </Wrapper>
  );
}

export default FlexC;
