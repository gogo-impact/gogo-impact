import React, { useState, useEffect, useCallback, useMemo } from 'react';
import gogoWideLogo from '../../assets/GOGO_LOGO_WIDE_WH.png';
import type { ReorderableSectionKey } from '../services/impact.api';

// Section configuration for the sticky TOC
// Maps section keys to their DOM IDs and display labels
export interface TocSection {
  key: ReorderableSectionKey;
  id: string;
  label: string;
}

// Master list mapping section keys to DOM IDs and labels
// This is the source of truth for all possible sections
const SECTION_CONFIG: Record<ReorderableSectionKey, { id: string; label: string }> = {
  hero: { id: 'hero', label: 'Hero' },
  mission: { id: 'mission', label: 'Mission' },
  population: { id: 'population', label: 'Who We Serve' },
  financial: { id: 'financial', label: 'Financials' },
  method: { id: 'method', label: 'Our Method' },
  curriculum: { id: 'curriculum', label: 'Curriculum' },
  impactSection: { id: 'impact', label: 'Impact' },
  hearOurImpact: { id: 'music', label: 'Hear Our Impact' },
  testimonials: { id: 'quote', label: 'Stories' },
  nationalImpact: { id: 'locations', label: 'Locations' },
  flexA: { id: 'flex-a', label: 'Featured Content' },
  flexB: { id: 'flex-b', label: 'Featured Content' },
  flexC: { id: 'flex-c', label: 'Featured Content' },
  impactLevels: { id: 'impact-levels', label: 'Impact Levels' },
  partners: { id: 'partners', label: 'Partners' },
  footer: { id: 'footer-section', label: 'Contact' },
};

interface HeaderProps {
  /** Section order from defaults - dynamically controls TOC order */
  sectionOrder?: ReorderableSectionKey[];
  /** Disabled sections from defaults - these will be hidden from TOC */
  disabledSections?: ReorderableSectionKey[];
  /** Year from hero section - used for flex section labels */
  heroYear?: string;
}

function Header({ sectionOrder, disabledSections = [], heroYear }: HeaderProps): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');
  const [tocVisible, setTocVisible] = useState(false);
  const [initialNavigationComplete, setInitialNavigationComplete] = useState(false);

  // Build dynamic TOC sections based on sectionOrder and disabledSections from defaults
  const tocSections = useMemo<TocSection[]>(() => {
    // Use provided order or fall back to the keys of SECTION_CONFIG (default order)
    const order = sectionOrder ?? (Object.keys(SECTION_CONFIG) as ReorderableSectionKey[]);
    
    // Generate the flex label based on hero year
    const flexLabel = heroYear ? `${heroYear} Featured Content` : 'Featured Content';
    
    return order
      // Filter out disabled sections
      .filter(key => !disabledSections.includes(key))
      // Map to full section config
      .map(key => {
        const config = SECTION_CONFIG[key];
        if (!config) return null;
        
        // Override flex section labels with year-based label
        let label = config.label;
        if (key === 'flexA' || key === 'flexB' || key === 'flexC') {
          label = flexLabel;
        }
        
        return {
          key,
          id: config.id,
          label,
        };
      })
      .filter((section): section is TocSection => section !== null);
  }, [sectionOrder, disabledSections, heroYear]);

  // Handle scroll state for header opacity
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      // Show TOC after scrolling past hero
      setTocVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize active section from URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash?.replace('#', '');
      const section = tocSections.find(s => s.id === hash);
      if (section) {
        setActiveSectionId(section.id);
      }
    }
  }, [tocSections]);

  // Mark initial navigation as complete after a delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setInitialNavigationComplete(true);
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  // Navigate to section
  const navigateTo = useCallback((id: string) => {
    try {
      const newHash = `#${id}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch {
      // Ignore history errors
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Observe section visibility and update active section
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (!initialNavigationComplete) {
      return;
    }

    const updateActiveSection = () => {
      const viewportHeight = window.innerHeight;
      const targetPoint = viewportHeight * 0.35;
      
      // Check if user has scrolled to the bottom of the page
      // This fixes the issue where the last section (Contact/Footer) can never be highlighted
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const isAtBottom = scrollTop + viewportHeight >= scrollHeight - 50; // 50px threshold
      
      // If at bottom, highlight the last section
      if (isAtBottom && tocSections.length > 0) {
        const lastSection = tocSections[tocSections.length - 1];
        setActiveSectionId((prev) => (prev === lastSection.id ? prev : lastSection.id));
        return;
      }

      let bestSection: string | null = null;
      let bestDistance = Infinity;

      for (const section of tocSections) {
        const el = document.getElementById(section.id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) continue;

        let distance: number;
        if (rect.top <= targetPoint && rect.bottom >= targetPoint) {
          distance = 0;
        } else if (rect.top > targetPoint) {
          distance = rect.top - targetPoint;
        } else {
          distance = targetPoint - rect.bottom + 1000;
        }

        if (distance < bestDistance) {
          bestDistance = distance;
          bestSection = section.id;
        }
      }

      if (bestSection) {
        setActiveSectionId((prev) => (prev === bestSection ? prev : bestSection));
      }
    };

    const observer = new IntersectionObserver(
      () => {
        updateActiveSection();
      },
      {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    tocSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [initialNavigationComplete, tocSections]);

  // Sync URL hash with active section
  useEffect(() => {
    if (!activeSectionId || !initialNavigationComplete) return;
    try {
      const newHash = `#${activeSectionId}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch {
      // Ignore history errors
    }
  }, [activeSectionId, initialNavigationComplete]);

  // Calculate progress for visual indicator
  const activeIndex = tocSections.findIndex(s => s.id === activeSectionId);
  const progress = activeIndex >= 0 ? ((activeIndex + 1) / tocSections.length) * 100 : 0;

  return (
    <>
      {/* Minimal Header */}
      <header className={`spotify-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <div className="logo-container">
            <div className="header-brand">
              <img
                src={gogoWideLogo}
                alt="GOGO Logo"
                className="header-logo-img"
              />
            </div>
          </div>
        </div>

        <div className="header-center">
          <h2 className="header-title">Impact Report</h2>
        </div>
      </header>

      {/* Sticky Table of Contents */}
      <nav 
        className={`sticky-toc ${tocVisible ? 'visible' : ''}`}
        aria-label="Table of contents"
      >
        {/* Progress line */}
        <div className="toc-progress-track">
          <div 
            className="toc-progress-fill" 
            style={{ height: `${progress}%` }}
          />
        </div>

        {/* Section links */}
        <div className="toc-items">
          {tocSections.map((section, index) => {
            const isActive = activeSectionId === section.id;
            const isPast = index < activeIndex;
            
            return (
              <button
                key={section.id}
                className={`toc-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                onClick={() => navigateTo(section.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="toc-dot" />
                <span className="toc-label">{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Header;
