import React, { useEffect, useRef, useState, memo } from 'react';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported first
import './ImpactReportStructure.css';
import '../assets/fonts/fonts.css'; // Import GOGO fonts
import styled from 'styled-components';
import { animate, stagger } from 'animejs';
import COLORS from '../assets/colors';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MissionSection from './sections/MissionSection';
import ImpactSection from './components/ImpactSection';
import OurMethodSection from './components/OurMethodSection';
import ProgramsSection from './components/ProgramsSection';
import CurriculumSection from './components/CurriculumSection';
import LocationsSection from './sections/LocationsSection';
// Replaced Stories of Impact carousel with a single quote section
import SingleQuoteSection from './components/SingleQuoteSection';
import FlexA from './components/FlexA';
import FlexB from './components/FlexB';
import FlexC from './components/FlexC';
import PartnersSection from './components/PartnersSection';
// import FutureVisionSection from './components/FutureVisionSection';
import ImpactLevelsSection from './components/ImpactLevelsSection';
import Population from './components/Population';
import gogoWideLogo from '../assets/GOGO_LOGO_WIDE_WH.png';
import SpotifyEmbedsSection from './components/SpotifyEmbedsSection';
import FinancialAnalysisSection from './components/FinancialAnalysisSection';
// IntroOverlay temporarily disabled

// Preflight API checks
import { fetchHeroContent, fetchMissionContent } from './services/impact.api';

// Styled components for Spotify-like footer
const SpotifyFooter = styled.footer`
  background: #121212;
  padding: 5rem 0 2rem;
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

const SpotifyCredit = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 2rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);

  a {
    color: rgba(255, 255, 255, 0.4);
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

// Facebook Icon Component
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}

// Instagram Icon Component
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// Twitter Icon Component
function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  );
}

// YouTube Icon Component
function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Music player removed; replaced with Spotify embeds section

// Main component
function ImpactReportPage() {
  // Perf: avoid noisy logs in production
  // Refs for each section to animate
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);
  const disciplinesRef = useRef<HTMLDivElement>(null);
  const programsRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const financialRef = useRef<HTMLDivElement>(null);
  const flexRef = useRef<HTMLDivElement>(null);
  // const futureRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Require backend content; redirect to 404 if missing
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const [hero, mission] = await Promise.all([fetchHeroContent(), fetchMissionContent()]);
        if (!hero || !mission) {
          window.location.replace('/404.html');
          return;
        }
        setIsReady(true);
      } catch {
        window.location.replace('/404.html');
      }
    })();
  }, []);

  // Music player state and initialization removed

  // Apply GOGO-like styles to body when component mounts
  useEffect(() => {
    // Save original styles to restore them later
    const originalBackground = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    const originalFontFamily = document.body.style.fontFamily;
    const originalOverflow = document.body.style.overflowX;

    // Apply GOGO-inspired styles
    document.body.style.backgroundColor = 'var(--spotify-black, #171717)';
    document.body.style.color = 'white';
    document.body.style.fontFamily =
      'var(--font-body, "Century Gothic", "Arial", sans-serif)';
    document.body.style.overflowX = 'hidden';
    document.body.classList.add('has-spotify-header');

    // No need to add Google Fonts for Montserrat, using GOGO fonts instead

    // Cleanup function to restore original styles
    return () => {
      document.body.style.backgroundColor = originalBackground;
      document.body.style.color = originalColor;
      document.body.style.fontFamily = originalFontFamily;
      document.body.style.overflowX = originalOverflow;
      document.body.classList.remove('has-spotify-header');
    };
  }, []);

  // Intro overlay disabled
  
  // Set up Intersection Observer for animations
  useEffect(() => {
    if (!isReady) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial animation for hero section
    if (heroRef.current) {
      const heroElement = heroRef.current;
      // Set initial state cheaply
      heroElement.style.opacity = '0';
      heroElement.style.transform = 'translateY(16px)';
      heroElement.style.willChange = 'opacity, transform';
      if (!prefersReduced) {
        animate(heroElement, {
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 700,
          easing: 'easeOutCubic',
          complete: () => {
            heroElement.style.willChange = '';
          },
        });
      } else {
        heroElement.style.opacity = '1';
        heroElement.style.transform = 'none';
      }
    }

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
                  (targetElement as HTMLElement).id === 'financial' ||
                  targetElement === financialRef.current;
                if (isFinancial) {
                  console.log('[ImpactReport] Financial section intersecting', {
                    prefersReduced,
                    hasAnimate: typeof animate,
                    target: (targetElement as HTMLElement).id,
                  });
                }
                if (!prefersReduced) {
                  if (isFinancial) {
                    console.log(
                      '[ImpactReport] Financial: starting section animation',
                    );
                  }
                  animate(targetElement, {
                    opacity: [0, 1],
                    translateY: [16, 0],
                    duration: 600,
                    easing: 'easeOutCubic',
                    complete: () => {
                      // drop will-change after animation completes
                      (targetElement as HTMLElement).style.willChange = '';
                      if (isFinancial) {
                        console.log(
                          '[ImpactReport] Financial: section animation complete',
                        );
                      }
                    },
                  });

                  // Animate child elements after the section appears (if marked)
                  const children =
                    targetElement.querySelectorAll('.animate-child');
                  if (children && children.length > 0) {
                    if (isFinancial) {
                      console.log(
                        '[ImpactReport] Financial: animating children',
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
                      easing: 'easeOutCubic',
                    });
                  }
                } else {
                  if (isFinancial) {
                    console.log(
                      '[ImpactReport] Financial: prefers-reduced-motion, skipping animations',
                    );
                  }
                  targetElement.setAttribute(
                    'style',
                    'opacity: 1; transform: none;',
                  );
                }
              }

              // Unobserve after animation is triggered
              observer.unobserve(target);
              if (
                (target as HTMLElement).id === 'financial' ||
                target === financialRef.current
              ) {
                console.log(
                  '[ImpactReport] Financial: unobserved after triggering',
                );
              }
            }
          }
        });
      },
      {
        threshold: 0,
        // Pre-trigger slightly before sections enter viewport
        rootMargin: '200px 0px -10% 0px',
      },
    );

    // Observe all sections except hero (which is animated on load)
    const sections = [
      impactRef.current,
      methodRef.current,
      disciplinesRef.current,
      programsRef.current,
      testimonialRef.current,
      musicRef.current,
      financialRef.current,
      partnersRef.current,
      // futureRef.current,
      footerRef.current,
    ];

    sections.forEach((node) => {
      if (node) {
        // Set initial styles to hint the compositor and reduce layout
        const el = node as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.willChange = 'opacity, transform';
        observer.observe(node);
        if (node === financialRef.current) {
          console.log(
            '[ImpactReport] Financial: observing with initial hidden styles',
          );
        }
      }
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, [isReady]);

  // Music handlers removed with music player

  // Debug-only log removed for performance

  // Support hash-based deep links on initial load
  useEffect(() => {
    if (!isReady) return;
    let timeoutId: number | undefined;
    const hash = window.location.hash?.replace('#', '');
    if (hash) {
      timeoutId = window.setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [isReady]);

  if (!isReady) {
    return null;
  }
  
  return (
    <div className="impact-report">
      {/* IntroOverlay disabled */}
      <div className="spotify-gradient-background" />
      <Header />
      <div className="main-content" style={{ paddingBottom: '120px' }}>
        <div id="hero" ref={heroRef} style={{ opacity: 0 }}>
          <HeroSection />
        </div>
        <div id="mission" ref={missionRef}>
          <MissionSection />
        </div>
        {/* Who We Serve (moved up) */}
        <div id="population">
          <Population inline />
        </div>
        {/* Financial Overview (moved higher) */}
        <div id="financial" ref={financialRef}>
          <FinancialAnalysisSection />
        </div>
        <div id="method" ref={methodRef}>
          <OurMethodSection />
        </div>
        {/* ArtisticDisciplinesSection removed; content now appears in Mission modal */}
        <div id="curriculum">
          <CurriculumSection />
        </div>

        <div id="programs" ref={programsRef}>
          <ProgramsSection />
        </div>
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
        <div id="flex" ref={flexRef} style={{ opacity: 1 }}>
          <FlexA />
          <FlexB />
          <FlexC />
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
          <SpotifyCredit>
            Design inspired by Spotify. Guitars Over Guns is not affiliated with
            Spotify.
          </SpotifyCredit>
        </FooterBottom>
      </SpotifyFooter>
      {/* Music player removed */}
    </div>
  );
}

export default memo(ImpactReportPage);
