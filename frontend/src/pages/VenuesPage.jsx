import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { 
  Users, 
  Check, 
  MapPin,
  Building
} from 'lucide-react';

const fallbackVenues = [
  {
    id: 1,
    name: "The Grand Royal Ballroom",
    type: "BANQUET_HALL",
    capacity: 500,
    pricePerNight: 2500.00,
    location: "East Wing, Grand Lobby Level",
    description: "A breathtaking architectural marvel with soaring crystal chandeliers, LED video walls, acoustic sound engineering, and adjacent private banquet prep kitchen.",
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    facilities: "Central AC, High-tech Audio/Visual, Stage, LED Screen, Catering Kitchen Access, Private Restrooms"
  },
  {
    id: 2,
    name: "Emerald Oceanfront Garden",
    type: "GARDEN_VENUE",
    capacity: 300,
    pricePerNight: 1800.00,
    location: "Seaside Promenade Grounds",
    description: "Romantic tropical garden surrounded by swaying palms, manicured flora, and an illuminated seaside gazebo with sunset ocean backdrop.",
    imageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
    facilities: "Outdoor Lighting, Gazebo, Beach Access, Portable Stage, Sunset View, Lawn Furniture"
  },
  {
    id: 4,
    name: "Sapphire Conference Center",
    type: "CONFERENCE_HALL",
    capacity: 120,
    pricePerNight: 1200.00,
    location: "Executive Tower, 3rd Floor",
    description: "High-tech executive amphitheater with smart 4K laser projection, hybrid international conferencing, and ergonomic leather delegate seating.",
    imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80",
    facilities: "Smart Projector, Hybrid Video Conferencing, Soundproof Walls, Ergonomic Chairs, High-speed Fiber"
  }
];

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedVenueForModal, setSelectedVenueForModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await api.get('/public/venues/all').catch(() => api.get('/public/venues'));
        const inventory = Array.isArray(res.data) ? res.data : [];
        const venueItems = inventory.filter(item => item.type !== 'ROOM');
        setVenues(venueItems.length > 0 ? venueItems : fallbackVenues);
      } catch (err) {
        console.warn('Failed to load venues, using fallbacks:', err);
        setVenues(fallbackVenues);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const filteredVenues = venues.filter(v => {
    if (typeFilter === 'ALL') return true;
    return v.type === typeFilter;
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
            ICONIC ARCHITECTURAL SETTINGS
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.8rem, 5vw, 4.4rem)',
            color: '#141414',
            fontWeight: 400,
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            Halls & Oceanfront Venues
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
            Explore world-class ballrooms, tropical seaside gardens, and acoustic conference amphitheaters engineered for unforgettable distinction.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '3.5rem' }}>
          {[
            { label: 'All Venues', value: 'ALL' },
            { label: 'Banquet Ballrooms', value: 'BANQUET_HALL' },
            { label: 'Outdoor Gardens', value: 'GARDEN_VENUE' },
            { label: 'Conference Amphitheaters', value: 'CONFERENCE_HALL' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              style={{
                padding: '0.55rem 1.35rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                border: typeFilter === f.value ? '1px solid #0B3B2C' : '1px solid #E2DCD2',
                background: typeFilter === f.value ? '#0B3B2C' : '#FFFFFF',
                color: typeFilter === f.value ? '#FFFFFF' : '#1C1C1C',
                transition: 'all 0.2s ease',
                borderRadius: '2px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Venues Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#0B3B2C', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem' }}>
            Loading venue spaces...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.5rem'
          }}>
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={venue.imageUrl || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"} 
                    alt={venue.name}
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
                    {venue.type ? venue.type.replace('_', ' ') : 'VENUE'}
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
                    <Users size={14} color="#8B7B61" /> Up to {venue.capacity} Guests
                  </span>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {venue.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#7E7A73', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.65rem' }}>
                      <MapPin size={13} color="#8B7B61" /> {venue.location}
                    </div>
                  )}

                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.65rem',
                    color: '#141414',
                    marginBottom: '0.65rem',
                    fontWeight: 500
                  }}>
                    {venue.name}
                  </h3>
                  <p style={{ color: '#555555', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.65, flexGrow: 1 }}>
                    {venue.description}
                  </p>

                  {/* Amenities Tags */}
                  {venue.facilities && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.75rem' }}>
                      {venue.facilities.split(',').slice(0, 3).map((f, i) => (
                        <span key={i} style={{
                          fontSize: '0.74rem',
                          color: '#4A4A4A',
                          background: '#F5F2EB',
                          border: '1px solid #E2DCD2',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '2px'
                        }}>
                          {f.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #E8E2D8',
                    paddingTop: '1.25rem',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Hire</span>
                      <div style={{ fontSize: '1.55rem', fontWeight: 700, color: '#141414', fontFamily: "'Cormorant Garamond', serif" }}>
                        LKR {venue.pricePerNight}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <button 
                        onClick={() => setSelectedVenueForModal(venue)} 
                        className="rosewood-btn-outline"
                        style={{ padding: '0.6rem 1.1rem', fontSize: '0.72rem' }}
                        title="View Specifications"
                      >
                        Specs
                      </button>
                      <button 
                        onClick={() => navigate(`/booking?venueId=${venue.id}`)} 
                        className="rosewood-btn-green"
                        style={{ padding: '0.6rem 1.3rem', fontSize: '0.72rem' }}
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Venue Detail Modal */}
      {selectedVenueForModal && (
        <Modal 
          isOpen={!!selectedVenueForModal} 
          onClose={() => setSelectedVenueForModal(null)} 
          title={selectedVenueForModal.name}
          maxWidth="720px"
        >
          <div>
            <div style={{ height: '320px', overflow: 'hidden', marginBottom: '1.75rem', border: '1px solid #E8E2D8' }}>
              <img 
                src={selectedVenueForModal.imageUrl || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"} 
                alt={selectedVenueForModal.name}
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
                {selectedVenueForModal.type?.replace('_', ' ')}
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#141414', fontFamily: "'Cormorant Garamond', serif" }}>
                LKR {selectedVenueForModal.pricePerNight} <span style={{ fontSize: '0.85rem', color: '#7E7A73', fontWeight: 400 }}>/ event</span>
              </div>
            </div>

            <p style={{ color: '#555555', lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.96rem' }}>
              {selectedVenueForModal.description}
            </p>

            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              color: '#141414',
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              Venue Specifications & Features
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
              <div style={{ background: '#FAF9F5', padding: '1rem', border: '1px solid #E8E2D8' }}>
                <div style={{ color: '#7E7A73', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>Maximum Capacity</div>
                <div style={{ color: '#141414', fontWeight: 600, fontSize: '0.95rem' }}>Up to {selectedVenueForModal.capacity} Guests</div>
              </div>
              <div style={{ background: '#FAF9F5', padding: '1rem', border: '1px solid #E8E2D8' }}>
                <div style={{ color: '#7E7A73', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>Location</div>
                <div style={{ color: '#141414', fontWeight: 600, fontSize: '0.95rem' }}>{selectedVenueForModal.location || 'Main Resort Complex'}</div>
              </div>
            </div>

            {selectedVenueForModal.facilities && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ color: '#7E7A73', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Available Equipment & Infrastructure:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedVenueForModal.facilities.split(',').map((f, i) => (
                    <span key={i} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#F5F2EB',
                      border: '1px solid #E2DCD2',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.82rem',
                      color: '#1C1C1C'
                    }}>
                      <Check size={12} color="#0B3B2C" strokeWidth={2.5} />
                      {f.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #E8E2D8', paddingTop: '1.5rem' }}>
              <button 
                onClick={() => setSelectedVenueForModal(null)} 
                className="rosewood-btn-outline" 
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const id = selectedVenueForModal.id;
                  setSelectedVenueForModal(null);
                  navigate(`/booking?venueId=${id}`);
                }}
                className="rosewood-btn-green" 
                style={{ flex: 1 }}
              >
                Reserve This Space
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VenuesPage;
