import React, { useEffect, useRef, useState, memo, lazy, Suspense } from 'react';
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
import IntroOverlay from "./components/IntroOverlay";
import gogoWideLogo from '../assets/GOGO_LOGO_WIDE_WH.png';

// Lazy load heavy components below the fold for better initial load performance
const ImpactSection = lazy(() => import('./components/ImpactSection'));
const OurMethodSection = lazy(() => import("./components/OurMethodSection"));
const CurriculumSection = lazy(() => import('./components/CurriculumSection'));
const LocationsSection = lazy(() => import("./sections/LocationsSection"));
const SingleQuoteSection = lazy(() => import('./components/SingleQuoteSection'));
const FlexA = lazy(() => import('./components/FlexA'));
const FlexB = lazy(() => import('./components/FlexB'));
const FlexC = lazy(() => import('./components/FlexC'));
const PartnersSection = lazy(() => import("./components/PartnersSection"));
const ImpactLevelsSection = lazy(() => import('./components/ImpactLevelsSection'));
const Population = lazy(() => import('./components/Population'));
const SpotifyEmbedsSection = lazy(() => import('./components/SpotifyEmbedsSection'));
const FinancialAnalysisSection = lazy(() => import('./components/FinancialAnalysisSection'));

// Simple fallback for lazy-loaded sections
const SectionFallback = () => (
  <div style={{ minHeight: '200px', background: 'transparent' }} />
);
import {
  fetchHeroContent,
  fetchMissionContent,
  fetchPopulationContent,
  fetchFinancialContent,
  fetchMethodContent,
  fetchDefaults,
  HeroContent,
  MissionContent,
  PopulationContent,
  FinancialContent,
  MethodContent,
  ReorderableSectionKey,
  DEFAULT_SECTION_ORDER,
} from './services/impact.api';
import FooterSection from './components/FooterSection';

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
  padding: 4rem 0 2rem;
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
  padding: 2rem;
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
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
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


// Props interface for ImpactReportPage
interface ImpactReportPageProps {
  /** When true, skips intro overlay and optimizes for PDF conversion */
  printMode?: boolean;
}

// Main component
function ImpactReportPage({ printMode = false }: ImpactReportPageProps) {
  // Centralized data loading state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reportData, setReportData] = useState<ImpactReportData | null>(null);
  // Section order and disabled sections from defaults
  const [sectionOrder, setSectionOrder] = useState<ReorderableSectionKey[]>([...DEFAULT_SECTION_ORDER]);
  const [disabledSections, setDisabledSections] = useState<ReorderableSectionKey[]>([]);

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

  // Check for skipIntro query parameter (used by PDF export)
  const shouldSkipIntro = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('skipIntro') === 'true';
    
  // Only show the intro once per tab: initialize from the module-level flag.
  // In print mode, always skip the intro overlay.
  const [introComplete, setIntroComplete] = useState(printMode || hasShownIntroInThisTab);

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
        const [hero, mission, population, financial, method, defaults] = await Promise.race([
          Promise.all([
            fetchHeroContent(),
            fetchMissionContent(),
            fetchPopulationContent(),
            fetchFinancialContent(),
            fetchMethodContent(),
            fetchDefaults(),
          ]),
          timeoutPromise,
        ]) as [HeroContent | null, MissionContent | null, PopulationContent | null, FinancialContent | null, MethodContent | null, { sectionOrder?: ReorderableSectionKey[]; disabledSections?: ReorderableSectionKey[] } | null];

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

        // Load section order from defaults
        if (defaults?.sectionOrder && Array.isArray(defaults.sectionOrder) && defaults.sectionOrder.length > 0) {
          // Ensure all sections are present (add any missing ones at the end)
          const loadedOrder = defaults.sectionOrder as ReorderableSectionKey[];
          const missingSections = DEFAULT_SECTION_ORDER.filter(s => !loadedOrder.includes(s));
          setSectionOrder([...loadedOrder, ...missingSections]);
        }

        // Load disabled sections from defaults
        if (defaults?.disabledSections && Array.isArray(defaults.disabledSections)) {
          setDisabledSections(defaults.disabledSections as ReorderableSectionKey[]);
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

  // Render a section based on its key
  const renderSection = (sectionKey: ReorderableSectionKey) => {
    if (!reportData) return null;

    // Skip disabled sections
    if (disabledSections.includes(sectionKey)) return null;

    switch (sectionKey) {
      case 'hero':
        return (
          <div key="hero" id="hero" ref={heroRef}>
            <HeroSection heroData={reportData.hero} />
          </div>
        );
      case 'mission':
        return (
          <div key="mission" id="mission" ref={missionRef} style={{ position: 'relative', zIndex: 2 }}>
            <MissionSection missionData={reportData.mission} />
          </div>
        );
      case 'population':
        return (
          <div key="population" id="population" style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <Population inline populationData={reportData.population} />
            </Suspense>
          </div>
        );
      case 'financial':
        return (
          <div key="financial" id="financial" ref={financialRef} style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <FinancialAnalysisSection financialData={reportData.financial} />
            </Suspense>
          </div>
        );
      case 'method':
        return (
          <div key="method" id="method" ref={methodRef} style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <OurMethodSection methodData={reportData.method} />
            </Suspense>
          </div>
        );
      case 'curriculum':
        return (
          <div key="curriculum" id="curriculum" style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <CurriculumSection />
            </Suspense>
          </div>
        );
      case 'impactSection':
        return (
          <div key="impact" id="impact" ref={impactRef} style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <ImpactSection />
            </Suspense>
          </div>
        );
      case 'hearOurImpact':
        return (
          <div key="music" id="music" ref={musicRef} style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <SpotifyEmbedsSection />
            </Suspense>
          </div>
        );
      case 'testimonials':
        return (
          <div key="quote" id="quote" ref={testimonialRef} style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <SingleQuoteSection />
            </Suspense>
          </div>
        );
      case 'nationalImpact':
        return (
          <div key="locations" id="locations" ref={locationsRef} style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <LocationsSection />
            </Suspense>
          </div>
        );
      case 'flexA':
        return (
          <div key="flex-a" id="flex-a" style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <FlexA />
            </Suspense>
          </div>
        );
      case 'flexB':
        return (
          <div key="flex-b" id="flex-b" style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <FlexB />
            </Suspense>
          </div>
        );
      case 'flexC':
        return (
          <div key="flex-c" id="flex-c" style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <FlexC />
            </Suspense>
          </div>
        );
      case 'impactLevels':
        return (
          <div key="impact-levels" id="impact-levels" style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <ImpactLevelsSection />
            </Suspense>
          </div>
        );
      case 'partners':
        return (
          <div key="partners" id="partners" ref={partnersRef} style={{ position: 'relative', zIndex: 2 }}>
            <Suspense fallback={<SectionFallback />}>
              <PartnersSection />
            </Suspense>
          </div>
        );
      case 'footer':
        return (
          <div key="footer" id="footer-section" ref={footerRef} style={{ position: 'relative', zIndex: 2 }}>
            <FooterSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="impact-report">
      {!introComplete && <IntroOverlay onFinish={handleIntroFinish} isLoading={loading} />}
      <div className="spotify-gradient-background" />
      <Header 
        sectionOrder={sectionOrder} 
        disabledSections={disabledSections} 
        heroYear={reportData?.hero?.year}
      />
      <div className="main-content" style={{ paddingBottom: 0 }}>
        {reportData && (
          <>
            {/* Render sections in order from sectionOrder */}
            {sectionOrder
              .filter(key => key !== 'footer') // Footer rendered separately at the end
              .map(sectionKey => renderSection(sectionKey))}
          </>
        )}
      </div>

      {/* Footer section - rendered via dynamic section order */}
      {renderSection('footer')}
    </div>
  );
}

export default memo(ImpactReportPage);
