import React from 'react';
import styled from 'styled-components';
import { Reveal } from '../../animations';
import COLORS from '../../assets/colors';

const Wrapper = styled.section`
  padding: 8rem 0;
  background: #141414; /* Slightly lighter/different shade than FlexA */
  color: #e0e0e0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div``;

const Sidebar = styled.aside`
  position: sticky;
  top: 2rem;
`;

const Label = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.75rem;
  background: ${COLORS.gogo_purple};
  color: #fff;
  margin-bottom: 1.5rem;
`;

const Headline = styled.h2`
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
  margin-bottom: 2rem;
`;

const LeadParagraph = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  font-weight: 300;
`;

const BodyText = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);

  p {
    margin-bottom: 1.5rem;
  }
`;

const PullQuote = styled.blockquote`
  margin: 3rem -2rem 3rem 0;
  padding: 2rem;
  background: linear-gradient(to right, rgba(124, 77, 255, 0.1), transparent);
  border-left: 4px solid ${COLORS.gogo_purple};
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  font-style: italic;
  line-height: 1.4;

  @media (max-width: 900px) {
    margin-right: 0;
  }
`;

const QuoteAuthor = styled.cite`
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: ${COLORS.gogo_purple};
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SidebarBox = styled.div`
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 1.2em;
    background: ${COLORS.gogo_purple};
    border-radius: 2px;
  }
`;

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
    line-height: 1.5;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${COLORS.gogo_purple};
      font-weight: bold;
    }
  }
`;

const KeyTakeaway = styled.div`
  background: ${COLORS.gogo_purple};
  color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  line-height: 1.5;
  font-size: 1.1rem;
  text-align: center;
`;

const ImageContainer = styled.div<{ $src: string }>`
  width: 100%;
  height: 300px;
  background: url('${(p) => p.$src}') center/cover no-repeat;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

function FlexB(): JSX.Element {
  return (
    <Wrapper>
      <Container>
        <Reveal variant="fade-up">
          <Grid>
            <MainContent>
              <Label>Case Study: Restorative Justice</Label>
              <Headline>Rewriting the Narrative: A Different Outlook on Life</Headline>
              <LeadParagraph>
                For youth involved in the justice system, the stories told about them are often written by others—judges, case workers, and society at large. But what happens when you hand them the pen?
              </LeadParagraph>
              
              <BodyText>
                <p>
                  Our "Restorative Storytelling" initiative operates on a fundamental premise: agency is the first step toward healing. Through songwriting, production, and performance, students aren't just learning music; they are authoring counter-narratives that center their humanity, their struggles, and their potential.
                </p>
                <p>
                  Sessions are designed to balance technical craft with deep reflection. A typical workshop might begin with a "check-in" circle, moving into lyric writing prompts that encourage vulnerability, and ending with beat production that channels that energy into sound.
                </p>
                
                <PullQuote>
                  “I didn’t think anyone wanted to hear me. I thought my voice was just noise. Now I know it matters—and I’ve got the track to prove it.”
                  <QuoteAuthor>— Participant, Spring 2024 Cohort</QuoteAuthor>
                </PullQuote>

                <p>
                  The impact goes beyond the music. By articulating their experiences, students develop emotional literacy and resilience. They learn to process trauma not in isolation, but in a community of creative peers and mentors who listen without judgment. This shift—from being the subject of a file to the artist of a song—can be the turning point in a young person's trajectory.
                </p>
              </BodyText>
            </MainContent>

            <Sidebar>
              <SidebarBox>
                <ImageContainer $src={'https://picsum.photos/1000/1200?random=22'} />
                <SidebarTitle>Program Highlights</SidebarTitle>
                <BulletList>
                  <li>Weekly studio sessions focused on lyrical expression</li>
                  <li>Mentor-guided co-writing and production</li>
                  <li>Peer circles for feedback and collaborative problem solving</li>
                  <li>Community showcases to build pride and confidence</li>
                </BulletList>
              </SidebarBox>

              <KeyTakeaway>
                92% of participants reported increased confidence in expressing their emotions.
              </KeyTakeaway>
            </Sidebar>
          </Grid>
        </Reveal>
      </Container>
    </Wrapper>
  );
}

export default FlexB;
