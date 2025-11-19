import React, { useState, useEffect, useCallback } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import QueueMusicOutlinedIcon from '@mui/icons-material/QueueMusicOutlined';
import EqualizerOutlinedIcon from '@mui/icons-material/EqualizerOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import gogoWideLogo from '../../assets/GOGO_LOGO_WIDE_WH.png';

// Section IDs that participate in scroll-based navigation / URL hashes.
// Keep this ordered to match the layout in ImpactReportPage.
const SECTION_IDS: string[] = [
  'hero',
  'mission',
  'population',
  'financial',
  'method',
  'curriculum',
  'programs',
  'impact',
  'music',
  'quote',
  'locations',
  'impact-levels',
  'partners',
  'footer',
];

function Header(): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navigateTo = useCallback((id: string) => {
    setMenuOpen(false);
    // Explicitly encode the section id in the URL hash for deep-link support
    try {
      const newHash = `#${id}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch {
      // Ignore history errors (e.g. SSR or restricted environments)
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const triggerMusicModal = useCallback(
    (type: 'student' | 'mentor') => {
      navigateTo('music');
      try {
        const eventName =
          type === 'student' ? 'openStudentMusicModal' : 'openMentorMusicModal';
        window.dispatchEvent(new Event(eventName));
      } catch {
        // Ignore dispatch errors in non-browser environments.
      }
    },
    [navigateTo],
  );

  // On first load, sync the active section with any existing hash so direct
  // links like /impact-report#financial correctly highlight the navigator.
  useEffect(() => {
    const hash = window.location.hash?.replace('#', '');
    if (hash && SECTION_IDS.includes(hash)) {
      setActiveSectionId(hash);
    } else {
      setActiveSectionId('hero');
    }
  }, []);

  // Observe section visibility and update the active nav item as the user
  // scrolls through the impact report.
  useEffect(() => {
    // Guard against environments where window/document are not available.
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the entry with the greatest intersection ratio (most visible)
        // that corresponds to one of our known sections.
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          if (!SECTION_IDS.includes(target.id)) continue;
          if (!entry.isIntersecting && entry.intersectionRatio <= 0) continue;
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        }

        if (bestEntry) {
          const el = bestEntry.target as HTMLElement;
          if (el.id && SECTION_IDS.includes(el.id)) {
            setActiveSectionId((prev) =>
              prev === el.id ? prev : el.id,
            );
          }
        }
      },
      {
        // Trigger when roughly the middle of the viewport intersects the section.
        root: null,
        rootMargin: '-35% 0px -55% 0px',
        threshold: [0.2, 0.4, 0.6],
      },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Whenever the active section changes (via scrolling), keep the URL hash in
  // sync so the page can be deep-linked and the back button behaves naturally.
  useEffect(() => {
    if (!activeSectionId) return;
    try {
      const newHash = `#${activeSectionId}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch {
      // Ignore history errors in non-browser environments.
    }
  }, [activeSectionId]);

  const navItems: Array<{ label: string; id: string; icon?: JSX.Element }> = [
    { label: 'Hero', id: 'hero' },
    { label: 'Our Mission', id: 'mission' },
    { label: 'Who We Serve', id: 'population' },
    { label: 'Financial Overview', id: 'financial' },
    { label: 'Our Method', id: 'method' },
    { label: 'Curriculum', id: 'curriculum' },
    { label: 'Programs', id: 'programs' },
    { label: 'Impact', id: 'impact' },
    { label: 'Hear Our Impact', id: 'music' },
    { label: 'Stories of Impact', id: 'quote' },
    { label: 'Locations', id: 'locations' },
    { label: 'Impact Levels', id: 'impact-levels' },
    { label: 'Partners', id: 'partners' },
    { label: 'Contact', id: 'footer' },
  ];

  const renderIcon = (id: string): JSX.Element => {
    switch (id) {
      case 'hero':
        return <HomeOutlinedIcon fontSize="small" />;
      case 'mission':
        return <FlagOutlinedIcon fontSize="small" />;
      case 'population':
        return <GroupsOutlinedIcon fontSize="small" />;
      case 'financial':
        return <SavingsOutlinedIcon fontSize="small" />;
      case 'method':
        return <TuneOutlinedIcon fontSize="small" />;
      case 'music':
        return <QueueMusicOutlinedIcon fontSize="small" />;
      case 'impact':
        return <EqualizerOutlinedIcon fontSize="small" />;
      case 'curriculum':
        return <MenuBookOutlinedIcon fontSize="small" />;
      case 'programs':
        return <QueueMusicOutlinedIcon fontSize="small" />;
      case 'quote':
        return <FormatQuoteOutlinedIcon fontSize="small" />;
      case 'locations':
        return <PlaceOutlinedIcon fontSize="small" />;
      case 'impact-levels':
        return <InsightsOutlinedIcon fontSize="small" />;
      case 'partners':
        return <HandshakeOutlinedIcon fontSize="small" />;
      case 'footer':
        return <MailOutlineOutlinedIcon fontSize="small" />;
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  return (
    <>
      <header className={`spotify-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <button
            type="button"
            className={`menu-button ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="pause-icon" />
          </button>
          <div className="logo-container">
            <div className="header-brand">
              <img
                src={gogoWideLogo}
                alt="GOGO Logo"
                style={{
                  height: '60px',
                  width: '180px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </div>
          </div>
        </div>

        <div className="header-center">
          <h2 className="header-title">Impact Report</h2>
        </div>
      </header>

      <div className={`side-nav ${menuOpen ? 'open' : ''}`}>
        <nav className="nav-content">
          <div className="nav-section section-group">
            <h3>Sections</h3>
            {navItems.map((item, idx) => (
              <div
                key={`nav-${item.id}`}
                className={`nav-item ${
                  activeSectionId === item.id ? 'active' : ''
                }`}
                onClick={() => navigateTo(item.id)}
                onKeyDown={(e) => e.key === 'Enter' && navigateTo(item.id)}
                role="button"
                tabIndex={0}
              >
                <div className="section-icon">{renderIcon(item.id)}</div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="playlist-section">
            <h3>Playlists</h3>
            <div className="playlist-links">
              <div
                className="nav-item playlist-button"
                role="button"
                tabIndex={0}
                onClick={() => triggerMusicModal('student')}
                onKeyDown={(e) =>
                  e.key === 'Enter' && triggerMusicModal('student')
                }
              >
                <span>Student Music</span>
              </div>
              <div
                className="nav-item playlist-button"
                role="button"
                tabIndex={0}
                onClick={() => triggerMusicModal('mentor')}
                onKeyDown={(e) =>
                  e.key === 'Enter' && triggerMusicModal('mentor')
                }
              >
                <span>Mentor Music</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <div
          className="overlay"
          onClick={toggleMenu}
          onKeyDown={(e) => e.key === 'Enter' && toggleMenu()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

    </>
  );
}

export default Header;
