import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { 
  BedDouble, 
  Users, 
  Check, 
  Filter, 
  Search
} from 'lucide-react';

const fallbackRooms = [
  {
    id: 3,
    name: "Executive Pinnacle Suite",
    type: "ROOM",
    category: "SUITE",
    capacity: 4,
    pricePerNight: 450.00,
    description: "Exclusive top-floor luxury suite offering panoramic ocean vistas, private jacuzzi, expansive master lounge, and personal 24-hour butler service.",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    facilities: "King Size Bed, Jacuzzi, Private Balcony, High-speed Wi-Fi, Mini Bar, Butler Service, 24/7 Room Service"
  },
  {
    id: 5,
    name: "Deluxe Ocean View Room",
    type: "ROOM",
    category: "DELUXE",
    capacity: 2,
    pricePerNight: 220.00,
    description: "Sun-drenched haven featuring floor-to-ceiling glass balconies overlooking the Indian Ocean, bespoke Egyptian cotton linens, and marble bathroom.",
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    facilities: "Queen Bed, Sea View Balcony, Work Desk, Smart TV, Air Conditioning, Rain Shower, Coffee Maker"
  },
  {
    id: 6,
    name: "Presidential Royal Residence",
    type: "ROOM",
    category: "PRESIDENTIAL",
    capacity: 6,
    pricePerNight: 850.00,
    description: "Our grandest living quarter with duplex architecture, private heated infinity plunge pool, dining room for 8, and dedicated chauffeur service.",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    facilities: "2 King Bedrooms, Infinity Pool, Butler Pantry, Chauffeur, Master Dressing Room, Wine Cellar"
  }
];

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomForModal, setSelectedRoomForModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/public/venues/all').catch(() => api.get('/public/venues'));
        const inventory = Array.isArray(res.data) ? res.data : [];
        const roomItems = inventory.filter(item => item.type === 'ROOM');
        setRooms(roomItems.length > 0 ? roomItems : fallbackRooms);
      } catch (err) {
        console.warn('Failed to fetch rooms from backend, using fallback:', err);
        setRooms(fallbackRooms);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesCategory = categoryFilter === 'ALL' || (room.category && room.category.toUpperCase() === categoryFilter);
    const matchesSearch = searchQuery === '' || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="rosewood-page" style={{ minHeight: '80vh', padding: '4.5rem 1.5rem 7rem 1.5rem' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in">
          <div style={{
            fontSize: '0.74rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#8B7B61',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            SANCTUARY RESIDENCES
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.8rem, 5vw, 4.4rem)',
            color: '#141414',
            fontWeight: 400,
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            Suites & Oceanfront Living
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
            Select from our opulent ocean-view suites and deluxe residences crafted for ultimate tranquility, world-class comfort, and personalized white-glove service.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8E2D8',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          padding: '1.25rem 1.75rem',
          marginBottom: '3rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Category Filter Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#7E7A73', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={13} /> Filter:
            </span>
            {['ALL', 'SUITE', 'DELUXE', 'PRESIDENTIAL'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  border: categoryFilter === cat ? '1px solid #0B3B2C' : '1px solid #E2DCD2',
                  background: categoryFilter === cat ? '#0B3B2C' : 'transparent',
                  color: categoryFilter === cat ? '#FFFFFF' : '#1C1C1C',
                  transition: 'all 0.2s ease',
                  borderRadius: '2px'
                }}
              >
                {cat === 'ALL' ? 'All Residences' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '380px' }}>
            <Search size={15} color="#7E7A73" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search suites or amenities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rosewood-input"
              style={{ paddingLeft: '2.3rem', height: '40px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#0B3B2C', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem' }}>
            Loading luxury accommodations...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rosewood-card" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
            <BedDouble size={40} color="#0B3B2C" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', color: '#141414', marginBottom: '0.5rem', fontWeight: 500 }}>
              No Residences Match Your Criteria
            </h3>
            <p style={{ color: '#666666', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
              Try selecting a different category filter or clearing your search term.
            </p>
            <button onClick={() => { setCategoryFilter('ALL'); setSearchQuery(''); }} className="rosewood-btn-outline">
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.5rem'
          }}>
            {filteredRooms.map((room) => (
              <div key={room.id} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={room.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"} 
                    alt={room.name}
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
                    {room.category || 'RESIDENCE'}
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
                    <Users size={14} color="#8B7B61" /> Up to {room.capacity} Guests
                  </span>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.65rem',
                    color: '#141414',
                    marginBottom: '0.65rem',
                    fontWeight: 500
                  }}>
                    {room.name}
                  </h3>
                  <p style={{ color: '#555555', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.65, flexGrow: 1 }}>
                    {room.description}
                  </p>

                  {/* Amenities Tags */}
                  {room.facilities && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.75rem' }}>
                      {room.facilities.split(',').slice(0, 4).map((f, i) => (
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
                      <span style={{ fontSize: '0.72rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.1em' }}>From</span>
                      <div style={{ fontSize: '1.55rem', fontWeight: 700, color: '#141414', fontFamily: "'Cormorant Garamond', serif" }}>
                        LKR {room.pricePerNight} <span style={{ fontSize: '0.82rem', color: '#7E7A73', fontWeight: 400 }}>/ night</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <button 
                        onClick={() => setSelectedRoomForModal(room)} 
                        className="rosewood-btn-outline"
                        style={{ padding: '0.6rem 1.1rem', fontSize: '0.72rem' }}
                        title="View Details & Amenities"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => navigate(`/booking?venueId=${room.id}`)} 
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

      {/* Room Detail Modal */}
      {selectedRoomForModal && (
        <Modal 
          isOpen={!!selectedRoomForModal} 
          onClose={() => setSelectedRoomForModal(null)} 
          title={selectedRoomForModal.name}
          maxWidth="720px"
        >
          <div>
            <div style={{ height: '320px', overflow: 'hidden', marginBottom: '1.75rem', border: '1px solid #E8E2D8' }}>
              <img 
                src={selectedRoomForModal.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"} 
                alt={selectedRoomForModal.name}
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
                {selectedRoomForModal.category || 'RESIDENCE'}
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#141414', fontFamily: "'Cormorant Garamond', serif" }}>
                LKR {selectedRoomForModal.pricePerNight} <span style={{ fontSize: '0.85rem', color: '#7E7A73', fontWeight: 400 }}>/ night</span>
              </div>
            </div>

            <p style={{ color: '#555555', lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.96rem' }}>
              {selectedRoomForModal.description}
            </p>

            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              color: '#141414',
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              Residence Specifications & Amenities
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
              <div style={{ background: '#FAF9F5', padding: '1rem', border: '1px solid #E8E2D8' }}>
                <div style={{ color: '#7E7A73', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>Guest Capacity</div>
                <div style={{ color: '#141414', fontWeight: 600, fontSize: '0.95rem' }}>Up to {selectedRoomForModal.capacity} Guests</div>
              </div>
              <div style={{ background: '#FAF9F5', padding: '1rem', border: '1px solid #E8E2D8' }}>
                <div style={{ color: '#7E7A73', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>Service Guarantee</div>
                <div style={{ color: '#141414', fontWeight: 600, fontSize: '0.95rem' }}>24/7 Dedicated Butler Concierge</div>
              </div>
            </div>

            {selectedRoomForModal.facilities && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ color: '#7E7A73', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Included Features:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedRoomForModal.facilities.split(',').map((f, i) => (
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
                onClick={() => setSelectedRoomForModal(null)} 
                className="rosewood-btn-outline" 
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const id = selectedRoomForModal.id;
                  setSelectedRoomForModal(null);
                  navigate(`/booking?venueId=${id}`);
                }}
                className="rosewood-btn-green" 
                style={{ flex: 1 }}
              >
                Reserve This Suite
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RoomsPage;
