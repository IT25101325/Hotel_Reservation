import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  Check, 
  Layers,
  Building2
} from 'lucide-react';

const EventsPage = () => {
  const navigate = useNavigate();

  const eventCategories = [
    {
      type: "WEDDING",
      title: "Luxury Weddings & Receptions",
      tagline: "Your Once-in-a-Lifetime Celebration",
      desc: "From dramatic grand ballroom processions beneath crystal chandeliers to romantic sunset ceremonies in our seaside garden, we curate unforgettable bridal experiences.",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
      capacity: "Up to 500 Guests",
      features: [
        "Dedicated Wedding Planning Specialist",
        "Complimentary Executive Honeymoon Suite",
        "Custom 5-Course Gourmet Tasting Menu",
        "Designer Floral Styling & Lighting Rigging"
      ]
    },
    {
      type: "CONFERENCE",
      title: "Corporate Summits & Galas",
      tagline: "Distinguished Global Business Meetings",
      desc: "State-of-the-art amphitheaters and executive breakout boardrooms equipped with gigabit fiber, 4K laser projection, and hybrid international video conferencing.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
      capacity: "Up to 300 Delegates",
      features: [
        "Zero-Lag Hybrid Conferencing Systems",
        "Executive Continental Breakfast & Luncheons",
        "High-Speed Encrypted Dedicated Wi-Fi",
        "VIP Speaker Green Rooms & Press Area"
      ]
    },
    {
      type: "BIRTHDAY",
      title: "Milestone Birthdays & Jubilees",
      tagline: "Celebrate Your Special Moments",
      desc: "Intimate and vibrant celebrations featuring curated craft cocktail bars, dynamic ambient mood lighting, interactive photo booths, and custom dessert artistry.",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80",
      capacity: "Up to 150 Guests",
      features: [
        "Bespoke Thematic Backdrop & Lighting",
        "Artisanal Cake & Dessert Showcase",
        "Live DJ, Sound Engineering & Acoustics",
        "Customized Mocktail & Cocktail Stations"
      ]
    },
    {
      type: "GALA",
      title: "Gala Dinners & Award Ceremonies",
      tagline: "Prestige, Distinction & Glamour",
      desc: "Host your annual charity balls, diplomatic banquets, and corporate awards in our royal grand hall with red-carpet arrivals, stage presentations, and white-glove table service.",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80",
      capacity: "Up to 450 Guests",
      features: [
        "Full Red Carpet Arrival & Media Wall",
        "Professional Stage, Audio & LED Wall",
        "Synchronized Multi-Course Banquet Service",
        "Dedicated Security & VIP Escort Services"
      ]
    }
  ];

  return (
    <div className="rosewood-page" style={{ minHeight: '80vh', padding: '4.5rem 1.5rem 7rem 1.5rem' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* Editorial Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }} className="animate-fade-in">
          <div style={{
            fontSize: '0.74rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#8B7B61',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            HAUTE HOSPITALITY & PRIVATE CELEBRATIONS
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.8rem, 5vw, 4.4rem)',
            color: '#141414',
            fontWeight: 400,
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            Special Events & Celebrations
          </h1>

          <p style={{
            color: '#4A4A4A',
            maxWidth: '740px',
            margin: '0 auto',
            fontSize: '1.12rem',
            lineHeight: 1.7,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic'
          }}>
            Whether hosting royal weddings, global executive summits, or milestone galas, our dedicated event management teams guarantee seamless execution and zero double-booking assurance.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to="/packages" className="rosewood-btn-green" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} /> View Event Packages
            </Link>
            <Link to="/venues" className="rosewood-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={14} /> Explore Venues & Halls
            </Link>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem'
        }}>
          {eventCategories.map((evt, idx) => (
            <div key={idx} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '260px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={evt.image} 
                  alt={evt.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#0B3B2C',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.75rem'
                }}>
                  {evt.type}
                </span>
                <span style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: '#FFFFFF',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#1C1C1C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <Users size={14} color="#8B7B61" /> {evt.capacity}
                </span>
              </div>

              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ fontSize: '0.72rem', color: '#8B7B61', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.4rem' }}>
                  {evt.tagline}
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.65rem',
                  color: '#141414',
                  marginBottom: '0.75rem',
                  fontWeight: 500
                }}>
                  {evt.title}
                </h3>
                <p style={{ color: '#555555', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1.5rem', flexGrow: 1 }}>
                  {evt.desc}
                </p>

                {/* Features List */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '0.74rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Signature Inclusions:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {evt.features.map((feat, i) => (
                      <li key={i} style={{ fontSize: '0.86rem', color: '#333333', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Check size={14} color="#0B3B2C" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: '1.5rem', marginTop: 'auto' }}>
                  <button 
                    onClick={() => navigate(`/booking?eventType=${evt.type}`)} 
                    className="rosewood-btn-green"
                    style={{ width: '100%' }}
                  >
                    Plan & Reserve This Event <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EventsPage;
