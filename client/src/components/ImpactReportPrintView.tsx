import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ImpactReportPage from '../ImpactReportPage';
import { fetchHeroContent, HeroContent } from '../services/impact.api';
import COLORS from '../../assets/colors';
import '../../assets/fonts/fonts.css';

// Full-viewport cover slide styled like the webapp
const CoverSlide = styled.section<{ $backgroundImage?: string }>`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: ${props => props.$backgroundImage
        ? `linear-gradient(135deg, rgba(23, 23, 23, 0.85) 0%, rgba(25, 70, 245, 0.7) 50%, rgba(104, 54, 154, 0.6) 100%), url(${props.$backgroundImage})`
        : `linear-gradient(135deg, #171717 0%, ${COLORS.gogo_blue} 50%, ${COLORS.gogo_purple} 100%)`};
  background-size: cover;
  background-position: center;
  
  @media print {
    page-break-after: always;
    height: 100vh;
  }
`;

const CoverContent = styled.div`
  text-align: center;
  z-index: 2;
  padding: 2rem;
`;

const Year = styled.div`
  font-family: 'Century Gothic', Arial, sans-serif;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
  color: ${COLORS.gogo_green};
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  opacity: 0.9;
`;

const Title = styled.h1`
  font-family: 'Airwaves', 'Century Gothic', sans-serif;
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 0.95;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.02em;
`;

const Subtitle = styled.div`
  font-family: 'Airwaves', 'Century Gothic', sans-serif;
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 600;
  color: ${COLORS.gogo_green};
  margin-top: 1.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.9;
`;

const LocationBubbles = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem 2rem;
  margin-top: 4rem;
`;

const LocationBubble = styled.span`
  font-family: 'Century Gothic', Arial, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
`;

const Separator = styled.span`
  color: ${COLORS.gogo_green};
  opacity: 0.6;
  display: flex;
  align-items: center;
`;

// Gradient overlay for extra depth
const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(25, 70, 245, 0.3) 0%,
    transparent 50%
  ),
  radial-gradient(
    ellipse at 70% 80%,
    rgba(141, 221, 166, 0.2) 0%,
    transparent 40%
  );
  pointer-events: none;
`;

/**
 * Print-ready view of the Impact Report
 * Includes a beautiful cover slide followed by the full webapp content
 * Use this route (/print) for Sejda PDF conversion
 */
const ImpactReportPrintView: React.FC = () => {
    const [heroData, setHeroData] = useState<HeroContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHero = async () => {
            try {
                const hero = await fetchHeroContent();
                setHeroData(hero);
            } catch (error) {
                console.error('Failed to load hero data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadHero();
    }, []);

    // Default locations
    const locations = ['Miami', 'Chicago', 'Los Angeles', 'New York'];

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#171717',
                color: 'white',
                fontFamily: 'Century Gothic, Arial, sans-serif'
            }}>
                Loading Print View...
            </div>
        );
    }

    return (
        <>
            {/* COVER SLIDE - Beautiful, webapp-styled */}
            <CoverSlide $backgroundImage={heroData?.backgroundImage}>
                <GradientOverlay />
                <CoverContent>
                    <Year>{heroData?.year || heroData?.subtitle || '2024'}</Year>
                    <Title>{heroData?.title || 'GUITARS OVER GUNS'}</Title>
                    <Subtitle>Impact Report</Subtitle>
                    <LocationBubbles>
                        {locations.map((location, index) => (
                            <React.Fragment key={location}>
                                <LocationBubble>{location}</LocationBubble>
                                {index < locations.length - 1 && <Separator>•</Separator>}
                            </React.Fragment>
                        ))}
                    </LocationBubbles>
                </CoverContent>
            </CoverSlide>

            {/* FULL WEBAPP CONTENT - Exact same as main site */}
            <ImpactReportPage printMode />
        </>
    );
};

export default ImpactReportPrintView;
