import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Award, Clock, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: '#06261B',
      color: '#FFFFFF',
      padding: '4.5rem 2rem 2.5rem 2rem',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '3.5rem',
        marginBottom: '3.5rem'
      }}>
        {/* Brand & Editorial Heritage */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <img 
              src="/grand-luxe-emblem-gold.png" 
              alt="Grand Luxe Crest" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain', marginBottom: '0.85rem' }} 
            />
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              marginBottom: '0.35rem'
            }}>
              GRAND LUXE
            </div>
            <div style={{
              fontSize: '0.66rem',
              color: '#C5A059',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              Hotel & Special Events
            </div>
          </div>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.72)',
            fontSize: '0.9rem',
            lineHeight: 1.75,
            marginBottom: '1.75rem',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic'
          }}>
            A distinguished oceanfront haven offering residential suites, classical ballrooms, and seaside gardens for high-profile weddings, corporate summits, and executive galas.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.95rem',
            border: '1px solid rgba(197, 160, 89, 0.35)',
            background: 'rgba(197, 160, 89, 0.08)',
            fontSize: '0.74rem',
            color: '#E5D5B5',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            <Award size={14} color="#C5A059" /> 5-Star Luxury Hospitality & Event Accreditation
          </div>
        </div>

        {/* Navigation Portals */}
        <div>
          <h4 style={{
            color: '#FFFFFF',
            marginBottom: '1.25rem',
            fontSize: '1.15rem',
            fontWeight: 500,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.04em'
          }}>
            The Collection
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            <li>
              <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'}>
                Home & Overview
              </Link>
            </li>
            <li>
              <Link to="/events" style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'}>
                Celebrations & Summits
              </Link>
            </li>
            <li>
              <Link to="/rooms" style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'}>
                Sanctuary Accommodations
              </Link>
            </li>
            <li>
              <Link to="/venues" style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'}>
                Ballrooms & Seaside Venues
              </Link>
            </li>
            <li>
              <Link to="/packages" style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'}>
                All-Inclusive Event Packages
              </Link>
            </li>
            <li>
              <Link to="/booking" style={{ color: '#C5A059', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                Online Reservation Portal <ArrowRight size={13} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Curated Experiences */}
        <div>
          <h4 style={{
            color: '#FFFFFF',
            marginBottom: '1.25rem',
            fontSize: '1.15rem',
            fontWeight: 500,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.04em'
          }}>
            Curated Experiences
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.72)' }}>
            <li>Royal Wedding Celebrations & Receptions</li>
            <li>Corporate Leadership Summits & Forums</li>
            <li>VIP Birthday Jubilees & Anniversaries</li>
            <li>International Diplomatic Dinners & Galas</li>
            <li>Oceanfront Garden Cocktails & Banquets</li>
            <li>Executive Boardroom & Hybrid Meetings</li>
          </ul>
        </div>

        {/* Concierge Inquiries */}
        <div>
          <h4 style={{
            color: '#FFFFFF',
            marginBottom: '1.25rem',
            fontSize: '1.15rem',
            fontWeight: 500,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.04em'
          }}>
            Concierge & Inquiries
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <MapPin size={17} color="#C5A059" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>100 Grand Esplanade, Galle Face, Colombo 03, Sri Lanka</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Phone size={17} color="#C5A059" style={{ flexShrink: 0 }} />
              <span>+94 (11) 244-8800 / +94 (11) 244-8801</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Mail size={17} color="#C5A059" style={{ flexShrink: 0 }} />
              <span>concierge@grandluxehotel.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Clock size={17} color="#C5A059" style={{ flexShrink: 0 }} />
              <span>24/7 Front Desk & Event Concierge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '1.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        color: 'rgba(255, 255, 255, 0.55)',
        fontSize: '0.78rem'
      }}>
        <div>
          © {new Date().getFullYear()} GRAND LUXE HOTEL & SPECIAL EVENTS MANAGEMENT SYSTEM. ALL RIGHTS RESERVED.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255, 255, 255, 0.65)' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Guaranteed Single-Booking Engine</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
