import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { Check } from 'lucide-react';

const fallbackPackages = [
  {
    id: 1,
    name: "Royal Wedding Extravaganza",
    eventType: "WEDDING",
    price: 4500.00,
    discountPercentage: 10,
    maxCapacity: 350,
    description: "Our signature all-inclusive wedding experience. Complete luxury decor, 5-course gourmet banquet, floral styling, live sound, and a complimentary night in our bridal suite.",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    includedServices: [
      "5-Course Gourmet Buffet for up to 350 guests",
      "Designer Floral Stage & Aisle Decorations",
      "Professional DJ, Audio & Intelligent Lighting",
      "Complimentary Executive Bridal Suite Stay",
      "Custom 3-Tier Luxury Wedding Cake",
      "Dedicated Master of Ceremonies & Coordinator"
    ]
  },
  {
    id: 2,
    name: "Corporate Leadership Summit",
    eventType: "CONFERENCE",
    price: 2200.00,
    discountPercentage: 5,
    maxCapacity: 100,
    description: "Designed for international board retreats and executive conferences. Includes seamless audiovisuals, high-speed fiber internet, and all-day executive catering.",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    includedServices: [
      "High-Speed Gigabit Wi-Fi & 4K Laser Projection",
      "Executive Lunch Buffet in Private Dining Hall",
      "Continuous Artisan Coffee & Afternoon High Tea",
      "Stationery, Notepads & Delegate Welcome Kits",
      "Hybrid Conferencing Recording & Stream Setup"
    ]
  },
  {
    id: 3,
    name: "VIP Birthday Jubilee",
    eventType: "BIRTHDAY",
    price: 1500.00,
    discountPercentage: 0,
    maxCapacity: 80,
    description: "Celebrate milestones with flair. Dynamic lighting, personalized bar setup, gourmet finger food stations, and a 360-degree interactive photo booth.",
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
    includedServices: [
      "Custom Themed Ambient Lighting & Backdrop",
      "Artisan Cocktail & Mocktail Bar Service",
      "360 Degree Interactive Photo Booth Experience",
      "Artisanal Custom Celebration Cake",
      "Dedicated Host & Sound Tech Support"
    ]
  },
  {
    id: 4,
    name: "Ambassadorial Gala Dinner",
    eventType: "GALA",
    price: 3800.00,
    discountPercentage: 8,
    maxCapacity: 250,
    description: "Premier formal dining package tailored for diplomacy, philanthropy, and annual corporate awards. High-end plating, live chamber quartet, and media wall.",
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    includedServices: [
      "Plated 5-Star Gourmet Dinner & Sommelier Pairings",
      "Red Carpet Arrival Wall & Press Lighting",
      "Stage Podium, Dual LED Screens & PA System",
      "White Glove Butler Service per Table"
    ]
  }
];

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedPkgForModal, setSelectedPkgForModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/public/packages');
        const pkgData = Array.isArray(res.data) ? res.data : [];
        setPackages(pkgData.length > 0 ? pkgData : fallbackPackages);
      } catch (err) {
        console.warn('Failed to load packages from backend, using fallbacks:', err);
        setPackages(fallbackPackages);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(pkg => {
    if (typeFilter === 'ALL') return true;
    return pkg.eventType && pkg.eventType.toUpperCase() === typeFilter;
  });

  return (
    <div className="rosewood-page" style={{ minHeight: '80vh', padding: '4.5rem 1.5rem 7rem 1.5rem' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in">
          <div style={{
            fontSize: '0.74rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#8B7B61',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            TAILORED EXPERIENCES & PRIVILEGES
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.8rem, 5vw, 4.4rem)',
            color: '#141414',
            fontWeight: 400,
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            All-Inclusive Event Packages
          </h1>

          <p style={{
            color: '#4A4A4A',
            maxWidth: '720px',
            margin: '0 auto',
            fontSize: '1.12rem',
            lineHeight: 1.7,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic'
          }}>
            Expertly curated packages published by our professional event directors, complete with transparent pricing, banquet catering, and audiovisuals.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '3.5rem' }}>
          {['ALL', 'WEDDING', 'CONFERENCE', 'BIRTHDAY', 'GALA'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '0.55rem 1.35rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                border: typeFilter === t ? '1px solid #0B3B2C' : '1px solid #E2DCD2',
                background: typeFilter === t ? '#0B3B2C' : '#FFFFFF',
                color: typeFilter === t ? '#FFFFFF' : '#1C1C1C',
                transition: 'all 0.2s ease',
                borderRadius: '2px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              {t === 'ALL' ? 'All Packages' : t}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#0B3B2C', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem' }}>
            Loading curated packages...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.5rem'
          }}>
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={pkg.imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"} 
                    alt={pkg.name}
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
                    {pkg.eventType}
                  </span>
                  {pkg.discountPercentage > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: '#C5A059',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '0.35rem 0.75rem'
                    }}>
                      {pkg.discountPercentage}% Privilege
                    </span>
                  )}
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.55rem',
                      color: '#141414',
                      flexGrow: 1,
                      paddingRight: '0.5rem',
                      fontWeight: 500
                    }}>
                      {pkg.name}
                    </h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#141414', fontFamily: "'Cormorant Garamond', serif" }}>
                        LKR {pkg.price}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#7E7A73' }}>Inclusive Fee</span>
                    </div>
                  </div>

                  <p style={{ color: '#555555', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                    {pkg.description}
                  </p>

                  {/* Included Services Checklist */}
                  <div style={{ marginBottom: '1.75rem', flexGrow: 1 }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                      Included Services & Amenities:
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {pkg.includedServices && pkg.includedServices.slice(0, 4).map((service, idx) => (
                        <li key={idx} style={{ fontSize: '0.86rem', color: '#333333', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                          <Check size={14} color="#0B3B2C" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', borderTop: '1px solid #E8E2D8', paddingTop: '1.25rem' }}>
                    <button 
                      onClick={() => setSelectedPkgForModal(pkg)} 
                      className="rosewood-btn-outline" 
                      style={{ flex: 1, padding: '0.65rem' }}
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => navigate(`/booking?packageId=${pkg.id}`)}
                      className="rosewood-btn-green" 
                      style={{ flex: 1, padding: '0.65rem' }}
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Package Detail Modal */}
      {selectedPkgForModal && (
        <Modal 
          isOpen={!!selectedPkgForModal} 
          onClose={() => setSelectedPkgForModal(null)} 
          title={selectedPkgForModal.name}
          maxWidth="700px"
        >
          <div>
            <div style={{ height: '280px', overflow: 'hidden', marginBottom: '1.75rem', border: '1px solid #E8E2D8' }}>
              <img 
                src={selectedPkgForModal.imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"} 
                alt={selectedPkgForModal.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{
                background: '#0B3B2C',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.35rem 0.75rem'
              }}>
                {selectedPkgForModal.eventType} PACKAGE
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#141414', fontFamily: "'Cormorant Garamond', serif" }}>
                LKR {selectedPkgForModal.price}
              </div>
            </div>

            <p style={{ color: '#555555', lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.96rem' }}>
              {selectedPkgForModal.description}
            </p>

            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              color: '#141414',
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              All Included Services ({selectedPkgForModal.includedServices ? selectedPkgForModal.includedServices.length : 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
              {selectedPkgForModal.includedServices && selectedPkgForModal.includedServices.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#FAF9F5', padding: '0.75rem 1rem', border: '1px solid #E8E2D8' }}>
                  <Check size={15} color="#0B3B2C" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span style={{ color: '#141414', fontSize: '0.9rem' }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #E8E2D8', paddingTop: '1.5rem' }}>
              <button 
                onClick={() => setSelectedPkgForModal(null)} 
                className="rosewood-btn-outline" 
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const id = selectedPkgForModal.id;
                  setSelectedPkgForModal(null);
                  navigate(`/booking?packageId=${id}`);
                }}
                className="rosewood-btn-green" 
                style={{ flex: 1 }}
              >
                Reserve This Package
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PackagesPage;
