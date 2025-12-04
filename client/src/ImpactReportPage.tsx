import React, { useEffect, useRef, useState, memo } from 'react';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported first
import './ImpactReportStructure.css';
import '../assets/fonts/fonts.css'; // Import GOGO fonts
import styled from 'styled-components';
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { animate, stagger } from 'animejs';
import COLORS from '../assets/colors';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MissionSection from './sections/MissionSection';
import ImpactSection from './components/ImpactSection';
import OurMethodSection from "./components/OurMethodSection";
import CurriculumSection from './components/CurriculumSection';
import LocationsSection from "./sections/LocationsSection";
import SingleQuoteSection from './components/SingleQuoteSection';
import FlexA from './components/FlexA';
import FlexB from './components/FlexB';
import FlexC from './components/FlexC';
import PartnersSection from "./components/PartnersSection";
import ImpactLevelsSection from './components/ImpactLevelsSection';
import Population from './components/Population';
import gogoWideLogo from '../assets/GOGO_LOGO_WIDE_WH.png';
import SpotifyEmbedsSection from './components/SpotifyEmbedsSection';
import FinancialAnalysisSection from './components/FinancialAnalysisSection';
import IntroOverlay from "./components/IntroOverlay";
import {
  fetchHeroContent,
  fetchMissionContent,
  fetchPopulationContent,
  fetchFinancialContent,
  fetchMethodContent,
  HeroContent,
  MissionContent,
  PopulationContent,
  FinancialContent,
  MethodContent,
} from './services/impact.api';

// Types for centralized data loading
interface ImpactReportData {
  hero: HeroContent;
  mission: MissionContent;
  population: PopulationContent;
  financial: FinancialContent;
  method: MethodContent;
}

// Track whether the intro overlay has been shown in this tab.
// This lives at the module level so it persists across component unmounts/remounts
// within the same browser tab/session.
let hasShownIntroInThisTab = false;

// Styled components for Spotify-like footer
const SpotifyFooter = styled.footer`
  background: #121212;
  padding: 0;
  position: relative;
  overflow: hidden;
`;

const FooterPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    ${COLORS.gogo_blue}44,
    ${COLORS.gogo_pink}44,
    ${COLORS.gogo_purple}44,
    ${COLORS.gogo_teal}44,
    ${COLORS.gogo_yellow}44,
    ${COLORS.gogo_green}44
  );
`;

const FooterGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FooterLogo = styled.div`
  margin-bottom: 2rem;

  img {
    max-width: 180px;
    height: auto;
  }
`;

const FooterAbout = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  max-width: 400px;
  margin-bottom: 2rem;
`;

const FooterColumn = styled.div``;

const FooterColumnTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 0.8rem;

  a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      color: white;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialIcon = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${COLORS.gogo_blue};
    transform: translateY(-3px);
  }
`;

const FooterBottom = styled.div`
  max-width: 1400px;
  margin: 4rem auto 0;
  padding: 2rem 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FooterCopyright = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
`;

const FooterLegal = styled.div`
  display: flex;
  gap: 1.5rem;

  a {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;

    &:hover {
      color: white;
    }
  }
`;

// Styled components for the Music Section
const MusicSectionWrapper = styled.section`
  padding: 5rem 0;
  background: linear-gradient(to bottom, #121212, #0a0a0a);
  position: relative;
  overflow: hidden;
`;

const MusicSectionContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const MusicSectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const MusicSectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
  background: linear-gradient(
    to right,
    ${COLORS.gogo_blue},
    ${COLORS.gogo_teal}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const MusicSectionDescription = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

// Social icons now use MUI icons instead of custom SVGs (for consistency)

// Music player removed; replaced with Spotify embeds section

// Loading spinner container
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #121212;
  color: white;
  gap: 2rem;
`;


// Main component
function ImpactReportPage() {
  // Centralized data loading state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reportData, setReportData] = useState<ImpactReportData | null>(null);

  // Refs for each section to animate
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);
  const disciplinesRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const financialRef = useRef<HTMLDivElement>(null);
  const flexRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Only show the intro once per tab: initialize from the module-level flag.
  const [introComplete, setIntroComplete] = useState(hasShownIntroInThisTab);

  // Timeout duration for loading data (30 seconds)
  const LOAD_TIMEOUT_MS = 30000;

  // Centralized data fetching - load all section data at once with timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const loadAllData = async () => {
      // Create a timeout promise that rejects after LOAD_TIMEOUT_MS
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Loading timed out'));
        }, LOAD_TIMEOUT_MS);
      });

      try {
        // Race between data loading and timeout
        const [hero, mission, population, financial, method] = await Promise.race([
          Promise.all([
            fetchHeroContent(),
            fetchMissionContent(),
            fetchPopulationContent(),
            fetchFinancialContent(),
            fetchMethodContent(),
          ]),
          timeoutPromise,
        ]) as [HeroContent | null, MissionContent | null, PopulationContent | null, FinancialContent | null, MethodContent | null];

        // Clear timeout on success
        clearTimeout(timeoutId);

        if (!isMounted) return;

        // Check if any required section failed to load
        if (!hero || !mission || !population || !financial || !method) {
          console.error('[ImpactReportPage] One or more sections failed to load:', {
            hero: !!hero,
            mission: !!mission,
            population: !!population,
            financial: !!financial,
            method: !!method,
          });
          setLoadError(true);
          return;
        }

        setReportData({ hero, mission, population, financial, method });
      } catch (error) {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        console.error('[ImpactReportPage] Failed to load report data:', error);
        setLoadError(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleIntroFinish = () => {
    hasShownIntroInThisTab = true;
    setIntroComplete(true);
  };

  // Apply GOGO-like styles to body when component mounts
  useEffect(() => {
    // Save original styles to restore them later
    const originalBackground = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    const originalFontFamily = document.body.style.fontFamily;
    const originalOverflow = document.body.style.overflowX;

    // Apply GOGO-inspired styles
    document.body.style.backgroundColor = "var(--spotify-black, #171717)";
    document.body.style.color = "white";
    document.body.style.fontFamily =
      'var(--font-body, "Century Gothic", "Arial", sans-serif)';
    document.body.style.overflowX = "hidden";
    document.body.classList.add("has-spotify-header");

    // No need to add Google Fonts for Montserrat, using GOGO fonts instead

    // Cleanup function to restore original styles
    return () => {
      document.body.style.backgroundColor = originalBackground;
      document.body.style.color = originalColor;
      document.body.style.fontFamily = originalFontFamily;
      document.body.style.overflowX = originalOverflow;
      document.body.classList.remove("has-spotify-header");
    };
  }, []);

  // Initial animation for hero section, coordinated with intro overlay
  useEffect(() => {
    if (!heroRef.current) {
      return;
    }

    const heroElement = heroRef.current;
    // Ensure hero is always fully visible; the intro overlay will visually
    // reveal it via the logo cutout instead of hiding it here.
    heroElement.style.opacity = "1";
    heroElement.style.transform = "none";
    heroElement.style.willChange = "";
  }, [introComplete]);

  // Intro overlay disabled

  // Set up Intersection Observer for animations
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Observer for other sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Different animation for each section
            const { target } = entry;

            // Ensure target is valid before animating
            if (target) {
              // Store the target element safely
              const targetElement = target;

              // Verify target is still available
              if (document.body.contains(targetElement)) {
                const isFinancial =
                  (targetElement as HTMLElement).id === "financial" ||
                  targetElement === financialRef.current;
                if (isFinancial) {
                  console.log("[ImpactReport] Financial section intersecting", {
                    prefersReduced,
                    hasAnimate: typeof animate,
                    target: (targetElement as HTMLElement).id,
                  });
                }
                if (!prefersReduced) {
                  if (isFinancial) {
                    console.log(
                      "[ImpactReport] Financial: starting section animation",
                    );
                  }
                  animate(targetElement, {
                    opacity: [0, 1],
                    translateY: [16, 0],
                    duration: 600,
                    easing: "easeOutCubic",
                    complete: () => {
                      // drop will-change after animation completes
                      (targetElement as HTMLElement).style.willChange = "";
                      if (isFinancial) {
                        console.log(
                          "[ImpactReport] Financial: section animation complete",
                        );
                      }
                    },
                  });

                  // Animate child elements after the section appears (if marked)
                  const children =
                    targetElement.querySelectorAll(".animate-child");
                  if (children && children.length > 0) {
                    if (isFinancial) {
                      console.log(
                        "[ImpactReport] Financial: animating children",
                        {
                          count: children.length,
                        },
                      );
                    }
                    animate(children, {
                      opacity: [0, 1],
                      translateY: [12, 0],
                      scale: [0.98, 1],
                      duration: 480,
                      delay: stagger(80),
                      easing: "easeOutCubic",
                    });
                  }
                } else {
                  if (isFinancial) {
                    console.log(
                      "[ImpactReport] Financial: prefers-reduced-motion, skipping animations",
                    );
                  }
                  targetElement.setAttribute(
                    "style",
                    "opacity: 1; transform: none;",
                  );
                }
              }

              // Unobserve after animation is triggered
              observer.unobserve(target);
              if (
                (target as HTMLElement).id === "financial" ||
                target === financialRef.current
              ) {
                console.log(
                  "[ImpactReport] Financial: unobserved after triggering",
                );
              }
            }
          }
        });
      },
      {
        threshold: 0,
        // Pre-trigger slightly before sections enter viewport
        rootMargin: "200px 0px -10% 0px",
      },
    );

    // Observe all sections except hero (which is animated on load)
    const sections = [
      methodRef.current,
      impactRef.current,
      disciplinesRef.current,
      testimonialRef.current,
      musicRef.current,
      financialRef.current,
      partnersRef.current,
      footerRef.current,
    ];

    sections.forEach((node) => {
      if (node) {
        // Set initial styles to hint the compositor and reduce layout
        const el = node as HTMLElement;
        el.style.opacity = "0";
        el.style.transform = "translateY(16px)";
        el.style.willChange = "opacity, transform";
        observer.observe(node);
        if (node === financialRef.current) {
          console.log(
            "[ImpactReport] Financial: observing with initial hidden styles",
          );
        }
      }
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  // Music handlers removed with music player

  // Debug-only log removed for performance

  // Support hash-based deep links on initial load - must wait for data to be loaded
  // so the section elements exist in the DOM
  useEffect(() => {
    // Don't attempt to scroll until data is loaded and sections are rendered
    if (loading || !reportData) return;

    let timeoutId: number | undefined;
    const hash = window.location.hash?.replace("#", "");
    if (hash) {
      timeoutId = window.setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [loading, reportData]);

  // Show error dialog (only after loading completes and there's an error)
  if (!loading && (loadError || !reportData)) {
    return (
      <LoadingContainer>
        <Dialog
          open
          PaperProps={{
            style: {
              background: 'linear-gradient(180deg, #1a1a1a, #121212)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              padding: '1.5rem',
            },
          }}
        >
          <DialogTitle sx={{ color: 'white', textAlign: 'center', fontWeight: 700 }}>
            Failed to Load Impact Report
          </DialogTitle>
          <DialogContent>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', margin: 0 }}>
              Unable to load the impact report data. This may be due to a connection issue or the request timed out.
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              Please try reloading the page or come back later.
            </p>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              onClick={() => window.location.reload()}
              variant="contained"
              sx={{
                background: COLORS.gogo_blue,
                '&:hover': { background: COLORS.gogo_purple },
                fontWeight: 600,
              }}
            >
              Reload Page
            </Button>
          </DialogActions>
        </Dialog>
      </LoadingContainer>
    );
  }

  return (
    <div className="impact-report">
      {!introComplete && <IntroOverlay onFinish={handleIntroFinish} isLoading={loading} />}
      <div className="spotify-gradient-background" />
      <Header />
      <div className="main-content" style={{ paddingBottom: 0 }}>
        {reportData && (
          <>
            {/* Sticky scroll container for hero and following sections */}
            <div style={{ position: 'relative' }}>
              <div id="hero" ref={heroRef}>
                <HeroSection heroData={reportData.hero} />
              </div>
              <div id="mission" ref={missionRef} style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <MissionSection missionData={reportData.mission} />
              </div>
            </div>
            {/* Who We Serve (moved up) */}
            <div id="population">
              <Population inline populationData={reportData.population} />
            </div>
            {/* Financial Overview (moved higher) */}
            <div id="financial" ref={financialRef}>
              <FinancialAnalysisSection financialData={reportData.financial} />
            </div>
            <div id="method" ref={methodRef}>
              <OurMethodSection methodData={reportData.method} />
            </div>
          </>
        )}
        {/* ArtisticDisciplinesSection removed; content now appears in Mission modal */}
        <div id="curriculum">
          <CurriculumSection />
        </div>

        {/* ProgramsSection removed as it was redundant with Flex sections */}
        {/* Impact section (moved lower, includes measurement) */}
        <div id="impact" ref={impactRef}>
          <ImpactSection />
        </div>
        {/* Hear Our Impact (Spotify) moved later */}
        <div id="music" ref={musicRef}>
          <SpotifyEmbedsSection />
        </div>
        <div id="quote" ref={testimonialRef}>
          <SingleQuoteSection />
        </div>
        <div id="locations" ref={locationsRef}>
          <LocationsSection />
        </div>
        <div ref={flexRef} style={{ opacity: 1 }}>
          <div id="flex-a">
            <FlexA />
          </div>
          <div id="flex-b">
            <FlexB />
          </div>
          <div id="flex-c">
            <FlexC />
          </div>
        </div>
        <div id="impact-levels">
          <ImpactLevelsSection />
        </div>
        <div id="partners" ref={partnersRef}>
          <PartnersSection />
        </div>
        {/* FutureVisionSection removed per redesign */}
      </div>

      <SpotifyFooter id="footer" className="spotify-footer" ref={footerRef}>
        <FooterPattern />
        <FooterGrid>
          <FooterColumn>
            <FooterLogo>
              <img
                src={gogoWideLogo}
                alt="Guitars Over Guns Logo"
                loading="lazy"
                decoding="async"
              />
            </FooterLogo>
            <FooterAbout>
              Guitars Over Guns is a 501(c)(3) organization that connects youth
              with professional musician mentors to help them overcome hardship,
              find their voice and reach their potential through music, art and
              mentorship.
            </FooterAbout>
            <SocialLinks>
              <SocialIcon
                href="https://facebook.com/guitarsoverguns"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
              </SocialIcon>
              <SocialIcon
                href="https://instagram.com/guitarsoverguns"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </SocialIcon>
              <SocialIcon
                href="https://twitter.com/guitarsoverguns"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
              </SocialIcon>
              <SocialIcon
                href="https://youtube.com/guitarsoverguns"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeIcon />
              </SocialIcon>
            </SocialLinks>
          </FooterColumn>

          <FooterColumn>
            <FooterColumnTitle>Company</FooterColumnTitle>
            <FooterLinks>
              <FooterLink>
                <a href="/about">About</a>
              </FooterLink>
              <FooterLink>
                <a href="/programs">Programs</a>
              </FooterLink>
              <FooterLink>
                <a href="/impact">Impact</a>
              </FooterLink>
              <FooterLink>
                <a href="/team">Our Team</a>
              </FooterLink>
              <FooterLink>
                <a href="/careers">Careers</a>
              </FooterLink>
              <FooterLink>
                <a href="/press">Press</a>
              </FooterLink>
            </FooterLinks>
          </FooterColumn>

          <FooterColumn>
            <FooterColumnTitle>Communities</FooterColumnTitle>
            <FooterLinks>
              <FooterLink>
                <a href="/locations/miami">Miami</a>
              </FooterLink>
              <FooterLink>
                <a href="/locations/chicago">Chicago</a>
              </FooterLink>
              <FooterLink>
                <a href="/locations/new-york">New York</a>
              </FooterLink>
              <FooterLink>
                <a href="/locations/los-angeles">Los Angeles</a>
              </FooterLink>
              <FooterLink>
                <a href="/mentors">For Mentors</a>
              </FooterLink>
              <FooterLink>
                <a href="/educators">For Educators</a>
              </FooterLink>
            </FooterLinks>
          </FooterColumn>

          <FooterColumn>
            <FooterColumnTitle>Get Involved</FooterColumnTitle>
            <FooterLinks>
              <FooterLink>
                <a
                  href="https://www.classy.org/give/352794/#!/donation/checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Donate
                </a>
              </FooterLink>
              <FooterLink>
                <a href="/volunteer">Volunteer</a>
              </FooterLink>
              <FooterLink>
                <a href="/partnerships">Partnerships</a>
              </FooterLink>
              <FooterLink>
                <a href="/events">Events</a>
              </FooterLink>
              <FooterLink>
                <a href="/newsletter">Newsletter</a>
              </FooterLink>
              <FooterLink>
                <a href="/contact">Contact Us</a>
              </FooterLink>
            </FooterLinks>
          </FooterColumn>
        </FooterGrid>

        <FooterBottom>
          <FooterCopyright>
            © 2024 Guitars Over Guns. All rights reserved.
          </FooterCopyright>
          <FooterLegal>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
            <a href="/accessibility">Accessibility</a>
          </FooterLegal>
        </FooterBottom>
      </SpotifyFooter>
      {/* Music player removed */}
    </div>
  );
}

export default memo(ImpactReportPage);
