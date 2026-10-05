import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Menu, 
  X, 
  Compass,
  User,
  ChevronDown,
  Globe
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change or hash change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const getDashboardRoute = () => {
    if (!user) return '/customer-dashboard';
    switch (user.role) {
      case 'ROLE_ADMIN': return '/admin-dashboard';
      case 'ROLE_RESERVATION_SUPERVISOR': return '/supervisor-dashboard';
      case 'ROLE_EVENT_COORDINATOR': return '/event-coordinator-dashboard';
      case 'ROLE_VENUE_MANAGER': return '/venue-manager-dashboard';
      case 'ROLE_HR_MANAGER': return '/hr-dashboard';
      case 'ROLE_CUSTOMER':
      default:
        return '/customer-dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    switch (user.role) {
      case 'ROLE_ADMIN': return 'Admin Suite';
      case 'ROLE_RESERVATION_SUPERVISOR': return 'Supervisor Portal';
      case 'ROLE_EVENT_COORDINATOR': return 'Event Coordinator';
      case 'ROLE_VENUE_MANAGER': return 'Venue Operations';
      case 'ROLE_HR_MANAGER': return 'HR Portal';
      case 'ROLE_CUSTOMER':
      default:
        return 'Guest Portal';
    }
  };

  return (
    <header className={`rosewood-navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      {/* 1. Rosewood Upper Utility Tier (Rosewood Global | Wordmark | English) */}
      <div className="rosewood-top-bar">
        {/* Left: Global Collection Link */}
        <div>
          <Link 
            to="/" 
            className="rosewood-top-link"
            title="Grand Luxe Global Portfolio"
          >
            GRAND LUXE GLOBAL
          </Link>
        </div>

        {/* Center: Signature Grand Brand Wordmark */}
        <div>
          <Link 
            to="/" 
            className="rosewood-brand-center"
            title="Grand Luxe Luxury Hotels & Events"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}
          >
            <img 
              src="/grand-luxe-emblem-dark.png" 
              alt="" 
              style={{ height: '18px', width: 'auto', objectFit: 'contain' }} 
            />
            <span>GRAND LUXE</span>
          </Link>
        </div>

        {/* Right: Language Selector & Guest Access */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
          <div 
            className="rosewood-top-link" 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Language: English"
          >
            <Globe size={11} strokeWidth={2} />
            ENGLISH
          </div>

          {!isAuthenticated ? (
            <Link 
              to="/login" 
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: '#555',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#0B3B2C'}
              onMouseOut={(e) => e.currentTarget.style.color = '#555'}
            >
              Sign In
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#666', letterSpacing: '0.04em' }}>
                {user.fullName || user.username}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Navigation Tier (Property Selector | Exact Navigation Tabs | Forest Green Reserve CTA) */}
      <div className="rosewood-main-nav">
        {/* Property Selector / Location Brand */}
        <Link 
          to="/" 
          className="rosewood-brand-property"
          title="Grand Luxe Hotel & Special Events"
        >
          <img 
            src="/grand-luxe-emblem-dark.png" 
            alt="Grand Luxe Emblem" 
            style={{ height: '34px', width: 'auto', objectFit: 'contain', marginRight: '0.35rem' }} 
          />
          <div>
            <div className="rosewood-brand-property-title">
              GRAND LUXE
            </div>
            <div className="rosewood-brand-property-sub">
              HOTEL & SPECIAL EVENTS
            </div>
          </div>
          <ChevronDown size={14} strokeWidth={2.4} style={{ color: '#141414', marginLeft: '2px' }} />
        </Link>

        {/* Desktop Navigation Links (Unchanged tabs, styled in Rosewood serif editorial) */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.85rem' }}>
          <Link 
            to="/" 
            className={`rosewood-nav-link ${isActive('/') && !location.hash ? 'active' : ''}`}
          >
            Home
          </Link>

          <a 
            href="/#events" 
            onClick={(e) => scrollToSection(e, 'events')}
            className={`rosewood-nav-link ${location.hash === '#events' ? 'active' : ''}`}
          >
            Events
          </a>

          <a 
            href="/#accommodations" 
            onClick={(e) => scrollToSection(e, 'accommodations')}
            className={`rosewood-nav-link ${location.hash === '#accommodations' ? 'active' : ''}`}
          >
            Accommodations
          </a>

          <a 
            href="/#venues" 
            onClick={(e) => scrollToSection(e, 'venues')}
            className={`rosewood-nav-link ${location.hash === '#venues' ? 'active' : ''}`}
          >
            Venues
          </a>

          <a 
            href="/#packages" 
            onClick={(e) => scrollToSection(e, 'packages')}
            className={`rosewood-nav-link ${location.hash === '#packages' ? 'active' : ''}`}
          >
            Packages
          </a>

          <a 
            href="/#heritage" 
            onClick={(e) => scrollToSection(e, 'heritage')}
            className={`rosewood-nav-link ${location.hash === '#heritage' ? 'active' : ''}`}
          >
            Heritage
          </a>

          <Link 
            to="/reservations" 
            className={`rosewood-nav-link ${isActive('/reservations') ? 'active' : ''}`}
          >
            Reservations
          </Link>

          {/* Active Role Dashboard Link for Authenticated Staff */}
          {isAuthenticated && user && user.role !== 'ROLE_CUSTOMER' && (
            <Link 
              to={getDashboardRoute()} 
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#0B3B2C',
                fontWeight: 700,
                fontSize: '0.74rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                border: '1px solid #0B3B2C',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: 'rgba(11, 59, 44, 0.04)'
              }}
            >
              <Compass size={13} color="#0B3B2C" />
              {getDashboardLabel()}
            </Link>
          )}
        </nav>

        {/* Right Side: Signature Deep Forest Green Reserve Button & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
          {isAuthenticated && user ? (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user.role === 'ROLE_CUSTOMER' ? (
                <>
                  <Link 
                    to="/booking" 
                    className="rosewood-reserve-btn"
                  >
                    RESERVE
                  </Link>

                  <Link 
                    to="/profile" 
                    className="rosewood-btn-outline"
                    style={{ 
                      padding: '0.72rem 1.15rem', 
                      fontSize: '0.72rem',
                      letterSpacing: '0.12em',
                      borderColor: isActive('/profile') ? '#0B3B2C' : '#1C1C1C',
                      color: isActive('/profile') ? '#0B3B2C' : '#1C1C1C'
                    }}
                    title="Customer Profile & Stays"
                  >
                    <User size={13} /> PROFILE
                  </Link>
                </>
              ) : (
                <div style={{ textAlign: 'right', whiteSpace: 'nowrap', marginRight: '0.35rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1C1C1C', lineHeight: 1.2 }}>
                    {user.fullName || user.username}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#0B3B2C', fontWeight: 700, letterSpacing: '0.1em' }}>
                    {user.role ? user.role.replace('ROLE_', '').replace('_', ' ') : 'STAFF'}
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogout} 
                className="rosewood-btn-outline"
                title="Log Out"
                style={{ 
                  padding: '0.72rem 0.9rem', 
                  fontSize: '0.72rem', 
                  borderColor: '#D4CDC2', 
                  color: '#555' 
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link 
                to="/login" 
                className="rosewood-btn-outline" 
                style={{ padding: '0.72rem 1.2rem', fontSize: '0.74rem' }}
              >
                SIGN IN
              </Link>
              <Link 
                to="/booking" 
                className="rosewood-reserve-btn"
              >
                RESERVE
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only"
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'transparent',
              border: '1px solid #D4CDC2',
              color: '#1C1C1C',
              borderRadius: '2px',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={20} color="#0B3B2C" /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-only animate-fade-in" style={{
          padding: '1.5rem',
          background: '#FAF9F5',
          borderTop: '1px solid #ECE7DF',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)'
        }}>
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)} 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#1C1C1C', 
              textDecoration: 'none' 
            }}
          >
            Home
          </Link>
          <a 
            href="/#events" 
            onClick={(e) => scrollToSection(e, 'events')} 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontSize: '1.25rem', 
              color: '#333', 
              textDecoration: 'none' 
            }}
          >
            Events
          </a>
          <a 
            href="/#accommodations" 
            onClick={(e) => scrollToSection(e, 'accommodations')} 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontSize: '1.25rem', 
              color: '#333', 
              textDecoration: 'none' 
            }}
          >
            Accommodations
          </a>
          <a 
            href="/#venues" 
            onClick={(e) => scrollToSection(e, 'venues')} 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontSize: '1.25rem', 
              color: '#333', 
              textDecoration: 'none' 
            }}
          >
            Venues
          </a>
          <a 
            href="/#packages" 
            onClick={(e) => scrollToSection(e, 'packages')} 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontSize: '1.25rem', 
              color: '#333', 
              textDecoration: 'none' 
            }}
          >
            Packages
          </a>
          <a 
            href="/#heritage" 
            onClick={(e) => scrollToSection(e, 'heritage')} 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontSize: '1.25rem', 
              color: '#333', 
              textDecoration: 'none' 
            }}
          >
            Heritage
          </a>
          <Link 
            to="/reservations" 
            onClick={() => setMobileMenuOpen(false)} 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontSize: '1.25rem', 
              color: '#333', 
              textDecoration: 'none' 
            }}
          >
            Reservations
          </Link>
          <Link 
            to="/booking" 
            onClick={() => setMobileMenuOpen(false)} 
            className="rosewood-reserve-btn"
            style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center' }}
          >
            RESERVE
          </Link>

          {isAuthenticated && user ? (
            <div style={{ borderTop: '1px solid #ECE7DF', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1C1C1C', fontSize: '0.9rem' }}>{user.fullName || user.username}</div>
                  <div style={{ fontSize: '0.72rem', color: '#0B3B2C', fontWeight: 600 }}>
                    {user.role ? user.role.replace('ROLE_', '').replace('_', ' ') : 'MEMBER'}
                  </div>
                </div>
                <button onClick={handleLogout} className="rosewood-btn-outline" style={{ padding: '0.5rem 0.85rem' }}>
                  <LogOut size={13} /> Log Out
                </button>
              </div>

              {user.role === 'ROLE_CUSTOMER' ? (
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="rosewood-btn-outline"
                  style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <User size={14} /> Customer Profile
                </Link>
              ) : (
                <Link 
                  to={getDashboardRoute()} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="rosewood-reserve-btn"
                  style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center' }}
                >
                  Go to {getDashboardLabel()}
                </Link>
              )}
            </div>
          ) : (
            <div style={{ borderTop: '1px solid #ECE7DF', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="rosewood-btn-outline" 
                style={{ flex: 1, textAlign: 'center' }}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)} 
                className="rosewood-btn-green" 
                style={{ flex: 1, textAlign: 'center' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
