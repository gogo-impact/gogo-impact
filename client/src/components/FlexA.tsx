import React from 'react';
import styled from 'styled-components';
import { Reveal } from '../../animations';
import COLORS from '../../assets/colors';

const Wrapper = styled.section`
  padding: 8rem 0;
  background: #0f0f0f;
  color: #e0e0e0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Header = styled.header`
  margin-bottom: 4rem;
  text-align: center;
`;

const Label = styled.span`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.85rem;
  background: ${COLORS.gogo_yellow};
  color: #111;
  margin-bottom: 1.5rem;
`;

const Headline = styled.h2`
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
  color: #fff;
  max-width: 900px;
  margin: 0 auto;
  letter-spacing: -0.02em;

  span {
    color: ${COLORS.gogo_yellow};
  }
`;

const Subhead = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 700px;
  margin: 1.5rem auto 0;
  line-height: 1.5;
  font-weight: 300;
`;

const HeroImage = styled.div<{ $src: string }>`
  width: 100%;
  height: 60vh;
  min-height: 400px;
  max-height: 700px;
  background: url('${(p) => p.$src}') center/cover no-repeat;
  border-radius: 24px;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(15, 15, 15, 0.9), transparent);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 4rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleBody = styled.div`
  font-size: 1.15rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);

  p {
    margin-bottom: 1.5rem;
  }

  p:first-of-type::first-letter {
    font-size: 3.5em;
    float: left;
    line-height: 0.8;
    margin-right: 0.15em;
    color: ${COLORS.gogo_yellow};
    font-weight: 900;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 2rem;
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const SidebarTitle = styled.h3`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
`;

const StatItem = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Quote = styled.blockquote`
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-left: 4px solid ${COLORS.gogo_yellow};
  border-radius: 0 12px 12px 0;
  font-size: 1.25rem;
  font-style: italic;
  color: #fff;
  font-weight: 500;
`;

const QuoteAuthor = styled.cite`
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

function FlexA(): JSX.Element {
  return (
    <Wrapper>
      <Container>
        <Reveal variant="fade-up">
          <Header>
            <Label>Program Spotlight</Label>
            <Headline>
              The Heartbeat of <span>Overtown</span>
            </Headline>
            <Subhead>
              How a historic neighborhood became the stage for our most ambitious summer program yet.
            </Subhead>
          </Header>

          <HeroImage $src={'https://picsum.photos/1400/800?random=21'} />

          <ContentGrid>
            <ArticleBody>
              <p>
                A staple of Miami's historic Overtown neighborhood, the Overtown Youth Center (OYC) has long been a hub for community empowerment. But this past summer, the halls echoed with a new kind of energy. With a program launch in December 2023, Guitars Over Guns mentors stepped in to facilitate programming that bridged the gap between after-school structure and summer freedom.
              </p>
              <p>
                The goal was simple but profound: give students the tools to tell their own stories. Over the course of eight weeks, the studio became a sanctuary. Students who had never touched an instrument were suddenly laying down tracks; shy voices found their volume behind the microphone.
              </p>
              <Quote>
                “The studio became our safe space. It's where we learned to listen to each other, to lead, and to be heard without judgment.”
                <QuoteAuthor>— OYC Student, Class of 2024</QuoteAuthor>
              </Quote>
              <p>
                During the summer camp, students created original songs and emboldened one another through friendly competition. The process culminated in two of the catchiest hits of the summer, tracks that didn't just stay in the classroom but were performed for the entire community.
              </p>
              <p>
                Alongside songwriting and performance fundamentals, mentors embedded social-emotional learning throughout every session. Students practiced goal-setting, collaboration, and reflective critique—skills that transfer far beyond music into classrooms, careers, and their communities. The Overtown program stands as a testament to what happens when you combine resources, mentorship, and the raw talent of Miami's youth.
              </p>
            </ArticleBody>

            <Sidebar>
              <SidebarTitle>By the Numbers</SidebarTitle>
              <StatItem>
                <StatNumber>18</StatNumber>
                <StatLabel>Active Mentors</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>42</StatNumber>
                <StatLabel>Original Songs</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>12</StatNumber>
                <StatLabel>Live Showcases</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>100%</StatNumber>
                <StatLabel>Student Satisfaction</StatLabel>
              </StatItem>
            </Sidebar>
          </ContentGrid>
        </Reveal>
      </Container>
    </Wrapper>
  );
}

export default FlexA;
